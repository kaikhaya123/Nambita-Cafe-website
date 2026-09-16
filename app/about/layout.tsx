import type { Metadata } from 'next'
import { buildPageMetadata } from '@/lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: 'About Nambita Cafe',
  description: 'Learn about the story, mission, and offerings of Nambita Cafe in Durban.',
  path: '/about',
})

export default function NambitaCafeAboutLayout({ children }: { readonly children: React.ReactNode }) {
  return children
}
