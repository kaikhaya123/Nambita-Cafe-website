// SEO title/description for the Privacy Policy page (/privacy).

import type { Metadata } from 'next'
import { buildPageMetadata } from '@/lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: 'Privacy Policy | Nambita Cafe',
  description: 'What personal information Nambita Cafe collects when you order online, why, who we share it with and your rights under POPIA.',
  path: '/privacy',
})

export default function PrivacyLayout({ children }: { readonly children: React.ReactNode }) {
  return children
}
