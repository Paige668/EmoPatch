
import { ActionType, ContextTag, ReframeType, Language, FollowUpContent } from "./types";

export const CONTEXT_TAGS: { value: ContextTag; label: string }[] = [
  { value: ContextTag.SOCIAL, label: "社交 / Friends" },
  { value: ContextTag.WORK, label: "工作 / Work" },
  { value: ContextTag.FAMILY, label: "家庭 / Family" },
  { value: ContextTag.SELF, label: "自我 / Self" },
];

export const EMOTIONAL_NEEDS = {
  zh: [
    "被看见", "被理解", "被尊重", 
    "安全感", "连接感", "公平", 
    "秩序感", "自主权", "休息"
  ],
  en: [
    "Seen", "Understood", "Respected",
    "Safety", "Connection", "Fairness",
    "Order", "Autonomy", "Rest"
  ]
};

export const PERSONA_LABELS = {
  zh: {
    [ReframeType.CAMERA]: { emoji: "📹", title: "摄像机 (客观)" },
    [ReframeType.SOCIOLOGIST]: { emoji: "🧬", title: "社会学家 (系统)" },
    [ReframeType.SHIELD]: { emoji: "🛡️", title: "守护者 (边界)" },
    // Legacy support for old records
    "SCIENTIST": { emoji: "🧬", title: "科学家 (系统)" },
  },
  en: {
    [ReframeType.CAMERA]: { emoji: "📹", title: "Camera (Objective)" },
    [ReframeType.SOCIOLOGIST]: { emoji: "🧬", title: "Sociologist (Systemic)" },
    [ReframeType.SHIELD]: { emoji: "🛡️", title: "Shield (Boundary)" },
    // Legacy support for old records
    "SCIENTIST": { emoji: "🧬", title: "Scientist (Systemic)" },
  }
};

