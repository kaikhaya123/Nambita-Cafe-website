'use client'

import { motion } from 'framer-motion'
import { MapPinIcon } from '@/components/map/MapIcons'
import { directionsHref, type CafeLocation } from '@/lib/cafe-locations'
import { pageEase } from '@/lib/motion'

export type LocationWithDistance = CafeLocation & { distanceKm: number | null }

// One branch in the /map results: name, address, distance (if known) and a directions link.
export default function LocationCard({ location }: { readonly location: LocationWithDistance }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: pageEase }}
      className="flex items-start gap-3 rounded-2xl border border-white/15 bg-white/5 p-5"
    >
      <span className="mt-1 text-brand-yellow">
        <MapPinIcon />
      </span>
      <div>
        <h3 className="font-teko text-base uppercase tracking-[0.03em] text-white sm:text-lg">
          {location.name}
        </h3>
        <p className="mt-1 text-sm leading-6 text-white/70">
          {location.addressLine1}, {location.addressLine2}
        </p>
        {location.distanceKm != null && (
          <p className="mt-1 text-xs font-bold uppercase tracking-[0.08em] text-brand-yellow">
            {location.distanceKm < 1 ? `${Math.round(location.distanceKm * 1000)} m away` : `${location.distanceKm.toFixed(1)} km away`}
          </p>
        )}
        <a
          href={directionsHref(location)}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex font-teko font-bold uppercase tracking-[0.05em] text-lg text-white underline decoration-brand-caramel decoration-2 underline-offset-4 hover:text-brand-yellow"
        >
          Get Directions
        </a>
      </div>
    </motion.div>
  )
}
