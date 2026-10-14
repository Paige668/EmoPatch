# About EmoPatch: A Soft Patch for Hard Moments

> [!IMPORTANT]
> **Medical Disclaimer:**
> **EmoPatch is a reflection tool. It is not a medical device, therapy, or a crisis service, and it does not provide diagnosis or treatment. If you might be in danger, contact local emergency services.**

## Inspiration

In emotionally charged moments it is hard to tell what actually happened apart from the story we add to it. A short **"OK."** after a five-hour silence can quickly become *"they're angry with me"*, and then *"I always ruin things."*

Most AI wellness tools respond to that with reassurance. I wanted something different: a tool that keeps evidence and interpretation apart, notices what it does not know, and **changes its mind when new facts arrive**, even when those facts confirm the worry instead of dissolving it.

## What it does

EmoPatch turns one triggering moment into a short, structured reflection:

1. **Fact vs. story.** Text, voice, or a chat screenshot is split into *what happened* and *the story my mind added*. The user can edit both.
2. **Unknowns and The Missing Piece.** EmoPatch lists what is still unknown and asks **at most one** optional question, only when the answer could change the analysis, and says why it is asking.
3. **Three grounded perspectives.**
   * **📹 Observable Evidence:** what the evidence actually supports.
   * **🔎 Other Possibilities:** several plausible explanations, with explicit unknowns.
   * **🧭 Needs & Agency:** the user's need, and one small, reversible step within their control.
4. **Context Patch.** *"Actually, there's more context…"* The user adds a new fact and EmoPatch re-analyzes the moment, showing the story **before → now**, **what changed**, **what stayed**, and **why**. Every revision is kept as a version.
5. **A safety route.** Inputs that signal risk of self-harm or harm to others leave the normal flow and are directed to real-world support.

A **"Try a sample"** button on the home screen runs the whole loop with cached outputs, so the core idea can be seen in under a minute without an API key or network.

## How I built it

* **Frontend:** React 18, TypeScript, and Vite. The flow is an explicit reducer state machine (`hooks/useTriageFlow.ts`) with cancellable AI steps and versioned analysis history.
* **Visual language:** a claymorphism UI with Framer Motion breathing animations. A puzzle-piece "patch" ties the idea of filling in missing information to the brand.
* **AI gateway:** the browser calls only a same-origin `/api/ai` endpoint. The OpenAI key lives on the server (a Vercel function plus a matching Vite dev middleware).
* **Models:** the OpenAI Responses API with strict JSON-schema Structured Outputs and `store: false`.
  * `gpt-6-luna` handles the fast split, screenshot reading, unknowns, and the clarifying question.
  * `gpt-6-luna` also handles the perspectives, deeper follow-up, and Context Patch, to keep cost low; `gpt-6.1-sol` can be switched back on for these.
  * `gpt-transcribe` handles voice input and `gpt-4o-mini-tts` reads results aloud.
  * `omni-moderation-latest` provides the first safety signal; the split model returns a second, model-side safety signal.
* **Reliability:** per-request time budgets, retries only where they help, a fallback when output is incomplete, and offline templates that never invent meaning. A failed step offers **Retry AI** instead of locking the whole session offline.
* **Privacy:** history is stored locally in IndexedDB. AI inputs are processed by the OpenAI API under its API data controls. The app does not claim zero retention.
* **Testing:** a gateway test suite (schemas, prompt/data separation, fallbacks, safety routing), state-machine tests (navigation, retries, versioning, demo data, bilingual copy parity), and a real-API evaluation script over 10 sample cases.

## Challenges I ran into

1. **Not replacing one guess with another.** The early "Sociologist" and "Shield" personas tended to explain away the user's interpretation with new, equally unsupported claims ("they're just tired"). I replaced them with three cognitive operations (evidence, multiple hypotheses, agency) that must keep uncertainty visible.
2. **Making revision honest.** A Context Patch has to be able to say *"this new fact makes your worry more likely."* The prompts forbid defending the previous answer, and the UI shows what stayed as prominently as what changed.
3. **Safety without over-reach.** Moderation signals are a product guardrail, not a clinical assessment. I route flagged inputs to human support and avoid any language that implies diagnosis or guaranteed calm.
4. **Bilingual nuance.** Concepts like boundaries and thinking patterns needed cultural adaptation between English and Chinese, not literal translation.

## Accomplishments that I'm proud of

* **An adaptive loop rather than a one-shot answer.** The system identifies what it doesn't know, asks selectively, and visibly revises.
* **A demo that cannot fail on stage.** The sample moment is fully cached, and any deviation from it falls through to live AI.
* **Server-side key handling and structured outputs end to end**, with fallbacks that keep the experience usable when the AI is not.

## What I learned

A short, structured interruption can be more useful in a heated moment than a long conversation. The most valuable thing an AI can do here is not to sound warm but to be **calibrated**: clear about evidence, honest about uncertainty, and willing to update. I also learned that the *texture* of an interface (soft edges, warm colors, pacing) matters as much as the logic when building for emotional moments.

## What's next for EmoPatch

* **A larger evaluation:** grow the 10-case set and add human ratings for revision sensitivity and question value.
* **"What would change this view?":** for each interpretation, show which evidence would support or weaken it.
* **Local Pattern Lens (opt-in):** summarize recurring triggers and helpful steps from local history, with no diagnoses or personality labels.
* **Durable rate limiting and observability** for a public deployment.
