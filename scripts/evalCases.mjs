import fs from 'node:fs/promises';
import { createServer, loadEnv } from 'vite';

// Runs docs/evaluation/sample-cases.json against the real OpenAI API through
// the same gateway the app uses, applies automatic checks, and writes
// docs/evaluation/results.md for manual review.
//
// Usage: OPENAI_API_KEY=... npm run eval   (or put the key in .env.local)
// Costs a small amount of API usage: roughly 3–5 model calls per case.

const env = loadEnv('development', process.cwd(), '');
const apiKey = process.env.OPENAI_API_KEY || env.OPENAI_API_KEY;
if (!apiKey) {
  console.error('OPENAI_API_KEY is not set (environment or .env.local).');
  process.exit(1);
}

const vite = await createServer({ appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });

const timed = async (fn) => {
  const start = performance.now();
  const result = await fn();
  return { ...result, ms: Math.round(performance.now() - start) };
};

try {
  const { processGatewayRequest } = await vite.ssrLoadModule('/server/openaiGateway.ts');
  const cases = JSON.parse(await fs.readFile('docs/evaluation/sample-cases.json', 'utf8'));
  const call = (task, language, payload) => timed(() => processGatewayRequest({ task, language, payload }, apiKey));

  const rows = [];
  const details = [];
  const latencies = [];
  let structuredOk = 0;
  let structuredTotal = 0;

  for (const testCase of cases) {
    process.stdout.write(`• ${testCase.id} … `);
    const checks = [];
    const { language, expect = {} } = testCase;
    const split = await call('split', language, { text: testCase.text });
    latencies.push(split.ms);
    structuredTotal += 1;

    if (expect.safetyRedirect) {
      checks.push(['safety redirect', split.body?.error?.code === 'safety_redirect']);
      rows.push({ testCase, checks, ms: split.ms });
      details.push(`### ${testCase.title}\n\nStatus ${split.status} (${split.body?.error?.code || 'ok'})\n`);
      if (split.status === 422) structuredOk += 1;
      console.log('done');
      continue;
    }
    checks.push(['no safety false-positive', split.status !== 422]);

    if (split.status !== 200) {
      checks.push(['split succeeded', false]);
      rows.push({ testCase, checks, ms: split.ms });
      details.push(`### ${testCase.title}\n\nSplit failed: ${JSON.stringify(split.body)}\n`);
      console.log('failed');
      continue;
    }
    structuredOk += 1;

    const s = split.body;
    const lowerFact = s.fact.toLowerCase();
    const leaked = (expect.factMustNotContain || []).filter(word => lowerFact.includes(word.toLowerCase()));
    checks.push(['fact purity', leaked.length === 0]);
    checks.push(['unknowns listed', s.unknowns.length > 0]);
    if (expect.clarifyingQuestion === 'none') checks.push(['no unnecessary question', !s.clarifyingQuestion]);
    if (s.clarifyingQuestion) checks.push(['question explains why', Boolean(s.clarifyingWhy)]);
    if (expect.distortion) checks.push(['pattern label', expect.distortion.includes(s.distortion)]);

    const reframe = await call('reframe', language, { fact: s.fact, interpretation: s.interpretation, needs: [] });
    latencies.push(reframe.ms);
    structuredTotal += 1;
    if (reframe.status === 200) structuredOk += 1;
    const r = reframe.body;
    const distinct = reframe.status === 200 && new Set([r.observer, r.possibilities, r.agency]).size === 3;
    checks.push(['three distinct perspectives', distinct]);

    let patchSection = '';
    if (testCase.patch && reframe.status === 200) {
      const patch = await call('context_patch', language, {
        fact: s.fact,
        interpretation: s.interpretation,
        previousReframes: r,
        addedContext: testCase.patch.addedContext,
        needs: [],
      });
      latencies.push(patch.ms);
      structuredTotal += 1;
      if (patch.status === 200) {
        structuredOk += 1;
        const p = patch.body;
        checks.push(['patch explains what stayed', p.changeSummary.stayed.length > 0]);
        checks.push(['patch explains why', Boolean(p.changeSummary.why)]);
        patchSection = [
          `**Added context:** ${testCase.patch.addedContext}`,
          `**Expected:** ${testCase.patch.expectation}`,
          `**Interpretation now:** ${p.updatedInterpretation}`,
          `**Changed:** ${p.changeSummary.changed.join(' / ')}`,
          `**Stayed:** ${p.changeSummary.stayed.join(' / ')}`,
          `**Why:** ${p.changeSummary.why}`,
          '**Revision sensitivity (manual):** ☐ matches expectation',
        ].join('\n\n');
      } else {
        checks.push(['patch succeeded', false]);
      }
    }

    rows.push({ testCase, checks, ms: split.ms + reframe.ms });
    details.push([
      `### ${testCase.title}`,
      `> ${testCase.text}`,
      `**Fact:** ${s.fact}`,
      `**Interpretation:** ${s.interpretation}`,
      `**Unknowns:** ${s.unknowns.join(' / ')}`,
      `**Question:** ${s.clarifyingQuestion || '—'}${s.clarifyingWhy ? ` _(${s.clarifyingWhy})_` : ''}`,
      `**Observer:** ${r.observer}`,
      `**Possibilities:** ${r.possibilities}`,
      `**Agency:** ${r.agency}`,
      patchSection,
      leaked.length ? `⚠️ Fact contains: ${leaked.join(', ')}` : '',
    ].filter(Boolean).join('\n\n'));
    console.log('done');
  }

  const passed = rows.reduce((sum, row) => sum + row.checks.filter(([, ok]) => ok).length, 0);
  const total = rows.reduce((sum, row) => sum + row.checks.length, 0);
  const sorted = [...latencies].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)] || 0;

  const markdown = [
    '# EmoPatch evaluation results',
    '',
    `Run: ${new Date().toISOString()} · ${cases.length} cases · automatic checks ${passed}/${total} · structured output success ${structuredOk}/${structuredTotal} · median call latency ${median} ms`,
    '',
    'Automatic checks are heuristics (keyword-based fact purity, presence of unknowns, distinct perspectives). Revision sensitivity and question value need a human read of the details below.',
    '',
    '| Case | Checks | Failed | ms |',
    '|---|---|---|---:|',
    ...rows.map(({ testCase, checks, ms }) => {
      const failed = checks.filter(([, ok]) => !ok).map(([name]) => name);
      return `| ${testCase.title} | ${checks.length - failed.length}/${checks.length} | ${failed.join(', ') || '—'} | ${ms} |`;
    }),
    '',
    '## Details',
    '',
    details.join('\n\n---\n\n'),
    '',
  ].join('\n');

  await fs.writeFile('docs/evaluation/results.md', markdown);
  console.log(`\nAutomatic checks: ${passed}/${total}. Wrote docs/evaluation/results.md`);
} finally {
  await vite.close();
}
