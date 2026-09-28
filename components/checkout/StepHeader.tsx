// Checkout: round icon + title shown at the top of each step.

import Image from 'next/image'
import type { Step } from '@/components/checkout/types'

const stepIconSrc: Record<Step, string> = {
  details: '/Icons/profile.png',
  review: '/Icons/fast-shipping.png',
  processing: '/Icons/wallet.png',
}

export default function StepHeader({
  step,
  title,
  subtitle,
}: Readonly<{ step: Step; title: string; subtitle?: string }>) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-yellow shadow-sm">
        <Image src={stepIconSrc[step]} alt="" width={26} height={26} className="h-6 w-6 object-contain" />
      </div>
      <div>
        <h1 className="font-teko text-3xl uppercase tracking-[0.03em] text-black-900 sm:text-4xl">{title}</h1>
        {subtitle && <p className="mx-auto mt-1.5 max-w-xs text-sm text-black-900">{subtitle}</p>}
      </div>
    </div>
  )
}
