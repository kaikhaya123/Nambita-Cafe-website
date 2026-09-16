import type { Metadata } from 'next'
import { buildPageMetadata } from '@/lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: 'Nambita Cafe Locations | Find a Cafe Near You',
  description: 'Find your nearest Nambita Cafe in KwaMashu or Waterloo, Durban — share your location or search an address to get directions.',
  path: '/map',
})

export default function NambitaCafeMapLayout({ children }: { readonly children: React.ReactNode }) {
  return children
}
