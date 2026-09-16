'use client'

import { Suspense, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Footer from '@/components/layout/Footer'
import { useCart, cartSubtotal, lineTotal, DELIVERY_FEE } from '@/lib/cart'

type Step = 'details' | 'review' | 'processing'

interface CustomerDetails {
  firstName: string
  lastName: string
  phone: string
  email: string
  address: string
  notes: string
}

const emptyDetails: CustomerDetails = {
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  address: '',
  notes: '',
}

const stepIconSrc: Record<'details' | 'review' | 'processing', string> = {
  details: '/Icons/profile.png',
  review: '/Icons/fast-shipping.png',
  processing: '/Icons/wallet.png',
}

const stepMeta = [
  { key: 'details', label: 'Personal Details' },
  { key: 'review', label: 'Delivery' },
  { key: 'processing', label: 'Payment' },
] as const

const stepOrder = stepMeta.map((s) => s.key)

function stepCircleClass(stepKey: (typeof stepMeta)[number]['key'], index: number, currentStep: Step) {
  if (currentStep === stepKey) return 'bg-black-900 text-white'
  if (stepOrder.indexOf(currentStep) > index) return 'bg-black-900/40 text-white'
  return 'bg-black/10 text-black-900/50'
}

function StepIcon({ step }: Readonly<{ step: 'details' | 'review' | 'processing' }>) {
  return (
    <div className="mx-auto mt-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#FFFF00]">
      <Image src={stepIconSrc[step]} alt="" width={24} height={24} className="h-6 w-6 object-contain" />
    </div>
  )
}

function CancelledOrFailedBanner() {
  const searchParams = useSearchParams()
  const payment = searchParams.get('payment')

  if (payment !== 'cancelled' && payment !== 'failed') return null

  return (
    <div className="mb-6 rounded-xl border border-red-900/20 bg-red-50 px-4 py-3 text-center">
      <p className="font-dm-sans text-sm text-red-900">
        {payment === 'cancelled' ? 'Payment was cancelled. Your order is still saved below.' : 'Payment failed. Please try again.'}
      </p>
    </div>
  )
}

export default function CheckoutPage() {
  const { cart, isHydrated } = useCart()
  const [step, setStep] = useState<Step>('details')
  const [details, setDetails] = useState<CustomerDetails>(emptyDetails)
  const [paymentError, setPaymentError] = useState<string | null>(null)

  const subtotal = cartSubtotal(cart)
  const total = subtotal + DELIVERY_FEE

  const isDetailsValid = useMemo(
    () =>
      details.firstName.trim().length > 0 &&
      details.lastName.trim().length > 0 &&
      details.phone.trim().length > 0 &&
      details.address.trim().length > 0,
    [details]
  )

  const updateField = (field: keyof CustomerDetails) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setDetails((current) => ({ ...current, [field]: event.target.value }))
  }

  const handleConfirmPayment = async () => {
    setPaymentError(null)
    setStep('processing')

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: total,
          subtotal,
          deliveryFee: DELIVERY_FEE,
          items: cart,
          customer: details,
        }),
      })

      const data = (await response.json()) as { redirectUrl?: string; error?: string }

      if (!response.ok || !data.redirectUrl) {
        throw new Error(data.error ?? 'Could not start payment right now.')
      }

      window.location.assign(data.redirectUrl)
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : 'Could not start payment right now.')
      setStep('review')
    }
  }

  if (isHydrated && cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAF8F3] text-black-900 [&_h1]:font-teko [&_h2]:font-teko">
        <section className="flex flex-col items-center justify-center gap-4 border-b border-black px-4 py-24 text-center">
          <h1 className="font-teko text-3xl uppercase tracking-[0.03em] text-black-900">Your order is empty</h1>
          <p className="max-w-sm text-sm text-black-900/70">Add something from the menu before heading to checkout.</p>
          <Link
            href="/menu"
            className="mt-2 inline-flex items-center rounded-full bg-black-900 px-6 py-3 font-dm-sans text-xs uppercase tracking-[0.12em] text-white"
          >
            Back to Menu
          </Link>
        </section>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAF8F3] text-black-900 [&_h1]:font-teko [&_h2]:font-teko [&_h3]:font-teko">
      <section className="border-b border-black bg-[#FAF8F3] py-14 sm:py-16">
        <div className="mx-auto w-full max-w-3xl px-4 sm:px-5">
          <Suspense fallback={null}>
            <CancelledOrFailedBanner />
          </Suspense>

          <div className="mb-8 flex justify-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-5 py-3 shadow-sm">
                {stepMeta.map((s, index) => (
                  <div key={s.key} className="flex items-center gap-2">
                    <div className="flex flex-col items-center gap-1.5">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full font-dm-sans text-xs font-bold ${stepCircleClass(s.key, index, step)}`}
                      >
                        {index + 1}
                      </div>
                      <span
                        className={`whitespace-nowrap font-dm-sans text-[0.65rem] uppercase tracking-[0.06em] ${
                          step === s.key ? 'text-black-900' : 'text-black-900/40'
                        }`}
                      >
                        {s.label}
                      </span>
                    </div>
                    {index < 2 && <div className="mb-5 h-px w-8 bg-black/15 sm:w-14" />}
                  </div>
                ))}
              </div>
          </div>

          {step === 'details' && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
              <h1 className="text-center font-teko text-3xl uppercase tracking-[0.03em] text-black-900 sm:text-4xl">
                Your Details
              </h1>
              <StepIcon step="details" />
              <p className="mt-2 text-center text-sm text-black-900/60">
                Tell us where to send your order.
              </p>

              <form
                className="mt-8 flex flex-col gap-4"
                onSubmit={(event) => {
                  event.preventDefault()
                  if (isDetailsValid) setStep('review')
                }}
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="flex flex-col gap-1.5">
                    <span className="font-dm-sans text-xs uppercase tracking-[0.1em] text-black-900/70">Name</span>
                    <input
                      required
                      value={details.firstName}
                      onChange={updateField('firstName')}
                      className="rounded-xl border border-black/15 bg-white px-4 py-3 font-dm-sans text-sm text-black-900 outline-none focus:border-black-900"
                      placeholder="Sbonakaliso"
                    />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="font-dm-sans text-xs uppercase tracking-[0.1em] text-black-900/70">Surname</span>
                    <input
                      required
                      value={details.lastName}
                      onChange={updateField('lastName')}
                      className="rounded-xl border border-black/15 bg-white px-4 py-3 font-dm-sans text-sm text-black-900 outline-none focus:border-black-900"
                      placeholder="Ngcobo"
                    />
                  </label>
                </div>

                <label className="flex flex-col gap-1.5">
                  <span className="font-dm-sans text-xs uppercase tracking-[0.1em] text-black-900/70">Contact Number</span>
                  <input
                    required
                    type="tel"
                    value={details.phone}
                    onChange={updateField('phone')}
                    className="rounded-xl border border-black/15 bg-white px-4 py-3 font-dm-sans text-sm text-black-900 outline-none focus:border-black-900"
                    placeholder="071 234 5678"
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="font-dm-sans text-xs uppercase tracking-[0.1em] text-black-900/70">Email (optional)</span>
                  <input
                    type="email"
                    value={details.email}
                    onChange={updateField('email')}
                    className="rounded-xl border border-black/15 bg-white px-4 py-3 font-dm-sans text-sm text-black-900 outline-none focus:border-black-900"
                    placeholder="you@example.com"
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="font-dm-sans text-xs uppercase tracking-[0.1em] text-black-900/70">Delivery Address / Location</span>
                  <textarea
                    required
                    rows={3}
                    value={details.address}
                    onChange={updateField('address')}
                    className="rounded-xl border border-black/15 bg-white px-4 py-3 font-dm-sans text-sm text-black-900 outline-none focus:border-black-900"
                    placeholder="Street, area, and any landmark that helps our driver find you"
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="font-dm-sans text-xs uppercase tracking-[0.1em] text-black-900/70">Notes (optional)</span>
                  <input
                    value={details.notes}
                    onChange={updateField('notes')}
                    className="rounded-xl border border-black/15 bg-white px-4 py-3 font-dm-sans text-sm text-black-900 outline-none focus:border-black-900"
                    placeholder="Gate code, allergies, etc."
                  />
                </label>

                <button
                  type="submit"
                  disabled={!isDetailsValid}
                  className="mt-4 w-full rounded-full bg-black-900 py-4 font-dm-sans text-sm uppercase tracking-[0.12em] text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Continue to Review
                </button>
              </form>
            </motion.div>
          )}

          {step === 'review' && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
              <h1 className="text-center font-teko text-3xl uppercase tracking-[0.03em] text-black-900 sm:text-4xl">
                Review Your Order
              </h1>
              <StepIcon step="review" />

              <div className="mt-6 rounded-2xl border border-black/10 bg-white p-5">
                <p className="font-teko text-lg uppercase tracking-[0.05em] text-black-900">Delivering To</p>
                <p className="mt-1 font-dm-sans text-sm text-black-900">
                  {details.firstName} {details.lastName} &middot; {details.phone}
                </p>
                <p className="mt-1 font-dm-sans text-sm text-black-900/70">{details.address}</p>
                {details.notes && <p className="mt-1 font-dm-sans text-xs text-black-900/50">Notes: {details.notes}</p>}
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="mt-3 font-dm-sans text-xs uppercase tracking-[0.1em] text-black-900/60 underline"
                >
                  Edit details
                </button>
              </div>

              <div className="mt-4 rounded-2xl border border-black/10 bg-white p-5">
                <p className="font-teko text-lg uppercase tracking-[0.05em] text-black-900">Order Summary</p>
                <div className="mt-3 flex flex-col divide-y divide-black/10">
                  {cart.map((line) => (
                    <div key={line.key} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
                      <div>
                        <p className="font-dm-sans text-sm font-bold uppercase tracking-[0.04em] text-black-900">
                          {line.quantity} × {line.item.name}
                        </p>
                        {line.addOns.length > 0 && (
                          <p className="mt-1 text-xs text-black-900/60">
                            + {line.addOns.map((addOn) => addOn.name).join(', ')}
                          </p>
                        )}
                      </div>
                      <span className="whitespace-nowrap font-dm-sans text-sm font-bold text-black-900">
                        R{lineTotal(line).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex flex-col gap-1.5 border-t border-black/10 pt-4">
                  <div className="flex items-center justify-between font-dm-sans text-sm text-black-900/70">
                    <span>Subtotal</span>
                    <span>R{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between font-dm-sans text-sm text-black-900/70">
                    <span>Delivery Fee</span>
                    <span>R{DELIVERY_FEE.toFixed(2)}</span>
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
                onClick={handleConfirmPayment}
                className="mt-6 w-full rounded-full bg-black-900 py-4 font-dm-sans text-sm uppercase tracking-[0.12em] text-white"
              >
                Confirm &amp; Pay R{total.toFixed(2)}
              </button>
              <p className="mt-2 text-center text-xs text-black-900/50">
                You&apos;ll be securely redirected to Yoco to complete your payment.
              </p>
            </motion.div>
          )}

          {step === 'processing' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center gap-5 py-20 text-center"
            >
              <StepIcon step="processing" />
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-black/10 border-t-black-900" />
              <h1 className="font-teko text-2xl uppercase tracking-[0.03em] text-black-900">Redirecting to secure payment&hellip;</h1>
              <p className="max-w-xs text-sm text-black-900/60">Please don&apos;t close this page.</p>
            </motion.div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}
