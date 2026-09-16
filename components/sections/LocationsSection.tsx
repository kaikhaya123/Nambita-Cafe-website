'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'

const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent('KwaZulu-Natal, South Africa')}&output=embed`
const directionsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('Nambita Cafe, KwaZulu-Natal')}`

export default function LocationsSection() {
  return (
    <section className="relative bg-[#FAF8F3] px-3 py-3 sm:px-5 sm:py-5">
      <div className="relative grid overflow-hidden rounded-[1.5rem] sm:rounded-[2.5rem] md:grid-cols-2">
        {/* Map */}
        <div className="relative h-[380px] md:h-[560px]">
          <iframe
            title="Map of KwaZulu-Natal"
            src={mapSrc}
            className="absolute inset-0 h-full w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        {/* Forest green CTA panel */}
        <div className="relative flex h-[380px] items-center overflow-hidden bg-[#3F6B3C] md:h-[560px]">
          <Image
            src="/Images/nambitacafe_1776619960157.webp"
            alt="Nambita Cafe storefront"
            fill
            className="object-cover object-center opacity-40"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <div className="pointer-events-none absolute inset-0 bg-[#3F6B3C]/70" />

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 px-6 sm:px-10 md:px-14"
          >
            <h2 className="font-teko text-4xl uppercase leading-[1.05] tracking-[0.01em] text-white sm:text-5xl md:text-6xl">
              We&apos;re Right
              <br />
              Next Door
            </h2>

            <a
              href={directionsHref}
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-flex items-center justify-center rounded-full border-2 border-white px-6 py-3 font-hagrid text-sm uppercase tracking-[0.08em] text-white transition-colors duration-200 hover:bg-[#FAF8F3] hover:text-[#3F6B3C]"
            >
              Find a Location
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
