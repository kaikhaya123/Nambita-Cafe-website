'use client'

// Shown on /map before the customer searches: asks to share their location.

import Image from 'next/image'
import { motion } from 'framer-motion'
import { pageEase } from '@/lib/motion'

export type GeoStatus = 'idle' | 'loading' | 'granted' | 'denied'

export default function FindLocationPrompt({
  geoStatus,
  onShareLocation,
}: Readonly<{
  geoStatus: GeoStatus
  onShareLocation: () => void
}>) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: pageEase }}
      className="flex flex-col items-center py-10 text-center"
    >
      <Image
        src="/Images/9674969-Photoroom.png"
        alt=""
        width={220}
        height={220}
        aria-hidden="true"
        className="h-32 w-32 object-contain sm:h-36 sm:w-36"
      />
      <h2 className="mt-6 font-teko text-2xl uppercase tracking-[0.03em] text-black-900">Find a Location Nearby</h2>
      <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-black-900/70">
        Let us know where you are so we can recommend nearby locations.
      </p>
      {geoStatus === 'denied' && (
        <p className="mt-3 max-w-xs text-xs font-bold uppercase tracking-[0.06em] text-brand-caramel">
          We couldn&apos;t access your location. Try searching your address above instead.
        </p>
      )}
      <button
        type="button"
        onClick={onShareLocation}
        disabled={geoStatus === 'loading'}
        className="mt-7 inline-flex items-center justify-center rounded-full bg-brand-green px-8 py-3 font-teko font-bold uppercase tracking-[0.05em] text-xl text-white transition-colors duration-200 hover:bg-brand-caramel disabled:opacity-60"
      >
        {geoStatus === 'loading' ? 'Locating…' : 'Share Location'}
      </button>
    </motion.div>
  )
}
