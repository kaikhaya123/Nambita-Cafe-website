// SEO title/description for the Terms & Refund Policy page (/terms).

import type { Metadata } from 'next'
import { buildPageMetadata } from '@/lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: 'Terms & Refund Policy | Nambita Cafe',
  description: 'How online ordering, payment, collection and refunds work at Nambita Cafe in KwaMashu and Waterloo, Durban.',
  path: '/terms',
})

export default function TermsLayout({ children }: { readonly children: React.ReactNode }) {
  return children
}
