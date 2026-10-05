'use client'

// Checkout step 2: summary of details and items, and the "Confirm & Pay" button.

import Image from 'next/image'
import { motion } from 'framer-motion'
import StepHeader from '@/components/checkout/StepHeader'
import type { CustomerDetails } from '@/components/checkout/types'
import type { CafeLocation } from '@/lib/cafe-locations'
import { lineTotal, type OrderLine } from '@/lib/menu-data'

// Pen-on-a-square "edit" icon. It uses currentColor, so it takes the same colour as the button text.
function EditIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
      aria-hidden="true"
    >
      <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z" />
    </svg>
  )
}

export default function ReviewStep({
  details,
  selectedLocation,
  cart,
  subtotal,
  total,
  paymentError,
  onEditDetails,
  onConfirmPayment,
}: Readonly<{
  details: CustomerDetails
  selectedLocation: CafeLocation | null
  cart: OrderLine[]
  subtotal: number
  total: number
  paymentError: string | null
  onEditDetails: () => void
  onConfirmPayment: () => void
}>) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <StepHeader step="review" title="Review Your Order" />

      <div className="mt-6 rounded-2xl border border-black/10 bg-white p-5">
        <p className="font-teko text-lg uppercase tracking-[0.05em] text-black-900">Pickup From</p>
        <p className="mt-1 font-dm-sans text-sm text-black-900">
          {details.firstName} {details.lastName} &middot; {details.phone}
        </p>
        {selectedLocation && (
          <p className="mt-1 font-dm-sans text-sm text-black-900/70">
            {selectedLocation.name} &mdash; {selectedLocation.addressLine1}, {selectedLocation.addressLine2}
          </p>
        )}
        {details.notes && <p className="mt-1 font-dm-sans text-xs text-black-900/70">Notes: {details.notes}</p>}
        <button
          type="button"
          onClick={onEditDetails}
          className="mt-3 inline-flex items-center gap-1.5 font-dm-sans text-xs uppercase tracking-[0.1em] text-black-900/70 underline transition-colors hover:text-black-900"
        >
          <EditIcon />
          Edit details
        </button>
      </div>

      <div className="mt-4 rounded-2xl border border-black/10 bg-white p-5">
        <p className="font-teko text-lg uppercase tracking-[0.05em] text-black-900">Order Summary</p>
        <div className="mt-3 flex flex-col divide-y divide-black/10">
          {cart.map((line) => (
            <div key={line.key} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-black/10 bg-white">
                <Image src={line.item.image} alt={line.item.name} fill sizes="56px" className="object-contain p-1" />
              </div>
              <div className="min-w-0 flex-1">
                {/* One row: "1 × ITEM NAME" on the left, the price on the right, sharing the same line. */}
                <div className="flex items-baseline justify-between gap-3">
                  <p className="font-dm-sans text-sm font-bold uppercase tracking-[0.04em] text-black-900">
                    {line.quantity} × {line.item.name}
                  </p>
                  <span className="shrink-0 whitespace-nowrap font-dm-sans text-sm font-bold text-black-900">
                    R{lineTotal(line).toFixed(2)}
                  </span>
                </div>
                {line.addOns.length > 0 && (
                  <p className="mt-1 text-xs text-black-900/70">
                    + {line.addOns.map((addOn) => addOn.name).join(', ')}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-col gap-1.5 border-t border-black/10 pt-4">
          <div className="flex items-center justify-between font-dm-sans text-sm text-black-900/70">
            <span>Subtotal</span>
            <span>R{subtotal.toFixed(2)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-black/10 pt-2">
            <span className="font-teko text-xl uppercase tracking-[0.05em] text-black-900">Total</span>
            <span className="font-teko text-2xl font-black text-black-900">R{total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {paymentError && (
        <p className="mt-4 text-center text-sm text-red-900">{paymentError}</p>
      )}

      <button
        type="button"
        onClick={onConfirmPayment}
        className="btn mt-6 w-full bg-black-900 text-white"
      >
        Confirm &amp; Pay R{total.toFixed(2)}
      </button>
      <p className="mt-2 text-center text-xs text-black-900/70">
        You&apos;ll be securely redirected to Yoco to complete your payment.
      </p>
      {/* Opens in a new tab so the customer doesn't lose the checkout page. */}
      <p className="mt-1 text-center text-xs text-black-900/70">
        By paying you agree to our{' '}
        <a href="/terms" target="_blank" rel="noopener" className="underline underline-offset-2">
          Terms &amp; Refund Policy
        </a>
        .
      </p>
    </motion.div>
  )
}
