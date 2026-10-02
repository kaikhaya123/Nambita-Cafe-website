// SEO title/description for the About page (/about).

import type { Metadata } from 'next'
import { buildPageMetadata } from '@/lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: 'Our Story | Nambita Cafe Durban',
  description:
    'How Nambita Cafe grew from the roots of Slaqa Salon into a local favourite in KwaMashu and Waterloo, Durban. Meet the cafe behind #ILoveNambita.',
  path: '/about',
  keywords: ['nambita cafe story', 'slaqa salon', 'kwamashu cafe'],
})

export default function NambitaCafeAboutLayout({ children }: { readonly children: React.ReactNode }) {
  return children
}
