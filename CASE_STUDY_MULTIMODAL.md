# Case Study: The “OK.” Screenshot

## The trigger

A user uploads a chat screenshot containing a short reply—`OK.`—after a long gap. The user writes: “They are angry with me.”

The screenshot contains real evidence, but it also invites uncertain social interpretation. Message length, punctuation, timestamps, and read receipts can be observed. Another person's emotion or intent cannot.

## First-pass analysis

### Observable evidence

> A message containing “OK.” is visible. The screenshot shows the displayed timestamp and the preceding messages available in the image.

### Interpretation

> You interpreted the short reply and period as anger or dismissal.

### Unknowns

- Whether the sender was busy, upset, tired, or simply brief.
- Whether this style differs from their usual messages.
- What happened outside the visible conversation.

### The Missing Piece

The system asks one optional question only if it could change the analysis:

> “Is this reply noticeably different from how this person usually texts you?”

## Three grounded perspectives

1. **Observable Evidence:** The reply is short; the screenshot alone does not establish anger.
2. **Other Possibilities:** Anger is possible, but so are limited time, a habitual brief style, distraction, or a conversation that felt complete to the sender.
3. **Needs & Agency:** The user's need for clarity matters. A small next move could be to pause and later ask a neutral clarifying question.

The second perspective deliberately includes more than one hypothesis. EmoPatch does not replace “they are angry” with an equally unsupported claim such as “they are only tired.”

## Context Patch

The user later adds:

> “Actually, they normally send long messages, and ten minutes later they told me they were frustrated about what I said.”

EmoPatch updates the state rather than defending its first output.

### What changed

- Anger or frustration now has direct supporting evidence.
- The interpretation becomes more specific and less speculative.
- The useful next step can move from information gathering to repair or boundary-setting.

### What stayed

- The short reply alone was not sufficient evidence.
- The user's need for clarity and respectful communication remains relevant.
- The other person's full motives and future behavior are still unknown.

### Why this matters

The core AI value is not detecting a hidden “tone” with certainty. It is maintaining a clear boundary between evidence and inference, identifying missing information, and visibly revising the analysis when new facts arrive.

## Technical path

```text
Screenshot + user text
  → server-side moderation
  → multimodal fact / interpretation split
  → strict structured output
  → optional clarification
  → three perspectives
  → added context
  → versioned re-analysis and visible diff
```

The screenshot is sent through the same-origin server gateway. The OpenAI API key never enters the browser bundle, and Responses requests use `store: false`.
