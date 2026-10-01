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
    <div className="min-h-screen bg-black-900 text-white [&_h1]:font-teko [&_h2]:font-teko [&_h3]:font-teko">
      {/* Page heading kept for Google and screen readers, but hidden on screen (sr-only). */}
      <h1 className="sr-only">Nambita Cafe Locations</h1>

      {/* Before the customer searches, this area fills the screen below the navbar (h-20, sm:h-24)
          so the "Find a Location Nearby" prompt can sit in the middle of it.
          On phones, pb-24 keeps it clear of the yellow "Order Now" bar fixed at the bottom. */}
      <div
        className={
          showEmptyState ? 'flex min-h-[calc(100svh-5rem)] flex-col sm:min-h-[calc(100svh-6rem)]' : undefined
        }
      >
        <LocationSearch value={searchInput} onChange={setSearchInput} onSubmit={handleSearchSubmit} />

        {/* Content */}
        {showEmptyState ? (
          <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-5 pb-24 pt-8 sm:px-8 lg:pb-8">
            <FindLocationPrompt geoStatus={geoStatus} onShareLocation={handleShareLocation} />
          </div>
        ) : (
          <div className="mx-auto max-w-2xl space-y-4 px-5 py-8 sm:px-8">
            {decoratedLocations.length === 0 ? (
              <p className="py-10 text-center text-sm text-white/70">No locations match your search.</p>
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
