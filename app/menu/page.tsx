'use client'

// Menu page (URL: /menu). Shows every menu section and handles "add to cart".
// Menu items and prices come from lib/menu-data.ts; the cards live in components/menu.

import { useRef, useState } from 'react'
import Footer from '@/components/layout/Footer'
import ItemOrderModal from '@/components/menu/ItemOrderModal'
import AddedToCartToast from '@/components/menu/AddedToCartToast'
import MenuSection from '@/components/menu/MenuSection'
import { menuSections, type MenuItem } from '@/lib/menu-data'
import { useCart } from '@/lib/cart'
import { openCartDrawer } from '@/lib/cart-drawer'

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
    <div className="min-h-screen bg-brand-offwhite text-black-900 [&_h1]:font-teko [&_h2]:font-teko [&_h3]:font-teko [&_h4]:font-teko [&_h5]:font-teko [&_h6]:font-teko">

      {/* MENU ITEMS — all categories stacked, per-item stagger */}
      <section className="border-b border-black bg-brand-offwhite py-14 sm:py-16 md:py-24">
        <div className="mx-auto w-full px-4 sm:px-5 lg:px-10">
          {menuSections.map((section) => (
            <MenuSection
              key={section.title}
              title={section.title}
              items={section.items}
              onSelectItem={setSelectedItem}
              onQuickAdd={handleQuickAdd}
            />
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
