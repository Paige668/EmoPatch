# EmoPatch

> **Separate what happened from the story your mind added, then explore three grounded perspectives—and watch the analysis update when new context arrives.**

## Before you start: do you need an API key?

| How you use EmoPatch | API key needed? |
|---|---|
| Click **“Try a sample”** on the home screen | **No.** The sample runs the full loop from cached outputs, without a key or network. |
| Run it locally and reflect on your own moments | **Yes, your own OpenAI API key.** This repository does not include one. Put yours in `.env.local` (see [Local setup](#local-setup)). API usage is billed to your account, separately from any ChatGPT subscription. |
| Open a deployed Live Demo | **No.** The demo uses the deployer's server-side key. |

**Only OpenAI keys work.** The server gateway calls OpenAI-specific APIs (Responses API with Structured Outputs, `gpt-transcribe`, `gpt-4o-mini-tts`, `omni-moderation-latest`). Gemini or Anthropic (Claude) keys will not work without code changes.

The key stays on the server and is never entered in, or sent to, the browser.

**Keep your key private.** `.env.local` is listed in `.gitignore`; never commit it, paste it into an issue, or put it in client code. If a key is ever exposed, revoke it in the OpenAI dashboard and create a new one.

EmoPatch is a bilingual reflection and emotional-regulation web app. It helps someone pause after a difficult moment, separate observable evidence from the story around it, explore multiple explanations, and choose one small next step.

EmoPatch is not a medical device, diagnostic system, therapist, or crisis service.

## Why this project exists

When emotions spike, one ambiguous event can quickly become a certain story:

> “They did not reply” → “They do not respect me” → “I always ruin relationships.”

EmoPatch does not replace that story with forced positivity. It makes the uncertainty visible and lets the analysis change when the user supplies new facts.

## Core experience

```text
Text / voice / screenshot
        ↓
Observable facts vs. interpretation
        ↓
One optional high-value clarification question (+ why it matters)
        ↓
Three grounded perspectives
        ↓
Deeper explanation or one small next step
        ↓
“Actually, there’s more context…”
        ↓
Updated analysis + What changed / What stayed / Why
```

### The Missing Piece

After the initial split, the AI lists what is still unknown. It asks at most one optional question—and only when the answer could materially change the analysis—and says in one line why it is asking. The answer is carried into every later step. This prevents the product from behaving like an endless generic chatbot.

### Three grounded perspectives

The perspectives are cognitive operations, not fictional experts:

1. **Observable Evidence** — What is directly supported by the available information?
2. **Other Possibilities** — What alternative explanations are plausible, and what is still unknown?
3. **Needs & Agency** — What need matters here, and what small action is within the user's control?

This exact trio is a product synthesis, not a clinically validated three-part protocol. Its components are informed by research on cognitive restructuring, reappraisal, self-distancing, and self-compassion. See [Scientific positioning](#scientific-positioning).

### Context Patch

The user can add new context after receiving an analysis. EmoPatch then:

- incorporates only facts the user actually supplied;
- updates facts, interpretations, unknowns, and all three perspectives;
- shows the story **before → now**, plus **what changed**, **what stayed**, and **why**;
- keeps every revision as a version, so perspectives can be compared with the previous version;
- allows another follow-up or another patch from the updated state.

Context Patch is available directly from the perspectives page, not only at the end of the flow.

The sample moment is deliberately chosen so that the added context makes the original worry *more* supported. EmoPatch follows the evidence rather than defaulting to reassurance.

This is the main agentic loop: the system identifies uncertainty, asks selectively, and revises rather than defending its first answer.

## Design: less to read, more to see

People often open EmoPatch while already overwhelmed, so the interface tries to carry meaning visually instead of in paragraphs.

- **Puzzle pieces.** The fact and the story are two interlocking clay pieces: the story is built on top of the fact. The three perspectives lock together as one column, three sides of the same situation. Unknowns appear as dashed, missing pieces.
- **One sentence first.** Each perspective leads with a single self-contained sentence; the detail is one tap away. Prompts ask the model for short, non-repetitive fields.
- **Patchy.** The purple fabric patch from the logo is a small mascot with one mood per moment: idle, thinking (while the AI works), found, comfort, cheer, hug, and breathe. It speaks the guidance that used to be small grey hint text.
- **Patchy's pause.** A button is always available on in-flow screens. Patchy also peeks out on its own, at most once per session, after two minutes without activity on one screen or after going back twice in quick succession, and never while the person is typing. It offers a three-round breathing guide (4 s in, 2 s hold, 6 s out), a hug, or calming rain or wave sound synthesised in the browser (no audio files), or the option to stop for today.
- **Motion with a purpose.** Pieces snap together when results arrive, buttons squish when pressed, and screens settle like a piece being set down. All motion respects the system's reduce-motion setting.
- **Fonts ship with the app.** Fredoka, Nunito, and ZCOOL KuaiLe are bundled through Fontsource rather than loaded from Google Fonts, which is slow or unreachable in some regions. The Chinese face is split into small subsets, so the browser downloads only the characters it needs.

## AI architecture

```mermaid
flowchart LR
    U[User] --> C[React client]
    C --> G[/api/ai server gateway]
    G --> M[omni-moderation-latest]
    G --> L[gpt-6-luna\nperception + reflection]
    G --> STT[gpt-transcribe]
    G --> TTS[gpt-4o-mini-tts]
    C --> DB[(IndexedDB history)]
```

The browser calls only the same-origin `/api/ai` endpoint. `OPENAI_API_KEY` remains server-side and is never injected into the Vite client bundle.

### Model routing

| Workload | Model | Reason |
|---|---|---|
| Fact/interpretation split, screenshot understanding, missing question | `gpt-6-luna` | Low latency and low cost |
| Three perspectives, deeper follow-up, Context Patch | `gpt-6-luna` | Short schema-bound outputs; about 1/20 the cost of `gpt-6.1-sol`, which can be re-enabled in `REASONING_MODELS` |
| Recorded voice transcription | `gpt-transcribe` | Dedicated speech-to-text |
| Spoken result | `gpt-4o-mini-tts` | Dedicated text-to-speech |
| Safety signal | `omni-moderation-latest` | Text and image moderation |

Structured tasks use the OpenAI Responses API with strict JSON schemas and `store: false`.

## Safety and privacy

- Product copy consistently describes EmoPatch as reflection, perspective-taking, and emotional regulation—not treatment.
- The model must preserve uncertainty and may not infer another person's motives as fact.
- Ordinary thinking-pattern prompts are separate from self-harm safety handling.
- Two independent safety signals: `omni-moderation-latest` (self-harm categories) and a model-side `safetyConcern` field in the split schema (self-harm or harm to others). Either one redirects to real-world support instead of a normal analysis. If the moderation call itself is unavailable, analysis continues and the model-side signal still applies.
- Rules and user data are sent in separate messages; user data is passed as JSON and treated as untrusted.
- Saved history stays in the user's browser through IndexedDB.
- AI inputs are still sent to the OpenAI API for processing. `store: false` disables Responses application-state storage; applicable OpenAI API data controls and abuse-monitoring retention still apply.

The safety classifier is a product guardrail, not a clinical risk assessment and should not be presented as one.

## Scientific positioning

EmoPatch uses evidence-informed mechanisms but does not claim clinical efficacy:

- Cognitive restructuring commonly treats thoughts as testable hypotheses and examines evidence, alternatives, and implications: [Cognitive Restructuring and Psychotherapy Outcome](https://pmc.ncbi.nlm.nih.gov/articles/PMC10440210/).
- Deliberate psychological distancing is a studied emotion-regulation strategy, with generally moderate effects and important context limitations: [Powers & LaBar, 2019](https://pubmed.ncbi.nlm.nih.gov/30502352/) and [Guo, 2022](https://pubmed.ncbi.nlm.nih.gov/36256910/).
- Self-compassion interventions show small-to-medium benefits in meta-analysis, while study quality and online generalization remain limitations: [Han & Kim, 2023](https://pubmed.ncbi.nlm.nih.gov/37362192/).

The previous “Sociologist” and “Shield” personas were removed because they could encourage unsupported external attribution or mind-reading. The new perspectives require multiple hypotheses, explicit unknowns, and actions within the user's control.

## Local setup

Requirements: Node.js 20 or newer and an OpenAI API account with API billing enabled.

ChatGPT subscriptions and OpenAI API billing are separate. You do not buy a special “GPT token” for this repository: add a payment method or prepaid API credits in the API Platform, create an API key, and pay for actual model usage. See OpenAI's [billing guide](https://help.openai.com/en/articles/9039756-billing-settings-in-chatgpt-vs-platform) and [current API pricing](https://developers.openai.com/api/docs/pricing).

```bash
npm install
cp .env.example .env.local
```

Set the server-only environment variable in `.env.local`:

```bash
OPENAI_API_KEY=your_openai_api_key_here
```

Then run:

```bash
npm run dev
```

Open `http://localhost:3000`.

Do not rename the variable to `VITE_OPENAI_API_KEY`. Variables prefixed with `VITE_` are exposed to browser code.

## Deployment

The repository includes:

- a Vite development middleware for `/api/ai`;
- a Vercel-compatible function at `api/ai.ts`;
- shared server logic at `server/openaiGateway.ts`.

For Vercel, add `OPENAI_API_KEY` as a project environment variable. Static-only hosts such as GitHub Pages cannot safely run the AI endpoint without a separate backend or serverless function.

| Variable | Required | Purpose |
|---|---|---|
| `OPENAI_API_KEY` | Yes | Server-side OpenAI key |
| `RATE_LIMIT_MAX_REQUESTS` | No | Requests per IP per 10 minutes (default 80; one full reflection uses 4–6) |
| `ALLOWED_ORIGINS` | No | Extra comma-separated origins allowed to call `/api/ai` (same-origin is always allowed) |

`vercel.json` sets the function `maxDuration` to 60 seconds; the gateway keeps each request within a 50-second budget with per-attempt timeouts. Request bodies are capped at about 4.4 MB to stay under Vercel's limit; the client downsizes screenshots and caps recordings at two minutes to fit.

The rate limiter is best-effort and in-memory (per function instance). For a public production release, replace it with a durable limiter and always configure an OpenAI project hard spend limit.

## Project structure

```text
api/                         Vercel serverless entry point (rate limit, origin check)
server/openaiGateway.ts      OpenAI routing, schemas, moderation, timeouts, fallbacks
services/aiService.ts        Browser client for the same-origin gateway
services/prompts.ts          Reflection rules and structured task instructions
services/demoCase.ts         Cached bilingual sample moment
services/imageUtils.ts       Client-side screenshot downscaling
hooks/useTriageFlow.ts       Product state machine, retries, versioned Context Patch
components/steps/            Individual experience steps
components/Patchy.tsx        The Patchy mascot and its moods
components/PatchyPause.tsx   Patchy's pause: breathing, hug, ambient sound
components/LensPieces.tsx    Interlocking perspective pieces
components/ui/Icon.tsx       Shared line-icon set
services/ambientSound.ts     Rain and wave sound synthesised with Web Audio
services/storageService.ts   Local IndexedDB history
scripts/                     Gateway tests, flow tests, real-API evaluation
docs/evaluation/             Sample cases and evaluation results
```

## Verification

```bash
npm run check   # typecheck + gateway tests + flow tests + production build
```

- `npm run test:gateway` covers schemas, prompt/data separation, incomplete-output errors, billing short-circuit, input limits, and both safety signals (with a mocked OpenAI API).
- `npm run test:flow` covers the state machine: back navigation, retry after a failed step, one-step skip, versioning, the demo path, and zh/en copy parity.

## Evaluation

`docs/evaluation/sample-cases.json` contains 10 synthetic cases (no real personal data), including cases where new context should strengthen, weaken, or not change the analysis, a case where no question is needed, a Chinese case, and a safety-route case.

```bash
npm run eval   # requires OPENAI_API_KEY; writes docs/evaluation/results.md
```

The script runs each case through the real gateway and checks fact purity (keyword heuristic), unknowns, question rationale, perspective distinctness, patch summaries, safety routing, structured-output success rate, and latency. Revision sensitivity and question value are left for human review in the generated report. No claim about improved user wellbeing is made.

## Limitations

- Not a clinical tool; safety signals are guardrails, not risk assessments.
- The evaluation set is small and synthetic, and the automatic checks are heuristics.
- The rate limiter is per-instance and in-memory.
- Model availability depends on the OpenAI project; all text tasks currently use `gpt-6-luna`.

## Official OpenAI references

- [Responses API migration](https://developers.openai.com/api/docs/guides/migrate-to-responses)
- [Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs)
- [Moderation](https://developers.openai.com/api/docs/guides/moderation)
- [API pricing](https://developers.openai.com/api/docs/pricing)
- [API data controls](https://developers.openai.com/api/docs/guides/your-data)
