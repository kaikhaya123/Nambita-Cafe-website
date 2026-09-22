'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import Footer from '@/components/layout/Footer'
import ItemOrderModal from '@/components/menu/ItemOrderModal'
import AddedToCartToast from '@/components/menu/AddedToCartToast'
import { menuSections, type MenuItem } from '@/lib/menu-data'
import { useCart } from '@/lib/cart'
import { openCartDrawer } from '@/lib/cart-drawer'

const pageEase = [0.22, 1, 0.36, 1] as const
const TOAST_DURATION_MS = 2500

export default function NambitaCafeMenuPage() {
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [toastItemName, setToastItemName] = useState<string | null>(null)
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { addToCart } = useCart()

  const showAddedToast = (itemName: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
    setToastItemName(itemName)
    toastTimeoutRef.current = setTimeout(() => setToastItemName(null), TOAST_DURATION_MS)
  }

  const handleQuickAdd = (item: MenuItem) => {
    addToCart(item, 1)
    showAddedToast(item.name)
  }

  const handleModalAdd = (item: MenuItem, quantity: number) => {
    addToCart(item, quantity)
    openCartDrawer()
  }

  const handleViewCart = () => {
    setToastItemName(null)
    openCartDrawer()
  }

  return (
    <div className="min-h-screen bg-[#FAF8F3] text-black-900 [&_h1]:font-teko [&_h2]:font-teko [&_h3]:font-teko [&_h4]:font-teko [&_h5]:font-teko [&_h6]:font-teko">

      {/* MENU ITEMS — all categories stacked, per-item stagger */}
      <section className="border-b border-black bg-[#FAF8F3] py-14 sm:py-16 md:py-24">
        <div className="mx-auto w-full px-4 sm:px-5 lg:px-10">
          {menuSections.map((section) => (
            <div
              key={section.title}
              className="mb-16 last:mb-12"
            >
              <div className="-mx-4 mb-8 flex items-center justify-center bg-black-900 px-5 py-5 sm:-mx-5 sm:px-8 lg:-mx-10">
                <h2 className="font-teko text-xl uppercase tracking-[0.02em] text-white sm:text-2xl sm:tracking-[0.025em] md:text-3xl md:tracking-[0.03em]">
                  {section.title}
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:gap-x-8 sm:gap-y-8 lg:grid-cols-3">
                {section.items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    className="overflow-hidden rounded-2xl border border-black/10 bg-white transition-shadow duration-200 hover:shadow-md"
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.5, ease: pageEase, delay: (index % 3) * 0.07 }}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedItem(item)}
                      className="block w-full text-left"
                    >
                      <div className="relative aspect-square w-full bg-white sm:aspect-[4/3]">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover"
                        />
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white to-transparent" />
                      </div>
                      <div className="p-3 pb-1.5 sm:p-3.5 sm:pb-0">
                        <h3 className="font-teko text-[0.88rem] sm:text-[0.98rem] uppercase leading-tight tracking-[0.02em] sm:tracking-[0.03em] text-black-900 md:text-[1.05rem] md:tracking-[0.04em]">
                          {item.name}
                        </h3>
                        <p className="type-subtitle tabular-nums mt-1.5 text-[0.88rem] sm:text-[0.98rem] font-black leading-tight tracking-tight text-black-900 md:text-[1.05rem]">
                          R{item.price.toFixed(2)}
                        </p>
                      </div>
                    </button>
                    <div className="p-3 pt-2.5 sm:p-3.5 sm:pt-2.5">
                      <button
                        type="button"
                        onClick={() => handleQuickAdd(item)}
                        className="flex w-full items-center justify-center gap-1.5 rounded-full bg-[#FFFF00] py-2 font-dm-sans text-[0.68rem] sm:text-xs font-black uppercase tracking-[0.02em] sm:tracking-[0.06em] text-black transition-opacity duration-200 hover:opacity-85"
                      >
                        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-black-900 text-[#FFFF00] sm:h-5 sm:w-5">
                          <svg viewBox="0 0 24 24" fill="none" className="h-2.5 w-2.5 sm:h-3 sm:w-3" aria-hidden="true">
                            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                          </svg>
                        </span>
                        Add to Cart
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {selectedItem && (
        <ItemOrderModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onAdd={handleModalAdd}
        />
      )}

      <AddedToCartToast itemName={toastItemName} onView={handleViewCart} />

      <Footer />
    </div>
  )
}
