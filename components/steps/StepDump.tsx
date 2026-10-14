
import React, { useRef } from 'react';
import { ClayButton } from '../ui/ClayButton';
import { Icon } from '../ui/Icon';
import { Patchy } from '../Patchy';
import type { UIText } from '../../constants';
import type { TriageData } from '../../hooks/useTriageFlow';

interface StepDumpProps {
  t: UIText;
  data: TriageData;
  inputText: string;
  setInputText: (text: string) => void;
  actions: {
    handleImageUpload: (file: File) => Promise<void>;
    removeImage: () => void;
    submitDump: (text: string) => void;
  };
  isRecording: boolean;
  isTranscribing: boolean;
  toggleRecording: () => void;
}

export const StepDump: React.FC<StepDumpProps> = ({ 
  t, 
  data, 
  inputText, 
  setInputText, 
  actions, 
  isRecording, 
  isTranscribing, 
  toggleRecording 
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      actions.handleImageUpload(e.target.files[0]);
    }
    // Allow choosing the same file again after removing it.
    e.target.value = '';
  };

  const empty = !inputText.trim();
  const bubble = isRecording ? t.mic_listening : isTranscribing ? t.mic_transcribing : empty ? t.input_patchy : t.input_patchy_typing;
  const mood = isRecording || isTranscribing ? 'thinking' : empty ? 'idle' : 'comfort';
  const insertStarter = (starter: string) => setInputText(starter);

  return (
    <div className="w-full">
       <h2 className="font-display text-[26px] text-[#4A4A4A] mb-4 text-center">{t.input_title}</h2>

       {data.isDemo && (
         <p className="mb-4 mx-2 rounded-2xl bg-[#F4EFF8] border border-[#B79FD4]/30 px-4 py-3 text-xs font-semibold text-[#6A5283] leading-relaxed">
           <Icon name="puzzle" className="inline w-4 h-4 mr-1 -mt-0.5" />{t.demo_hint}
         </p>
       )}

       <div className="px-1">
          {data.rawImage && (
            <div className="mb-5 relative rounded-3xl overflow-hidden shadow-md border-4 border-white/70 mx-auto max-w-[90%] rotate-[-1.5deg]">
              <img src={data.rawImage} alt={t.img_preview_alt} className="w-full h-auto max-h-48 object-cover" />
              <button aria-label={t.img_remove} onClick={actions.removeImage} className="squish absolute top-2 right-2 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center backdrop-blur-sm">
                <Icon name="close" className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Patchy perches on the page and listens. */}
          <div className="relative pt-[58px]">
            <div className="absolute left-3 top-0 z-20 flex items-start gap-2 right-3">
              <Patchy mood={mood} className="w-[74px]" />
              <div key={bubble} className="pop relative mt-1 rounded-[1.1rem] bg-white px-3.5 py-2 font-display text-[15px] text-[#6A5283] shadow-[4px_4px_10px_rgba(150,140,120,0.28)]" role="status">
                <span aria-hidden="true" className="absolute -left-1.5 top-3.5 h-3.5 w-3.5 rotate-45 rounded-[3px] bg-white" />
                <span className="relative">{bubble}</span>
              </div>
            </div>

            <div className="piece-stack">
              <div className="piece piece-journal">
                <textarea
                  placeholder={t.input_placeholder}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  maxLength={12000}
                  aria-label={t.input_title}
                  rows={6}
                  className="journal-lines relative w-full bg-transparent border-none outline-none resize-none p-0 pt-2 text-[17px] text-[#4A4A4A] placeholder-[#B3A88F] focus:ring-0"
                />
              </div>
            </div>
          </div>

          {empty && (
            <div className="mt-4 flex flex-wrap items-center gap-2 px-1">
              <span className="text-xs font-bold text-[#8E8A84]">{t.input_starters_label}</span>
              {t.input_starters.map(starter => (
                <button
                  key={starter}
                  type="button"
                  onClick={() => insertStarter(starter)}
                  className="squish rounded-full bg-white/80 px-3 py-1.5 font-display text-sm text-[#6A5283] shadow-[3px_3px_7px_rgba(150,140,120,0.22),-3px_-3px_7px_#FFFFFF] hover:bg-white"
                >
                  {starter}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-end justify-between mt-6 px-1 gap-3">
             <div className="flex gap-3">
                 <button
                   type="button"
                   onClick={() => fileInputRef.current?.click()}
                   aria-label={t.img_upload_label}
                   className="squish grid justify-items-center gap-1 rounded-2xl bg-[#FFF6D8] px-3 pt-2.5 pb-2 text-[#85651A] shadow-[4px_4px_9px_rgba(150,140,120,0.28),-4px_-4px_9px_#FFFFFF]"
                 >
                   <Icon name="image" className="w-[22px] h-[22px]" />
                   <span className="font-display text-xs">{t.input_screenshot}</span>
                 </button>
                 <input type="file" ref={fileInputRef} onChange={onFileSelect} className="hidden" accept="image/*" />

                 <button
                   type="button"
                   onClick={toggleRecording}
                   aria-label={isRecording ? t.mic_listening : t.mic_start}
                   aria-pressed={isRecording}
                   className={`squish grid justify-items-center gap-1 rounded-2xl px-3 pt-2.5 pb-2 shadow-[4px_4px_9px_rgba(150,140,120,0.28),-4px_-4px_9px_#FFFFFF] ${
                     isRecording ? 'bg-[#E08D79] text-white animate-pulse' : 'bg-[#EFE8F7] text-[#6A5283]'
                   }`}
                 >
                   <Icon name={isRecording ? 'stop' : 'mic'} className="w-[22px] h-[22px]" />
                   <span className="font-display text-xs">{isRecording ? t.input_voice_stop : t.input_voice}</span>
                 </button>
             </div>

             <ClayButton onClick={() => actions.submitDump(inputText)} disabled={empty && !data.rawImage} className="gap-1.5 !px-7 !py-3.5 text-lg">
                {t.input_button}<Icon name="arrow" className="w-5 h-5" />
             </ClayButton>
          </div>
       </div>
    </div>
  );
};
