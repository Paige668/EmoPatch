import assert from 'node:assert/strict';
import { createServer } from 'vite';

// Tests the product state machine, demo data, and copy without a browser.

const vite = await createServer({
  appType: 'custom',
  logLevel: 'silent',
  server: { middlewareMode: true },
});

try {
  const { triageReducer, initialState } = await vite.ssrLoadModule('/hooks/useTriageFlow.ts');
  const { DEMO_CASES, getDemoSplit, getDemoReframes, getDemoFollowUp, getDemoPatch } = await vite.ssrLoadModule('/services/demoCase.ts');
  const { UI_TEXT, getFallbackData, FOLLOWUP_FALLBACKS } = await vite.ssrLoadModule('/constants.ts');

  const run = (state, ...actions) => actions.reduce(triageReducer, state);

  // --- Copy: both languages define the same keys, with no empty strings (or lists of them) ---
  const zhKeys = Object.keys(UI_TEXT.zh).sort();
  const enKeys = Object.keys(UI_TEXT.en).sort();
  assert.deepEqual(zhKeys, enKeys, 'zh and en UI text must have identical keys');
  for (const language of ['zh', 'en']) {
    for (const [key, value] of Object.entries(UI_TEXT[language])) {
      const values = Array.isArray(value) ? value : [value];
      assert.ok(values.length > 0, `${language}.${key} is empty`);
      for (const item of values) assert.ok(typeof item === 'string' && item.trim(), `${language}.${key} is empty`);
    }
  }

  // --- Offline templates match the shape the perspective cards render ---
  for (const language of ['zh', 'en']) {
    const { reframes } = getFallbackData(language, 'A fact', 'A story');
    assert.deepEqual(Object.keys(reframes).sort(), ['agency', 'observer', 'possibilities']);
    assert.ok(Object.values(reframes).every(text => typeof text === 'string' && text.length > 0));
    assert.equal(FOLLOWUP_FALLBACKS[language].keyPoints.length, 3);
  }

  // --- Demo data is complete and only matches the scripted path ---
  for (const language of ['zh', 'en']) {
    const demo = DEMO_CASES[language];
    const { fact, interpretation } = demo.split;
    assert.ok(demo.split.clarifyingQuestion && demo.split.clarifyingWhy);
    assert.ok(getDemoSplit(language, demo.input, false));
    assert.equal(getDemoSplit(language, demo.input, true), null, 'an image means live analysis');
    assert.equal(getDemoSplit(language, `${demo.input} edited`, false), null);
    assert.ok(getDemoReframes(language, fact, interpretation, ''));
    assert.equal(getDemoReframes(language, fact, interpretation, 'an answer'), null);
    assert.equal(getDemoReframes(language, `${fact}!`, interpretation, ''), null);
    assert.ok(getDemoFollowUp(language, fact, interpretation, '', 'EXPLAIN'));
    assert.ok(getDemoFollowUp(language, fact, interpretation, '', 'ACTION'));
    assert.ok(getDemoPatch(language, fact, interpretation, '', demo.sampleContext));
    assert.equal(getDemoPatch(language, fact, interpretation, '', 'something else'), null);
    const { changeSummary } = demo.patch;
    assert.ok(changeSummary.changed.length && changeSummary.stayed.length && changeSummary.why);
  }

  // --- Demo flow: sample → split → perspectives → patch → versioned diff ---
  const demo = DEMO_CASES.en;
  let state = run(initialState, { type: 'START_DEMO' });
  assert.equal(state.step, 'DUMP');
  assert.equal(state.data.isDemo, true);
  assert.equal(state.data.rawText, demo.input);

  state = run(state, { type: 'START_ANALYSIS' }, { type: 'ANALYSIS_SUCCESS', payload: demo.split });
  assert.equal(state.step, 'CONFIRM');
  assert.equal(state.data.clarifyingWhy, demo.split.clarifyingWhy);

  state = run(state, { type: 'START_REFRAMING' }, { type: 'REFRAMING_SUCCESS', payload: demo.reframes });
  assert.equal(state.step, 'CHOICE');
  assert.equal(state.data.versions.length, 1);

  // Context Patch can open directly from the perspectives page, and back returns there.
  state = run(state, { type: 'OPEN_CONTEXT_PATCH' });
  assert.equal(state.step, 'CONTEXT_PATCH');
  assert.equal(run(state, { type: 'GO_BACK' }).step, 'CHOICE');

  state = run(state, { type: 'SUBMIT_CONTEXT_PATCH', payload: demo.sampleContext }, { type: 'CONTEXT_PATCH_SUCCESS', payload: demo.patch });
  assert.equal(state.step, 'PATCH_RESULT');
  assert.equal(state.data.versions.length, 2);
  assert.equal(state.data.versions[0].interpretation, demo.split.interpretation);
  assert.equal(state.data.versions[1].interpretation, demo.patch.updatedInterpretation);
  assert.equal(state.data.versions[1].addedContext, demo.sampleContext);
  assert.equal(state.data.fact, demo.patch.updatedFact);

  // Re-opening the patch step starts with an empty input.
  state = run(state, { type: 'OPEN_CONTEXT_PATCH' });
  assert.equal(state.data.contextPatchInput, '');
  assert.equal(run(state, { type: 'GO_BACK' }).step, 'PATCH_RESULT');

  // A failed patch keeps the typed context for retry.
  const failedPatch = run(state, { type: 'SUBMIT_CONTEXT_PATCH', payload: 'More context' }, { type: 'CONTEXT_PATCH_ERROR', payload: 'error' });
  assert.equal(failedPatch.step, 'CONTEXT_PATCH');
  assert.equal(failedPatch.data.contextPatchInput, 'More context');

  // --- Back navigation never drops the user home mid-session ---
  let session = run(initialState, { type: 'START_FLOW' }, { type: 'INPUT_UPDATE', payload: 'x' }, { type: 'START_ANALYSIS' });
  assert.equal(run(session, { type: 'GO_BACK' }).step, 'DUMP');
  session = run(session, { type: 'ANALYSIS_SUCCESS', payload: demo.split }, { type: 'STABILIZE' });
  assert.equal(session.step, 'BUFFER');
  assert.equal(run(session, { type: 'GO_BACK' }).step, 'CONFIRM');
  assert.equal(run(session, { type: 'BUFFER_END' }).step, 'CONFIRM');
  session = run(session, { type: 'BUFFER_END' }, { type: 'START_REFRAMING' });
  assert.equal(run(session, { type: 'GO_BACK' }).step, 'CONFIRM');

  // --- A transient AI error is retryable and does not poison later steps ---
  let failing = run(initialState, { type: 'START_FLOW' }, { type: 'INPUT_UPDATE', payload: 'They replied OK.' }, { type: 'START_ANALYSIS' },
    { type: 'ANALYSIS_ERROR', payload: { reason: 'AI_ERROR', isQuota: false } });
  assert.equal(failing.step, 'CONFIRM');
  assert.equal(failing.data.isFallback, true);
  assert.equal(failing.data.fact, 'They replied OK.');
  assert.equal(failing.isOfflineMode, false);
  assert.equal(run(failing, { type: 'RETRY_AI' }).step, 'ANALYZING');
  failing = run(failing, { type: 'START_REFRAMING' });
  assert.equal(failing.step, 'REFRAMING', 'the next step must try the AI again');
  assert.equal(failing.data.isFallback, false);

  // Template perspectives have the right shape and still allow Context Patch.
  failing = run(failing, { type: 'REFRAMING_ERROR', payload: { reason: 'RATE_LIMIT', isQuota: false } });
  assert.equal(failing.data.fallbackReason, 'RATE_LIMIT');
  assert.ok(failing.data.reframes.observer && failing.data.reframes.possibilities && failing.data.reframes.agency);
  assert.equal(failing.data.versions.length, 1);

  // Skipping applies to one step only.
  const skipped = run(initialState, { type: 'START_FLOW' }, { type: 'INPUT_UPDATE', payload: 'x' }, { type: 'START_ANALYSIS' }, { type: 'SKIP_LOADING' });
  assert.equal(skipped.data.fallbackReason, 'MANUAL_SKIP');
  assert.equal(run(skipped, { type: 'START_REFRAMING' }).step, 'REFRAMING');

  // Quota errors switch to offline mode; a new session tries again.
  const quota = run(failing, { type: 'START_FOLLOWUP', payload: 'ACTION' }, { type: 'FOLLOWUP_ERROR', payload: { reason: 'OFFLINE', isQuota: true } });
  assert.equal(quota.isOfflineMode, true);
  assert.equal(run(quota, { type: 'RETRY_AI' }).step, 'FINAL_CONTENT', 'no retry while offline');
  assert.equal(run(quota, { type: 'RESET' }).isOfflineMode, false);
  const network = run(initialState, { type: 'SET_NETWORK_STATUS', payload: false }, { type: 'RESET' });
  assert.equal(network.isOfflineMode, true, 'real network loss persists across sessions');

  console.log('Flow tests passed.');
} finally {
  await vite.close();
}
