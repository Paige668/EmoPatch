
import { useReducer, useRef, useEffect } from 'react';
import { analyzeSplit, generateReframes, generateFollowUp } from '../services/aiService';
import { saveRecord, findRecordByText } from '../services/storageService';
import { ContextTag, ActionType, ReframeType, Language, FollowUpContent } from '../types';
import { getFallbackData, FOLLOWUP_FALLBACKS } from '../constants';

// --- Types ---

export type TriageStep = 
  | 'IDLE'
  | 'BUFFER'
  | 'DUMP'
  | 'USER_SPLIT' // Standard Step: Gamification/Training (Legacy/Optional)
  | 'ANALYZING'
  | 'CONFIRM'
  | 'EXTREME_ALERT'
  | 'REFRAMING'
  | 'CHOICE'
  | 'DEPTH_CHOICE'
  | 'GENERATING_FOLLOWUP'
  | 'FINAL_CONTENT';

export interface TriageData {
  rawText: string;
  rawImage: string | null;
  userFactAttempt: string | null; // User's manual attempt
  fact: string;
  interpretation: string;
  selectedNeeds: string[];
  reframes: { camera: string; sociologist: string; shield: string } | null;
  selectedReframe: string | null;
  selectedReframeType: string | null;
  followUp: FollowUpContent | null;
  extremeType: 'SELF_ATTACK' | 'CATASTROPHIZING' | 'MIND_READING' | 'SHOULD_STATEMENTS' | 'ALL_OR_NOTHING' | 'EMOTIONAL_REASONING' | null;
  isFallback: boolean;
  fallbackReason: 'AI_ERROR' | 'MANUAL_SKIP' | null;
  followUpRequestType?: 'EXPLAIN' | 'ACTION'; // Transient state for followup generation
}

interface TriageState {
  step: TriageStep;
  language: Language;
  isOfflineMode: boolean;
  offlineReason: 'QUOTA' | 'MANUAL' | 'NETWORK' | null;
  bufferDuration: number;
  loading: boolean;
  data: TriageData;
}

// --- Actions ---

type Action =
  | { type: 'SET_LANGUAGE'; payload: Language }
  | { type: 'START_FLOW' }
  | { type: 'BUFFER_END' }
  | { type: 'INPUT_UPDATE'; payload: string }
  | { type: 'SET_IMAGE'; payload: string }
  | { type: 'REMOVE_IMAGE' }
  | { type: 'DETECTED_EXTREME'; payload: 'SELF_ATTACK' | 'CATASTROPHIZING' | 'MIND_READING' | 'SHOULD_STATEMENTS' | 'ALL_OR_NOTHING' | 'EMOTIONAL_REASONING' }
  | { type: 'STABILIZE' }
  | { type: 'CONTINUE_ANYWAY' }
  | { type: 'GO_TO_USER_SPLIT' } // Transition to user split
  | { type: 'SUBMIT_USER_SPLIT'; payload: string } // Submit user's fact
  | { type: 'SKIP_USER_SPLIT' } // Skip user split
  | { type: 'START_ANALYSIS' }
  | { type: 'ANALYSIS_SUCCESS'; payload: { fact: string; interpretation: string; distortion?: string | null } }
  | { type: 'ANALYSIS_ERROR'; payload: { isQuota: boolean; fallbackFact: string } }
  | { type: 'MANUAL_OFFLINE_START'; payload: string }
  | { type: 'UPDATE_SPLIT'; payload: { fact?: string; interpretation?: string } }
  | { type: 'TOGGLE_NEED'; payload: string }
  | { type: 'ADD_CUSTOM_NEED'; payload: string }
  | { type: 'START_REFRAMING' }
  | { type: 'REFRAMING_SUCCESS'; payload: any }
  | { type: 'REFRAMING_ERROR'; payload: { isQuota: boolean; fallbackReframes: any } }
  | { type: 'SELECT_REFRAME'; payload: { type: string; text: string } }
  | { type: 'START_FOLLOWUP'; payload: 'EXPLAIN' | 'ACTION' }
  | { type: 'FOLLOWUP_SUCCESS'; payload: FollowUpContent }
  | { type: 'FOLLOWUP_ERROR'; payload: { isQuota: boolean; fallbackContent: FollowUpContent } }
  | { type: 'RESET' }
  | { type: 'GO_BACK' }
  | { type: 'SKIP_LOADING'; payload: { step: TriageStep; fallbackData: any } }
  | { type: 'SET_NETWORK_STATUS'; payload: boolean };

