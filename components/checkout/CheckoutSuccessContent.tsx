'use client'

// Success page content: clears the cart and shows the order number and progress.

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import OrderProgress from '@/components/checkout/OrderProgress'
import { useCart } from '@/lib/cart'

export default function CheckoutSuccessContent() {
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
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-yellow text-3xl">✓</div>
      <h1 className="font-teko text-3xl uppercase tracking-[0.03em] text-black-900 sm:text-4xl">Payment Successful</h1>
      {orderNumber && (
        <p className="font-dm-sans text-sm text-black-900/70">
          Order <span className="font-bold text-black-900">{orderNumber}</span> is on its way to being prepared.
        </p>
      )}
      {orderNumber && <OrderProgress orderNumber={orderNumber} />}
      <p className="max-w-sm text-sm text-black-900/70">
        Check your email for your receipt &mdash; we&apos;ll let you know when it&apos;s ready for collection.
      </p>
      <Link
        href="/menu"
        className="btn mt-4 bg-black-900 text-white"
      >
        Back to Menu
      </Link>
    </motion.div>
  )
}
