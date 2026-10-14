import type {
  AISplitResponse,
  ContextPatchResponse,
  FollowUpContent,
  FollowUpRequestType,
  Language,
  PerspectiveSet,
} from '../types';

// A fully cached sample moment so the core loop can be demonstrated without an
// API key, network, or quota. Cached responses are served only while the user
// stays on the scripted path; any edit falls through to the live API.
//
// The added context deliberately makes the original worry *better* supported.
// EmoPatch follows the evidence rather than defaulting to reassurance.

interface DemoCase {
  input: string;
  split: AISplitResponse;
  reframes: PerspectiveSet;
  followUps: Record<FollowUpRequestType, FollowUpContent>;
  sampleContext: string;
  patch: ContextPatchResponse;
}

export const DEMO_CASES: Record<Language, DemoCase> = {
  en: {
    input: 'I asked Maya to move our Saturday plans to Sunday. Five hours later she replied: “OK.” She’s clearly annoyed with me.',
    split: {
      fact: 'You asked Maya to move Saturday’s plans to Sunday. Five hours later she replied “OK.”',
      interpretation: 'You read the delay and short reply as annoyance.',
      distortion: 'MIND_READING',
      unknowns: [
        'How Maya usually texts',
        'What she was doing those five hours',
        'Whether the change was a problem for her',
      ],
      clarifyingQuestion: 'Is a one-word reply unusual for Maya?',
      clarifyingWhy: 'If it’s normal for her, “OK.” says very little.',
    },
    reframes: {
      observer: 'She agreed, late and briefly. Annoyance isn’t in the message—your mind added it, because she matters to you.',
      possibilities: 'Annoyed, busy, or simply fine with Sunday. You can’t tell yet without knowing how she usually texts.',
      agency: 'Wanting reassurance makes sense. Try a light check-in: “Does Sunday still work for you?”',
    },
    followUps: {
      EXPLAIN: {
        headline: 'Short reply, many meanings',
        encouragement: 'You looked again',
        mainInsight: 'Text loses tone, so the mind fills the gap with what it fears. A delay and a short reply fit several stories.',
        keyPoints: [
          'Busy people often reply briefly.',
          'Delay shows availability more than feelings.',
          'Your worry shows the friendship matters.',
        ],
        advice: 'Worry and uncertainty can sit side by side.',
      },
      ACTION: {
        headline: 'One small step',
        encouragement: 'You paused',
        mainInsight: 'You don’t need to know her feelings tonight. Pick one easy, reversible step.',
        keyPoints: [
          'List what you know and what you don’t.',
          'Tomorrow, ask: “Does Sunday still work?”',
          'Put the phone down for ten minutes.',
        ],
        advice: 'A small step beats rereading the message.',
      },
    },
    sampleContext: 'She usually writes long messages. Ten minutes later she said: “Honestly I’m frustrated—this is the third last-minute change.”',
    patch: {
      updatedFact: 'Maya replied “OK.”, unusually short for her. Then she said she’s frustrated: it’s the third last-minute change.',
      updatedInterpretation: 'She is upset—she said so. It’s about repeated changes, not about you as a person.',
      unknowns: [
        'What would make plans feel reliable to her',
        'Whether Sunday works for her',
      ],
      reframes: {
        observer: 'She told you directly she’s frustrated, and why. Nothing suggests the friendship itself is at risk.',
        possibilities: 'She may want fixed plans, an acknowledgement, or a better way to reschedule. You don’t know which yet.',
        agency: 'Acknowledge without over-apologising: “You’re right, I’ve moved things three times. Sorry—what would help?”',
      },
      changeSummary: {
        changed: [
          '“She’s annoyed” went from guess to confirmed.',
          'The cause is clear: repeated changes.',
          'Next step: repair, not more guessing.',
        ],
        stayed: [
          '“OK.” alone wasn’t enough evidence.',
          'She hasn’t judged you as a person.',
        ],
        why: 'She said it directly—stronger evidence than tone, even though it confirms the worry.',
      },
    },
  },
  zh: {
    input: '我问小雨能不能把周六的约改到周日。五个小时后她只回了：“嗯。”她肯定生我气了。',
    split: {
      fact: '你请小雨把周六的约改到周日。五小时后她回复“嗯。”',
      interpretation: '你把延迟和短回复理解为她生气了。',
      distortion: 'MIND_READING',
      unknowns: [
        '小雨平时怎么回消息',
        '那五小时她在做什么',
        '改期对她是否有影响',
      ],
      clarifyingQuestion: '只回一个字，对小雨来说少见吗？',
      clarifyingWhy: '如果她平时就这样，“嗯。”说明不了什么。',
    },
    reframes: {
      observer: '她同意了，只是回得晚、回得短。“生气”不在消息里，是你补上的——因为你在乎她。',
      possibilities: '可能生气，可能在忙，也可能觉得周日没问题。不知道她平时的习惯，还判断不了。',
      agency: '想确认关系没事很正常。可以轻轻问一句：“周日对你还方便吗？”',
    },
    followUps: {
      EXPLAIN: {
        headline: '短回复，多种含义',
        encouragement: '你又看了一遍',
        mainInsight: '文字没有语气，大脑会用最怕的版本补空白。延迟和短回复，符合好几种解释。',
        keyPoints: [
          '人忙的时候常回得很短。',
          '回得慢更多说明没空，不说明情绪。',
          '你的担心说明这段友谊重要。',
        ],
        advice: '担心和不确定可以同时存在。',
      },
      ACTION: {
        headline: '一个小步骤',
        encouragement: '你停下来了',
        mainInsight: '不用今晚就弄清她的感受。选一个简单、可撤回的小步骤。',
        keyPoints: [
          '写下知道的和不知道的。',
          '明天问一句：“周日还方便吗？”',
          '先放下手机十分钟。',
        ],
        advice: '小步骤胜过反复重读消息。',
      },
    },
    sampleContext: '她平时都回很长的消息。十分钟后她又说：“说实话有点烦，这是第三次临时改约了。”',
    patch: {
      updatedFact: '小雨回了“嗯。”，比平时短很多。之后她说有点烦：这是第三次临时改约。',
      updatedInterpretation: '她确实不高兴——她自己说了。原因是反复改约，不是针对你这个人。',
      unknowns: [
        '怎样让她觉得约定可靠',
        '周日对她是否合适',
      ],
      reframes: {
        observer: '她直接说了有点烦，也说了原因。没有迹象表明这段友谊有危险。',
        possibilities: '她可能希望约定不变、得到一句承认，或换种改期方式。还不知道是哪个。',
        agency: '承认但不过度自责：“你说得对，我改了三次了，抱歉。怎样安排对你更好？”',
      },
      changeSummary: {
        changed: [
          '“她生气了”从猜测变成确认。',
          '原因清楚了：反复改约。',
          '下一步：修复，而不是继续猜。',
        ],
        stayed: [
          '单凭“嗯。”证据仍然不够。',
          '她没有否定你这个人。',
        ],
        why: '她亲口说的话比语气推测更可靠，即使它证实了你的担心。',
      },
    },
  },
};