// --- Initial State ---

const initialData: TriageData = {
  rawText: '',
  rawImage: null,
  userFactAttempt: null,
  fact: '',
  interpretation: '',
  selectedNeeds: [],
  reframes: null,
  selectedReframe: null,
  selectedReframeType: null,
  followUp: null,
  extremeType: null,
  isFallback: false,
  fallbackReason: null,
};

const initialState: TriageState = {
  step: 'IDLE',
  language: 'en',
  isOfflineMode: false,
  offlineReason: null,
  bufferDuration: 5000,
  loading: false,
  data: initialData,
};

// --- Helper ---
const generateId = () => Math.random().toString(36).substr(2, 9);

// --- Reducer ---

function triageReducer(state: TriageState, action: Action): TriageState {
  switch (action.type) {
    case 'SET_LANGUAGE':
      return { ...state, language: action.payload };
    
    case 'SET_NETWORK_STATUS':
      const isOnline = action.payload;
      if (!isOnline) {
        return { ...state, isOfflineMode: true, offlineReason: 'NETWORK' };
      } else {
        if (state.offlineReason === 'NETWORK') {
            return { ...state, isOfflineMode: false, offlineReason: null };
        }
        return state;
      }
    
    case 'START_FLOW':
      return {
        ...state,
        step: 'BUFFER',
        bufferDuration: 10500, // Changed: 10.5s for 1 cycle of 4-6 breathing (with slight buffer)
        data: initialData,
      };

    case 'BUFFER_END':
      // FIX: If we just finished stabilizing from an extreme alert (detected earlier),
      // proceed to CONFIRM without re-analyzing to avoid infinite loop.
      if (state.data.extremeType && state.data.fact) {
          return { ...state, step: 'CONFIRM' }; 
      }

      if (state.data.rawText || state.data.rawImage) {
        // Will trigger analysis in hook
        return { ...state };
      }
      return { ...state, step: 'DUMP' };

    case 'INPUT_UPDATE':
      return { ...state, data: { ...state.data, rawText: action.payload } };

    case 'SET_IMAGE':
      return { ...state, data: { ...state.data, rawImage: action.payload } };

    case 'REMOVE_IMAGE':
      return { ...state, data: { ...state.data, rawImage: null } };
    
    case 'GO_TO_USER_SPLIT':
      return { ...state, step: 'USER_SPLIT' };

    case 'SUBMIT_USER_SPLIT':
      return { ...state, data: { ...state.data, userFactAttempt: action.payload } }; 

    case 'SKIP_USER_SPLIT':
       return { ...state }; 

    case 'DETECTED_EXTREME':
      return {
        ...state,
        step: 'EXTREME_ALERT',
        data: { ...state.data, extremeType: action.payload },
      };

    case 'STABILIZE':
      return {
        ...state,
        step: 'BUFFER',
        bufferDuration: 20000, // 20s for 2 cycles of 4-6 breathing
      };

    case 'CONTINUE_ANYWAY':
      // Move to CONFIRM directly because data is already loaded from previous analysis
      return { ...state, step: 'CONFIRM' }; 

    case 'START_ANALYSIS':
      return { ...state, step: 'ANALYZING', loading: true };

    case 'ANALYSIS_SUCCESS':
      return {
        ...state,
        step: action.payload.distortion ? 'EXTREME_ALERT' : 'CONFIRM',
        loading: false,
        data: {
          ...state.data,
          fact: action.payload.fact,
          interpretation: action.payload.interpretation,
          extremeType: action.payload.distortion as any || null,
          isFallback: false,
          fallbackReason: null,
        },
      };

    case 'ANALYSIS_ERROR':
      return {
        ...state,
        step: 'CONFIRM',
        loading: false,
        isOfflineMode: action.payload.isQuota ? true : state.isOfflineMode,
        offlineReason: action.payload.isQuota ? 'QUOTA' : state.offlineReason,
        data: {
          ...state.data,
          fact: action.payload.fallbackFact,
          interpretation: '',
          isFallback: true,
          fallbackReason: 'AI_ERROR',
        },
      };

    case 'MANUAL_OFFLINE_START':
      return {
        ...state,
        step: 'CONFIRM',
        loading: false,
        data: {
          ...state.data,
          rawText: action.payload,
          fact: action.payload,
          interpretation: state.language === 'zh' ? '（离线模式：请手动填写您的想法）' : '(Offline: Please enter your interpretation)',
          isFallback: true,
          fallbackReason: 'MANUAL_SKIP'
        }
      };

    case 'UPDATE_SPLIT':
      return { ...state, data: { ...state.data, ...action.payload } };

    case 'TOGGLE_NEED':
      const needs = state.data.selectedNeeds.includes(action.payload)
        ? state.data.selectedNeeds.filter(n => n !== action.payload)
        : [...state.data.selectedNeeds, action.payload];
      return { ...state, data: { ...state.data, selectedNeeds: needs } };

    case 'ADD_CUSTOM_NEED':
      if (state.data.selectedNeeds.includes(action.payload)) return state;
      return { ...state, data: { ...state.data, selectedNeeds: [...state.data.selectedNeeds, action.payload] } };

    case 'START_REFRAMING':
      return { ...state, step: 'REFRAMING', loading: true };

    case 'REFRAMING_SUCCESS':
      return {
        ...state,
        step: 'CHOICE',
        loading: false,
        data: { ...state.data, reframes: action.payload, isFallback: false, fallbackReason: null },
      };

    case 'REFRAMING_ERROR':
      return {
        ...state,
        step: 'CHOICE',
        loading: false,
        isOfflineMode: action.payload.isQuota ? true : state.isOfflineMode,
        offlineReason: action.payload.isQuota ? 'QUOTA' : state.offlineReason,
        data: {
          ...state.data,
          reframes: action.payload.fallbackReframes,
          isFallback: true,
          fallbackReason: 'AI_ERROR',
        },
      };

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
        loading: true, 
        data: { 
            ...state.data, 
            followUp: null,
            followUpRequestType: action.payload 
        } 
      };

    case 'FOLLOWUP_SUCCESS':
      return {
        ...state,
        step: 'FINAL_CONTENT',
        loading: false,
        data: { ...state.data, followUp: action.payload, isFallback: false, fallbackReason: null },
      };

    case 'FOLLOWUP_ERROR':
      return {
        ...state,
        step: 'FINAL_CONTENT',
        loading: false,
        isOfflineMode: action.payload.isQuota ? true : state.isOfflineMode,
        offlineReason: action.payload.isQuota ? 'QUOTA' : state.offlineReason,
        data: {
          ...state.data,
          followUp: action.payload.fallbackContent,
          isFallback: true,
          fallbackReason: 'AI_ERROR',
        },
      };

    case 'SKIP_LOADING':
      const { step: loadingStep, fallbackData } = action.payload;
      let nextStep: TriageStep = state.step;
      let updateData = {};

      if (loadingStep === 'ANALYZING') {
        nextStep = 'CONFIRM';
        updateData = { fact: state.data.rawText, interpretation: '' };
      } else if (loadingStep === 'REFRAMING') {
        nextStep = 'CHOICE';
        updateData = { reframes: fallbackData.reframes };
      } else if (loadingStep === 'GENERATING_FOLLOWUP') {
        nextStep = 'FINAL_CONTENT';
        updateData = { followUp: fallbackData.followUp };
      }

      return {
        ...state,
        step: nextStep,
        loading: false,
        data: {
          ...state.data,
          ...updateData,
          isFallback: true,
          fallbackReason: 'MANUAL_SKIP',
        },
      };
    
    case 'RESET':
        return {
            ...initialState,
            language: state.language // Persist language
        };
        
    case 'GO_BACK':
        // Simple history stack logic approximation
        let prevStep: TriageStep = 'IDLE';
        if (state.step === 'DUMP') prevStep = 'IDLE';
        // else if (state.step === 'USER_SPLIT') prevStep = 'DUMP'; // Skipped
        else if (state.step === 'CONFIRM') prevStep = 'DUMP'; // Was USER_SPLIT
        else if (state.step === 'CHOICE') prevStep = 'CONFIRM';
        else if (state.step === 'DEPTH_CHOICE') prevStep = 'CHOICE';
        else if (state.step === 'FINAL_CONTENT') prevStep = 'DEPTH_CHOICE';
        
        return { ...state, step: prevStep };

    default:
      return state;
  }
}

