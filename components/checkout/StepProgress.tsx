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
    <div className="mx-auto flex w-full max-w-sm items-center">
      {stepMeta.map((s, index) => {
        const isComplete = currentIndex > index
        const isCurrent = currentStep === s.key

        let circleClass = 'bg-black text-black-900'
        if (isComplete) {
          circleClass = 'bg-black-900 text-white'
        } else if (isCurrent) {
          circleClass = 'bg-brand-yellow text-black-900 ring-2 ring-black-900 ring-offset-2 ring-offset-brand-offwhite'
        }

        return (
          <div key={s.key} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-2">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full font-dm-sans text-xs font-bold transition-colors ${circleClass}`}
              >
                {isComplete ? <CheckIcon /> : index + 1}
              </div>
              <span
                className={`whitespace-nowrap font-dm-sans text-[0.65rem] uppercase tracking-[0.06em] ${
                  isCurrent ? 'font-bold text-black-900' : 'text-black-900/40'
                }`}
              >
                {s.label}
              </span>
            </div>
            {index < stepMeta.length - 1 && (
              <div className="mx-2 mb-5 h-[2px] flex-1 rounded-full bg-black/10 sm:mx-3">
                <div
                  className={`h-full rounded-full bg-black-900 transition-all duration-300 ${isComplete ? 'w-full' : 'w-0'}`}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
