
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { AISplitResponse, AIReframeResponse, Language, FollowUpContent } from "../types";
import { 
  getTranscriptionPrompt, 
  getSplitSystemInstruction,
  getSplitAnalysisPrompt, 
  getReframePrompt, 
  getFollowUpPrompt 
} from "./prompts";
import { getAudioContext } from "./audioContext";

// --- Model Configuration with Fallback Strategy ---

// Priority queue for complex reasoning (Reframing, Deep Analysis)
// Strategy: 
// 1. The Star: gemini-3-pro-preview (Best quality)
// 2. The Speedster: gemini-3-flash-preview (Fast, native multimodal)
const REASONING_MODELS = [
  'gemini-3-pro-preview',
  'gemini-3-flash-preview'
];

// Priority queue for fast tasks (Transcription, Initial Split)
// Strategy: Unified on Gemini 3 Flash
const FAST_MODELS = [
  'gemini-3-flash-preview'
];

// Reverted to Gemini 2.5 Flash TTS for specialized voice control (Gemini 3 Flash currently lacks full TTS config support)
const TTS_MODEL_NAME = 'gemini-2.5-flash-preview-tts';

// Helper to safely get the AI client
const getAIClient = () => {
  let apiKey = '';
  try {
    // Check if process is defined (Node-like env or polyfilled)
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      apiKey = process.env.API_KEY;
    }
  } catch (e) {
    console.warn("Could not access process.env.API_KEY", e);
  }
  
  if (!apiKey) {
    console.warn("API Key is missing. AI features will fail.");
  }
  
  return new GoogleGenAI({ apiKey });
};

