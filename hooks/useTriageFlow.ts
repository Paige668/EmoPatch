import { useReducer, useEffect } from 'react';
import {
  analyzeSplit,
  generateReframes,
  generateFollowUp,
  isPayloadTooLarge,
  isQuotaError,
  isRateLimitError,
  isSafetyRedirect,
  reviseContext,
} from '../services/aiService';
import { saveRecord } from '../services/storageService';
import { prepareImageForUpload } from '../services/imageUtils';
import {
  DEMO_CASES,
  DEMO_LATENCY_MS,
  getDemoFollowUp,
  getDemoPatch,
  getDemoReframes,
  getDemoSplit,
} from '../services/demoCase';
import {
  ContextTag,
  ActionType,
  ReframeType,
  Language,
  FollowUpContent,
  FollowUpRequestType,
  ContextPatchResponse,
  PerspectiveSet,
  AISplitResponse,
  AnalysisVersion,
  ThinkingPattern,
} from '../types';
import { getFallbackData, FOLLOWUP_FALLBACKS } from '../constants';

// --- Types ---

export type TriageStep =
  | 'IDLE'
  | 'BUFFER'
  | 'DUMP'
  | 'ANALYZING'
  | 'CONFIRM'
  | 'REFRAMING'
  | 'CHOICE'
  | 'DEPTH_CHOICE'
  | 'GENERATING_FOLLOWUP'
  | 'FINAL_CONTENT'
  | 'CRISIS_SUPPORT'
  | 'CONTEXT_PATCH'
  | 'REVISING_CONTEXT'
  | 'PATCH_RESULT';

export type FallbackReason = 'AI_ERROR' | 'MANUAL_SKIP' | 'RATE_LIMIT' | 'TOO_LARGE' | 'OFFLINE';

export interface TriageData {
  rawText: string;
  rawImage: string | null;
  isDemo: boolean;
  fact: string;
  interpretation: string;
  selectedNeeds: string[];
  reframes: PerspectiveSet | null;
  selectedReframe: string | null;
  selectedReframeType: string | null;
  followUp: FollowUpContent | null;
  followUpRequestType: FollowUpRequestType;
  unknowns: string[];
  clarifyingQuestion: string | null;
  clarifyingWhy: string | null;
  clarifyingAnswer: string;
  contextPatchInput: string;
  lastPatch: ContextPatchResponse | null;
  contextPatchError: string | null;
  patchReturnStep: TriageStep | null;
  // versions[0] is the first full analysis; each Context Patch appends one.
  versions: AnalysisVersion[];
  thinkingPattern: ThinkingPattern | null;
  isFallback: boolean;
  fallbackReason: FallbackReason | null;
}

interface TriageState {
  step: TriageStep;
  language: Language;
  isOfflineMode: boolean;
  offlineReason: 'QUOTA' | 'NETWORK' | null;
  bufferDuration: number;
  data: TriageData;
}

interface FailurePayload {
  reason: FallbackReason;
  isQuota: boolean;
}

// --- Actions ---

type Action =
  | { type: 'SET_LANGUAGE'; payload: Language }
  | { type: 'START_FLOW' }
  | { type: 'START_DEMO' }
  | { type: 'BUFFER_END' }
  | { type: 'INPUT_UPDATE'; payload: string }
  | { type: 'SET_IMAGE'; payload: string }
  | { type: 'REMOVE_IMAGE' }
  | { type: 'STABILIZE' }
  | { type: 'START_ANALYSIS' }
  | { type: 'ANALYSIS_SUCCESS'; payload: AISplitResponse }
  | { type: 'ANALYSIS_ERROR'; payload: FailurePayload }
  | { type: 'SAFETY_REDIRECT' }
  | { type: 'UPDATE_SPLIT'; payload: { fact?: string; interpretation?: string } }
  | { type: 'SET_CLARIFYING_ANSWER'; payload: string }
  | { type: 'TOGGLE_NEED'; payload: string }
  | { type: 'ADD_CUSTOM_NEED'; payload: string }
  | { type: 'START_REFRAMING' }
  | { type: 'REFRAMING_SUCCESS'; payload: PerspectiveSet }
  | { type: 'REFRAMING_ERROR'; payload: FailurePayload }
  | { type: 'SELECT_REFRAME'; payload: { type: string; text: string } }
  | { type: 'START_FOLLOWUP'; payload: FollowUpRequestType }
  | { type: 'FOLLOWUP_SUCCESS'; payload: FollowUpContent }
  | { type: 'FOLLOWUP_ERROR'; payload: FailurePayload }
  | { type: 'OPEN_CONTEXT_PATCH' }
  | { type: 'SUBMIT_CONTEXT_PATCH'; payload: string }
  | { type: 'CONTEXT_PATCH_SUCCESS'; payload: ContextPatchResponse }
  | { type: 'CONTEXT_PATCH_ERROR'; payload: string }
  | { type: 'RETRY_AI' }
  | { type: 'RESET' }
  | { type: 'GO_BACK' }
  | { type: 'SKIP_LOADING' }
  | { type: 'SET_NETWORK_STATUS'; payload: boolean };