export const UI_TEXT = {
  zh: {
    app_name: "EmoPatch",
    app_slogan: "给情绪阵痛一个小补丁",
    app_philosophy: "专为高敏感人群 (HSP) 设计。\n这不是医疗方案，只是想在世界太吵时，\n用 3 分钟帮你“情绪降温”，找回内心秩序。", // New
    home_title: "我情绪过载了",
    home_subtitle: "点击开始平复",
    view_history: "查看历史记录",
    input_title: "发生了什么？",
    input_placeholder: "尽管说、写，或者上传截图...",
    input_button: "接住我",
    loading_text: "正在温柔地拆解...", 
    loading_inhale: "", 
    loading_exhale: "", 
    skip_button: "AI 还没好？跳过并使用手动模式",
    step_confirm_title: "让我们来拆解一下",
    fact_label: "事实 (Fact)",
    fact_placeholder: "例如：他看了三次手机...",
    interpretation_label: "感受 (Feel)",
    interpretation_placeholder: "我此刻的感觉是...",
    needs_label: "内在需求 (Needs)",
    add_need_placeholder: "自定义...",
    confirm_button: "确认并继续 →",
    choice_title: "你想听听谁的声音？",
    depth_question: "关于这个视角，你现在需要什么？",
    explain_button: "🧠 想要更深入的理解",
    action_button: "👣 告诉我具体怎么做",
    final_title: "做得好。", 
    final_subtitle: "本次记录已保存。",
    home_button: "回到首页",
    back_button: "返回",
    history_title: "历史记录",
    history_empty: "这里还是一片荒原，\n去处理你的第一个情绪吧。",
    history_loading: "加载中...",
    history_thought: "当时的感受:",
    buffer_inhale: "吸气...",
    buffer_exhale: "呼气...", 
    buffer_connecting: "正在建立安全连接...",
    buffer_slowly: "(慢慢来，不着急)",
    skip_breathing: "跳过呼吸", 
    alert_stabilize: "先深呼吸 20秒 (推荐)",
    alert_continue: "不用，我想直接分析",
    // Voice Features
    mic_start: "点击开始录音",
    mic_listening: "正在倾听... (点击停止)",
    mic_transcribing: "正在接收你的情绪...",
    mic_error: "无法访问麦克风",
    audio_play: "听听建议 (语音版)",
    audio_playing: "正在播放...",
    audio_loading: "正在生成语音...",
    // Image Upload & Tooltips
    img_upload_label: "上传图片 / 聊天记录",
    voice_input_tooltip: "语音倾诉 (Voice)",
    img_preview_alt: "截图预览",
    // Alerts
    alert_sa_title: "对自己太严厉了",
    alert_sa_body: "我注意到你对自己用了一些很重的词。试着像对待最好的朋友那样对待自己，好吗？",
    alert_cat_title: "灾难化思维",
    alert_cat_body: "这是一个‘全或无’的陷阱。事情也许没有你想的那么绝对和永久。",
    alert_mr_title: "读心术陷阱",
    alert_mr_body: "你好像在试图猜测别人的想法。这是一个常见的认知陷阱，事实往往比我们想象的要简单。",
    alert_should_title: "暴君思维",
    alert_should_body: "‘必须’和‘应该’是给自己套上的枷锁。试着把它们换成‘我希望’或者‘如果是那样就好了’。",
    alert_an_title: "非黑即白",
    alert_an_body: "世界不是只有黑和白，中间有很宽的灰色地带。一次失误不代表全盘皆输。",
    alert_er_title: "情绪推理",
    alert_er_body: "感觉不好并不代表事实真的很糟。情绪是真实的，但不一定是事实。",
    alert_default_title: "先停一下",
    alert_default_body: "我感觉到你现在的情绪波动很大。我们先花一点时间稳住自己，好吗？",
    // Disclaimer
    disclaimer: "EmoPatch 是一个自我反思工具，不提供医疗诊断或治疗。\nIf you are in crisis, please seek professional help.",
    // Training Check
    training_check_title: "查看拆解对比",
    training_check_user: "你的拆解",
    training_check_ai: "AI 的建议",
    // User Split
    user_split_title: "小练习：事实 vs 想法",
    user_split_hint: "试着把刚才那件事中“摄像机能拍到的部分”写下来（不带情绪形容词）。",
    user_split_placeholder: "例如：他没有回复我的微信...",
    user_split_next: "写好了，去看看 AI 怎么拆",
    user_split_skip: "太累了，直接帮我拆",
    // Save
    save_button: "保存记录",
    saved_button: "已保存",
    saved_hint: "可在首页右上角“历史”中查看",
  },
  en: {
    app_name: "EmoPatch",
    app_slogan: "A Soft Patch for Hard Moments",
    app_philosophy: "Designed for High Sensitivity (HSP).\nNot a medical cure, but a 3-minute 'cool-down'\nto find inner order when the world is too loud.", // New
    home_title: "I'm Overloaded",
    home_subtitle: "Click to De-escalate",
    view_history: "History",
    input_title: "What's happening?",
    input_placeholder: "Type, speak, or upload a chat log...",
    input_button: "Catch Me",
    loading_text: "Gently untangling...",
    loading_inhale: "",
    loading_exhale: "",
    skip_button: "AI taking too long? Skip to manual mode",
    step_confirm_title: "Let's Untangle This",
    fact_label: "Fact",
    fact_placeholder: "e.g., He looked at his phone 3 times...",
    interpretation_label: "Feel",
    interpretation_placeholder: "I feel...",
    needs_label: "Needs",
    add_need_placeholder: "Custom...",
    confirm_button: "Confirm & Continue →",
    choice_title: "Whose voice do you need?",
    depth_question: "What do you need from this perspective?",
    explain_button: "🧠 I want to understand WHY",
    action_button: "👣 Tell me WHAT to do",
    final_title: "Well done.",
    final_subtitle: "Session saved.",
    home_button: "Back Home",
    back_button: "Back",
    history_title: "History",
    history_empty: "It's a quiet wilderness here.\nProcess your first emotion to see it grow.",
    history_loading: "Loading...",
    history_thought: "Feel:",
    buffer_inhale: "Inhale...",
    buffer_exhale: "Exhale...",
    buffer_connecting: "Establishing safe connection...",
    buffer_slowly: "(Slowly, no rush)",
    skip_breathing: "Skip Breathing", 
    alert_stabilize: "Deep Breathe 20s (Recommended)",
    alert_continue: "No, analyze immediately",
    // Voice Features
    mic_start: "Tap to Record",
    mic_listening: "Listening... (Tap to Stop)",
    mic_transcribing: "Receiving your feelings...",
    mic_error: "Microphone access denied",
    audio_play: "Listen to Advice",
    audio_playing: "Playing...",
    audio_loading: "Generating voice...",
    // Image Upload & Tooltips
    img_upload_label: "Upload Screenshot / Chat Log",
    voice_input_tooltip: "Voice Venting",
    img_preview_alt: "Preview",
    // Alerts
    alert_sa_title: "Self-Critical",
    alert_sa_body: "I noticed some harsh words towards yourself. Try to talk to yourself like you would to a best friend.",
    alert_cat_title: "Catastrophizing",
    alert_cat_body: "This looks like an 'all or nothing' trap. Things might not be as absolute or permanent as they feel.",
    alert_mr_title: "Mind Reading",
    alert_mr_body: "You seem to be guessing others' thoughts. Facts are usually simpler than our fears.",
    alert_should_title: "The Tyranny of Should",
    alert_should_body: "'Should' and 'Must' are heavy chains. Try replacing them with 'I wish' or 'It would be nice'.",
    alert_an_title: "All or Nothing",
    alert_an_body: "The world isn't just black and white. One mistake doesn't mean total failure.",
    alert_er_title: "Emotional Reasoning",
    alert_er_body: "Feeling bad doesn't make the reality bad. Feelings are real, but they aren't facts.",
    alert_default_title: "Let's Pause",
    alert_default_body: "I sense a spike in intensity. Let's take a moment to ground ourselves first.",
    // Disclaimer
    disclaimer: "EmoPatch is a self-reflection tool, not a medical device.\nIf you are in crisis, please seek professional help.",
    // Training Check
    training_check_title: "Compare Split",
    training_check_user: "Your Split",
    training_check_ai: "AI Suggestion",
    // User Split
    user_split_title: "Mini-Exercise: Fact vs. Story",
    user_split_hint: "Try to write down ONLY what a camera would see (no adjectives).",
    user_split_placeholder: "e.g., He didn't reply to my text...",
    user_split_next: "Done, show me AI split",
    user_split_skip: "Too tired, AI do it",
    // Save
    save_button: "Save Record",
    saved_button: "Saved",
    saved_hint: "View in History tab",
  }
};

