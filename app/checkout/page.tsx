'use client'

import { Suspense, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Footer from '@/components/layout/Footer'
import { useCart, cartSubtotal, lineTotal } from '@/lib/cart'
import { cafeLocations } from '@/lib/cafe-locations'

type Step = 'details' | 'review' | 'processing'

interface CustomerDetails {
  firstName: string
  lastName: string
  phone: string
  email: string
  pickupLocationId: string
  notes: string
}

const emptyDetails: CustomerDetails = {
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  pickupLocationId: '',
  notes: '',
}

const stepIconSrc: Record<'details' | 'review' | 'processing', string> = {
  details: '/Icons/profile.png',
  review: '/Icons/fast-shipping.png',
  processing: '/Icons/wallet.png',
}

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

function StepProgress({ currentStep }: Readonly<{ currentStep: Step }>) {
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
          circleClass = 'bg-[#FFFF00] text-black-900 ring-2 ring-black-900 ring-offset-2 ring-offset-[#FAF8F3]'
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

function StepHeader({
  step,
  title,
  subtitle,
}: Readonly<{ step: 'details' | 'review' | 'processing'; title: string; subtitle?: string }>) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FFFF00] shadow-sm">
        <Image src={stepIconSrc[step]} alt="" width={26} height={26} className="h-6 w-6 object-contain" />
      </div>
      <div>
        <h1 className="font-teko text-3xl uppercase tracking-[0.03em] text-black-900 sm:text-4xl">{title}</h1>
        {subtitle && <p className="mx-auto mt-1.5 max-w-xs text-sm text-black-900">{subtitle}</p>}
      </div>
    </div>
  )
}

function FieldGroup({ label, children }: Readonly<{ label: string; children: React.ReactNode }>) {
  return (
    <div className="flex flex-col gap-4 border-t border-black/10 pt-6 first:border-t-0 first:pt-0">
      <span className="font-dm-sans text-[0.65rem] font-bold uppercase tracking-[0.15em] text-black-900">
        {label}
      </span>
      {children}
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
  const total = subtotal

  const isDetailsValid = useMemo(
    () =>
      details.firstName.trim().length > 0 &&
      details.lastName.trim().length > 0 &&
      details.phone.trim().length > 0 &&
      details.pickupLocationId.trim().length > 0,
    [details]
  )

  const selectedLocation = useMemo(
    () => cafeLocations.find((location) => location.id === details.pickupLocationId) ?? null,
    [details.pickupLocationId]
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

          <div className="mb-10 flex justify-center">
            <StepProgress currentStep={step} />
          </div>

          {step === 'details' && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
              <StepHeader
                step="details"
                title="Your Details"
                subtitle="Tell us who's collecting and where you'll pick up."
              />

              <form
                className="mt-8 flex flex-col gap-6 rounded-3xl border border-black/10 bg-white p-6 shadow-sm sm:p-8"
                onSubmit={(event) => {
                  event.preventDefault()
                  if (isDetailsValid) setStep('review')
                }}
              >
                <FieldGroup label="Contact Info">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <label className="flex flex-col gap-1.5">
                      <span className="font-dm-sans text-xs uppercase tracking-[0.1em] text-black-900/70">Name</span>
                      <input
                        required
                        value={details.firstName}
                        onChange={updateField('firstName')}
                        className="rounded-xl border border-black/15 bg-white px-4 py-3 font-dm-sans text-sm text-black-900 outline-none focus:border-black-900"
                        placeholder="First name"
                      />
                    </label>
                    <label className="flex flex-col gap-1.5">
                      <span className="font-dm-sans text-xs uppercase tracking-[0.1em] text-black-900/70">Surname</span>
                      <input
                        required
                        value={details.lastName}
                        onChange={updateField('lastName')}
                        className="rounded-xl border border-black/15 bg-white px-4 py-3 font-dm-sans text-sm text-black-900 outline-none focus:border-black-900"
                        placeholder="Last name"
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
                      placeholder="Phone number"
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
                </FieldGroup>

                <FieldGroup label="Pickup Location">
                  <div className="flex flex-col gap-2">
                    {cafeLocations.map((location) => (
                      <label
                        key={location.id}
                        className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition-colors ${
                          details.pickupLocationId === location.id
                            ? 'border-black-900 bg-black-900/5'
                            : 'border-black/15 bg-white'
                        }`}
                      >
                        <input
                          required
                          type="radio"
                          name="pickupLocationId"
                          value={location.id}
                          checked={details.pickupLocationId === location.id}
                          onChange={updateField('pickupLocationId')}
                          className="mt-1 h-4 w-4 accent-black"
                        />
                        <span>
                          <span className="block font-dm-sans text-sm font-bold text-black-900">{location.name}</span>
                          <span className="block font-dm-sans text-xs text-black-900/70">
                            {location.addressLine1}, {location.addressLine2}
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>
                </FieldGroup>

                <FieldGroup label="Notes">
                  <label className="flex flex-col gap-1.5">
                    <span className="font-dm-sans text-xs uppercase tracking-[0.1em] text-black-900/70">Notes (optional)</span>
                    <input
                      value={details.notes}
                      onChange={updateField('notes')}
                      className="rounded-xl border border-black/15 bg-white px-4 py-3 font-dm-sans text-sm text-black-900 outline-none focus:border-black-900"
                      placeholder="Gate code, allergies, etc."
                    />
                  </label>
                </FieldGroup>

                <button
                  type="submit"
                  disabled={!isDetailsValid}
                  className="w-full rounded-full bg-black-900 py-4 font-dm-sans text-sm uppercase tracking-[0.12em] text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Continue to Review
                </button>
              </form>
            </motion.div>
          )}

          {step === 'review' && (
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
                {details.notes && <p className="mt-1 font-dm-sans text-xs text-black-900/50">Notes: {details.notes}</p>}
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="mt-3 font-dm-sans text-xs uppercase tracking-[0.1em] text-black-900/70 underline"
                >
                  Edit details
                </button>
              </div>

              <div className="mt-4 rounded-2xl border border-black/10 bg-white p-5">
                <p className="font-teko text-lg uppercase tracking-[0.05em] text-black-900">Order Summary</p>
                <div className="mt-3 flex flex-col divide-y divide-black/10">
                  {cart.map((line) => (
                    <div key={line.key} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-[#F4EFD8]">
                        <Image src={line.item.image} alt={line.item.name} fill sizes="56px" className="object-cover" />
                      </div>
                      <div className="flex flex-1 items-start justify-between gap-3">
                        <div>
                          <p className="font-dm-sans text-sm font-bold uppercase tracking-[0.04em] text-black-900">
                            {line.quantity} × {line.item.name}
                          </p>
                          {line.addOns.length > 0 && (
                            <p className="mt-1 text-xs text-black-900/70">
                              + {line.addOns.map((addOn) => addOn.name).join(', ')}
                            </p>
                          )}
                        </div>
                        <span className="whitespace-nowrap font-dm-sans text-sm font-bold text-black-900">
                          R{lineTotal(line).toFixed(2)}
                        </span>
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
              <StepHeader step="processing" title="Redirecting to Payment" />
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-black/10 border-t-black-900" />
              <p className="max-w-xs text-sm text-black-900/70">Please don&apos;t close this page.</p>
            </motion.div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}
