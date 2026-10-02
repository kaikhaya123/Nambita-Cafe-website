// SEO title/description for the Locations page (/map). The addresses come from lib/cafe-locations.ts.

import type { Metadata } from 'next'
import { cafeLocations } from '@/lib/cafe-locations'
import { buildPageMetadata } from '@/lib/seo'

// e.g. "206 Bhenjane Rd, KwaMashu and 346 Pricklepear Rd, Waterloo"
const addresses = cafeLocations.map((l) => `${l.addressLine1}, ${l.addressLine2.split(',')[0]}`).join(' and ')
const areas = cafeLocations.map((l) => l.addressLine2.split(',')[0]).join(' & ')

export const metadata: Metadata = buildPageMetadata({
  title: `Locations: ${areas} | Nambita Cafe`,
  description: `Find Nambita Cafe at ${addresses}, Durban. Share your location to find the nearest branch and get directions.`,
  path: '/map',
  keywords: ['cafe near me', ...cafeLocations.map((l) => l.name.toLowerCase())],
})

export default function NambitaCafeMapLayout({ children }: { readonly children: React.ReactNode }) {
  return children
}
