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
                <h2 className="font-teko text-2xl uppercase tracking-[0.03em] text-white sm:text-3xl md:text-4xl">
                  {section.title}
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
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
                      <div className="relative aspect-[4/3] w-full bg-[#F4EFD8]">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover"
                        />
                      </div>
                      <div className="p-4 pb-0">
                        <h3 className="font-teko text-[1.04rem] sm:text-[1.12rem] uppercase leading-tight tracking-[0.04em] sm:tracking-[0.05em] text-black-900 md:text-[1.2rem]">
                          {item.name}
                        </h3>
                        <p className="type-subtitle tabular-nums mt-1 text-[1.04rem] sm:text-[1.12rem] font-black leading-tight tracking-tight text-black-900 md:text-[1.2rem]">
                          R{item.price.toFixed(2)}
                        </p>
                        <p className="mt-2 text-[0.92rem] leading-relaxed text-black-900 sm:text-base">
                          {item.description}
                        </p>
                      </div>
                    </button>
                    <div className="p-4 pt-3">
                      <button
                        type="button"
                        onClick={() => handleQuickAdd(item)}
                        className="flex w-full items-center justify-center gap-2 rounded-full bg-black-900 py-2.5 font-dm-sans text-xs font-bold uppercase tracking-[0.1em] text-white transition-opacity duration-200 hover:opacity-85"
                      >
                        <span className="flex h-4 w-4 items-center justify-center rounded-full border border-white text-[0.65rem] leading-none">+</span>
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