// --- Initial State ---

const initialData: TriageData = {
  rawText: '',
  rawImage: null,
  isDemo: false,
  fact: '',
  interpretation: '',
  selectedNeeds: [],
  reframes: null,
  selectedReframe: null,
  selectedReframeType: null,
  followUp: null,
  followUpRequestType: 'ACTION',
  unknowns: [],
  clarifyingQuestion: null,
  clarifyingWhy: null,
  clarifyingAnswer: '',
  contextPatchInput: '',
  lastPatch: null,
  contextPatchError: null,
  patchReturnStep: null,
  versions: [],
  thinkingPattern: null,
  isFallback: false,
  fallbackReason: null,
};

export const initialState: TriageState = {
  step: 'IDLE',
  language: 'en',
  isOfflineMode: false,
  offlineReason: null,
  bufferDuration: 20000,
  data: initialData,
};

// --- Helpers ---
const generateId = () => Math.random().toString(36).slice(2, 11);

const failureState = (state: TriageState, payload: FailurePayload) => ({
  isOfflineMode: payload.isQuota ? true : state.isOfflineMode,
  offlineReason: payload.isQuota ? 'QUOTA' as const : state.offlineReason,
});

const firstVersion = (data: TriageData, reframes: PerspectiveSet): AnalysisVersion[] => [{
  createdAt: new Date().toISOString(),
  fact: data.fact,
  interpretation: data.interpretation,
  unknowns: data.unknowns,
  reframes,
}];

// --- Reducer ---

