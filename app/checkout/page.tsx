'use client'

// Checkout page (URL: /checkout). Three steps: details -> review -> payment.
// This file holds the state and the "pay" request; each step's UI lives in components/checkout.
// The server (app/api/checkout) works out the real price, so the total shown here is just for display.

import { Suspense, useMemo, useState } from 'react'
import Footer from '@/components/layout/Footer'
import DetailsStep from '@/components/checkout/DetailsStep'
import EmptyCart from '@/components/checkout/EmptyCart'
import PaymentStatusBanner from '@/components/checkout/PaymentStatusBanner'
import ProcessingStep from '@/components/checkout/ProcessingStep'
import ReviewStep from '@/components/checkout/ReviewStep'
import StepProgress from '@/components/checkout/StepProgress'
import { emptyDetails, type CustomerDetails, type Step } from '@/components/checkout/types'
import { useCart, cartSubtotal } from '@/lib/cart'
import { cafeLocations } from '@/lib/cafe-locations'

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
        // The server prices the order itself from item ids and quantities.
        body: JSON.stringify({ items: cart, customer: details }),
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
      <div className="min-h-screen bg-brand-offwhite text-black-900 [&_h1]:font-teko [&_h2]:font-teko">
        <EmptyCart />
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-offwhite text-black-900 [&_h1]:font-teko [&_h2]:font-teko [&_h3]:font-teko">
      <section className="border-b border-black bg-brand-offwhite py-14 sm:py-16">
        <div className="mx-auto w-full max-w-3xl px-4 sm:px-5">
          <Suspense fallback={null}>
            <PaymentStatusBanner />
          </Suspense>

          <div className="mb-10 flex justify-center">
            <StepProgress currentStep={step} />
          </div>

          {step === 'details' && (
            <DetailsStep
              details={details}
              isValid={isDetailsValid}
              onFieldChange={updateField}
              onContinue={() => setStep('review')}
            />
          )}

          {step === 'review' && (
            <ReviewStep
              details={details}
              selectedLocation={selectedLocation}
              cart={cart}
              subtotal={subtotal}
              total={total}
              paymentError={paymentError}
              onEditDetails={() => setStep('details')}
              onConfirmPayment={handleConfirmPayment}
            />
          )}

          {step === 'processing' && <ProcessingStep />}
        </div>
      </section>

      <Footer />
    </div>
  )
}
