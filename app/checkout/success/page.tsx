// Payment success page (URL: /checkout/success?order=NC-...). Yoco sends customers here after paying.

import { Suspense } from 'react'
import Footer from '@/components/layout/Footer'
import CheckoutSuccessContent from '@/components/checkout/CheckoutSuccessContent'

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-brand-offwhite text-black-900 [&_h1]:font-teko">
      <section className="border-b border-black bg-brand-offwhite py-14 sm:py-16">
        <div className="mx-auto w-full max-w-3xl px-4 sm:px-5">
          <Suspense fallback={null}>
            <CheckoutSuccessContent />
          </Suspense>
        </div>
      </section>
      <Footer />
    </div>
  )
}
