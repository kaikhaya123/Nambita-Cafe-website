// Checkout: shown instead of the form when the cart is empty.

import Link from 'next/link'

export default function EmptyCart() {
  return (
    <section className="flex flex-col items-center justify-center gap-4 border-b border-black px-4 py-24 text-center">
      <h1 className="font-teko text-3xl uppercase tracking-[0.03em] text-black-900">Your order is empty</h1>
      <p className="max-w-sm text-sm text-black-900/70">Add something from the menu before heading to checkout.</p>
      <Link
        href="/menu"
        className="btn mt-2 bg-black-900 text-white"
      >
        Back to Menu
      </Link>
    </section>
  )
}
