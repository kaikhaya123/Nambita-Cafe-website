'use client'

// Small "X added to cart" message that pops up at the bottom of the screen after a quick add.

import { AnimatePresence, motion } from 'framer-motion'

interface AddedToCartToastProps {
  itemName: string | null
  onView: () => void
}

export default function AddedToCartToast({ itemName, onView }: AddedToCartToastProps) {
  return (
    <AnimatePresence>
      {itemName && (
        <motion.div
          // Sits at the bottom of the screen. Below `lg` the yellow "Order Now" bar (Navbar.tsx) is fixed there
          // (about 64px tall on phones, 72px on tablets), so the pop-up floats 16px / 24px above it.
          // On desktop there is no bar, so it sits 32px from the bottom edge. It slides up into view.
          className="fixed inset-x-0 bottom-[calc(80px+env(safe-area-inset-bottom))] z-[110] flex justify-center px-4 sm:bottom-[calc(96px+env(safe-area-inset-bottom))] lg:bottom-8"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Inner padding: more room around the text on the left, and around the "View Cart" button on the right. */}
          <div className="flex w-full max-w-sm items-center justify-between gap-4 rounded-full bg-black-900 py-3 pl-6 pr-3 shadow-lg sm:max-w-md sm:py-3.5 sm:pl-7 sm:pr-3.5">
            <span className="font-dm-sans text-xs text-white sm:text-sm">
              <span className="font-bold">{itemName}</span> added to cart
            </span>
            <button
              type="button"
              onClick={onView}
              className="btn btn-sm whitespace-nowrap bg-brand-yellow text-black-900"
            >
              View Cart
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
