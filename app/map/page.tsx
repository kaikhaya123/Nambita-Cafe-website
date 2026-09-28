'use client'

// Locations page (URL: /map). Lets customers search for a branch or share their location
// to sort branches by distance. Branch data comes from lib/cafe-locations.ts.

import { useMemo, useState } from 'react'
import Footer from '@/components/layout/Footer'
import LocationSearch from '@/components/map/LocationSearch'
import LocationCard, { type LocationWithDistance } from '@/components/map/LocationCard'
import FindLocationPrompt, { type GeoStatus } from '@/components/map/FindLocationPrompt'
import { cafeLocations as locations, distanceKm } from '@/lib/cafe-locations'

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

  const decoratedLocations = useMemo<LocationWithDistance[]>(() => {
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

  return (
    <div className="min-h-screen bg-brand-offwhite [&_h1]:font-teko [&_h2]:font-teko [&_h3]:font-teko">
      {/* Sub-header */}
      <div className="flex items-center justify-center bg-black-900 px-5 py-5 sm:px-8">
        <h1 className="font-teko text-xl uppercase tracking-[0.05em] text-white sm:text-2xl">Locations</h1>
      </div>

      <LocationSearch value={searchInput} onChange={setSearchInput} onSubmit={handleSearchSubmit} />

      {/* Content */}
      <div className="mx-auto max-w-2xl px-5 py-8 sm:px-8">
        {showEmptyState ? (
          <FindLocationPrompt geoStatus={geoStatus} onShareLocation={handleShareLocation} />
        ) : (
          <div className="space-y-4">
            {decoratedLocations.length === 0 ? (
              <p className="py-10 text-center text-sm text-black-900/70">No locations match your search.</p>
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
