// Root layout: wraps every page. Loads the fonts, sets default SEO tags, and shows the Navbar.

import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import { Cormorant_Garamond, DM_Sans, Manrope, Teko } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import { buildPageMetadata, jsonLdScript, seoConfig, siteStructuredData } from '@/lib/seo'

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
  // The tab icon comes from app/icon.png and the phone home-screen icon from app/apple-icon.png
  // (black logo on brand yellow). Next.js finds them by file name.
  ...buildPageMetadata({
    title: 'Nambita Cafe | Wings, Wors Rolls & Coffee in Durban',
    description:
      'Crispy wings, juicy wors rolls, golden chips and ice-cold smoothies. Order online and collect at Nambita Cafe in KwaMashu or Waterloo, Durban.',
    path: '/',
    keywords: [
      'cafe Durban',
      'cafe near me',
      'wings and chips Durban',
      'wors roll Durban',
      'food KwaMashu',
      'food Waterloo Durban',
      'iced coffee Durban',
      'smoothies Durban',
      'order online collect Durban',
      'nambita cafe menu',
    ],
  }),
  applicationName: 'Nambita Cafe',
  category: 'restaurant',
  // Lets Google show large image previews and full text snippets in search results.
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
  },
  formatDetection: { telephone: false },
  // Proves to Google Search Console that we own the site (adds <meta name="google-site-verification">).
  verification: {
    google: 'Hi5dylKxiOW-NIyKCVa1cCYM8q-2Q2oQBpjBtyFzIrU',
  },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-ZA" suppressHydrationWarning className={`${manrope.variable} ${hagrid.variable} ${ncSerif.variable} ${cityBold.variable} ${lucySaidOk.variable} ${gellix.variable} ${dmSans.variable} ${teko.variable}`}>
      <body className="font-sans antialiased" suppressHydrationWarning>
        {/* Tells Google and Bing about the business and each branch (built in lib/seo.ts). */}
        <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(siteStructuredData())} />
        <div className="relative pb-[96px] lg:pb-0">
          <Navbar />
          {children}
        </div>
      </body>
    </html>
  )
}
