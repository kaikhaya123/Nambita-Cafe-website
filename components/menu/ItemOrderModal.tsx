'use client'

import { useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import type { MenuItem } from '@/lib/menu-data'

interface ItemOrderModalProps {
  item: MenuItem
  onClose: () => void
  onAdd: (item: MenuItem, quantity: number) => void
}

export default function ItemOrderModal({ item, onClose, onAdd }: ItemOrderModalProps) {
  const [quantity, setQuantity] = useState(1)

  const total = item.price * quantity

  const handleAdd = () => {
    onAdd(item, quantity)
    onClose()
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[120] flex items-end justify-center bg-black/50 sm:items-center sm:p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="max-h-[90vh] w-full overflow-y-auto rounded-t-3xl bg-white sm:max-w-lg sm:rounded-3xl"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="relative aspect-[16/9] w-full bg-white">
            <Image src={item.image} alt={item.name} fill sizes="(max-width: 640px) 100vw, 512px" className="object-cover" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white to-transparent" />
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black-900 text-white shadow"
            >
              &times;
            </button>
          </div>

          <div className="p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-teko text-2xl uppercase tracking-[0.03em] text-black-900 sm:text-3xl">{item.name}</h3>
              <p className="whitespace-nowrap font-teko text-2xl font-black text-black-900 sm:text-3xl">R{item.price.toFixed(2)}</p>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-black-900/80 sm:text-base">{item.description}</p>

            <div className="mt-6 flex items-center justify-between">
              <p className="font-teko text-lg uppercase tracking-[0.05em] text-black-900">Quantity</p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-black/20 text-lg text-black-900"
                >
                  −
                </button>
                <span className="w-6 text-center font-dm-sans text-base font-bold text-black-900">{quantity}</span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-black/20 text-lg text-black-900"
                >
                  +
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAdd}
              className="mt-6 flex w-full items-center justify-between rounded-full bg-[#FFFF00] px-6 py-4 font-dm-sans text-sm uppercase tracking-[0.12em] text-black-900"
            >
              <span>Add to Order</span>
              <span className="font-bold">R{total.toFixed(2)}</span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