// --- Hook ---

export const useTriageFlow = () => {
  const [state, dispatch] = useReducer(triageReducer, initialState);
  
  // -- Effects: AI Services --

  // 1. Analysis (Split)
  useEffect(() => {
    if (state.step === 'ANALYZING' && !state.data.isFallback) {
        if (state.isOfflineMode) {
             dispatch({ 
                type: 'ANALYSIS_ERROR', 
                payload: { isQuota: false, fallbackFact: state.data.rawText } 
             });
             return;
        }

        analyzeSplit(state.data.rawText, state.language, state.data.rawImage ? state.data.rawImage.split(',')[1] : undefined, state.data.rawImage ? state.data.rawImage.split(';')[0].split(':')[1] : undefined)
            .then(res => dispatch({ type: 'ANALYSIS_SUCCESS', payload: res }))
            .catch(err => {
                console.error(err);
                const isQuota = typeof (err as any)?.message === 'string' && (err as any).message.includes('quota');
                dispatch({ 
                    type: 'ANALYSIS_ERROR', 
                    payload: { isQuota, fallbackFact: state.data.rawText } 
                });
            });
    }
  }, [state.step, state.data.rawText, state.data.rawImage, state.language, state.isOfflineMode]);

  // 2. Reframing
  useEffect(() => {
    if (state.step === 'REFRAMING' && !state.data.isFallback) {
        if (state.isOfflineMode) {
             dispatch({ 
                 type: 'REFRAMING_ERROR', 
                 payload: { isQuota: false, fallbackReframes: getFallbackData(state.language).reframes } 
             });
             return;
        }

        generateReframes(state.data.fact, state.data.interpretation, state.data.selectedNeeds, state.language)
            .then(res => dispatch({ type: 'REFRAMING_SUCCESS', payload: res }))
            .catch(err => {
                console.error(err);
                const isQuota = typeof (err as any)?.message === 'string' && (err as any).message.includes('quota');
                dispatch({ 
                    type: 'REFRAMING_ERROR', 
                    payload: { isQuota, fallbackReframes: getFallbackData(state.language).reframes } 
                });
            });
    }
  }, [state.step, state.data.fact, state.data.interpretation, state.data.selectedNeeds, state.language, state.isOfflineMode]);

  // 3. Follow Up
  useEffect(() => {
    if (state.step === 'GENERATING_FOLLOWUP' && !state.data.isFallback) {
         if (state.isOfflineMode) {
             dispatch({ 
                 type: 'FOLLOWUP_ERROR', 
                 payload: { isQuota: false, fallbackContent: FOLLOWUP_FALLBACKS[state.language] as FollowUpContent } 
             });
             return;
        }

        generateFollowUp(
            state.data.fact, 
            state.data.interpretation, 
            state.data.selectedReframeType || 'SHIELD', 
            state.data.followUpRequestType || 'ACTION', 
            state.language
        )
            .then(res => dispatch({ type: 'FOLLOWUP_SUCCESS', payload: res }))
            .catch(err => {
                console.error(err);
                const isQuota = typeof (err as any)?.message === 'string' && (err as any).message.includes('quota');
                dispatch({ 
                    type: 'FOLLOWUP_ERROR', 
                    payload: { isQuota, fallbackContent: FOLLOWUP_FALLBACKS[state.language] as FollowUpContent } 
                });
            });
    }
  }, [state.step, state.data.fact, state.data.interpretation, state.data.selectedReframeType, state.data.followUpRequestType, state.language, state.isOfflineMode]);

  // -- Action Handlers --

  const startFlow = () => dispatch({ type: 'START_FLOW' });
  const onBufferEnd = () => dispatch({ type: 'BUFFER_END' });
  
  const submitDump = (text: string) => {
      dispatch({ type: 'INPUT_UPDATE', payload: text });
      // SKIP USER SPLIT: Directly start analysis
      dispatch({ type: 'START_ANALYSIS' });
  };

  const submitUserSplit = (text: string) => {
      dispatch({ type: 'SUBMIT_USER_SPLIT', payload: text });
      dispatch({ type: 'START_ANALYSIS' });
  };

  const skipUserSplit = () => {
      dispatch({ type: 'SKIP_USER_SPLIT' });
      dispatch({ type: 'START_ANALYSIS' });
  };
  
  const updateSplit = (updates: { fact?: string; interpretation?: string }) => dispatch({ type: 'UPDATE_SPLIT', payload: updates });
  const toggleNeed = (need: string) => dispatch({ type: 'TOGGLE_NEED', payload: need });
  const addCustomNeed = (need: string) => dispatch({ type: 'ADD_CUSTOM_NEED', payload: need });
  
  const confirmSplit = () => dispatch({ type: 'START_REFRAMING' });
  const selectReframe = (type: string, text: string) => dispatch({ type: 'SELECT_REFRAME', payload: { type, text } });
  
  const fetchFollowUp = (type: 'EXPLAIN' | 'ACTION') => dispatch({ type: 'START_FOLLOWUP', payload: type });
  
  const handleExtremeChoice = (choice: 'STABILIZE' | 'CONTINUE') => {
      if (choice === 'STABILIZE') dispatch({ type: 'STABILIZE' });
      else dispatch({ type: 'CONTINUE_ANYWAY' });
  };
  
  const skipLoading = () => {
      let fallbackData: any = {};
      if (state.step === 'ANALYZING') fallbackData = {}; // Just confirms raw text
      if (state.step === 'REFRAMING') fallbackData = { reframes: getFallbackData(state.language).reframes };
      if (state.step === 'GENERATING_FOLLOWUP') fallbackData = { followUp: FOLLOWUP_FALLBACKS[state.language] };
      
      dispatch({ type: 'SKIP_LOADING', payload: { step: state.step, fallbackData } });
  };

  const setLanguage = (lang: Language) => dispatch({ type: 'SET_LANGUAGE', payload: lang });
  
  const handleImageUpload = (file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
          dispatch({ type: 'SET_IMAGE', payload: reader.result as string });
      };
      reader.readAsDataURL(file);
  };
  
  const removeImage = () => dispatch({ type: 'REMOVE_IMAGE' });
  
  const reset = () => dispatch({ type: 'RESET' });
  const goBack = () => dispatch({ type: 'GO_BACK' });

  const saveCurrentSession = async () => {
     if (!state.data.followUp) return;
     
     const content = state.data.followUp;
     const formattedText = `${content.headline}\n\n${content.mainInsight}\n\n${content.keyPoints.map(p => `• ${p}`).join('\n')}\n\n${content.advice}`;
     
     await saveRecord({
        id: generateId(),
        createdAt: new Date().toISOString(),
        capture: {
            eventText: state.data.rawText,
            contextTag: ContextTag.SELF,
            moodBefore: 0
        },
        split: { fact: state.data.fact, interpretation: state.data.interpretation },
        selectedNeeds: state.data.selectedNeeds,
        chosenReframe: { type: state.data.selectedReframeType as ReframeType || ReframeType.SHIELD, text: state.data.selectedReframe || '' },
        chosenAction: { type: ActionType.WRITING, text: formattedText },
        moodDelta: 0
    });
  };

  return {
    ...state,
    actions: { 
        startFlow, onBufferEnd, submitDump, submitUserSplit, skipUserSplit, updateSplit, toggleNeed, addCustomNeed,
        confirmSplit, selectReframe, fetchFollowUp, reset, handleExtremeChoice, goBack,
        skipLoading, setLanguage, handleImageUpload, removeImage, saveCurrentSession
    }
  };
};
