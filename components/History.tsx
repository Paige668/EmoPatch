
import React, { useEffect, useState } from 'react';
import { getRecords } from '../services/storageService';
import { TriageRecord, Language } from '../types';
import { PERSONA_LABELS, UI_TEXT } from '../constants';
import { motion, AnimatePresence } from 'framer-motion';
import { ClayButton } from './ui/ClayButton';

interface HistoryProps {
  onBack: () => void;
  language: Language;
}

const ITEMS_PER_PAGE = 10;

const History: React.FC<HistoryProps> = ({ onBack, language }) => {
  const [allRecords, setAllRecords] = useState<TriageRecord[]>([]);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const t = UI_TEXT[language];

  useEffect(() => {
    getRecords().then(data => {
      setAllRecords(data);
      setLoading(false);
    });
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + ITEMS_PER_PAGE);
  };

  const displayedRecords = allRecords.slice(0, visibleCount);
  const hasMore = visibleCount < allRecords.length;

  return (
    <div className="min-h-screen bg-[#FFF8F3] p-6 font-sans">
      <div className="max-w-md mx-auto">
        <div className="flex items-center mb-10">
          <button 
            onClick={onBack} 
            className="w-12 h-12 rounded-full bg-white shadow-[4px_4px_8px_#E6D8D1,-4px_-4px_8px_#FFFFFF] flex items-center justify-center text-slate-400 hover:text-[#88C9A1] active:shadow-inner transition-all"
          >
            <span className="font-bold text-lg">←</span>
          </button>
          <h1 className="text-2xl font-black text-slate-800 ml-5">{t.history_title}</h1>
        </div>

        {loading ? (
          <div className="text-center text-slate-400 mt-20 animate-pulse font-bold">{t.history_loading}</div>
        ) : allRecords.length === 0 ? (
          <div className="text-center mt-20">
             <div className="w-24 h-24 bg-white rounded-full mx-auto mb-6 flex items-center justify-center text-4xl shadow-[8px_8px_16px_#E6D8D1,-8px_-8px_16px_#FFFFFF]">
                 🍃
             </div>
             <p className="text-slate-400 font-medium whitespace-pre-line leading-relaxed">{t.history_empty}</p>
          </div>
        ) : (
          <div className="space-y-6 pb-20">
            {displayedRecords.map((rec) => {
              const isExpanded = expandedId === rec.id;
              const persona = PERSONA_LABELS[language][rec.chosenReframe.type] || { emoji: '✨', title: 'Perspective' };

              return (
                <div 
                  key={rec.id} 
                  onClick={() => toggleExpand(rec.id)}
                  role="button"
                  tabIndex={0}
                  aria-expanded={isExpanded}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleExpand(rec.id);
                    }
                  }}
                  className={`
                    bg-white p-6 rounded-[2rem] 
                    shadow-[10px_10px_20px_#E6D8D1,-10px_-10px_20px_#FFFFFF] 
                    border-2 border-white
                    cursor-pointer transition-all duration-300 outline-none focus:ring-4 focus:ring-[#8AB89F]/20
                    ${isExpanded ? 'scale-[1.02] ring-4 ring-[#88C9A1]/10 z-10' : 'hover:scale-[1.01] hover:shadow-xl'}
                  `}
                >
                  {/* Top Row: Date & Mood */}
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs text-slate-400 font-bold bg-[#F0F4F8] px-3 py-1 rounded-full">
                      {new Date(rec.createdAt).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-2">
                        {rec.moodDelta !== 0 && (
                            <span className={`text-xs px-2 py-1 rounded-full font-black ${rec.moodDelta <= 0 ? 'bg-[#88D4AB] text-white' : 'bg-[#88C9A1] text-white'}`}>
                                {rec.moodDelta > 0 ? '+' : ''}{rec.moodDelta}
                            </span>
                        )}
                        <span className={`text-slate-300 font-bold text-xs transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                            ▼
                        </span>
                    </div>
                  </div>
                  
                  {/* Title */}
                  <h3 className={`text-slate-800 font-black mb-4 ${isExpanded ? 'text-xl' : 'text-base line-clamp-1'}`}>
                    {rec.capture.eventText}
                  </h3>
                  
                  {/* Collapsed View Summary */}
                  {!isExpanded && (
                     <div className="space-y-3">
                        <div className="bg-[#F8F5F2] p-4 rounded-2xl shadow-inner">
                            <p className="text-xs text-slate-400 font-bold uppercase mb-1">{t.history_thought}</p>
                            <p className="text-sm text-slate-600 italic line-clamp-2">"{rec.split.interpretation}"</p>
                        </div>
                        <div className="flex gap-3 items-center text-sm text-slate-500 pl-2">
                           <span className="bg-[#EEF2FF] w-8 h-8 rounded-full flex items-center justify-center shadow-sm">{persona.emoji}</span>
                           <span className="truncate flex-1 font-bold">{rec.chosenReframe.text}</span>
                        </div>
                     </div>
                  )}

                  {/* Expanded View Details */}
                  <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="pt-6 mt-4 border-t-2 border-dashed border-slate-100 space-y-6">
                                
                                {/* 1. Fact & Interpretation Split */}
                                <div className="space-y-4">
                                    <div className="bg-[#F0F4F8] p-5 rounded-2xl border border-white shadow-sm">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-2 h-2 rounded-full bg-[#88D4AB]"></div>
                                            <span className="text-xs font-black text-slate-400 uppercase tracking-wider">
                                                {language === 'zh' ? '事实 (Fact)' : 'Fact'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-700 leading-relaxed font-medium">{rec.split.fact}</p>
                                    </div>
                                    <div className="bg-[#FFF4F4] p-5 rounded-2xl border border-white shadow-sm">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-2 h-2 rounded-full bg-[#88C9A1]"></div>
                                            <span className="text-xs font-black text-slate-400 uppercase tracking-wider">
                                                {language === 'zh' ? '感受 (Feel)' : 'Feel'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-700 leading-relaxed italic">"{rec.split.interpretation}"</p>
                                    </div>
                                </div>

                                {/* 1.5 Selected Needs (Tags) */}
                                {rec.selectedNeeds && rec.selectedNeeds.length > 0 && (
                                    <div>
                                       <span className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2 block">
                                           {language === 'zh' ? '当时渴望 (Needs)' : 'Needs'}
                                       </span>
                                       <div className="flex flex-wrap gap-2">
                                           {rec.selectedNeeds.map((need, idx) => (
                                               <span key={idx} className="px-3 py-1 bg-[#FFFBEB] text-[#B45309] text-xs font-bold rounded-lg border border-[#FEF3C7] shadow-sm">
                                                   {need}
                                               </span>
                                           ))}
                                       </div>
                                    </div>
                                )}

                                {/* 2. Selected Perspective */}
                                <div>
                                     <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-xl bg-[#F0F4F8] flex items-center justify-center text-xl shadow-inner">
                                            {persona.emoji}
                                        </div>
                                        <span className="text-xs font-black text-slate-500 uppercase tracking-wider">
                                            {persona.title}
                                        </span>
                                     </div>
                                     <p className="text-sm text-slate-600 pl-4 border-l-4 border-[#F0F4F8] font-medium leading-relaxed">
                                        {rec.chosenReframe.text}
                                     </p>
                                </div>

                                {/* 3. Advice - UPDATED LABEL HERE */}
                                <div className="bg-[#F0FDF4] p-6 rounded-3xl relative overflow-hidden border-2 border-[#DCFCE7]">
                                     <div className="absolute top-0 right-0 p-4 opacity-20 text-5xl">🌱</div>
                                     <span className="text-xs font-black text-[#88D4AB] uppercase tracking-wider block mb-3">
                                         {language === 'zh' ? '行动锦囊' : 'Action Step'}
                                     </span>
                                     <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed font-bold">
                                        {rec.chosenAction.text}
                                     </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
            
            {/* Load More Button */}
            {hasMore && (
                <div className="flex justify-center pt-4">
                    <ClayButton onClick={handleLoadMore} variant="secondary" className="!px-8 !py-2 !text-sm">
                        {language === 'zh' ? '加载更多' : 'Load More'} ({allRecords.length - visibleCount})
                    </ClayButton>
                </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
