/* ========================================
   SOUND SYSTEM  |  Web Audio API Procedural Synthesizer
   Zero external audio assets (<1KB code)
   ======================================== */

let audioCtx = null;
let soundEnabled = localStorage.getItem('kurt_portfolio_sound') === 'true';

function getAudioContext() {
  if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playUiSound(type = 'click') {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(850, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.035);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
      osc.start(now);
      osc.stop(now + 0.035);
    } else if (type === 'success') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.setValueAtTime(659.25, now + 0.05);
      osc.frequency.setValueAtTime(783.99, now + 0.10);
      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.start(now);
      osc.stop(now + 0.18);
    } else if (type === 'warning') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.setValueAtTime(200, now + 0.06);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (type === 'tab') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(750, now + 0.025);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);
      osc.start(now);
      osc.stop(now + 0.025);
    }
  } catch (err) {
    // Silent fail if audio blocked by browser policy
  }
}

export function toggleSound() {
  soundEnabled = !soundEnabled;
  localStorage.setItem('kurt_portfolio_sound', String(soundEnabled));
  updateSoundBtnUi();
  if (soundEnabled) {
    playUiSound('success');
    if (typeof window.spawnToast === 'function') {
      window.spawnToast('AUDIO ENABLED', 'Tactile UI micro-sounds active');
    }
  } else {
    if (typeof window.spawnToast === 'function') {
      window.spawnToast('AUDIO MUTED', 'UI sounds turned off');
    }
  }
}

function updateSoundBtnUi() {
  const btn = document.getElementById('soundToggleBtn');
  if (!btn) return;
  btn.setAttribute('aria-label', soundEnabled ? 'Mute UI sounds' : 'Enable UI sounds');
  btn.setAttribute('title', soundEnabled ? 'Sound: ON (Click to mute)' : 'Sound: OFF (Click to unmute)');
  btn.classList.toggle('sound-active', soundEnabled);
  
  const iconOn = btn.querySelector('.sound-icon-on');
  const iconOff = btn.querySelector('.sound-icon-off');
  if (iconOn && iconOff) {
    iconOn.style.display = soundEnabled ? 'block' : 'none';
    iconOff.style.display = soundEnabled ? 'none' : 'block';
  }
}

export function initSoundSystem() {
  window.toggleSound = toggleSound;
  window.playUiSound = playUiSound;
  updateSoundBtnUi();
}
