import React, { useEffect, useRef, useState } from 'react';
import { Patchy } from './Patchy';
import { Icon, IconBadge, type IconName } from './ui/Icon';
import { playAmbient, stopAmbient, type AmbientKind } from '../services/ambientSound';
import type { UIText } from '../constants';

// Patchy's pause: people often arrive already overwhelmed, so Patchy offers a
// break. The button is always there; Patchy also peeks out on its own, at most
// once per session, when someone has sat on one screen for a while or keeps
// going back. It never interrupts typing.
const IDLE_MS = 120_000;

type PauseMode = 'closed' | 'peek' | 'menu' | 'breathe' | 'hug' | 'sound' | 'bye';

interface PatchyPauseProps {
  t: UIText;
  // Whether the pause is offered on the current screen.
  enabled: boolean;
  // Changes whenever the current screen changes, restarting the idle timer.
  screenKey: string;
  // Incremented by the parent to ask Patchy to peek (e.g. repeated going back).
  nudge: number;
  onStopForToday: () => void;
}

const isTyping = () => {
  const el = document.activeElement;
  return el instanceof HTMLTextAreaElement || (el instanceof HTMLInputElement && el.type !== 'file');
};

export const PatchyPause: React.FC<PatchyPauseProps> = ({ t, enabled, screenKey, nudge, onStopForToday }) => {
  const [mode, setMode] = useState<PauseMode>('closed');
  const [sound, setSound] = useState<AmbientKind | null>(null);
  const [breath, setBreath] = useState({ phase: 0, round: 1, done: false });
  const autoUsed = useRef(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  const peek = () => {
    if (autoUsed.current || !enabled) return;
    autoUsed.current = true;
    setMode('peek');
  };

  // Idle timer: restarts on any activity and on every new screen.
  useEffect(() => {
    if (!enabled || mode !== 'closed' || autoUsed.current) return;
    let timer: ReturnType<typeof setTimeout>;
    const arm = () => {
      clearTimeout(timer);
      timer = setTimeout(() => (isTyping() ? arm() : peek()), IDLE_MS);
    };
    const events = ['pointerdown', 'keydown', 'wheel', 'touchstart', 'input'] as const;
    events.forEach(name => window.addEventListener(name, arm, { passive: true }));
    arm();
    return () => {
      clearTimeout(timer);
      events.forEach(name => window.removeEventListener(name, arm));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, mode, screenKey]);

  useEffect(() => {
    if (nudge > 0 && mode === 'closed' && !isTyping()) peek();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nudge]);

  // Leaving a screen where the pause isn't offered closes it.
  useEffect(() => {
    if (!enabled) setMode('closed');
  }, [enabled]);

  // Breathing guide: inhale 4s, hold 2s, exhale 6s, three rounds.
  useEffect(() => {
    if (mode !== 'breathe') return;
    setBreath({ phase: 0, round: 1, done: false });
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let round = 0; round < 3; round += 1) {
      [[0, 0], [4000, 1], [6000, 2]].forEach(([at, phase]) => {
        timers.push(setTimeout(() => setBreath({ phase, round: round + 1, done: false }), round * 12000 + at));
      });
    }
    timers.push(setTimeout(() => setBreath(b => ({ ...b, done: true })), 36000));
    return () => timers.forEach(clearTimeout);
  }, [mode]);

  // Sound only plays inside the sound panel.
  useEffect(() => {
    if (mode !== 'sound' && sound) {
      stopAmbient();
      setSound(null);
    }
  }, [mode, sound]);
  useEffect(() => () => stopAmbient(), []);

  // Move focus into the sheet when it opens, return it when it closes, and let Escape close it.
  const sheetOpen = mode !== 'closed' && mode !== 'peek';
  useEffect(() => {
    if (!sheetOpen) return;
    returnFocus.current ??= document.activeElement as HTMLElement | null;
    sheetRef.current?.querySelector<HTMLElement>('button')?.focus();
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setMode('closed'); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sheetOpen, mode]);
  useEffect(() => {
    if (mode === 'closed' && returnFocus.current) {
      returnFocus.current.focus?.();
      returnFocus.current = null;
    }
  }, [mode]);

  const toggleSound = (kind: AmbientKind) => {
    if (sound === kind) {
      stopAmbient();
      setSound(null);
    } else {
      playAmbient(kind);
      setSound(kind);
    }
  };

  if (!enabled) return null;

  const backLink = (
    <button type="button" onClick={() => setMode('menu')} className="justify-self-center text-[13px] font-bold text-[#8E8A84] underline decoration-dashed underline-offset-4">
      {t.pause_back}
    </button>
  );
  const tile = (target: PauseMode, icon: IconName, label: string, tone: string, iconTone: string) => (
    <button
      type="button"
      onClick={() => setMode(target)}
      className={`squish grid justify-items-center gap-1.5 rounded-[1.4rem] px-2 py-3.5 text-sm font-extrabold shadow-[4px_5px_10px_rgba(150,140,120,0.28),-4px_-4px_9px_#FFFFFF,inset_2px_2px_5px_rgba(255,255,255,0.7)] hover:-translate-y-0.5 ${tone}`}
    >
      <IconBadge name={icon} className={iconTone} />
      {label}
    </button>
  );

  let content: React.ReactNode = null;
  if (mode === 'menu') {
    content = (
      <>
        <Patchy mood="comfort" className="w-32 justify-self-center" />
        <h2 id="pause-title" className="font-display text-center text-[22px] text-[#4A4A4A]">{t.pause_ask}</h2>
        <p className="text-center text-sm text-[#6B6B6B]">{t.pause_ask_sub}</p>
        <div className="grid grid-cols-2 gap-2.5">
          {tile('breathe', 'wind', t.pause_breathe, 'bg-gradient-to-b from-[#E2EEDD] to-[#C9E0CB] text-[#3F6B52]', 'text-[#3F6B52]')}
          {tile('hug', 'heart', t.pause_hug, 'bg-gradient-to-b from-[#EFE8F7] to-[#D4C4E8] text-[#6A5283]', 'text-[#A8481B]')}
          {tile('sound', 'speaker', t.pause_sound, 'bg-gradient-to-b from-[#FFF6D8] to-[#FBE3A1] text-[#85651A]', 'text-[#85651A]')}
          {tile('closed', 'arrow', t.pause_fine, 'bg-gradient-to-b from-white to-[#F3EFE8] text-[#6B6B6B]', 'text-[#6B6B6B]')}
        </div>
        <button type="button" onClick={() => setMode('bye')} className="justify-self-center text-[13px] font-bold text-[#8E8A84] underline decoration-dashed underline-offset-4">
          {t.pause_bye}
        </button>
      </>
    );
  } else if (mode === 'breathe') {
    const phases = [t.pause_inhale, t.pause_hold, t.pause_exhale];
    content = (
      <>
        <Patchy mood={breath.done ? 'cheer' : 'breathe'} motion={breath.done ? '' : 'patchy-breathing'} className="w-44 justify-self-center" />
        <p id="pause-title" className="font-display text-center text-[28px] text-[#6A5283]" aria-live="polite">
          {breath.done ? t.pause_well_done : phases[breath.phase]}
        </p>
        <p className="text-center text-sm text-[#6B6B6B]">{t.pause_round.replace('{n}', String(breath.round))}</p>
        <button type="button" onClick={() => setMode('menu')} className="squish justify-self-center rounded-[1.25rem] bg-gradient-to-b from-[#F2F7EE] to-[#E2EEDD] px-8 py-3 font-black text-[#3F6B52] shadow-[4px_4px_10px_rgba(150,140,120,0.28),-4px_-4px_10px_#FFFFFF]">
          {t.pause_done}
        </button>
      </>
    );
  } else if (mode === 'hug') {
    content = (
      <>
        <Patchy mood="hug" className="w-40 justify-self-center" />
        <h2 id="pause-title" className="font-display text-center text-[22px] text-[#4A4A4A]">{t.pause_hug}</h2>
        <p className="text-center text-sm text-[#6B6B6B]">{t.pause_hug_text}</p>
        <button type="button" onClick={() => setMode('closed')} className="squish justify-self-center rounded-[1.25rem] bg-gradient-to-b from-[#9CC7AE] to-[#7FAE94] px-8 py-3 font-black text-white shadow-[5px_6px_12px_rgba(111,148,128,0.4),-4px_-4px_10px_#FFFFFF]">
          {t.pause_better}
        </button>
        {backLink}
      </>
    );
  } else if (mode === 'sound') {
    content = (
      <>
        <div className="relative justify-self-center">
          <Patchy mood={sound ? 'comfort' : 'idle'} motion={sound ? 'patchy-sway' : ''} className="w-36" />
          {sound && (
            <>
              <span aria-hidden="true" className="note-fly absolute -left-2 top-8 text-xl font-black text-[#B79FD4]">♪</span>
              <span aria-hidden="true" className="note-fly absolute -right-1 top-2 text-xl font-black text-[#B79FD4]" style={{ animationDelay: '1.2s' }}>♫</span>
            </>
          )}
        </div>
        <h2 id="pause-title" className="font-display text-center text-[22px] text-[#4A4A4A]">{t.pause_sound}</h2>
        <p className="text-center text-sm text-[#6B6B6B]">{t.pause_sound_sub}</p>
        <div className="flex flex-wrap justify-center gap-2.5">
          {(['rain', 'waves'] as const).map(kind => (
            <button
              key={kind}
              type="button"
              aria-pressed={sound === kind}
              onClick={() => toggleSound(kind)}
              className={`squish inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-extrabold ${
                sound === kind
                  ? 'bg-[#B79FD4] text-white shadow-[inset_3px_3px_6px_rgba(90,60,130,0.35)]'
                  : 'bg-[#F5F2EB] text-[#4A4A4A] shadow-[4px_4px_9px_rgba(150,140,120,0.28),-4px_-4px_9px_#FFFFFF]'
              }`}
            >
              <Icon name={sound === kind ? 'stop' : kind === 'rain' ? 'speaker' : 'wave'} className="h-4 w-4" />
              {sound === kind ? t.pause_stop : kind === 'rain' ? t.pause_rain : t.pause_waves}
            </button>
          ))}
        </div>
        {backLink}
      </>
    );
  } else if (mode === 'bye') {
    content = (
      <>
        <Patchy mood="comfort" className="w-32 justify-self-center" />
        <h2 id="pause-title" className="font-display text-center text-[22px] text-[#4A4A4A]">{t.pause_bye_title}</h2>
        <p className="text-center text-sm text-[#6B6B6B]">{t.pause_bye_text}</p>
        <button
          type="button"
          onClick={() => { setMode('closed'); onStopForToday(); }}
          className="squish justify-self-center rounded-[1.25rem] bg-gradient-to-b from-[#9CC7AE] to-[#7FAE94] px-8 py-3 font-black text-white shadow-[5px_6px_12px_rgba(111,148,128,0.4),-4px_-4px_10px_#FFFFFF]"
        >
          {t.home_button}
        </button>
        {backLink}
      </>
    );
  }

  return (
    <>
      {mode === 'closed' && (
        <button
          type="button"
          onClick={() => setMode('menu')}
          aria-label={`${t.patchy_name}: ${t.pause_ask}`}
          title={t.pause_fab}
          className="group fixed bottom-4 right-4 z-40 w-16 transition-transform duration-300 hover:-translate-y-1 hover:-rotate-3"
        >
          <span className="pointer-events-none absolute right-[60px] top-2 whitespace-nowrap rounded-full bg-white px-3 py-1 text-xs font-extrabold text-[#6A5283] opacity-0 shadow-[3px_3px_8px_rgba(150,140,120,0.28)] transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
            {t.pause_fab}
          </span>
          <Patchy mood="idle" className="w-16" />
        </button>
      )}

      {mode === 'peek' && (
        <div className="fixed bottom-4 right-4 z-40 flex max-w-[260px] flex-col items-end gap-2" role="status">
          <div className="pop rounded-[1.25rem] bg-white px-4 py-3 text-sm font-bold text-[#6A5283] shadow-[4px_4px_12px_rgba(150,140,120,0.32)]">
            <p>{t.pause_peek}</p>
            <div className="mt-2.5 flex gap-2">
              <button type="button" onClick={() => setMode('menu')} className="squish rounded-full bg-[#B79FD4] px-4 py-1.5 text-xs font-black text-white">
                {t.pause_peek_yes}
              </button>
              <button type="button" onClick={() => setMode('closed')} className="squish rounded-full bg-[#F5F2EB] px-4 py-1.5 text-xs font-black text-[#6B6B6B]">
                {t.pause_fine}
              </button>
            </div>
          </div>
          <span className="peek-up"><Patchy mood="comfort" className="w-20" /></span>
        </div>
      )}

      {sheetOpen && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label={t.pause_close}
            tabIndex={-1}
            onClick={() => setMode('closed')}
            className="absolute inset-0 h-full w-full cursor-default bg-[#4A3F55]/20 backdrop-blur-[2px]"
          />
          <div className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-lg px-3 pb-3">
            <div
              ref={sheetRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="pause-title"
              className="sheet-up grid gap-3.5 rounded-[2.1rem] bg-gradient-to-b from-[#FFFDF9] to-[#F1EAF8] px-5 pb-5 pt-5 shadow-[0_-8px_34px_rgba(122,96,160,0.28),inset_0_0_0_6px_rgba(255,255,255,0.65)]"
            >
              {content}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
