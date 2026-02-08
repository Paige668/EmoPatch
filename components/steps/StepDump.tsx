
import React, { useRef } from 'react';
import { ClayButton } from '../ui/ClayButton';

interface StepDumpProps {
  t: any;
  data: any;
  inputText: string;
  setInputText: (text: string) => void;
  actions: {
    handleImageUpload: (file: File) => void;
    removeImage: () => void;
    submitDump: (text: string) => void;
  };
  isRecording: boolean;
  isTranscribing: boolean;
  toggleRecording: () => void;
}

// Custom Tooltip Component for Demo Highlight
const DemoTooltip: React.FC<{ text: string; children: React.ReactNode }> = ({ text, children }) => (
  <div className="relative group flex flex-col items-center">
    {children}
    {/* Tooltip Body */}
    <div className="absolute bottom-full mb-3 hidden group-hover:flex flex-col items-center whitespace-nowrap z-20 transition-all duration-200 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0">
      <span className="relative z-10 px-3 py-1.5 text-xs font-bold text-white bg-[#655C70] rounded-xl shadow-xl tracking-wide">
        {text}
      </span>
      {/* Little arrow */}
      <div className="w-3 h-3 -mt-1.5 rotate-45 bg-[#655C70]"></div>
    </div>
  </div>
);

// Custom Puzzle-Shaped Input Component
const PuzzleInputArea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => {
  return (
    <div className="relative w-full group py-4 md:pr-6">
      {/* Unified Drop Shadow Wrapper */}
      <div className="filter drop-shadow-[10px_10px_20px_rgba(150,160,150,0.2)] transition-all duration-300 group-hover:drop-shadow-[12px_12px_24px_rgba(150,160,150,0.3)] relative">
        
        {/* TOP KNOB (Puzzle Ear) */}
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-20 h-10 rounded-t-[1.5rem] bg-gradient-to-b from-[#C2DBC6] to-[#CCE0CF] shadow-[inset_4px_4px_8px_rgba(255,255,255,0.4),inset_-4px_-2px_4px_rgba(100,120,105,0.05)]"></div>

        {/* RIGHT KNOB (Puzzle Ear) */}
        <div className="absolute top-1/2 -translate-y-1/2 -right-5 w-10 h-20 rounded-r-[1.5rem] bg-gradient-to-r from-[#D4E8D8] to-[#E0EFE4] shadow-[inset_2px_4px_8px_rgba(255,255,255,0.4),inset_-4px_-4px_8px_rgba(100,120,105,0.05)]"></div>

        {/* MAIN BODY */}
        <div className="relative z-10 w-full rounded-[2rem] bg-gradient-to-br from-[#C2DBC6] to-[#D4E8D8] shadow-[inset_6px_6px_12px_#B0C4B4,inset_-6px_-6px_12px_rgba(255,255,255,0.8)]">
          <textarea
            {...props}
            className={`
              w-full h-full bg-transparent border-none outline-none resize-none
              p-6 md:p-8 text-lg leading-relaxed text-[#4A5A50] placeholder-[#8AB89F]/70
              rounded-[2rem]
              focus:ring-0 transition-all
              ${props.className}
            `}
          />
        </div>
      </div>
    </div>
  );
};

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
  };

  return (
    <div className="w-full">
       <h2 className="text-2xl font-black text-[#4A4A4A] mb-8 text-center">{t.input_title}</h2>
       
       <div className="mb-6 px-2 md:px-4">
          {data.rawImage && (
            <div className="mb-6 relative rounded-3xl overflow-hidden shadow-md border-4 border-white/50 mx-auto max-w-[90%]">
              <img src={data.rawImage} alt={t.img_preview_alt} className="w-full h-auto max-h-48 object-cover" />
              <button onClick={actions.removeImage} className="absolute top-2 right-2 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm backdrop-blur-sm">✕</button>
            </div>
          )}
          
          <PuzzleInputArea 
            placeholder={t.input_placeholder} 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="min-h-[200px]"
          />
          
          {/* Action Buttons Row */}
          <div className="flex items-center justify-between mt-8 px-2">
             <div className="flex gap-4">
                 {/* Camera / Chat Log Upload */}
                 <DemoTooltip text={t.img_upload_label}>
                   <button 
                     onClick={() => fileInputRef.current?.click()}
                     className="w-12 h-12 rounded-2xl bg-[#EFEBE6] text-[#8C8C8C] flex items-center justify-center shadow-[4px_4px_8px_#D6D1C9,-4px_-4px_8px_#FFFFFF] active:shadow-inner active:scale-95 transition-all text-xl hover:text-[#4A4A4A]"
                   >
                      📷
                   </button>
                 </DemoTooltip>
                 <input type="file" ref={fileInputRef} onChange={onFileSelect} className="hidden" accept="image/*" />

                 {/* Voice Input */}
                 <DemoTooltip text={t.voice_input_tooltip}>
                   <button 
                     onClick={toggleRecording}
                     className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-[4px_4px_8px_#D6D1C9,-4px_-4px_8px_#FFFFFF] transition-all text-xl ${isRecording ? 'bg-[#E08D79] text-white shadow-inner animate-pulse' : 'bg-[#EFEBE6] text-[#8C8C8C] active:shadow-inner active:scale-95 hover:text-[#4A4A4A]'}`}
                   >
                      {isRecording ? '⏹' : '🎙️'}
                   </button>
                 </DemoTooltip>
                 
                 {isTranscribing && <span className="text-xs text-[#8AB89F] font-bold self-center animate-pulse">{t.mic_transcribing}</span>}
             </div>

             <ClayButton onClick={() => actions.submitDump(inputText)} disabled={!inputText.trim() && !data.rawImage}>
                {t.input_button}
             </ClayButton>
          </div>
       </div>
    </div>
  );
};
