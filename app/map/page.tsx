'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import Footer from '@/components/layout/Footer'
import { cafeLocations as locations, distanceKm, type CafeLocation } from '@/lib/cafe-locations'

function directionsHref(location: CafeLocation) {
  const query = `${location.name}, ${location.addressLine1}, ${location.addressLine2}`
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="M20 20L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function MapPinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path
        d="M12 22s7-6.3 7-12.5A7 7 0 0 0 5 9.5C5 15.7 12 22 12 22z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="9.5" r="2.4" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

function FindLocationMascot() {
  return (
    <Image
      src="/Images/9674969-Photoroom.png"
      alt=""
      width={220}
      height={220}
      aria-hidden="true"
      className="h-32 w-32 object-contain sm:h-36 sm:w-36"
    />
  )
}

type GeoStatus = 'idle' | 'loading' | 'granted' | 'denied'

export default function NambitaCafeMapPage() {
  const [searchInput, setSearchInput] = useState('')
  const [committedSearch, setCommittedSearch] = useState('')
  const [geoStatus, setGeoStatus] = useState<GeoStatus>('idle')
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null)

  function handleShareLocation() {
    if (!('geolocation' in navigator)) {
      setGeoStatus('denied')
      return
    }
    setGeoStatus('loading')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserCoords({ lat: position.coords.latitude, lng: position.coords.longitude })
        setGeoStatus('granted')
      },
      () => setGeoStatus('denied'),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  function handleSearchSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    setCommittedSearch(searchInput.trim())
  }

  const decoratedLocations = useMemo(() => {
    const query = committedSearch.toLowerCase()
    const matched = query
      ? locations.filter((loc) => `${loc.name} ${loc.addressLine1} ${loc.addressLine2}`.toLowerCase().includes(query))
      : locations

    const withDistance = matched.map((loc) => ({
      ...loc,
      distanceKm: userCoords ? distanceKm(userCoords, loc) : null,
    }))

    return [...withDistance].sort((a, b) => {
      if (a.distanceKm == null || b.distanceKm == null) return 0
      return a.distanceKm - b.distanceKm
    })
  }, [committedSearch, userCoords])

  const showEmptyState = !userCoords && !committedSearch

  const pageEase = [0.22, 1, 0.36, 1] as const

  function LocationCard({ location }: { readonly location: (typeof decoratedLocations)[number] }) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: pageEase }}
        className="flex items-start gap-3 rounded-2xl border border-black/10 bg-[#F4EFD8] p-5 shadow-sm"
      >
        <span className="mt-1 text-[#3F6B3C]">
          <MapPinIcon />
        </span>
        <div>
          <h3 className="font-teko text-base uppercase tracking-[0.03em] text-black-900 sm:text-lg">
            {location.name}
          </h3>
          <p className="mt-1 text-sm leading-6 text-black-900/70">
            {location.addressLine1}, {location.addressLine2}
          </p>
          {location.distanceKm != null && (
            <p className="mt-1 text-xs font-bold uppercase tracking-[0.08em] text-[#3F6B3C]">
              {location.distanceKm < 1 ? `${Math.round(location.distanceKm * 1000)} m away` : `${location.distanceKm.toFixed(1)} km away`}
            </p>
          )}
          <a
            href={directionsHref(location)}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex text-xs font-black uppercase tracking-[0.08em] text-black-900 underline decoration-[#C98A2B] decoration-2 underline-offset-4 hover:text-[#3F6B3C]"
          >
            Get Directions
          </a>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAF8F3] [&_h1]:font-teko [&_h2]:font-teko [&_h3]:font-teko">
      {/* Sub-header */}
      <div className="flex items-center justify-center bg-black-900 px-5 py-5 sm:px-8">
        <h1 className="font-teko text-xl uppercase tracking-[0.05em] text-white sm:text-2xl">Locations</h1>
      </div>

      {/* Search */}
      <div className="border-b border-black/10 bg-[#FAF8F3] px-5 py-5 sm:px-8">
        <form onSubmit={handleSearchSubmit} className="mx-auto flex max-w-2xl items-center gap-3 rounded-full border border-black/15 px-5 py-3">
          <input
            type="text"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Your Address"
            aria-label="Search by address or suburb"
            className="w-full bg-transparent text-sm text-black-900 placeholder:text-black-900/40 focus:outline-none"
            suppressHydrationWarning
          />
          <button type="submit" aria-label="Search" className="text-black-900/50 transition-colors hover:text-[#3F6B3C]">
            <SearchIcon />
          </button>
        </form>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-2xl px-5 py-8 sm:px-8">
        {showEmptyState ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: pageEase }}
            className="flex flex-col items-center py-10 text-center"
          >
            <FindLocationMascot />
            <h2 className="mt-6 font-teko text-2xl uppercase tracking-[0.03em] text-black-900">Find a Location Nearby</h2>
            <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-black-900/70">
              Let us know where you are so we can recommend nearby locations.
            </p>
            {geoStatus === 'denied' && (
              <p className="mt-3 max-w-xs text-xs font-bold uppercase tracking-[0.06em] text-[#C98A2B]">
                We couldn&apos;t access your location. Try searching your address above instead.
              </p>
            )}
            <button
              type="button"
              onClick={handleShareLocation}
              disabled={geoStatus === 'loading'}
              className="mt-7 inline-flex items-center justify-center rounded-full bg-[#3F6B3C] px-8 py-3 font-hagrid text-sm uppercase tracking-[0.08em] text-white transition-colors duration-200 hover:bg-[#C98A2B] disabled:opacity-60"
            >
              {geoStatus === 'loading' ? 'Locating…' : 'Share Location'}
            </button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {decoratedLocations.length === 0 ? (
              <p className="py-10 text-center text-sm text-black-900/60">No locations match your search.</p>
            ) : (
              decoratedLocations.map((location) => <LocationCard key={location.id} location={location} />)
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
