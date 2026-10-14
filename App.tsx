import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, MotionConfig, Variants } from 'framer-motion';
import { useTriageFlow, type FallbackReason } from './hooks/useTriageFlow';
import { useAudioRecorder } from './hooks/useAudioRecorder';
import { BufferStep } from './components/BufferStep';
import History from './components/History';
import { ClayButton } from './components/ui/ClayButton';
import { Icon } from './components/ui/Icon';
import { PatchyPause } from './components/PatchyPause';
import { UI_TEXT } from './constants';
import { transcribeAudio, generateSpeech, isQuotaError } from './services/aiService';
import { getAudioContext } from './services/audioContext';

// Step Components
import { StepIdle } from './components/steps/StepIdle';
import { StepDump } from './components/steps/StepDump';
import { StepLoading } from './components/steps/StepLoading';
import { StepConfirm } from './components/steps/StepConfirm';
import { StepChoice } from './components/steps/StepChoice';
import { StepDepthChoice } from './components/steps/StepDepthChoice';
import { StepFinalContent } from './components/steps/StepFinalContent';
import { StepContextPatch } from './components/steps/StepContextPatch';
import { StepPatchResult } from './components/steps/StepPatchResult';
import { StepCrisisSupport } from './components/steps/StepCrisisSupport';

// --- Main App ---

