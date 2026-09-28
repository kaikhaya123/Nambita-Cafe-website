'use client'

// Checkout step 3: spinner shown while we send the customer to Yoco.

import { motion } from 'framer-motion'
import StepHeader from '@/components/checkout/StepHeader'

export default function ProcessingStep() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center gap-5 py-20 text-center"
    >
      <StepHeader step="processing" title="Redirecting to Payment" />
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-black/10 border-t-black-900" />
      <p className="max-w-xs text-sm text-black-900/70">Please don&apos;t close this page.</p>
    </motion.div>
  )
}
