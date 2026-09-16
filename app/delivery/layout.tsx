import type { Metadata } from 'next'
import { buildPageMetadata } from '@/lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: 'Delivery Pricing | Nambita Cafe',
  description: 'Enter your address to see your driving distance from the nearest Nambita Cafe and get an instant delivery fee quote.',
  path: '/delivery',
})

export default function NambitaCafeDeliveryLayout({ children }: { readonly children: React.ReactNode }) {
  return children
}
