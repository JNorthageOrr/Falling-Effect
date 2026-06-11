import overflowSoundUrl from '../assets/freesound_community-fart-91011.mp3';

let audio;
const playedForInput = new WeakMap();

export function shouldPlayOverflowSound(input, currentLength, maxLength) {
  if (currentLength < maxLength) {
    playedForInput.delete(input);
    return true;
  }

  if (playedForInput.has(input)) {
    return false;
  }

  playedForInput.set(input, true);
  return true;
}

export function playOverflowSound() {
  if (typeof window === 'undefined') return;

  if (!audio) {
    audio = new Audio(overflowSoundUrl);
  }

  audio.currentTime = 0;
  audio.play().catch(() => {});
}