// Fallback Data (Offline Mode)
export const getFallbackData = (lang: Language) => {
    const isZh = lang === 'zh';
    return {
        reframes: [
            { type: 'CAMERA', text: isZh ? "事件发生：A发送了信息。B没有回复。A感到焦虑。" : "Event: A sent a message. B did not reply. A felt anxious." },
            { type: 'SOCIOLOGIST', text: isZh ? "可能原因：信息过载、网络延迟或注意力分散是普遍现象，非针对性行为。" : "Possible causes: Information overload, latency, or distraction are common systemic factors." },
            { type: 'SHIELD', text: isZh ? "自我保护：无论对方是否回复，我的价值不由此时的等待定义。" : "Boundary: My worth is not defined by this waiting period, regardless of the outcome." }
        ]
    };
};

export const FOLLOWUP_FALLBACKS = {
    zh: {
        headline: "连接暂时中断",
        encouragement: "你很安全",
        mainInsight: "我们暂时无法连接到云端大脑，但请记住：你的情绪是合理的。深呼吸，这只是暂时的技术波动，就像生活中的小插曲。",
        keyPoints: ["喝一杯水", "离开屏幕5分钟", "写下此刻的一个感恩点"],
        advice: "不论外界如何，照顾好自己是此刻最重要的事。"
    },
    en: {
        headline: "Connection Paused",
        encouragement: "You are safe",
        mainInsight: "We can't reach the cloud mind right now, but remember: your feelings are valid. Breathe. This is just a temporary technical wave.",
        keyPoints: ["Drink a glass of water", "Step away from screen", "Write one thing you are grateful for"],
        advice: "Taking care of yourself is the priority, regardless of connection status."
    }
};