const same = (a: string, b: string) => a.trim() === b.trim();

export const getDemoSplit = (language: Language, rawText: string, hasImage: boolean): AISplitResponse | null => {
  const demo = DEMO_CASES[language];
  return !hasImage && same(rawText, demo.input) ? demo.split : null;
};

const matchesInitialSplit = (language: Language, fact: string, interpretation: string) => {
  const { split } = DEMO_CASES[language];
  return same(fact, split.fact) && same(interpretation, split.interpretation);
};

export const getDemoReframes = (
  language: Language,
  fact: string,
  interpretation: string,
  clarification: string,
): PerspectiveSet | null =>
  matchesInitialSplit(language, fact, interpretation) && !clarification.trim() ? DEMO_CASES[language].reframes : null;

export const getDemoFollowUp = (
  language: Language,
  fact: string,
  interpretation: string,
  clarification: string,
  requestType: FollowUpRequestType,
): FollowUpContent | null =>
  matchesInitialSplit(language, fact, interpretation) && !clarification.trim()
    ? DEMO_CASES[language].followUps[requestType]
    : null;

export const getDemoPatch = (
  language: Language,
  fact: string,
  interpretation: string,
  clarification: string,
  addedContext: string,
): ContextPatchResponse | null =>
  matchesInitialSplit(language, fact, interpretation) && !clarification.trim() && same(addedContext, DEMO_CASES[language].sampleContext)
    ? DEMO_CASES[language].patch
    : null;

// A short pause so the cached path still shows the loading state and feels
// like the live flow, without pretending to be slower than it is.
export const DEMO_LATENCY_MS = 900;
