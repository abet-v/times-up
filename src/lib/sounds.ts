// Web Audio API sound utilities for score animations

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
}

/**
 * Play a "ting" sound with ascending pitch
 * @param index - The index in the sequence (0, 1, 2, ...) - higher = higher pitch
 * @param total - Total number of sounds in the sequence
 */
export function playScoreTing(index: number, total: number): void {
  try {
    const ctx = getAudioContext();

    // Resume context if suspended (required by browsers)
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;

    // Base frequency increases with index
    // Start around C5 (523Hz) and go up
    const baseFreq = 523;
    const maxFreq = 1047; // C6
    const freq = baseFreq + (maxFreq - baseFreq) * (index / Math.max(total - 1, 1));

    // Create oscillator for the main tone
    const oscillator = ctx.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(freq, now);

    // Create a second oscillator for richness (slightly detuned)
    const oscillator2 = ctx.createOscillator();
    oscillator2.type = 'triangle';
    oscillator2.frequency.setValueAtTime(freq * 2, now); // Octave higher

    // Create gain nodes for envelope
    const gainNode = ctx.createGain();
    const gainNode2 = ctx.createGain();

    // Quick attack, short decay for a "ting" sound
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    gainNode2.gain.setValueAtTime(0, now);
    gainNode2.gain.linearRampToValueAtTime(0.1, now + 0.01);
    gainNode2.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    // Connect nodes
    oscillator.connect(gainNode);
    oscillator2.connect(gainNode2);
    gainNode.connect(ctx.destination);
    gainNode2.connect(ctx.destination);

    // Start and stop
    oscillator.start(now);
    oscillator2.start(now);
    oscillator.stop(now + 0.2);
    oscillator2.stop(now + 0.15);
  } catch (e) {
    // Silently fail if audio is not supported
    console.warn('Audio not supported:', e);
  }
}

/**
 * Play a final celebratory sound (for when all points are added)
 */
export function playScoreComplete(): void {
  try {
    const ctx = getAudioContext();

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;

    // Play a quick ascending arpeggio
    const frequencies = [523, 659, 784, 1047]; // C5, E5, G5, C6

    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      const gain = ctx.createGain();
      const startTime = now + i * 0.05;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.25, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.35);
    });
  } catch (e) {
    console.warn('Audio not supported:', e);
  }
}
