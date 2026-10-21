// Retro sound kit: every sound is synthesized with WebAudio (noise bursts, square/triangle tones), so there are no audio files to load or license.
// Levels are deliberately low; the ambient bed sits well under the click and key sounds.

const AMBIENT_LEVEL = 0.05;

function noiseBuffer(context, seconds, brown = false) {
  const length = Math.max(1, Math.floor(context.sampleRate * seconds));
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < data.length; i += 1) {
    const white = Math.random() * 2 - 1;
    // Brown noise (integrated white noise) is the low rumble of a PC fan.
    data[i] = brown ? (last = (last + 0.02 * white) / 1.02) * 3.5 : white;
  }
  return buffer;
}

export function createSoundKit(context) {
  const master = context.createGain();
  master.gain.value = 0.9;
  master.connect(context.destination);
  const white = noiseBuffer(context, 1);
  let ambient = null;

  const envelope = (node, at, peak, attack, decay) => {
    node.gain.setValueAtTime(0.0001, at);
    node.gain.exponentialRampToValueAtTime(peak, at + attack);
    node.gain.exponentialRampToValueAtTime(0.0001, at + attack + decay);
  };

  // A filtered slice of white noise: the basis of clicks, clacks, seeks and the printer rasp.
  const burst = ({ at = context.currentTime, decay = 0.03, freq = 2000, q = 1, peak = 0.2, type = 'bandpass' }) => {
    const source = context.createBufferSource();
    source.buffer = white;
    const filter = context.createBiquadFilter();
    filter.type = type; filter.frequency.value = freq; filter.Q.value = q;
    const gain = context.createGain();
    envelope(gain, at, peak, 0.002, decay);
    source.connect(filter); filter.connect(gain); gain.connect(master);
    source.start(at, Math.random() * 0.5); source.stop(at + decay + 0.02);
    source.onended = () => { source.disconnect(); filter.disconnect(); gain.disconnect(); };
  };

  const tone = ({ at = context.currentTime, freq = 440, decay = 0.1, peak = 0.05, type = 'square', slideTo }) => {
    const oscillator = context.createOscillator();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(freq, at);
    if (slideTo) oscillator.frequency.exponentialRampToValueAtTime(slideTo, at + decay);
    const gain = context.createGain();
    envelope(gain, at, peak, 0.004, decay);
    oscillator.connect(gain); gain.connect(master);
    oscillator.start(at); oscillator.stop(at + decay + 0.02);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
  };

  const sounds = {
    // Ball mouse: a sharp press then a softer release.
    click: at => { burst({ at, freq: 3800, q: 3, peak: 0.16, decay: 0.012 }); burst({ at: at + 0.06, freq: 3000, q: 3, peak: 0.07, decay: 0.01 }); },
    // Mechanical buckling-spring key: bright clack over a low thump, pitch varied so typing doesn't sound looped.
    key: at => { const vary = 0.85 + Math.random() * 0.3; burst({ at, freq: 2600 * vary, q: 1.5, peak: 0.14, decay: 0.025 }); burst({ at, freq: 180 * vary, q: 0.8, peak: 0.12, decay: 0.05, type: 'lowpass' }); },
    // Space and Enter are the big stabilised keys.
    'key-large': at => { burst({ at, freq: 1500, q: 1.2, peak: 0.16, decay: 0.04 }); burst({ at, freq: 140, q: 0.7, peak: 0.18, decay: 0.08, type: 'lowpass' }); },
    // Toggle blip, PC-speaker style.
    startup: at => { tone({ at, freq: 660, decay: 0.06 }); tone({ at: at + 0.07, freq: 990, decay: 0.08 }); },
    // POST beep, then hard-drive seek chatter.
    boot: at => {
      tone({ at, freq: 1000, decay: 0.16, peak: 0.06 });
      for (let i = 0; i < 9; i += 1) burst({ at: at + 0.35 + i * 0.07 + Math.random() * 0.03, freq: 900 + Math.random() * 800, q: 4, peak: 0.12, decay: 0.018 });
    },
    // Dot-matrix printer: rows of needle rasps.
    print: at => { for (let i = 0; i < 24; i += 1) burst({ at: at + i * 0.045, freq: 1400 + (i % 3) * 300, q: 6, peak: 0.1, decay: 0.03 }); },
    // CRT power: relay thunk plus the degauss "boing".
    power: at => { burst({ at, freq: 120, q: 0.7, peak: 0.25, decay: 0.12, type: 'lowpass' }); tone({ at: at + 0.02, freq: 55, decay: 0.45, peak: 0.06, type: 'sawtooth', slideTo: 38 }); },
    // Desk clock tick.
    tick: at => burst({ at, freq: 5000, q: 8, peak: 0.03, decay: 0.008 }),
    // Fighting-game demo on the small CRT: a quick chiptune hit.
    chip: at => { const base = [330, 392, 440, 523][Math.floor(Math.random() * 4)]; tone({ at, freq: base * 2, decay: 0.05, peak: 0.018 }); tone({ at: at + 0.05, freq: base, decay: 0.07, peak: 0.014, type: 'triangle' }); },
    // Arcade "zap" for BugHunter.
    zap: at => tone({ at, freq: 1400, decay: 0.12, peak: 0.04, slideTo: 220 }),
    // A wet low crunch when a bug is squashed.
    squish: at => { burst({ at, freq: 420, q: 1.4, peak: 0.2, decay: 0.09, type: 'lowpass' }); tone({ at, freq: 180, decay: 0.12, peak: 0.04, type: 'triangle', slideTo: 70 }); },
    // Taking a bite (or detonating a Bugsweeper bug): a falling buzz.
    hurt: at => { tone({ at, freq: 240, decay: 0.2, peak: 0.05, type: 'sawtooth', slideTo: 90 }); burst({ at, freq: 300, q: 0.8, peak: 0.12, decay: 0.08, type: 'lowpass' }); },
    // New wave: a rising three-note alarm.
    wave: at => [523, 659, 784].forEach((freq, i) => tone({ at: at + i * 0.09, freq, decay: 0.08, peak: 0.035 })),
    // The window cat: a hiss (high noise) under a bent "mrrow".
    hiss: at => {
      burst({ at, freq: 5200, q: 0.6, peak: 0.16, decay: 0.55, type: 'highpass' });
      tone({ at: at + 0.02, freq: 520, decay: 0.38, peak: 0.035, type: 'triangle', slideTo: 760 });
      tone({ at: at + 0.4, freq: 760, decay: 0.3, peak: 0.03, type: 'triangle', slideTo: 380 });
    }
  };

  return {
    play(kind) {
      (sounds[kind] || sounds.click)(context.currentTime);
    },
    // PC fan (brown noise) plus a faint CRT mains hum, looping until stopped.
    startAmbient() {
      if (ambient) return;
      const bed = context.createGain();
      bed.gain.setValueAtTime(0.0001, context.currentTime);
      bed.gain.exponentialRampToValueAtTime(AMBIENT_LEVEL, context.currentTime + 1.5);
      bed.connect(master);
      const fan = context.createBufferSource();
      fan.buffer = noiseBuffer(context, 4, true); fan.loop = true;
      const fanFilter = context.createBiquadFilter();
      fanFilter.type = 'lowpass'; fanFilter.frequency.value = 420;
      fan.connect(fanFilter); fanFilter.connect(bed);
      const hums = [[60, 0.05], [120, 0.025]].map(([freq, level]) => {
        const oscillator = context.createOscillator();
        oscillator.frequency.value = freq;
        const gain = context.createGain(); gain.gain.value = level;
        oscillator.connect(gain); gain.connect(bed); oscillator.start();
        return oscillator;
      });
      fan.start();
      ambient = { bed, nodes: [fan, ...hums] };
    },
    stopAmbient() {
      if (!ambient) return;
      const { bed, nodes } = ambient;
      ambient = null;
      bed.gain.cancelScheduledValues(context.currentTime);
      bed.gain.setValueAtTime(Math.max(bed.gain.value, 0.0001), context.currentTime);
      bed.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.4);
      nodes.forEach(node => node.stop(context.currentTime + 0.45));
      setTimeout(() => bed.disconnect(), 600);
    },
    get ambientPlaying() { return Boolean(ambient); },
    kinds: Object.keys(sounds)
  };
}

// Which key presses make a typing sound: printable characters and the editing keys, never modifiers or auto-repeat.
export function keySoundFor(event) {
  if (event.repeat || event.ctrlKey || event.metaKey || event.altKey) return null;
  if (event.key === ' ' || event.key === 'Enter') return 'key-large';
  if (event.key.length === 1 || ['Backspace', 'Delete', 'Tab'].includes(event.key)) return 'key';
  return null;
}
