'use client'

// One menu item: photo, name, price, and a quick "Add to Cart" button. Clicking the photo opens ItemOrderModal.

import Image from 'next/image'
import { motion } from 'framer-motion'
import type { MenuItem } from '@/lib/menu-data'
import { pageEase } from '@/lib/motion'

export default function MenuItemCard({
  item,
  index,
  onSelect,
  onQuickAdd,
}: Readonly<{
  item: MenuItem
  index: number
  onSelect: (item: MenuItem) => void
  onQuickAdd: (item: MenuItem) => void
}>) {
  return (
    <motion.div
      className="overflow-hidden rounded-2xl border border-black/10 bg-white transition-shadow duration-200 hover:shadow-md"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, ease: pageEase, delay: (index % 3) * 0.07 }}
    >
      <button
        type="button"
        onClick={() => onSelect(item)}
        className="block w-full text-left"
      >
        {/* The whole photo is shown (object-contain), with a small margin so it never touches the card edge. */}
        <div className="relative aspect-square w-full bg-white sm:aspect-[4/3]">
          <div className="absolute inset-4 sm:inset-5">
            <Image
              src={item.image}
              alt={item.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-contain"
            />
          </div>
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
          onClick={() => onQuickAdd(item)}
          className="btn btn-sm flex w-full gap-1.5 bg-brand-yellow text-black transition-opacity hover:opacity-85"
        >
          <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-black-900 text-brand-yellow sm:h-5 sm:w-5">
            <svg viewBox="0 0 24 24" fill="none" className="h-2.5 w-2.5 sm:h-3 sm:w-3" aria-hidden="true">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </span>
          Add to Cart
        </button>
      </div>
    </motion.div>
  )
}
