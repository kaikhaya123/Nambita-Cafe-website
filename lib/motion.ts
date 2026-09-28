// Shared animation timings (framer-motion), so pages animate consistently.

export const pageEase = [0.22, 1, 0.36, 1] as const
export const hoverEase = [0.4, 0, 0.2, 1] as const

export const motionSettings = {
  slow: { duration: 1, ease: pageEase },
  medium: { duration: 0.95, ease: pageEase },
  quick: { duration: 0.8, ease: pageEase },
  hover: { duration: 0.35, ease: hoverEase },
}
