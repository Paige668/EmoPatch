import type {
  AIReframeResponse,
  AISplitResponse,
  ContextPatchResponse,
  FollowUpContent,
  Language,
  PerspectiveSet,
} from '../types';
import { getAudioContext } from './audioContext';

type GatewayTask = 'split' | 'reframe' | 'followup' | 'context_patch' | 'transcribe' | 'speech';

interface GatewayErrorBody {
  error?: {
    code?: string;
    message?: string;
  };
}

export class AIServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number,
  ) {
    super(message);
  }
}

async function callGateway<T>(task: GatewayTask, language: Language, payload: Record<string, unknown>): Promise<T> {
  let response: Response;
  try {
    response = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task, language, payload }),
    });
  } catch {
    throw new AIServiceError('Unable to reach the AI service.', 'network_error', 0);
  }

  const body = await response.json().catch(() => ({})) as T & GatewayErrorBody;
  if (!response.ok) {
    throw new AIServiceError(
      body.error?.message || `AI request failed (${response.status}).`,
      body.error?.code || 'ai_request_failed',
      response.status,
    );
  }
  return body;
}

const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes.buffer;
};

export const isSafetyRedirect = (error: unknown): boolean =>
  error instanceof AIServiceError && error.code === 'safety_redirect';

export const isQuotaError = (error: unknown): boolean => {
  if (!(error instanceof AIServiceError)) return false;
  return [
    'credit_balance_exhausted',
    'organization_spend_limit_exceeded',
    'project_spend_limit_exceeded',
    'organization_usage_limit_exceeded',
    'insufficient_quota',
  ].includes(error.code);
};

export const isRateLimitError = (error: unknown): boolean =>
  error instanceof AIServiceError && error.code === 'demo_rate_limit';

export const isPayloadTooLarge = (error: unknown): boolean =>
  error instanceof AIServiceError && (error.code === 'payload_too_large' || error.status === 413);

export const transcribeAudio = async (
  audioBase64: string,
  mimeType: string,
  language: Language,
): Promise<string> => {
  const response = await callGateway<{ text: string }>('transcribe', language, { audioBase64, mimeType });
  return response.text;
};

export const generateSpeech = async (text: string, language: Language): Promise<AudioBuffer> => {
  const response = await callGateway<{ audioBase64: string; mimeType: string }>('speech', language, { text });
  const audioContext = getAudioContext();
  return audioContext.decodeAudioData(base64ToArrayBuffer(response.audioBase64));
};

export const analyzeSplit = async (
  text: string,
  language: Language,
  imageBase64?: string,
  imageMime?: string,
): Promise<AISplitResponse> => callGateway<AISplitResponse>('split', language, {
  text,
  imageBase64,
  imageMime,
});

export const generateReframes = async (
  fact: string,
  interpretation: string,
  needs: string[] = [],
  language: Language,
  clarification?: string,
): Promise<AIReframeResponse> => callGateway<AIReframeResponse>('reframe', language, {
  fact,
  interpretation,
  needs,
  clarification,
});

export const generateFollowUp = async (
  fact: string,
  interpretation: string,
  personaType: string,
  requestType: 'EXPLAIN' | 'ACTION',
  language: Language,
  context: { needs?: string[]; clarification?: string; selectedPerspective?: string } = {},
): Promise<FollowUpContent> => callGateway<FollowUpContent>('followup', language, {
  fact,
  interpretation,
  personaType,
  requestType,
  needs: context.needs || [],
  clarification: context.clarification,
  selectedPerspective: context.selectedPerspective,
});

export const reviseContext = async (
  fact: string,
  interpretation: string,
  previousReframes: PerspectiveSet,
  addedContext: string,
  needs: string[],
  language: Language,
  clarification?: string,
): Promise<ContextPatchResponse> => callGateway<ContextPatchResponse>('context_patch', language, {
  fact,
  interpretation,
  previousReframes,
  addedContext,
  needs,
  clarification,
});