export function triageReducer(state: TriageState, action: Action): TriageState {
  switch (action.type) {
    case 'SET_LANGUAGE':
      return { ...state, language: action.payload };

    case 'SET_NETWORK_STATUS': {
      if (!action.payload) return { ...state, isOfflineMode: true, offlineReason: 'NETWORK' };
      if (state.offlineReason === 'NETWORK') return { ...state, isOfflineMode: false, offlineReason: null };
      return state;
    }

    case 'START_FLOW':
      return { ...state, step: 'DUMP', data: initialData };

    case 'START_DEMO':
      return {
        ...state,
        step: 'DUMP',
        data: { ...initialData, isDemo: true, rawText: DEMO_CASES[state.language].input },
      };

    case 'BUFFER_END':
      // Grounding is optional and returns to wherever the user came from.
      return { ...state, step: state.data.fact ? 'CONFIRM' : 'DUMP' };

    case 'INPUT_UPDATE':
      return { ...state, data: { ...state.data, rawText: action.payload } };

    case 'SET_IMAGE':
      return { ...state, data: { ...state.data, rawImage: action.payload } };

    case 'REMOVE_IMAGE':
      return { ...state, data: { ...state.data, rawImage: null } };

    case 'STABILIZE':
      return { ...state, step: 'BUFFER', bufferDuration: 20000 };

    case 'START_ANALYSIS':
      return { ...state, step: 'ANALYZING', data: { ...state.data, isFallback: false, fallbackReason: null } };

    case 'ANALYSIS_SUCCESS':
      return {
        ...state,
        step: 'CONFIRM',
        data: {
          ...state.data,
          fact: action.payload.fact,
          interpretation: action.payload.interpretation,
          thinkingPattern: action.payload.distortion || null,
          unknowns: action.payload.unknowns || [],
          clarifyingQuestion: action.payload.clarifyingQuestion || null,
          clarifyingWhy: action.payload.clarifyingQuestion ? action.payload.clarifyingWhy || null : null,
          clarifyingAnswer: '',
          isFallback: false,
          fallbackReason: null,
        },
      };

    case 'SAFETY_REDIRECT':
      return { ...state, step: 'CRISIS_SUPPORT' };

    case 'ANALYSIS_ERROR':
      // Offline split: keep the user's words as a starting point and let them
      // sort fact from interpretation by hand. Nothing is invented.
      return {
        ...state,
        ...failureState(state, action.payload),
        step: 'CONFIRM',
        data: {
          ...state.data,
          fact: state.data.rawText,
          interpretation: '',
          thinkingPattern: null,
          unknowns: [],
          clarifyingQuestion: null,
          clarifyingWhy: null,
          isFallback: true,
          fallbackReason: action.payload.reason,
        },
      };

    case 'UPDATE_SPLIT':
      return { ...state, data: { ...state.data, ...action.payload } };

    case 'SET_CLARIFYING_ANSWER':
      return { ...state, data: { ...state.data, clarifyingAnswer: action.payload } };

    case 'TOGGLE_NEED': {
      const needs = state.data.selectedNeeds.includes(action.payload)
        ? state.data.selectedNeeds.filter(n => n !== action.payload)
        : [...state.data.selectedNeeds, action.payload];
      return { ...state, data: { ...state.data, selectedNeeds: needs } };
    }

    case 'ADD_CUSTOM_NEED':
      if (state.data.selectedNeeds.includes(action.payload)) return state;
      return { ...state, data: { ...state.data, selectedNeeds: [...state.data.selectedNeeds, action.payload] } };

    case 'START_REFRAMING':
      return { ...state, step: 'REFRAMING', data: { ...state.data, isFallback: false, fallbackReason: null } };

    case 'REFRAMING_SUCCESS':
      return {
        ...state,
        step: 'CHOICE',
        data: {
          ...state.data,
          reframes: action.payload,
          versions: firstVersion(state.data, action.payload),
          lastPatch: null,
          isFallback: false,
          fallbackReason: null,
        },
      };

    case 'REFRAMING_ERROR': {
      const reframes = getFallbackData(state.language, state.data.fact, state.data.interpretation).reframes;
      return {
        ...state,
        ...failureState(state, action.payload),
        step: 'CHOICE',
        data: {
          ...state.data,
          reframes,
          versions: firstVersion(state.data, reframes),
          lastPatch: null,
          isFallback: true,
          fallbackReason: action.payload.reason,
        },
      };
    }

    case 'SELECT_REFRAME':
      return {
        ...state,
        step: 'DEPTH_CHOICE',
        data: {
          ...state.data,
          selectedReframeType: action.payload.type,
          selectedReframe: action.payload.text,
        },
      };

    case 'START_FOLLOWUP':
      return {
        ...state,
        step: 'GENERATING_FOLLOWUP',
        data: {
          ...state.data,
          followUp: null,
          followUpRequestType: action.payload,
          isFallback: false,
          fallbackReason: null,
        },
      };

    case 'FOLLOWUP_SUCCESS':
      return {
        ...state,
        step: 'FINAL_CONTENT',
        data: { ...state.data, followUp: action.payload, isFallback: false, fallbackReason: null },
      };

    case 'FOLLOWUP_ERROR':
      return {
        ...state,
        ...failureState(state, action.payload),
        step: 'FINAL_CONTENT',
        data: {
          ...state.data,
          followUp: FOLLOWUP_FALLBACKS[state.language],
          isFallback: true,
          fallbackReason: action.payload.reason,
        },
      };

    case 'OPEN_CONTEXT_PATCH':
      return {
        ...state,
        step: 'CONTEXT_PATCH',
        data: {
          ...state.data,
          contextPatchInput: '',
          contextPatchError: null,
          patchReturnStep: state.step,
        },
      };

    case 'SUBMIT_CONTEXT_PATCH':
      return {
        ...state,
        step: 'REVISING_CONTEXT',
        data: { ...state.data, contextPatchInput: action.payload, contextPatchError: null },
      };

    case 'CONTEXT_PATCH_SUCCESS':
      return {
        ...state,
        step: 'PATCH_RESULT',
        data: {
          ...state.data,
          fact: action.payload.updatedFact,
          interpretation: action.payload.updatedInterpretation,
          unknowns: action.payload.unknowns,
          reframes: action.payload.reframes,
          selectedReframe: null,
          selectedReframeType: null,
          followUp: null,
          lastPatch: action.payload,
          contextPatchError: null,
          isFallback: false,
          fallbackReason: null,
          versions: [
            ...state.data.versions,
            {
              createdAt: new Date().toISOString(),
              addedContext: state.data.contextPatchInput,
              fact: action.payload.updatedFact,
              interpretation: action.payload.updatedInterpretation,
              unknowns: action.payload.unknowns,
              reframes: action.payload.reframes,
              changeSummary: action.payload.changeSummary,
            },
          ],
        },
      };

    case 'CONTEXT_PATCH_ERROR':
      return { ...state, step: 'CONTEXT_PATCH', data: { ...state.data, contextPatchError: action.payload } };

    case 'RETRY_AI': {
      if (state.isOfflineMode || !state.data.isFallback) return state;
      const retryStep: Partial<Record<TriageStep, TriageStep>> = {
        CONFIRM: 'ANALYZING',
        CHOICE: 'REFRAMING',
        FINAL_CONTENT: 'GENERATING_FOLLOWUP',
      };
      const next = retryStep[state.step];
      if (!next) return state;
      return { ...state, step: next, data: { ...state.data, isFallback: false, fallbackReason: null } };
    }

    case 'SKIP_LOADING': {
      // Skipping applies to this step only; the next step tries the AI again.
      const skipped = { ...state.data, isFallback: true, fallbackReason: 'MANUAL_SKIP' as const };
      if (state.step === 'ANALYZING') {
        return {
          ...state,
          step: 'CONFIRM',
          data: { ...skipped, fact: state.data.rawText, interpretation: '', unknowns: [], clarifyingQuestion: null, clarifyingWhy: null, thinkingPattern: null },
        };
      }
      if (state.step === 'REFRAMING') {
        const reframes = getFallbackData(state.language, state.data.fact, state.data.interpretation).reframes;
        return { ...state, step: 'CHOICE', data: { ...skipped, reframes, versions: firstVersion(state.data, reframes), lastPatch: null } };
      }
      if (state.step === 'GENERATING_FOLLOWUP') {
        return { ...state, step: 'FINAL_CONTENT', data: { ...skipped, followUp: FOLLOWUP_FALLBACKS[state.language] } };
      }
      return state;
    }

    case 'RESET': {
      // A new session retries the AI after a quota error; real network loss persists.
      const stillOffline = state.offlineReason === 'NETWORK';
      return {
        ...initialState,
        language: state.language,
        isOfflineMode: stillOffline,
        offlineReason: stillOffline ? 'NETWORK' : null,
      };
    }

    case 'GO_BACK': {
      const previous: Partial<Record<TriageStep, TriageStep>> = {
        DUMP: 'IDLE',
        BUFFER: state.data.fact ? 'CONFIRM' : 'DUMP',
        ANALYZING: 'DUMP',
        CONFIRM: 'DUMP',
        REFRAMING: 'CONFIRM',
        CHOICE: 'CONFIRM',
        DEPTH_CHOICE: state.data.lastPatch ? 'PATCH_RESULT' : 'CHOICE',
        GENERATING_FOLLOWUP: 'DEPTH_CHOICE',
        FINAL_CONTENT: 'DEPTH_CHOICE',
        CONTEXT_PATCH: state.data.patchReturnStep || 'CHOICE',
        REVISING_CONTEXT: 'CONTEXT_PATCH',
        PATCH_RESULT: 'CHOICE',
        CRISIS_SUPPORT: 'DUMP',
      };
      return { ...state, step: previous[state.step] || 'IDLE' };
    }

    default:
      return state;
  }
}

