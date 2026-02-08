
export enum FlowStep {
  HOME = 'HOME',
  BUFFER = 'BUFFER',
  CAPTURE = 'CAPTURE',
  SPLIT_REVIEW = 'SPLIT_REVIEW', // New step: Review AI split
  REFRAME_SELECTION = 'REFRAME_SELECTION', // New step: Choose perspective
  ACTION = 'ACTION',
  CLOSE = 'CLOSE',
  HISTORY = 'HISTORY',
}

export type Language = 'zh' | 'en';

export enum ContextTag {
  SOCIAL = 'social',
  WORK = 'work',
  FAMILY = 'family',
  SELF = 'self',
}

// The three "Friend" personas
export enum ReframeType {
  CAMERA = 'CAMERA',      // Objective, dull
  SOCIOLOGIST = 'SOCIOLOGIST', // Probabilistic, system view (Renamed from SCIENTIST)
  SHIELD = 'SHIELD',      // Protective boundary
}

export enum ActionType {
  SENSORY = 'SENSORY',    // Physical/Grounding
  WRITING = 'WRITING',    // Cognitive/Foundation
  BOUNDARY = 'BOUNDARY',  // Social/Blocking
}

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

// New Structured Follow-up Content
export interface FollowUpContent {
  headline: string;    // Short essence (e.g., "Cognitive Overload")
  encouragement: string; // New: Dynamic short comforting phrase (e.g., "You are safe")
  mainInsight: string; // The deep dive paragraph
  keyPoints: string[]; // 3 bullet points
  advice: string;      // Closing warm sentence
}

// Main Draft Object
export interface Draft {
  id: string;
  createdAt: number;
  step: FlowStep;
  capture: CaptureData;
  split: SplitResult; // AI Result 1
  reframes: ReframeOption[]; // AI Result 2
  selectedReframe: ReframeOption | null;
  actions: ActionOption[];
  selectedAction: ActionOption | null;
  moodAfter: number;
}

// Final Record for History
export interface TriageRecord {
  id: string;
  createdAt: string;
  capture: CaptureData;
  split: SplitResult;
  selectedNeeds?: string[]; // New: Store the tags selected during triage
  chosenReframe: ReframeOption;
  chosenAction: ActionOption;
  moodDelta: number;
}

// AI Service Response Types
export interface AISplitResponse {
  fact: string;
  interpretation: string;
  distortion?: 'SELF_ATTACK' | 'CATASTROPHIZING' | 'MIND_READING' | 'SHOULD_STATEMENTS' | 'ALL_OR_NOTHING' | 'EMOTIONAL_REASONING' | null; // AI-detected distortion
}

export interface AIReframeResponse {
  camera: string;
  sociologist: string;
  shield: string;
  suggestedActions: {
    sensory: string;
    writing: string;
    boundary: string;
  }
}
