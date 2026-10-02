// SEO for the Menu page (/menu): title, description, and the full menu with prices for Google and Bing.

import type { Metadata } from 'next'
import { buildPageMetadata, jsonLdScript, menuStructuredData } from '@/lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: 'Menu & Prices | Nambita Cafe Durban',
  description:
    'See the Nambita Cafe menu and prices: wings and fries, wors roll combos, chips, smoothies, iced coffee and cold drinks. Order online and collect in KwaMashu or Waterloo.',
  path: '/menu',
  keywords: ['nambita cafe menu', 'wings and fries price', 'wors roll combo', 'smoothies Durban'],
})

export default function NambitaCafeMenuLayout({ children }: { readonly children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(menuStructuredData())} />
      {children}
    </>
  )
}
