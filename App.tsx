
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useTriageFlow } from './hooks/useTriageFlow';
import { useAudioRecorder } from './hooks/useAudioRecorder';
import { BufferStep } from './components/BufferStep';
import History from './components/History';
import { ClayButton } from './components/ui/ClayButton';
import { UI_TEXT } from './constants';
import { transcribeAudio, generateSpeech } from './services/aiService';
import { getAudioContext } from './services/audioContext';

// Step Components
import { StepIdle } from './components/steps/StepIdle';
import { StepDump } from './components/steps/StepDump';
import { StepLoading } from './components/steps/StepLoading';
import { StepExtremeAlert } from './components/steps/StepExtremeAlert';
import { StepConfirm } from './components/steps/StepConfirm';
import { StepChoice } from './components/steps/StepChoice';
import { StepDepthChoice } from './components/steps/StepDepthChoice';
import { StepFinalContent } from './components/steps/StepFinalContent';

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

  // Reset inputs when IDLE
  useEffect(() => {
    if (step === 'IDLE') {
        setInputText('');
    }
  }, [step]);

  // --- Handlers ---

  const handleTranscription = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1];
        const mimeType = base64String.split(';')[0].split(':')[1];
        const text = await transcribeAudio(base64Data, mimeType, language);
        if (text) setInputText(prev => prev ? prev + " " + text : text);
        setIsTranscribing(false);
      };
    } catch (e) {
      console.error(e);
      setIsTranscribing(false);
      if (typeof (e as any)?.message === 'string' && (e as any).message.includes('quota')) {
         alert("Voice quota exceeded. Please type instead.");
      }
    }
  };

  const { isRecording, toggleRecording } = useAudioRecorder({
    onStop: handleTranscription,
    onError: () => alert(t.mic_error)
  });

  const handleToggleRecordingWrapper = () => {
    if (isOfflineMode) {
      alert("Offline Mode: Voice features are unavailable.");
      return;
    }
    toggleRecording();
  };

  const handlePlayAudio = async () => {
    if (!data.followUp || isPlayingAudio) return;
    if (isOfflineMode) {
        alert("Offline Mode: Audio unavailable.");
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
      if (typeof (e as any)?.message === 'string' && (e as any).message.includes('quota')) {
          alert("Audio quota exceeded.");
      }
    }
  };

  const handleAddCustomNeed = () => {
    if (customNeedInput.trim()) {
        actions.addCustomNeed(customNeedInput.trim());
        setCustomNeedInput('');
    }
    setIsAddingNeed(false);
  };

  const alertContent = data.extremeType 
    ? {
        'SELF_ATTACK': { title: t.alert_sa_title, body: t.alert_sa_body },
        'CATASTROPHIZING': { title: t.alert_cat_title, body: t.alert_cat_body },
        'MIND_READING': { title: t.alert_mr_title, body: t.alert_mr_body },
        'SHOULD_STATEMENTS': { title: t.alert_should_title, body: t.alert_should_body },
        'ALL_OR_NOTHING': { title: t.alert_an_title, body: t.alert_an_body },
        'EMOTIONAL_REASONING': { title: t.alert_er_title, body: t.alert_er_body },
      }[data.extremeType] || { title: t.alert_default_title, body: t.alert_default_body }
    : { title: t.alert_default_title, body: t.alert_default_body };

  // Helper to get fallback text
  const getFallbackMessage = () => {
    if (data.fallbackReason === 'AI_ERROR') {
        return language === 'zh' ? 'AI 连接失败，已切换至离线模版' : 'AI connection failed. Using offline template.';
    }
    return language === 'zh' ? '已跳过 AI 分析，切换至离线模版' : 'Skipped AI. Using offline template.';
  };

  const fallbackMsg = getFallbackMessage();

  if (showHistory) {
    return <History onBack={() => setShowHistory(false)} language={language} />;
  }

  // Animation variants
  const pageVariants: Variants = {
    initial: { opacity: 0, scale: 0.95, y: 15 },
    animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 1, 0.5, 1] } },
    exit: { opacity: 0, scale: 0.98, y: -10, transition: { duration: 0.4, ease: "easeIn" } }
  };
  
  // Show disclaimer only on IDLE (Home), input and result steps
  const showDisclaimer = ['IDLE', 'DUMP', 'CHOICE', 'DEPTH_CHOICE', 'FINAL_CONTENT'].includes(step);

  // --- Render ---

  return (
    <div className="min-h-screen bg-[#F5F2EB] text-[#4A4A4A] font-sans selection:bg-[#8AB89F] selection:text-white flex flex-col items-center relative overflow-hidden">
      
      {/* Navbar / Header */}
      <div className="w-full max-w-2xl px-6 py-6 flex justify-between items-center z-50">
         {/* Left: Back Button + Branding */}
         <div className="flex items-center gap-3 min-w-[100px]">
             {step !== 'IDLE' && (
                 <>
                   <ClayButton variant="secondary" onClick={actions.goBack} className="!w-12 !h-12 !p-0 !rounded-full shrink-0">
                       ←
                   </ClayButton>
                   <span className="font-black text-lg tracking-tight cursor-default">
                     <span className="text-[#8AB89F]">Emo</span><span className="text-[#B79FD4]">Patch</span>
                   </span>
                 </>
             )}
         </div>

         {/* Center: Title or Offline Indicator */}
         <div className="flex-1 text-center">
            {isOfflineMode && (
                <span className={`text-xs font-bold px-3 py-1 rounded-full border 
                    ${offlineReason === 'MANUAL' 
                        ? 'text-[#8C8C8C] bg-[#EFEBE6] border-[#D6D1C9]' 
                        : 'text-[#E08D79] bg-[#E08D79]/10 border-[#E08D79]/20'
                    }`}>
                    {offlineReason === 'QUOTA' ? '📡 Offline (Quota Exceeded)' : 
                     offlineReason === 'NETWORK' ? '📡 Offline (No Connection)' :
                     '📝 Offline (Manual Mode)'}
                </span>
            )}
         </div>

         {/* Right: History & Language */}
         <div className="flex items-center gap-3">
             {/* Logic Update: Only show on IDLE (Home) and FINAL_CONTENT (Result), and always use the Pill style */}
             {(step === 'IDLE' || step === 'FINAL_CONTENT') && (
                 <ClayButton 
                   variant="secondary" 
                   onClick={() => setShowHistory(true)} 
                   className="!text-xs !font-bold !py-2 !px-5 !bg-none !bg-[#F7F7F7] !text-[#A3A3A3] !shadow-[3px_3px_6px_#E0E0E0,-3px_-3px_6px_#FFFFFF] border !border-[#EEEEEE] hover:!bg-[#F0F0F0] active:!shadow-inner"
                 >
                    {t.view_history}
                 </ClayButton>
             )}

             <button 
               onClick={() => actions.setLanguage(language === 'zh' ? 'en' : 'zh')}
               className="text-xs font-bold text-[#8C8C8C] bg-[#EFEBE6] px-3 py-1.5 rounded-full shadow-inner"
             >
                {language === 'zh' ? '🇨🇳' : '🇺🇸'}
             </button>
         </div>
      </div>

      {/* Main Content Area - Centered Focus */}
      <div className="flex-1 w-full max-w-lg px-6 flex flex-col justify-center pb-20 relative">
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
                  // Pass onSkip only if duration implies it's the initial flow (< 15s)
                  // The stabilize flow is 20s
                  onSkip={bufferDuration < 15000 ? actions.onBufferEnd : undefined}
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
                actions={actions}
                isRecording={isRecording}
                isTranscribing={isTranscribing}
                toggleRecording={handleToggleRecordingWrapper}
              />
            </motion.div>
          )}

          {/* STEP: ANALYZING / LOADING */}
          {(step === 'ANALYZING' || step === 'REFRAMING' || step === 'GENERATING_FOLLOWUP') && (
            <motion.div key="LOADING" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="flex flex-col items-center justify-center h-full w-full">
               <StepLoading t={t} isOfflineMode={isOfflineMode} actions={actions} />
            </motion.div>
          )}

          {/* STEP: EXTREME ALERT */}
          {step === 'EXTREME_ALERT' && (
            <motion.div key="ALERT" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <StepExtremeAlert t={t} alertContent={alertContent} actions={actions} />
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
                  actions={actions} 
                  handlePlayAudio={handlePlayAudio}
                  isGeneratingAudio={isGeneratingAudio}
                  isPlayingAudio={isPlayingAudio}
                />
             </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Safety Disclaimer - Conditional */}
      {showDisclaimer && (
        <div className="w-full text-center p-2 z-0 opacity-50 absolute bottom-0">
            <p className="text-[10px] text-[#8C8C8C] font-bold max-w-md mx-auto leading-tight whitespace-pre-line">
                {t.disclaimer}
            </p>
        </div>
      )}

    </div>
  );
}
