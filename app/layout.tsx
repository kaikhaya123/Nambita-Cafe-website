// Root layout: wraps every page. Loads the fonts, sets default SEO tags, and shows the Navbar.

import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import { Cormorant_Garamond, DM_Sans, Manrope, Teko } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import { buildPageMetadata, seoConfig } from '@/lib/seo'

const hagrid = localFont({
  src: [
    {
      path: '../public/Font/Hagrid font/Hagrid-Text-Extrabold-trial.ttf',
      weight: '800',
      style: 'normal',
    },
  ],
  variable: '--font-hagrid',
  display: 'swap',
})

const cityBold = localFont({
  src: [
    {
      path: '../public/Font/Hagrid font/City BQ Bold.ttf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-city-bold',
  display: 'swap',
})

// Brush-script font for the "#I Love Nambita" headline (use the `font-lucy` class).
// Licence: free for PERSONAL use only. The live cafe site needs a commercial licence
// from Billy Argel Fonts (billyargel.com / billyargel@gmail.com).
const lucySaidOk = localFont({
  src: [
    {
      path: '../public/Font/Hagrid font/Lucy Said Ok Personal Use.ttf',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-lucy',
  display: 'swap',
})

// Gellix: the body text font for paragraphs across the site (Tailwind `font-sans`).
// Only the weights we use are loaded, to keep the download small.
// Licence: this is the TRIAL / personal-use version. The live site needs a commercial licence.
const gellix = localFont({
  src: [
    { path: '../public/Font/Hagrid font/gellix-font-family/Gellix-TRIAL-Regular.otf', weight: '400', style: 'normal' },
    { path: '../public/Font/Hagrid font/gellix-font-family/Gellix-TRIAL-Medium.otf', weight: '500', style: 'normal' },
    { path: '../public/Font/Hagrid font/gellix-font-family/Gellix-TRIAL-SemiBold.otf', weight: '600', style: 'normal' },
    { path: '../public/Font/Hagrid font/gellix-font-family/Gellix-TRIAL-Bold.otf', weight: '700', style: 'normal' },
  ],
  variable: '--font-gellix',
  display: 'swap',
})

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '700', '800'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const ncSerif = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-nc-serif',
})

const teko = Teko({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-teko',
  display: 'swap',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#111111',
}

export const metadata: Metadata = {
  metadataBase: new URL(seoConfig.siteUrl),
  icons: {
    icon: '/logo/NAMBITA Logo/NambitaL4.png',
    shortcut: '/logo/NAMBITA Logo/NambitaL4.png',
    apple: '/logo/NAMBITA Logo/NambitaL4.png',
  },
  ...buildPageMetadata({
    title: 'Nambita Cafe | Coffee, Smoothies & Food in Durban',
    description:
      'Nambita Cafe serves premium coffee, smoothies, sandwiches, and snacks in Durban. Fresh menu, quick service, and great atmosphere. Visit today!',
    path: '/',
    keywords: [
      'cafe Durban',
      'coffee shop near me',
      'smoothie bar Durban',
      'quick lunch Durban',
      'nambita cafe menu',
      'cafe food Durban',
      'best coffee Durban',
      'sandwich shop Durban',
      'cold drinks Durban',
      'snack bar Durban',
    ],
  }),
}

const restaurantSchema = {
  '@context': 'https://schema.org',
  '@type': 'Restaurant',
  name: 'Nambita Cafe',
  url: seoConfig.siteUrl,
  menu: `${seoConfig.siteUrl}/menu`,
  servesCuisine: ['Cafe', 'Sandwich', 'Coffee', 'Smoothie'],
  priceRange: 'R13-R56',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${manrope.variable} ${hagrid.variable} ${ncSerif.variable} ${cityBold.variable} ${lucySaidOk.variable} ${gellix.variable} ${dmSans.variable} ${teko.variable}`}>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantSchema) }}
        />
        <div className="relative pb-[96px] lg:pb-0">
          <Navbar />
          {children}
        </div>
      </body>
    </html>
  )
}