const describeFailure = (error: unknown): FailurePayload => {
  if (isQuotaError(error)) return { reason: 'OFFLINE', isQuota: true };
  if (isRateLimitError(error)) return { reason: 'RATE_LIMIT', isQuota: false };
  if (isPayloadTooLarge(error)) return { reason: 'TOO_LARGE', isQuota: false };
  return { reason: 'AI_ERROR', isQuota: false };
};

const OFFLINE_FAILURE: FailurePayload = { reason: 'OFFLINE', isQuota: false };

// Resolves a cached demo response after a short pause, otherwise calls the API.
const resolveStep = <T,>(cached: T | null, live: () => Promise<T>): Promise<T> =>
  cached ? new Promise(resolve => setTimeout(() => resolve(cached), DEMO_LATENCY_MS)) : live();

// --- Hook ---

export const useTriageFlow = () => {
  const [state, dispatch] = useReducer(triageReducer, initialState);
  const { step, language, isOfflineMode, data } = state;

  useEffect(() => {
    const syncNetworkStatus = () => dispatch({ type: 'SET_NETWORK_STATUS', payload: navigator.onLine });
    syncNetworkStatus();
    window.addEventListener('online', syncNetworkStatus);
    window.addEventListener('offline', syncNetworkStatus);
    return () => {
      window.removeEventListener('online', syncNetworkStatus);
      window.removeEventListener('offline', syncNetworkStatus);
    };
  }, []);

  // Runs one AI step: cached demo response → offline fallback → live API.
  // Changing step (e.g. pressing back) cancels the in-flight result.
  const runStep = <T,>(
    cached: T | null,
    live: () => Promise<T>,
    onSuccess: (result: T) => Action,
    onFailure: (failure: FailurePayload) => Action,
  ) => {
    if (!cached && isOfflineMode) {
      dispatch(onFailure(OFFLINE_FAILURE));
      return undefined;
    }
    let cancelled = false;
    resolveStep(cached, live)
      .then(result => {
        if (!cancelled) dispatch(onSuccess(result));
      })
      .catch(error => {
        if (cancelled) return;
        console.error(error);
        dispatch(isSafetyRedirect(error) ? { type: 'SAFETY_REDIRECT' } : onFailure(describeFailure(error)));
      });
    return () => {
      cancelled = true;
    };
  };

  // 1. Analysis (Split)
  useEffect(() => {
    if (step !== 'ANALYZING') return;
    const image = data.rawImage;
    return runStep(
      data.isDemo ? getDemoSplit(language, data.rawText, Boolean(image)) : null,
      () => analyzeSplit(
        data.rawText,
        language,
        image ? image.split(',')[1] : undefined,
        image ? image.split(';')[0].split(':')[1] : undefined,
      ),
      payload => ({ type: 'ANALYSIS_SUCCESS', payload }),
      payload => ({ type: 'ANALYSIS_ERROR', payload }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // 2. Reframing
  useEffect(() => {
    if (step !== 'REFRAMING') return;
    return runStep(
      data.isDemo ? getDemoReframes(language, data.fact, data.interpretation, data.clarifyingAnswer) : null,
      () => generateReframes(data.fact, data.interpretation, data.selectedNeeds, language, data.clarifyingAnswer.trim() || undefined),
      payload => ({ type: 'REFRAMING_SUCCESS', payload }),
      payload => ({ type: 'REFRAMING_ERROR', payload }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // 3. Follow Up
  useEffect(() => {
    if (step !== 'GENERATING_FOLLOWUP') return;
    return runStep(
      data.isDemo
        ? getDemoFollowUp(language, data.fact, data.interpretation, data.clarifyingAnswer, data.followUpRequestType)
        : null,
      () => generateFollowUp(
        data.fact,
        data.interpretation,
        data.selectedReframeType || ReframeType.AGENCY,
        data.followUpRequestType,
        language,
        {
          needs: data.selectedNeeds,
          clarification: data.clarifyingAnswer.trim() || undefined,
          selectedPerspective: data.selectedReframe || undefined,
        },
      ),
      payload => ({ type: 'FOLLOWUP_SUCCESS', payload }),
      payload => ({ type: 'FOLLOWUP_ERROR', payload }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // 4. Context Patch: update the analysis when the user supplies new facts.
  useEffect(() => {
    if (step !== 'REVISING_CONTEXT' || !data.reframes) return;
    const reframes = data.reframes;
    const errorMessage = language === 'zh'
      ? '暂时无法更新分析，请稍后再试。你刚才输入的补充内容仍保留在本页。'
      : 'The analysis could not be updated yet. Your added context is still here so you can retry.';
    return runStep(
      data.isDemo
        ? getDemoPatch(language, data.fact, data.interpretation, data.clarifyingAnswer, data.contextPatchInput)
        : null,
      () => reviseContext(
        data.fact,
        data.interpretation,
        reframes,
        data.contextPatchInput,
        data.selectedNeeds,
        language,
        data.clarifyingAnswer.trim() || undefined,
      ),
      payload => ({ type: 'CONTEXT_PATCH_SUCCESS', payload }),
      () => ({ type: 'CONTEXT_PATCH_ERROR', payload: errorMessage }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // -- Action Handlers --

  const startFlow = () => dispatch({ type: 'START_FLOW' });
  const startDemo = () => dispatch({ type: 'START_DEMO' });
  const onBufferEnd = () => dispatch({ type: 'BUFFER_END' });

  const submitDump = (text: string) => {
    dispatch({ type: 'INPUT_UPDATE', payload: text });
    dispatch({ type: 'START_ANALYSIS' });
  };

  const updateSplit = (updates: { fact?: string; interpretation?: string }) => dispatch({ type: 'UPDATE_SPLIT', payload: updates });
  const setClarifyingAnswer = (answer: string) => dispatch({ type: 'SET_CLARIFYING_ANSWER', payload: answer });
  const toggleNeed = (need: string) => dispatch({ type: 'TOGGLE_NEED', payload: need });
  const addCustomNeed = (need: string) => dispatch({ type: 'ADD_CUSTOM_NEED', payload: need });
  const confirmSplit = () => dispatch({ type: 'START_REFRAMING' });
  const selectReframe = (type: string, text: string) => dispatch({ type: 'SELECT_REFRAME', payload: { type, text } });
  const fetchFollowUp = (type: FollowUpRequestType) => dispatch({ type: 'START_FOLLOWUP', payload: type });
  const openContextPatch = () => dispatch({ type: 'OPEN_CONTEXT_PATCH' });
  const submitContextPatch = (context: string) => dispatch({ type: 'SUBMIT_CONTEXT_PATCH', payload: context });
  const retryAI = () => dispatch({ type: 'RETRY_AI' });
  const startGrounding = () => dispatch({ type: 'STABILIZE' });
  const skipLoading = () => dispatch({ type: 'SKIP_LOADING' });
  const setLanguage = (lang: Language) => dispatch({ type: 'SET_LANGUAGE', payload: lang });

  const handleImageUpload = async (file: File): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_IMAGE', payload: await prepareImageForUpload(file) });
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const removeImage = () => dispatch({ type: 'REMOVE_IMAGE' });
  const reset = () => dispatch({ type: 'RESET' });
  const goBack = () => dispatch({ type: 'GO_BACK' });

  const saveCurrentSession = async () => {
    if (!data.followUp) return;

    const content = data.followUp;
    const formattedText = `${content.headline}\n\n${content.mainInsight}\n\n${content.keyPoints.map(p => `• ${p}`).join('\n')}\n\n${content.advice}`;

    await saveRecord({
      id: generateId(),
      createdAt: new Date().toISOString(),
      capture: {
        eventText: data.rawText,
        contextTag: ContextTag.SELF,
        moodBefore: 0,
      },
      split: { fact: data.fact, interpretation: data.interpretation },
      selectedNeeds: data.selectedNeeds,
      unknowns: data.unknowns,
      clarifyingQuestion: data.clarifyingQuestion,
      clarifyingAnswer: data.clarifyingAnswer.trim() || undefined,
      contextPatches: data.versions.slice(1).map(version => ({
        addedContext: version.addedContext || '',
        why: version.changeSummary?.why || '',
      })),
      chosenReframe: { type: (data.selectedReframeType as ReframeType) || ReframeType.AGENCY, text: data.selectedReframe || '' },
      chosenAction: { type: ActionType.WRITING, text: formattedText },
      moodDelta: 0,
    });
  };

  return {
    ...state,
    actions: {
      startFlow, startDemo, onBufferEnd, submitDump, updateSplit, setClarifyingAnswer, toggleNeed, addCustomNeed,
      confirmSplit, selectReframe, fetchFollowUp, reset, startGrounding, goBack, retryAI,
      openContextPatch, submitContextPatch, skipLoading, setLanguage, handleImageUpload, removeImage, saveCurrentSession,
    },
  };
};
