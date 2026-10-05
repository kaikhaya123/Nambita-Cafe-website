'use client'

// Success page content. Shows what the server says about the order, not just that Yoco sent the customer here:
// - waiting for Yoco to confirm: "Confirming your payment…"
// - paid: "Payment Successful", the order number and live progress (and the cart is emptied)
// - failed or cancelled: "Payment didn't go through" (the cart is kept so they can try again)
// - unknown order number: "We couldn't find this order"
// The big order number is only shown once the order is really paid, so this page can't be used as fake proof.

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import OrderProgress from '@/components/checkout/OrderProgress'
import { useCart } from '@/lib/cart'
import { ticketNumber } from '@/lib/orders'
import { useOrderStatus } from '@/lib/use-order-status'

// After this long still waiting for Yoco, explain what to do.
const SLOW_CONFIRMATION_MS = 60_000

export default function CheckoutSuccessContent() {
  const searchParams = useSearchParams()
  const orderNumber = searchParams.get('order')
  const status = useOrderStatus(orderNumber)
  const { clearCart } = useCart()
  const [isSlow, setIsSlow] = useState(false)

  const paymentStatus = status && status !== 'not-found' ? status.paymentStatus : null
  const isPaid = paymentStatus === 'paid'

  // Empty the cart only once the payment is confirmed. If it failed, they still have it to try again.
  useEffect(() => {
    if (isPaid) clearCart()
  }, [isPaid, clearCart])

  useEffect(() => {
    const timer = window.setTimeout(() => setIsSlow(true), SLOW_CONFIRMATION_MS)
    return () => window.clearTimeout(timer)
  }, [])

  if (status === 'not-found') {
    return (
      <Message title="We couldn't find this order">
        <p className="max-w-sm text-sm text-black-900/70">Check the link in your email, or order again from the menu.</p>
        <BackToMenu />
      </Message>
    )
  }

  if (paymentStatus === 'failed' || paymentStatus === 'cancelled') {
    return (
      <Message title="Payment didn't go through">
        <p className="max-w-sm text-sm text-black-900/70">You haven&apos;t been charged for this order. Your cart is still saved.</p>
        <Link href="/checkout" className="btn mt-4 bg-black-900 text-white">
          Try Again
        </Link>
      </Message>
    )
  }

  if (!isPaid || status === null) {
    return (
      <Message title="Confirming your payment…">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-black-900/10 border-t-black-900" aria-hidden />
        <p className="max-w-sm text-sm text-black-900/70">This usually takes a few seconds. Please keep this page open.</p>
        {isSlow && (
          <p className="max-w-sm rounded-xl bg-white p-4 text-sm text-black-900">
            We&apos;re still waiting for Yoco to confirm. If money has left your account, please don&apos;t pay again:
            show reference <strong>{orderNumber}</strong> at the counter and we&apos;ll sort it out.
          </p>
        )}
      </Message>
    )
  }

  return (
    <Message title="Payment Successful" icon="✓">
      {/* The short number the kitchen calls out at the counter. */}
      <p className="font-teko text-5xl uppercase leading-none tracking-[0.04em] text-black-900">
        Order No. {ticketNumber(orderNumber!)}
      </p>
      <p className="font-dm-sans text-sm text-black-900/70">It&apos;s on its way to being prepared.</p>
      <OrderProgress status={status} />
      <p className="max-w-sm text-sm text-black-900/70">
        Check your email for your receipt &mdash; we&apos;ll let you know when it&apos;s ready for collection.
      </p>
      <BackToMenu />
    </Message>
  )
}

// The centred layout every state of this page shares: optional round icon, heading, then the content.
function Message({ title, icon, children }: Readonly<{ title: string; icon?: string; children: React.ReactNode }>) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center gap-4 py-16 text-center"
    >
      {icon && <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-yellow text-3xl">{icon}</div>}
      <h1 className="font-teko text-3xl uppercase tracking-[0.03em] text-black-900 sm:text-4xl">{title}</h1>
      {children}
    </motion.div>
  )
}

function BackToMenu() {
  return (
    <Link href="/menu" className="btn mt-4 bg-black-900 text-white">
      Back to Menu
    </Link>
  )
}
