'use client'

import Image from 'next/image'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect } from 'react'
import { cartSubtotal, useCart } from '@/lib/cart'
import { closeCartDrawer, useCartDrawerOpen } from '@/lib/cart-drawer'
import { lineTotal } from '@/lib/menu-data'

// Trash-can "delete" icon. It uses currentColor, so it takes the same colour as the button text.
function TrashIcon() {
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
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  )
}

// The slide-in "Your Order" panel. Opened from the navbar cart icon or after adding an item.
export default function CartDrawer() {
  const { cart, removeFromCart, clearCart } = useCart()
  const isOpen = useCartDrawerOpen()

  // While the cart is open it covers the whole screen, so stop the page behind it from scrolling.
  useEffect(() => {
    if (!isOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [isOpen])

  const subtotal = cartSubtotal(cart)
  const orderTotal = subtotal

  return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-[120] flex justify-end bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCartDrawer}
          >
            {/* Full screen on every device, so the cart covers the whole page while it's open. */}
            <motion.div
              className="flex h-full w-full flex-col bg-white"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              onClick={(event) => event.stopPropagation()}
            >
              {/* Header: just the logo, centred across the full panel width.
                  The close button is pinned to the top-right corner (absolute) so it doesn't push the logo off-centre. */}
              <div className="relative flex flex-col items-center px-5 pb-4 pt-5 text-center">
                <Image
                  src="/logo/NAMBITA Logo/NambitaL2.png"
                  alt="Nambita Cafe"
                  width={140}
                  height={71}
                  sizes="140px"
                  className="h-14 w-auto object-contain sm:h-16"
                />
                {/* Hidden on screen (`sr-only`), but screen readers still announce this panel as "Your Order". */}
                <h3 className="sr-only">Your Order</h3>
                <button
                  type="button"
                  aria-label="Close"
                  onClick={closeCartDrawer}
                  className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center text-black-900 transition-opacity duration-200 hover:opacity-60"
                >
                  {/* A drawn X (instead of the × character) so the lines can be made thick and bold. */}
                  <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" aria-hidden="true">
                    <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-2 p-5 text-center">
                  <p className="font-teko text-xl uppercase tracking-[0.05em] text-black-900">Your cart is empty</p>
                  <p className="text-sm text-black-900/70">Add something tasty from the menu.</p>
                </div>
              ) : (
                <>
                  <div className="flex-1 overflow-y-auto overscroll-contain p-5">
                    {/* Centred column so lines don't stretch across a wide desktop screen. */}
                    <div className="mx-auto flex w-full max-w-2xl flex-col divide-y divide-black/10">
                    {cart.map((line) => (
                      <div key={line.key} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-black/10 bg-white sm:h-32 sm:w-32">
                          <Image src={line.item.image} alt={line.item.name} fill sizes="128px" className="object-contain p-2" />
                        </div>
                        <div className="min-w-0 flex-1">
                          {/* One row: "1 × ITEM NAME" on the left, the price on the right, sharing the same line. */}
                          <div className="flex items-baseline justify-between gap-3">
                            <p className="font-dm-sans text-base font-extrabold uppercase leading-snug tracking-[0.03em] text-black-900 sm:text-lg">
                              {line.quantity} × {line.item.name}
                            </p>
                            <span className="shrink-0 whitespace-nowrap font-dm-sans text-base font-extrabold text-black-900 sm:text-lg">
                              R{lineTotal(line).toFixed(2)}
                            </span>
                          </div>
                          {line.addOns.length > 0 && (
                            <p className="mt-1 text-xs text-black-900/70">
                              + {line.addOns.map((addOn) => addOn.name).join(', ')}
                            </p>
                          )}
                          <button
                            type="button"
                            aria-label={`Remove ${line.item.name}`}
                            onClick={() => removeFromCart(line.key)}
                            className="mt-1 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.08em] text-black-900 underline transition-opacity duration-200 hover:opacity-60"
                          >
                            <TrashIcon />
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                    </div>
                  </div>

                  <div className="border-t border-black/10 p-5">
                    <div className="mx-auto w-full max-w-2xl">
                    {/* Subtotal and Total share one layout: label on the left, amount on the right, same font as
                        the item lines. Total is one step bigger and bolder so it stands out. `tabular-nums`
                        gives every digit the same width, so the two amounts line up under each other. */}
                    <div className="flex items-baseline justify-between font-dm-sans text-base uppercase tracking-[0.03em] text-black-900/70">
                      <span>Subtotal</span>
                      <span className="tabular-nums">R{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="mt-3 flex items-baseline justify-between border-t border-black/10 pt-3 font-dm-sans text-lg font-extrabold uppercase tracking-[0.03em] text-black-900 sm:text-xl">
                      <span>Total</span>
                      <span className="tabular-nums">R{orderTotal.toFixed(2)}</span>
                    </div>
                    <Link
                      href="/checkout"
                      onClick={closeCartDrawer}
                      className="btn mt-4 flex w-full bg-black-900 text-white"
                    >
                      Checkout
                    </Link>
                    <button
                      type="button"
                      onClick={clearCart}
                      className="btn mt-3 w-full border border-black/20 text-black-900"
                    >
                      Clear Order
                    </button>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
  )
}
