'use client'

// About page: logo and the "About Nambita Cafe" story text.

import Image from 'next/image'
import { motion } from 'framer-motion'
import { pageEase } from '@/lib/motion'

export default function AboutIntro() {
  return (
    <section className="relative overflow-hidden bg-brand-offwhite px-5 py-16 sm:px-8 md:px-10 md:py-24">
      <div className="relative mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, ease: pageEase }}
          className="space-y-6 text-center"
        >
          <div>
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.65, ease: pageEase }}
            >
              <Image
                src="/logo/NAMBITA Logo/NambitaL4.webp"
                alt="Nambita Cafe logo"
                width={224}
                height={224}
                className="mx-auto mb-6 h-auto w-40 object-contain [filter:brightness(0)_saturate(100%)] sm:w-44"
                sizes="(max-width: 640px) 160px, 176px"
              />
            </motion.div>
            <h2 className="font-teko border-outline mb-4 text-[1.72rem] leading-tight uppercase tracking-[0.05em] text-black-900 sm:text-4xl sm:tracking-[0.06em]">
              About Nambita Cafe
            </h2>
            <p className="mx-auto max-w-2xl font-sans text-[0.95rem] leading-7 text-black-900 sm:text-base sm:leading-8">
              Nambita Cafe was created as a welcoming space for Slaqa Salon clients and the wider community to enjoy quality refreshments and casual bites in a relaxed setting. What began as a simple refreshment corner has grown into a full-service cafe with its own identity, serving freshly brewed coffee, fruit smoothies, toasted bites, pastries, and chilled drinks for people looking to unwind, grab a quick refresher, or enjoy a warm and inviting stop at our KwaMashu and Waterloo locations.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
