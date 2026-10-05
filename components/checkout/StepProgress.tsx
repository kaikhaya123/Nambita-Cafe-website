// Checkout: the 1-2-3 progress dots at the top (Details, Review, Payment).

import type { Step } from '@/components/checkout/types'

const stepMeta = [
  { key: 'details', label: 'Personal Details' },
  { key: 'review', label: 'Review' },
  { key: 'processing', label: 'Payment' },
] as const

const stepOrder = stepMeta.map((s) => s.key)

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function StepProgress({ currentStep }: Readonly<{ currentStep: Step }>) {
  const currentIndex = stepOrder.indexOf(currentStep)

  return (
    // Three equal columns, each with its circle in the middle. The line for each step starts at the
    // centre of its circle and is exactly one column wide, so it ends at the centre of the next circle.
    // It sits behind the circles, so the circles cover its ends and the steps look joined up.
    <div className="mx-auto grid w-full max-w-sm grid-cols-3">
      {stepMeta.map((s, index) => {
        const isComplete = currentIndex > index
        const isCurrent = currentStep === s.key

        // Steps still to come: white circle, dark number, thin outline.
        let circleClass = 'bg-white text-black-900 ring-1 ring-black-900/30'
        if (isComplete) {
          circleClass = 'bg-black-900 text-white'
        } else if (isCurrent) {
          circleClass = 'bg-brand-yellow text-black-900 ring-2 ring-black-900 ring-offset-2 ring-offset-brand-offwhite'
        }

        return (
          <div key={s.key} className="relative flex flex-col items-center gap-2">
            {index < stepMeta.length - 1 && (
              // top-[17px] puts this 2px line through the middle of the 36px (h-9) circle.
              <div className="absolute left-1/2 top-[17px] h-[2px] w-full bg-black/10">
                <div
                  className={`h-full bg-black-900 transition-all duration-300 ${isComplete ? 'w-full' : 'w-0'}`}
                />
              </div>
            )}
            <div
              className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-full font-dm-sans text-xs font-bold transition-colors ${circleClass}`}
            >
              {isComplete ? <CheckIcon /> : index + 1}
            </div>
            <span
              className={`text-center font-dm-sans text-[0.65rem] uppercase tracking-[0.06em] ${
                isCurrent ? 'font-bold text-black-900' : 'text-black-900/70'
              }`}
            >
              {s.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
