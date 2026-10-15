import { describe, expect, it, vi } from 'vitest';
import { createSoundKit, keySoundFor } from '../src/utils/retroSound';

const param = () => ({ value: 0, setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn(), cancelScheduledValues: vi.fn() });
const node = () => ({ gain: param(), frequency: param(), Q: param(), connect: vi.fn(), disconnect: vi.fn(), start: vi.fn(), stop: vi.fn() });
function fakeContext() {
  return {
    currentTime: 0, sampleRate: 8000, destination: {},
    createGain: vi.fn(node), createOscillator: vi.fn(node), createBiquadFilter: vi.fn(node), createBufferSource: vi.fn(node),
    createBuffer: (channels, length) => { const data = new Float32Array(length); return { getChannelData: () => data }; }
  };
}

describe('retro sound kit', () => {
  it('synthesizes every sound without audio files', () => {
    const context = fakeContext();
    const kit = createSoundKit(context);
    for (const kind of kit.kinds) expect(() => kit.play(kind), kind).not.toThrow();
    expect(context.createBufferSource).toHaveBeenCalled();
    expect(context.createOscillator).toHaveBeenCalled();
  });
  it('starts the ambient bed once and stops it', () => {
    const kit = createSoundKit(fakeContext());
    kit.startAmbient(); kit.startAmbient();
    expect(kit.ambientPlaying).toBe(true);
    kit.stopAmbient();
    expect(kit.ambientPlaying).toBe(false);
  });
  it('only makes typing sounds for real key presses', () => {
    expect(keySoundFor({ key: 'a' })).toBe('key');
    expect(keySoundFor({ key: 'Backspace' })).toBe('key');
    expect(keySoundFor({ key: ' ' })).toBe('key-large');
    expect(keySoundFor({ key: 'Enter' })).toBe('key-large');
    expect(keySoundFor({ key: 'Shift' })).toBeNull();
    expect(keySoundFor({ key: 'a', repeat: true })).toBeNull();
    expect(keySoundFor({ key: 'k', ctrlKey: true })).toBeNull();
  });
});
