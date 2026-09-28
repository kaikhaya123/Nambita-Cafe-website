'use client'

// Small "X added to cart" message that appears at the top after a quick add.

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
          className="fixed inset-x-0 top-[calc(80px+env(safe-area-inset-top))] z-[110] flex justify-center px-4 sm:top-[calc(96px+env(safe-area-inset-top))]"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex w-full max-w-sm items-center justify-between gap-3 rounded-full bg-black-900 py-2.5 pl-4 pr-2 shadow-lg">
            <span className="font-dm-sans text-xs text-white sm:text-sm">
              <span className="font-bold">{itemName}</span> added to cart
            </span>
            <button
              type="button"
              onClick={onView}
              className="whitespace-nowrap rounded-full bg-brand-yellow px-3 py-1.5 font-teko font-bold uppercase tracking-[0.05em] text-base text-black-900 sm:text-lg"
            >
              View Cart
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
