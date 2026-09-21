export interface CafeLocation {
  id: string
  name: string
  addressLine1: string
  addressLine2: string
  lat: number
  lng: number
}

export const cafeLocations: CafeLocation[] = [
  {
    id: 'kwamashu',
    name: 'Nambita Cafe KwaMashu',
    addressLine1: '206 Bhenjane Rd',
    addressLine2: 'KwaMashu, 4051',
    lat: -29.75,
    lng: 30.9833,
  },
  {
    id: 'waterloo',
    name: 'Nambita Cafe Waterloo',
    addressLine1: '346 Pricklepear Rd',
    addressLine2: 'Waterloo, Blackburn, 4319',
    lat: -29.6643,
    lng: 31.059,
  },
]

export const cafeLocationsById: Record<string, CafeLocation> = Object.fromEntries(
  cafeLocations.map((location) => [location.id, location])
)

export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const lat1 = (a.lat * Math.PI) / 180
  const lat2 = (b.lat * Math.PI) / 180
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}
