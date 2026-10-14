import { getAudioContext } from './audioContext';

// Calming background sound, synthesised from noise in the browser so the app
// ships no audio files and needs no licences.
export type AmbientKind = 'rain' | 'waves';

let playing: { stop: () => void } | null = null;

const noiseBuffer = (ctx: AudioContext, kind: AmbientKind): AudioBuffer => {
  const length = ctx.sampleRate * 4;
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < length; i += 1) {
    const white = Math.random() * 2 - 1;
    if (kind === 'waves') {
      // Brown noise: a slow random walk, deep like surf.
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.5;
    } else {
      data[i] = white;
    }
  }
  return buffer;
};

export const playAmbient = (kind: AmbientKind) => {
  stopAmbient();
  const ctx = getAudioContext();
  const source = ctx.createBufferSource();
  source.buffer = noiseBuffer(ctx, kind);
  source.loop = true;

  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();
  const extras: AudioScheduledSourceNode[] = [];

  if (kind === 'rain') {
    filter.type = 'bandpass';
    filter.frequency.value = 2200;
    filter.Q.value = 0.5;
    gain.gain.value = 0.08;
  } else {
    filter.type = 'lowpass';
    filter.frequency.value = 700;
    gain.gain.value = 0.3;
    // A slow swell, roughly one wave every nine seconds.
    const swell = ctx.createOscillator();
    swell.frequency.value = 0.11;
    const depth = ctx.createGain();
    depth.gain.value = 0.22;
    swell.connect(depth);
    depth.connect(gain.gain);
    swell.start();
    extras.push(swell);
  }

  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  source.start();

  playing = {
    stop: () => {
      [source, ...extras].forEach(node => {
        try { node.stop(); } catch { /* already stopped */ }
      });
      gain.disconnect();
    },
  };
};

export const stopAmbient = () => {
  playing?.stop();
  playing = null;
};
