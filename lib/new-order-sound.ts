'use client'

// Plays a short "ding-ding" on the kitchen board when a new order arrives.
// The sound is made by the browser itself (Web Audio), so there's no sound file to download.
// Browsers only allow sound after someone has tapped the page, so the board calls unlockSound()
// on the first tap and shows a "Turn on sound" button until then.

let audioContext: AudioContext | null = null

function getAudioContext() {
  audioContext ??= new AudioContext()
  return audioContext
}

/** True once the browser allows this page to play sound. */
export function isSoundOn() {
  return audioContext?.state === 'running'
}

/** Call from a tap or click. Returns true if sound is now allowed. */
export async function unlockSound() {
  try {
    await getAudioContext().resume()
    return isSoundOn()
  } catch {
    return false
  }
}

/** Two rising beeps. Does nothing if sound hasn't been allowed yet. */
export function playNewOrderSound() {
  const context = audioContext
  if (!context || context.state !== 'running') return

  const start = context.currentTime
  const beeps = [
    { delay: 0, pitch: 880 },
    { delay: 0.25, pitch: 1175 },
  ]
  for (const { delay, pitch } of beeps) {
    const tone = context.createOscillator()
    const volume = context.createGain()
    tone.frequency.value = pitch
    // Fade in and out quickly so the beep doesn't click.
    volume.gain.setValueAtTime(0.0001, start + delay)
    volume.gain.exponentialRampToValueAtTime(0.5, start + delay + 0.02)
    volume.gain.exponentialRampToValueAtTime(0.0001, start + delay + 0.5)
    tone.connect(volume).connect(context.destination)
    tone.start(start + delay)
    tone.stop(start + delay + 0.55)
  }
}
