
# EmoPatch (Soft Triage)

> **"A Soft Patch for Hard Moments."**

## IMPORTANT DISCLAIMER

**EmoPatch is a wellness tool designed for self-reflection and emotional clarity. It is NOT a medical device and does not provide medical diagnosis, treatment, or professional therapy. If you are in a crisis, please seek professional help immediately.**

## Overview

EmoPatch is a bite-sized emotional clarity web application designed for high-sensitivity users. It utilizes **Google Gemini 3** to help users de-escalate immediate emotional triggers by applying Cognitive Reframing principles.

Unlike generic chatbots that offer vague comfort, EmoPatch acts as a structured "Thought Sorting" system. It helps users separate objective facts from subjective interpretations, identifies unhelpful thinking patterns, and offers fresh perspectives through distinct, non-judgmental personas.

## Unique Core Logic & Philosophy

The application is built around **"Emotional Logic Analysis"** to interrupt the cycle of rumination:

### 1. The Great Split (Fact vs. Interpretation)

Stress often stems from confusing *what happened* (Fact) with *what we assume it means* (Interpretation).

***Step:** The app asks the user to "dump" their raw thoughts via Voice, Text, or Image.
***AI Logic:** It extracts the "Camera Fact" (objective reality, e.g., "He looked at his phone") and separates it from the "Narrative" (e.g., "He is ignoring me").

### 2. Thinking Pattern Recognition

Before offering perspective, the system acts as a gentle safety net. If the user's input contains potentially stressful patterns (e.g., Negative Self-Talk, Catastrophizing, Assumption Making), the flow interrupts with a gentle "Pause & Breathe" moment to stabilize the user before proceeding.

### 3. The Three Perspectives (Reframing)

Instead of generic "positive vibes," EmoPatch offers three specific cognitive lenses to view the situation:

***📹 The Observer (Objectivity):** A mechanical, dry view of the event. "Event A occurred, followed by Event B." (Reduces emotional intensity).
***🧬 The Sociologist (Systems):** Attributes events to external factors, probability, or human limitations. "This is a systemic phenomenon, not a personal target." (Reduces personalization).
***🛡️ The Shield (Boundaries):** A protective, agency-focused voice. "Regardless of the outcome, I prioritize my own well-being." (Restores sense of control).

## Technical Architecture & AI Orchestration

EmoPatch does not rely on a single model. Instead, it acts as a **Multi-Model Orchestrator**, assigning specific cognitive tasks to the most suitable Gemini variant to balance latency, reasoning depth, and emotional resonance.

### Architecture Diagram

```mermaid
graph TD
    %% Styling
    classDef input fill:#f9f,stroke:#333,stroke-width:2px;
    classDef react fill:#61dafb,stroke:#333,stroke-width:2px,color:black;
    classDef geminiFlash fill:#e6f7ff,stroke:#007bff,stroke-width:2px;
    classDef geminiPro fill:#e6fffa,stroke:#00cc88,stroke-width:4px;
    classDef geminiTTS fill:#fff0f6,stroke:#ff85c0,stroke-width:2px;

    User((User)) -->|Voice / Image / Text| React[React App\n(Client Side)]:::react

    subgraph "Perception Layer (Fast)"
        React -->|useAudioRecorder Hook| AudioBlob[Audio Blob]
        AudioBlob -->|Multimodal Input| G3Flash[Gemini 3 Flash\n(STT & Emotional Tone)]:::geminiFlash
        G3Flash -->|Transcribed Text + Tone| React
    end

    subgraph "Cognitive Layer (Deep)"
        React -->|Structured Prompt + CBT Context| G3Pro[Gemini 3 Pro\n(Reasoning & Reframing)]:::geminiPro
        G3Pro -->|Fact/Interpretation Split| React
        G3Pro -->|3 Persona Perspectives| React
    end

    subgraph "Response Layer (Empathetic)"
        React -->|Final Advice Text| G2TTS[Gemini 2.5 Flash TTS\n(Voice Synthesis)]:::geminiTTS
        G2TTS -->|Audio Buffer| React
    end

    React -->|Play Audio & Visuals| User
```

### 1. The "Deep Brain" (Cognitive Reframing)

***Primary Model:** `gemini-3-pro-preview`
***Role:** Handles the core "Three Perspectives" generation and deep pattern analysis.
***Why:** Cognitive reframing requires high nuance and empathy. The Pro model excels at complex reasoning, ensuring the "Sociologist" and "Shield" personas sound profound and human-like.

### 2. The "Fast Ears" (Perception & Triage)

***Primary Model:** `gemini-3-flash-preview`
***Role:** Handles real-time voice transcription, multimodal input (images), and initial intent detection.
***Why:** For the initial interaction, low latency is critical. Flash provides native multimodal understanding at high speed, making the user feel heard instantly.

### 3. The "Voice" (Connection)

***Model:** `gemini-2.5-flash-preview-tts`
***Role:** Specialized Text-to-Speech generation.
***Why:** While Gemini 3 is multimodal, we utilize the specialized 2.5 TTS model to access advanced speech controls (e.g., 'Kore' persona) to ensure the output voice is soothing and therapeutically appropriate.

## AI Safety & Ethical Guardrails

