export type Language = 'zh' | 'en';

export enum ContextTag {
  SOCIAL = 'social',
  WORK = 'work',
  FAMILY = 'family',
  SELF = 'self',
}

// Three evidence-informed reflection lenses.
// The legacy persona values are still supported in constants.ts when old local
// records are rendered, but new sessions use these clearer operations.
export enum ReframeType {
  OBSERVER = 'OBSERVER',
  POSSIBILITIES = 'POSSIBILITIES',
  AGENCY = 'AGENCY',
}

export enum ActionType {
  SENSORY = 'SENSORY',    // Physical/Grounding
  WRITING = 'WRITING',    // Cognitive/Foundation
  BOUNDARY = 'BOUNDARY',  // Social/Blocking
}

export type ThinkingPattern =
  | 'SELF_ATTACK'
  | 'CATASTROPHIZING'
  | 'MIND_READING'
  | 'SHOULD_STATEMENTS'
  | 'ALL_OR_NOTHING'
  | 'EMOTIONAL_REASONING';

export type FollowUpRequestType = 'EXPLAIN' | 'ACTION';

export interface SplitResult {
  fact: string;
  interpretation: string;
}

export interface ReframeOption {
  type: ReframeType;
  text: string;
}

export interface ActionOption {
  type: ActionType;
  text: string;
}

export interface CaptureData {
  eventText: string;
  contextTag: ContextTag;
  moodBefore: number;
}

// Structured follow-up content
export interface FollowUpContent {
  headline: string;    // Short essence (e.g., "Cognitive Overload")
  encouragement: string; // Dynamic, non-clinical acknowledgment
  mainInsight: string; // The deep dive paragraph
  keyPoints: string[]; // 3 bullet points
  advice: string;      // Closing warm sentence
}

export interface PerspectiveSet {
  observer: string;
  possibilities: string;
  agency: string;
}

export interface ContextPatchResponse {
  updatedFact: string;
  updatedInterpretation: string;
  unknowns: string[];
  reframes: PerspectiveSet;
  changeSummary: {
    changed: string[];
    stayed: string[];
    why: string;
  };
}

// One snapshot of the analysis. A new version is appended every time a
// Context Patch succeeds, so the UI can show a before/after comparison.
export interface AnalysisVersion {
  createdAt: string;
  addedContext?: string;
  fact: string;
  interpretation: string;
  unknowns: string[];
  reframes: PerspectiveSet;
  changeSummary?: ContextPatchResponse['changeSummary'];
}

// Final Record for History
export interface TriageRecord {
  id: string;
  createdAt: string;
  capture: CaptureData;
  split: SplitResult;
  selectedNeeds?: string[];
  unknowns?: string[];
  clarifyingQuestion?: string | null;
  clarifyingAnswer?: string;
  contextPatches?: { addedContext: string; why: string }[];
  chosenReframe: ReframeOption;
  chosenAction: ActionOption;
  moodDelta: number;
}

// AI Service Response Types
export interface AISplitResponse {
  fact: string;
  interpretation: string;
  distortion?: ThinkingPattern | null;
  unknowns: string[];
  clarifyingQuestion: string | null;
  clarifyingWhy: string | null;
}

export type AIReframeResponse = PerspectiveSet;
