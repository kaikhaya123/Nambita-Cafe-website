import type { Metadata } from 'next'
import { buildPageMetadata } from '@/lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: 'Nambita Cafe Menu | Coffee, Food & Drinks in Durban',
  description: 'Browse the full Nambita Cafe menu — toasted sandwiches, wraps, hot and cold drinks, all served fresh in Durban.',
  path: '/menu',
})

export default function NambitaCafeMenuLayout({ children }: { readonly children: React.ReactNode }) {
  return children
}