// Retry helper: Exponential backoff with longer initial delay for rate limits
async function retryOperation<T>(operation: () => Promise<T>, retries = 2, delay = 1000): Promise<T> {
  try {
    return await operation();
  } catch (error: any) {
    const status = error?.status || error?.code || error?.error?.code;
    const msg = error?.message || JSON.stringify(error);
    
    // Check for rate limits or temporary server errors
    const isRetryable = status === 429 || status === 503 || 
                        msg.includes('429') || msg.includes('quota') || 
                        msg.includes('RESOURCE_EXHAUSTED') || msg.includes('OVERLOADED');

    if (retries > 0 && isRetryable) {
      console.warn(`API Temporary Issue (${status}). Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryOperation(operation, retries - 1, delay * 2);
    }
    throw error;
  }
}

// --- NEW: Fallback Executor ---
// Executes an operation against a list of models. If one fails, tries the next.
async function executeWithFallback<T>(
  modelList: string[],
  action: (model: string) => Promise<T>,
  taskName: string = "AI Task"
): Promise<T> {
  let lastError: any;

  for (const model of modelList) {
    try {
      // console.log(`[${taskName}] Attempting with model: ${model}`);
      // We wrap the individual model call in a retry for transient network errors (429s)
      // before giving up on the model entirely.
      return await retryOperation(() => action(model));
    } catch (error) {
      console.warn(`[${taskName}] Model ${model} failed.`, error);
      lastError = error;
      // Continue to the next model in the list
      continue;
    }
  }

  // If we exhaust all models
  console.error(`[${taskName}] All models failed.`);
  throw lastError;
}

// --- UTILS: JSON Parsing ---
// Helper to clean JSON string from Markdown code blocks
const parseJSONResponse = (text: string | undefined): any => {
  if (!text) return {};
  
  let clean = text.trim();
  
  // Remove markdown wrapping ```json ... ``` or just ``` ... ```
  if (clean.startsWith('```')) {
    // Remove start marker (e.g. ```json)
    clean = clean.replace(/^```[a-z]*\s*/i, '');
    // Remove end marker (```)
    clean = clean.replace(/```$/, '');
    clean = clean.trim();
  }

  try {
    return JSON.parse(clean);
  } catch (e) {
    console.error("Failed to parse JSON response:", text);
    throw new Error("Invalid JSON response from AI");
  }
};

// --- UTILS: Audio decoding ---
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}


// --- STEP 0: Transcribe Audio (STT) + Emotional Analysis ---
export const transcribeAudio = async (base64Audio: string, mimeType: string, language: Language): Promise<string> => {
  return executeWithFallback(FAST_MODELS, async (model) => {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Audio
            }
          },
          {
            text: getTranscriptionPrompt(language)
          }
        ]
      }
    });
    return response.text?.trim() || "";
  }, "Transcribe Audio");
};

// --- NEW: Generate Speech (TTS) ---
// Using Gemini 2.5 Flash TTS for specialized voice control
export const generateSpeech = async (text: string, language: Language): Promise<AudioBuffer> => {
  return retryOperation(async () => {
    const ai = getAIClient();
    const voiceName = 'Kore'; 

    const response = await ai.models.generateContent({
      model: TTS_MODEL_NAME,
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName }
            }
        }
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      throw new Error("No audio data returned");
    }

    const audioContext = getAudioContext();
    const audioBytes = decode(base64Audio);
    const audioBuffer = await decodeAudioData(audioBytes, audioContext);
    
    return audioBuffer;
  });
};

// --- STEP 1: SPLIT (Fact vs Interpretation) - Supports Multimodal (Image) ---
export const analyzeSplit = async (text: string, language: Language, imageBase64?: string, imageMime?: string): Promise<AISplitResponse> => {
  return executeWithFallback(FAST_MODELS, async (model) => {
    const ai = getAIClient();
    const parts: any[] = [];
    
    if (imageBase64 && imageMime) {
        parts.push({
            inlineData: {
                mimeType: imageMime,
                data: imageBase64
            }
        });
    }

    parts.push({ text: getSplitAnalysisPrompt(text) });

    const response = await ai.models.generateContent({
      model: model,
      contents: { parts },
      config: {
        systemInstruction: getSplitSystemInstruction(language),
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            fact: { type: Type.STRING },
            interpretation: { type: Type.STRING },
            distortion: { 
              type: Type.STRING, 
              enum: [
                'SELF_ATTACK', 
                'MIND_READING', 
                'CATASTROPHIZING', 
                'SHOULD_STATEMENTS', 
                'ALL_OR_NOTHING', 
                'EMOTIONAL_REASONING', 
                'NULL'
              ],
              description: "The type of cognitive distortion detected, or 'NULL' if none."
            }
          },
          required: ["fact", "interpretation"],
        },
      },
    });

    const result = parseJSONResponse(response.text);
    if (result.distortion === 'NULL') result.distortion = null;
    return result as AISplitResponse;
  }, "Analyze Split");
};

// --- STEP 2: REFRAME (Perspectives) ---
export const generateReframes = async (fact: string, interpretation: string, needs: string[] = [], language: Language): Promise<AIReframeResponse> => {
  return executeWithFallback(REASONING_MODELS, async (model) => {
    const ai = getAIClient();
    const prompt = getReframePrompt(fact, interpretation, needs, language);

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            camera: { type: Type.STRING },
            sociologist: { type: Type.STRING }, // Changed from scientist
            shield: { type: Type.STRING },
            suggestedActions: {
              type: Type.OBJECT,
              properties: {
                sensory: { type: Type.STRING },
                writing: { type: Type.STRING },
                boundary: { type: Type.STRING },
              }
            }
          },
          required: ["camera", "sociologist", "shield", "suggestedActions"],
        },
      },
    });

    return parseJSONResponse(response.text) as AIReframeResponse;
  }, "Generate Reframes");
};

// --- STEP 3: FOLLOW UP (Deep Dive or Action) ---
export const generateFollowUp = async (
  fact: string, 
  interpretation: string, 
  personaType: string, 
  requestType: 'EXPLAIN' | 'ACTION',
  language: Language
): Promise<FollowUpContent> => {
  const ai = getAIClient();
  const prompt = getFollowUpPrompt(fact, interpretation, personaType, requestType, language);

  return executeWithFallback(REASONING_MODELS, async (model) => {
      const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
              headline: { type: Type.STRING },
              encouragement: { type: Type.STRING },
              mainInsight: { type: Type.STRING },
              keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
              advice: { type: Type.STRING }
          },
          required: ["headline", "encouragement", "mainInsight", "keyPoints", "advice"]
        }
      }
    });
    return parseJSONResponse(response.text) as FollowUpContent;
  }, "Generate FollowUp");
};
