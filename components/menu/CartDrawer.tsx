'use client'

import Image from 'next/image'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { lineTotal, useCart } from '@/lib/cart'
import { closeCartDrawer, useCartDrawerOpen } from '@/lib/cart-drawer'

export default function CartDrawer() {
  const { cart, removeFromCart, clearCart } = useCart()
  const isOpen = useCartDrawerOpen()

  const subtotal = cart.reduce((sum, line) => sum + lineTotal(line), 0)
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
            <motion.div
              className="flex h-full w-full max-w-md flex-col bg-white sm:max-w-lg"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-black/10 p-5">
                <h3 className="font-teko text-2xl uppercase tracking-[0.03em] text-black-900">Your Order</h3>
                <button
                  type="button"
                  aria-label="Close"
                  onClick={closeCartDrawer}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-black-900 text-white"
                >
                  &times;
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-2 p-5 text-center">
                  <p className="font-teko text-xl uppercase tracking-[0.05em] text-black-900">Your cart is empty</p>
                  <p className="text-sm text-black-900/70">Add something tasty from the menu.</p>
                </div>
              ) : (
                <>
                  <div className="flex flex-1 flex-col divide-y divide-black/10 overflow-y-auto p-5">
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
                          <div className="flex items-center gap-3">
                            <span className="whitespace-nowrap font-dm-sans text-sm font-bold text-black-900">
                              R{lineTotal(line).toFixed(2)}
                            </span>
                            <button
                              type="button"
                              aria-label={`Remove ${line.item.name}`}
                              onClick={() => removeFromCart(line.key)}
                              className="text-xs uppercase tracking-[0.08em] text-black-900/50 underline"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-black/10 p-5">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between font-dm-sans text-sm text-black-900/70">
                        <span>Subtotal</span>
                        <span>R{subtotal.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-black/10 pt-3">
                      <span className="font-teko text-xl uppercase tracking-[0.05em] text-black-900">Total</span>
                      <span className="font-teko text-2xl font-black text-black-900">R{orderTotal.toFixed(2)}</span>
                    </div>
                    <Link
                      href="/checkout"
                      onClick={closeCartDrawer}
                      className="mt-4 flex w-full items-center justify-center rounded-full bg-black-900 py-3 font-dm-sans text-xs uppercase tracking-[0.12em] text-white"
                    >
                      Checkout
                    </Link>
                    <button
                      type="button"
                      onClick={clearCart}
                      className="mt-3 w-full rounded-full border border-black/20 py-3 font-dm-sans text-xs uppercase tracking-[0.12em] text-black-900"
                    >
                      Clear Order
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
  )
}
