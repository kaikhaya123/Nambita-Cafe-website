'use client'

import { Suspense, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import Footer from '@/components/layout/Footer'
import { useCart } from '@/lib/cart'

function CheckoutSuccessContent() {
  const searchParams = useSearchParams()
  const orderNumber = searchParams.get('order')
  const { clearCart } = useCart()

  useEffect(() => {
    clearCart()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center gap-4 py-16 text-center"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FFFF00] text-3xl">✓</div>
      <h1 className="font-teko text-3xl uppercase tracking-[0.03em] text-black-900 sm:text-4xl">Payment Successful</h1>
      {orderNumber && (
        <p className="font-dm-sans text-sm text-black-900/70">
          Order <span className="font-bold text-black-900">{orderNumber}</span> is on its way to being prepared.
        </p>
      )}
      <p className="max-w-sm text-sm text-black-900/70">
        Check your email for your receipt &mdash; we&apos;ll have your order ready for pickup.
      </p>
      <Link
        href="/menu"
        className="mt-4 inline-flex items-center rounded-full bg-black-900 px-6 py-3 font-dm-sans text-xs uppercase tracking-[0.12em] text-white"
      >
        Back to Menu
      </Link>
    </motion.div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F3] text-black-900 [&_h1]:font-teko">
      <section className="border-b border-black bg-[#FAF8F3] py-14 sm:py-16">
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