export default function App() {
  const { step, data, language, isOfflineMode, offlineReason, bufferDuration, actions } = useTriageFlow();
  const [inputText, setInputText] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  // Custom Needs State
  const [customNeedInput, setCustomNeedInput] = useState('');
  const [isAddingNeed, setIsAddingNeed] = useState(false);

  // Voice & Media State
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);

  const t = UI_TEXT[language];

  // Going back twice in quick succession can mean the person is stuck or
  // overwhelmed, so it asks Patchy to offer a pause.
  const [pauseNudge, setPauseNudge] = useState(0);
  const recentBacks = useRef<number[]>([]);
  const handleBack = () => {
    const now = Date.now();
    recentBacks.current = [...recentBacks.current.filter(time => now - time < 20_000), now];
    if (recentBacks.current.length >= 2) {
      recentBacks.current = [];
      setPauseNudge(n => n + 1);
    }
    actions.goBack();
  };

  // The input box mirrors the submitted text whenever the user lands on it,
  // so a sample is prefilled and going back keeps what was written.
  useEffect(() => {
    if (step === 'DUMP') setInputText(data.rawText);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  useEffect(() => {
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
  }, [language]);

  // --- Handlers ---

  const handleTranscription = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    try {
      const base64String = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(reader.error || new Error('Could not read the recording.'));
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(audioBlob);
      });
      const base64Data = base64String.split(',')[1];
      const mimeType = audioBlob.type || base64String.split(';')[0].split(':')[1];
      const text = await transcribeAudio(base64Data, mimeType, language);
      if (text) setInputText(prev => prev ? `${prev} ${text}` : text);
    } catch (e) {
      console.error(e);
      alert(isQuotaError(e) ? t.voice_quota_error : t.ai_unavailable);
    } finally {
      setIsTranscribing(false);
    }
  };

  const { isRecording, toggleRecording } = useAudioRecorder({
    onStop: handleTranscription,
    onError: () => alert(t.mic_error)
  });

  const handleToggleRecordingWrapper = () => {
    if (isOfflineMode) {
      alert(t.voice_offline);
      return;
    }
    toggleRecording();
  };

  const handleImageUpload = async (file: File) => {
    const ok = await actions.handleImageUpload(file);
    if (!ok) alert(t.img_error);
  };

  const handlePlayAudio = async () => {
    if (!data.followUp || isPlayingAudio) return;
    if (isOfflineMode) {
      alert(t.audio_offline);
      return;
    }

    const { headline, mainInsight, keyPoints, advice } = data.followUp;
    const textToSpeak = `${headline}. ${mainInsight}. ${keyPoints.join('. ')}. ${advice}`;

    setIsGeneratingAudio(true);
    try {
      const audioBuffer = await generateSpeech(textToSpeak, language);
      setIsGeneratingAudio(false);
      setIsPlayingAudio(true);

      const ctx = getAudioContext();
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.onended = () => { setIsPlayingAudio(false); };
      source.start();
    } catch (e) {
      setIsGeneratingAudio(false);
      setIsPlayingAudio(false);
      alert(isQuotaError(e) ? t.audio_quota_error : t.ai_unavailable);
    }
  };

  const handleAddCustomNeed = () => {
    if (customNeedInput.trim()) {
      actions.addCustomNeed(customNeedInput.trim());
      setCustomNeedInput('');
    }
    setIsAddingNeed(false);
  };

  const patternContent = data.thinkingPattern
    ? {
        'SELF_ATTACK': { title: t.alert_sa_title, body: t.alert_sa_body },
        'CATASTROPHIZING': { title: t.alert_cat_title, body: t.alert_cat_body },
        'MIND_READING': { title: t.alert_mr_title, body: t.alert_mr_body },
        'SHOULD_STATEMENTS': { title: t.alert_should_title, body: t.alert_should_body },
        'ALL_OR_NOTHING': { title: t.alert_an_title, body: t.alert_an_body },
        'EMOTIONAL_REASONING': { title: t.alert_er_title, body: t.alert_er_body },
      }[data.thinkingPattern]
    : undefined;

  const fallbackMessages: Record<FallbackReason, string> = {
    AI_ERROR: t.fallback_ai_error,
    MANUAL_SKIP: t.fallback_manual_skip,
    RATE_LIMIT: t.fallback_rate_limit,
    TOO_LARGE: t.fallback_too_large,
    OFFLINE: t.fallback_offline,
  };
  const fallbackMsg = data.fallbackReason ? fallbackMessages[data.fallbackReason] : null;
  // Retry is offered whenever a template is showing and the AI might be reachable.
  const onRetry = data.isFallback && !isOfflineMode ? actions.retryAI : undefined;

  if (showHistory) {
    return <History onBack={() => setShowHistory(false)} language={language} />;
  }

  // Animation variants
  // Screens drop in with a slight tilt and settle on a spring, like a puzzle
  // piece being set down; they lift away the same way.
  const pageVariants: Variants = {
    initial: { opacity: 0, scale: 0.94, y: 24, rotate: -1.5 },
    animate: { opacity: 1, scale: 1, y: 0, rotate: 0, transition: { type: 'spring', stiffness: 260, damping: 22 } },
    exit: { opacity: 0, scale: 0.96, y: -12, rotate: 1.5, transition: { duration: 0.25, ease: 'easeIn' } }
  };

  const pauseEnabled = ['DUMP', 'CONFIRM', 'CHOICE', 'DEPTH_CHOICE', 'FINAL_CONTENT', 'CONTEXT_PATCH', 'PATCH_RESULT'].includes(step);

  // Show disclaimer only on IDLE (Home), input and result steps
  const showDisclaimer = ['IDLE', 'DUMP', 'CHOICE', 'DEPTH_CHOICE', 'FINAL_CONTENT', 'CONTEXT_PATCH', 'PATCH_RESULT'].includes(step);

  // --- Render ---

  return (
    <MotionConfig reducedMotion="user">
    <div className="min-h-screen bg-[#F5F2EB] text-[#4A4A4A] font-sans selection:bg-[#8AB89F] selection:text-white flex flex-col items-center relative overflow-hidden">

      {/* Navbar / Header */}
      <div className="w-full max-w-2xl px-6 py-6 flex justify-between items-center z-50">
         {/* Left: Back Button + Branding */}
         <div className="flex items-center gap-3 min-w-[100px]">
             {step !== 'IDLE' && (
                 <>
                   <ClayButton variant="secondary" onClick={handleBack} className="!w-12 !h-12 !p-0 !rounded-full shrink-0" ariaLabel={language === 'zh' ? '返回' : 'Back'}>
                       <Icon name="back" className="w-5 h-5" />
                   </ClayButton>
                   <span className="font-display text-xl cursor-default">
                     <span className="text-[#5E9A78]">Emo</span><span className="text-[#8F72B3]">Patch</span>
                   </span>
                 </>
             )}
         </div>

         {/* Center: Demo / Offline Indicator */}
         <div className="flex-1 flex justify-center gap-2">
            {data.isDemo && step !== 'IDLE' && (
                <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full border text-[#7B6194] bg-[#F4EFF8] border-[#B79FD4]/40">
                    <Icon name="puzzle" className="w-3.5 h-3.5" />{t.demo_badge}
                </span>
            )}
            {isOfflineMode && (
                <span className="text-xs font-bold px-3 py-1 rounded-full border text-[#B5523C] bg-[#E08D79]/10 border-[#E08D79]/20">
                    {offlineReason === 'QUOTA' ? t.offline_quota : t.offline_network}
                </span>
            )}
         </div>

         {/* Right: History & Language */}
         <div className="flex items-center gap-3">
             {(step === 'IDLE' || step === 'FINAL_CONTENT') && (
                 <ClayButton
                   variant="secondary"
                   onClick={() => setShowHistory(true)}
                   className="!text-xs !font-bold !py-2 !px-5 !bg-none !bg-[#F7F7F7] !text-[#757575] !shadow-[3px_3px_6px_#E0E0E0,-3px_-3px_6px_#FFFFFF] border !border-[#EEEEEE] hover:!bg-[#F0F0F0] active:!shadow-inner"
                 >
                    {t.view_history}
                 </ClayButton>
             )}

             <button
               onClick={() => actions.setLanguage(language === 'zh' ? 'en' : 'zh')}
               aria-label={t.language_toggle_aria}
               className="text-xs font-bold text-[#6B6B6B] bg-[#EFEBE6] px-3 py-1.5 rounded-full shadow-inner"
             >
                {t.language_toggle}
             </button>
         </div>
      </div>

      {/* Main Content Area - Centered Focus */}
      <div className={`flex-1 w-full max-w-lg px-6 flex flex-col justify-center relative ${pauseEnabled ? "pb-32" : "pb-24"}`}>
        <AnimatePresence mode="wait">

          {/* STEP: IDLE */}
          {step === 'IDLE' && (
            <motion.div key="IDLE" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="flex flex-col items-center">
              <StepIdle t={t} actions={actions} />
            </motion.div>
          )}

          {/* STEP: BUFFER */}
          {step === 'BUFFER' && (
             <motion.div key="BUFFER" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="h-full">
               <BufferStep
                  onFinish={actions.onBufferEnd}
                  onSkip={actions.onBufferEnd}
                  duration={bufferDuration}
                  text={{
                      inhale: t.buffer_inhale,
                      exhale: t.buffer_exhale,
                      connecting: t.buffer_connecting,
                      slowly: t.buffer_slowly,
                      skip_breathing: t.skip_breathing
                  }}
               />
             </motion.div>
          )}

          {/* STEP: DUMP (Input) */}
          {step === 'DUMP' && (
            <motion.div key="DUMP" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="w-full">
              <StepDump
                t={t}
                data={data}
                inputText={inputText}
                setInputText={setInputText}
                actions={{ ...actions, handleImageUpload }}
                isRecording={isRecording}
                isTranscribing={isTranscribing}
                toggleRecording={handleToggleRecordingWrapper}
              />
            </motion.div>
          )}

          {/* STEP: ANALYZING / LOADING */}
          {(step === 'ANALYZING' || step === 'REFRAMING' || step === 'GENERATING_FOLLOWUP' || step === 'REVISING_CONTEXT') && (
            <motion.div key="LOADING" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="flex flex-col items-center justify-center h-full w-full">
               <StepLoading
                 t={t}
                 isOfflineMode={isOfflineMode}
                 canSkip={step !== 'REVISING_CONTEXT'}
                 actions={actions}
               />
            </motion.div>
          )}

          {/* STEP: CONFIRM (Split) */}
          {step === 'CONFIRM' && (
            <motion.div key="CONFIRM" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <StepConfirm
                t={t}
                data={data}
                language={language}
                fallbackMessage={fallbackMsg}
                onRetry={onRetry}
                patternContent={patternContent}
                customNeedInput={customNeedInput}
                setCustomNeedInput={setCustomNeedInput}
                isAddingNeed={isAddingNeed}
                setIsAddingNeed={setIsAddingNeed}
                handleAddCustomNeed={handleAddCustomNeed}
                actions={actions}
              />
            </motion.div>
          )}

          {/* STEP: CHOICE (Reframes) */}
          {step === 'CHOICE' && data.reframes && (
             <motion.div key="CHOICE" variants={pageVariants} initial="initial" animate="animate" exit="exit">
                <StepChoice
                  t={t}
                  data={data}
                  language={language}
                  fallbackMessage={fallbackMsg}
                  onRetry={onRetry}
                  canPatch={!isOfflineMode}
                  actions={actions}
                />
             </motion.div>
          )}

          {/* STEP: DEPTH CHOICE */}
          {step === 'DEPTH_CHOICE' && (
            <motion.div key="DEPTH" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <StepDepthChoice t={t} data={data} language={language} actions={actions} />
            </motion.div>
          )}

          {/* STEP: FINAL CONTENT */}
          {step === 'FINAL_CONTENT' && data.followUp && (
             <motion.div key="FINAL" variants={pageVariants} initial="initial" animate="animate" exit="exit">
                <StepFinalContent
                  t={t}
                  data={data}
                  fallbackMessage={fallbackMsg}
                  onRetry={onRetry}
                  canPatch={!isOfflineMode}
                  actions={actions}
                  handlePlayAudio={handlePlayAudio}
                  isGeneratingAudio={isGeneratingAudio}
                  isPlayingAudio={isPlayingAudio}
                />
             </motion.div>
          )}

          {/* STEP: ADD NEW CONTEXT */}
          {step === 'CONTEXT_PATCH' && (
            <motion.div key="CONTEXT_PATCH" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <StepContextPatch t={t} data={data} language={language} actions={actions} />
            </motion.div>
          )}

          {/* STEP: UPDATED ANALYSIS DIFF */}
          {step === 'PATCH_RESULT' && data.lastPatch && (
            <motion.div key="PATCH_RESULT" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <StepPatchResult t={t} data={data} language={language} actions={actions} />
            </motion.div>
          )}

          {/* STEP: SAFETY REDIRECTION */}
          {step === 'CRISIS_SUPPORT' && (
            <motion.div key="CRISIS_SUPPORT" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <StepCrisisSupport t={t} actions={actions} />
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Safety Disclaimer - Conditional */}
      {showDisclaimer && (
        <div className={`w-full text-center pl-4 py-3 z-0 absolute bottom-0 ${pauseEnabled ? 'pr-20 sm:pr-4' : 'pr-4'}`}>
            <p className="text-xs text-[#6B6B6B] font-semibold max-w-md mx-auto leading-snug whitespace-pre-line">
                {t.disclaimer}
            </p>
        </div>
      )}

      <PatchyPause t={t} enabled={pauseEnabled} screenKey={step} nudge={pauseNudge} onStopForToday={actions.reset} />
    </div>
    </MotionConfig>
  );
}
