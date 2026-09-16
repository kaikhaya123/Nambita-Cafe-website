import { NextRequest, NextResponse } from 'next/server'

const ORS_API_KEY = process.env.OPENROUTESERVICE_API_KEY

const BASE_FEE_ZAR = 30
const RATE_PER_KM_ZAR = 7

const cafeLocations = [
  { name: 'Nambita Cafe KwaMashu', lat: -29.75, lng: 30.9833 },
  { name: 'Nambita Cafe Waterloo', lat: -29.6643, lng: 31.059 },
] as const

type OrsGeocodeResponse = {
  features: { geometry: { coordinates: [number, number] } }[]
}

type OrsMatrixResponse = {
  distances: number[][]
}

export async function POST(request: NextRequest) {
  if (!ORS_API_KEY) {
    return NextResponse.json({ error: 'Delivery pricing is not configured yet.' }, { status: 500 })
  }

  const body = await request.json().catch(() => null)
  const address = typeof body?.address === 'string' ? body.address.trim() : ''

  if (!address) {
    return NextResponse.json({ error: 'Please enter a delivery address.' }, { status: 400 })
  }

  const geocodeUrl = new URL('https://api.openrouteservice.org/geocode/search')
  geocodeUrl.searchParams.set('api_key', ORS_API_KEY)
  geocodeUrl.searchParams.set('text', address)
  geocodeUrl.searchParams.set('boundary.country', 'ZA')
  geocodeUrl.searchParams.set('size', '1')

  const geocodeResponse = await fetch(geocodeUrl)
  if (!geocodeResponse.ok) {
    return NextResponse.json({ error: 'Could not look up that address right now.' }, { status: 502 })
  }

  const geocodeData = (await geocodeResponse.json()) as OrsGeocodeResponse
  const match = geocodeData.features[0]
  if (!match) {
    return NextResponse.json({ error: "We couldn't find that address. Try adding more detail." }, { status: 422 })
  }

  const [customerLng, customerLat] = match.geometry.coordinates

  const matrixResponse = await fetch('https://api.openrouteservice.org/v2/matrix/driving-car', {
    method: 'POST',
    headers: {
      Authorization: ORS_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      locations: [
        ...cafeLocations.map((loc) => [loc.lng, loc.lat]),
        [customerLng, customerLat],
      ],
      sources: [0, 1],
      destinations: [2],
      metrics: ['distance'],
    }),
  })

  if (!matrixResponse.ok) {
    return NextResponse.json({ error: 'Could not calculate driving distance right now.' }, { status: 502 })
  }

  const matrixData = (await matrixResponse.json()) as OrsMatrixResponse
  const distancesMeters = matrixData.distances.map((row) => row[0])

  let nearestIndex = 0
  for (let i = 1; i < distancesMeters.length; i++) {
    if (distancesMeters[i] < distancesMeters[nearestIndex]) nearestIndex = i
  }

  const distanceKm = distancesMeters[nearestIndex] / 1000
  const fee = Math.round(BASE_FEE_ZAR + RATE_PER_KM_ZAR * distanceKm)

  return NextResponse.json({
    locationName: cafeLocations[nearestIndex].name,
    distanceKm: Math.round(distanceKm * 10) / 10,
    fee,
  })
}
