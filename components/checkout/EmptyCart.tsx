// Checkout: shown instead of the form when the cart is empty.

import Link from 'next/link'

export default function EmptyCart() {
  return (
    <section className="flex flex-col items-center justify-center gap-4 border-b border-black px-4 py-24 text-center">
      <h1 className="font-teko text-3xl uppercase tracking-[0.03em] text-black-900">Your order is empty</h1>
      <p className="max-w-sm text-sm text-black-900/70">Add something from the menu before heading to checkout.</p>
      <Link
        href="/menu"
        className="mt-2 inline-flex items-center rounded-full bg-black-900 px-6 py-3 font-teko font-bold uppercase tracking-[0.05em] text-lg text-white"
      >
        Back to Menu
      </Link>
    </section>
  )
}