To ensure strict compliance with international safety standards, EmoPatch is engineered with multi-layered safety moats. The system is explicitly designed as a **Cognitive Coaching Tool**, strictly isolated from clinical intervention.

### 1. Multi-Stage Protocol Enforcement

We have implemented a Mandatory Safety Interruption Protocol across ALL internal logic steps. This ensures that the AI cannot generate medical advice, regardless of the generation stage (Initial Split, Reframing, or Deep Analysis):
*`getSplitSystemInstruction`: Hard-coded boundaries during initial thought deconstruction.
*`getReframePrompt`: Strict persona constraints during perspective generation.
*`getFollowUpPrompt`: Enforcement during deep insight and action-step synthesis.

> **[SAFETY PROTOCOL - ENFORCED AT EVERY STEP]**
> *YOU ARE A COGNITIVE PROCESSING TOOL, NOT A MENTAL HEALTH PROFESSIONAL.
>*NO DIAGNOSIS: Never use DSM-5 terminology (e.g., "Depression", "Bipolar") to label users.
>*NO PRESCRIPTION: Never tell users what they "should" do medically.
>*CRISIS REDIRECTION: If self-harm is detected, STOP analysis and output suicide prevention resources ONLY.

### 2. Scope of Analysis: Patterns vs. Pathology

***The Logic:** The AI identifies Cognitive Distortions (educational concepts like Catastrophizing or Mind Reading), which are universal thinking habits, not clinical symptoms.
***The Restriction:** The system is technically prohibited from mapping these patterns to medical diagnostic codes. It treats input as "thought-loop bugs," not "biological disorders."

### 3. Crisis De-escalation & Redirection

***Mechanism:** If high-risk sentiment (e.g., `SELF_ATTACK`) is detected, the `StepExtremeAlert` protocol overrides the standard logic.
***Action:** The system immediately shifts from "Analysis Mode" to "Stabilization Mode," guiding the user through grounding exercises (e.g., 4-7-8 breathing), acting as a First-Aid De-escalator rather than a medical provider.

## UX Engineering Highlights

### Latency as a Feature (The Breathing Buffer)

We turned a technical constraint into a psychological feature.
***The Problem:** Deep reasoning with `gemini-3-pro` takes time (approx. 5-10 seconds).
***The Solution:** Instead of a generic loading spinner, we trigger a 20-second UI-guided breathing exercise (consisting of two 10-second cycles: 4s Inhale + 6s Exhale).
***The Impact:** This creates a natural "Buffer Zone." By the time the user completes two deep breath cycles to lower their physiological tension, the high-latency AI analysis is ready. We effectively masked the latency while providing direct therapeutic value.

### Vibe Engineering (Claymorphism)

***Visual Strategy:** We strictly avoided clinical or "tech-heavy" aesthetics.
***Implementation:** Used **Claymorphism (Soft 3D)** with "Sage Green" and "Warm Cream" palettes. The UI elements look soft, squeezable, and non-threatening, physically reducing the user's cognitive load and defensive state.

## Key Functionalities

***Multimodal Input (Gemini 3):** Text, Voice (Tone Analysis via native audio tokens), and Image Context.
***Bilingual Support:** Seamlessly toggle between English and Chinese (Mandarin) with culturally adapted nuances.
***Audio Guidance (TTS):** Soothing speech synthesis using `gemini-2.5-flash-preview-tts`.
***Offline "Coping" Mode:** Robust error handling. If the API is unreachable, the app falls back to local "Grounding Templates" so the user is never left without support.
***Local History:** All sessions are saved locally in the browser (IndexedDB) for privacy and personal reflection.

## Technical Architecture Stack

***Frontend:** React 18, TypeScript, Tailwind CSS.
***Animation:** Framer Motion (for smooth, calming transitions).
***AI Engine:** Google Gemini API via `@google/genai`.
***Orchestration Logic:** Custom `executeWithFallback` wrapper implementing the Pro → 3 Flash priority queue.
***State Management:** React `useReducer` (State Machine pattern).
***Storage:** `idb-keyval` (IndexedDB wrapper).

### Data Flow

1. **Capture:** `useAudioRecorder` → State.
2. **Fast Analysis (3 Flash):** Rapidly extracts facts and emotional tone.
3. **Buffer:** User performs a 20s breathing exercise while Pro model reasons in background (with auto-fallback).
4. **Deep Reframing:** Generates 3 specific personas with safety checks.
5. **Synthesis:** Output rendered to UI + Audio Buffer (TTS).

## Project Structure

```bash
/src
  ├── components/       # Claymorphism UI & Flow Steps
  │   ├── steps/        # Dump, PatternAlert, Perspectives, Final
  │   └── ui/           # ClayCard, ClayButton, BreathingCircle
  ├── services/          
  │   ├── aiService.ts  # Implements Cascading Fallback Logic
  │   ├── prompts.ts    # System instructions & Guardrails
  │   └── storage.ts    # IndexedDB operations
  ...
```

## Privacy

***No Backend Database:** EmoPatch does not store user data on a server.
***Local Storage:** History is stored strictly in the user's browser via IndexedDB.
***AI Privacy:** Data is sent to the Google Gemini API solely for processing the immediate session and is not retained by this application.

## Credits

Developed as a prototype for emotional wellness using the latest capabilities of the **Google Gemini 3** model family.
