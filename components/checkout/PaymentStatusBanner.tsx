'use client'

import { useSearchParams } from 'next/navigation'

// Shown when Yoco redirects back after a cancelled or failed payment.
export default function PaymentStatusBanner() {
  const searchParams = useSearchParams()
  const payment = searchParams.get('payment')

  if (payment !== 'cancelled' && payment !== 'failed') return null

  return (
    <div className="mb-6 rounded-xl border border-red-900 bg-red-50 px-4 py-3 text-center">
      <p className="font-dm-sans text-sm text-red-900">
        {payment === 'cancelled' ? 'Payment was cancelled. Your order is still saved below.' : 'Payment failed. Please try again.'}
      </p>
    </div>
  )
}
