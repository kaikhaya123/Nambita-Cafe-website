// Builds the SEO tags (title, description, social previews) for each page, and the "structured data"
// (JSON-LD) that tells Google and Bing about the business, its branches and its menu.
// Set NEXT_PUBLIC_SITE_URL for the real domain.

import type { Metadata } from 'next'
import { cafeLocations } from '@/lib/cafe-locations'
import { menuSections } from '@/lib/menu-data'

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://nambitacafe.co.za').replace(/\/$/, '')
const DEFAULT_KEYWORDS = [
  'nambita cafe',
  'nambita cafe durban',
  'cafe kwamashu',
  'cafe waterloo durban',
  'wings durban',
] as const

// Social media pages Google can link to the business. Only add real profile links here.
const SOCIAL_PROFILES = ['https://www.instagram.com/nambitacafe/']

type BuildPageMetadataInput = {
  title: string
  description: string
  path: string
  keywords?: string[]
}

export const seoConfig = {
  siteName: 'Nambita Cafe',
  siteUrl: SITE_URL,
  // public/og-image.png: the picture shown when a link is shared on WhatsApp, Facebook, X, etc.
  ogImage: '/og-image.png',
  ogImages: [
    {
      url: '/og-image.png',
      width: 1200,
      height: 630,
      alt: 'Nambita Cafe logo',
    },
  ],
}

export function buildPageMetadata({ title, description, path, keywords = [] }: BuildPageMetadataInput): Metadata {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const url = normalizedPath === '/' ? SITE_URL : `${SITE_URL}${normalizedPath}`
  const mergedKeywords = Array.from(new Set([...DEFAULT_KEYWORDS, ...keywords]))

  return {
    title,
    description,
    keywords: mergedKeywords,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      locale: 'en_ZA',
      siteName: seoConfig.siteName,
      images: seoConfig.ogImages,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [seoConfig.ogImage],
    },
  }
}

// ---------- Structured data (JSON-LD) ----------
// Read by Google and Bing to show the cafe on maps, in "near me" searches and in rich results.
// Built from lib/cafe-locations.ts and lib/menu-data.ts, so it updates when those change.

const allMenuPrices = menuSections.flatMap((section) => section.items.map((item) => item.price))
const priceRange = `R${Math.min(...allMenuPrices)}–R${Math.max(...allMenuPrices)}`
const absoluteUrl = (path: string) => `${SITE_URL}${encodeURI(path)}`

/** The business as a whole, the website, and one entry per branch. Goes on every page. */
export function siteStructuredData() {
  const organizationId = `${SITE_URL}/#organization`

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': organizationId,
        name: seoConfig.siteName,
        url: SITE_URL,
        logo: absoluteUrl('/icon.png'),
        image: absoluteUrl(seoConfig.ogImage),
        email: 'info@nambitacafe.co.za',
        sameAs: SOCIAL_PROFILES,
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        name: seoConfig.siteName,
        url: SITE_URL,
        inLanguage: 'en-ZA',
        publisher: { '@id': organizationId },
      },
      ...cafeLocations.map((location) => ({
        '@type': 'Restaurant',
        '@id': `${SITE_URL}/map#${location.id}`,
        name: location.name,
        parentOrganization: { '@id': organizationId },
        url: `${SITE_URL}/map`,
        image: absoluteUrl(seoConfig.ogImage),
        servesCuisine: ['South African', 'Chicken wings', 'Coffee', 'Smoothies'],
        priceRange,
        currenciesAccepted: 'ZAR',
        acceptsReservations: false,
        hasMenu: `${SITE_URL}/menu`,
        address: {
          '@type': 'PostalAddress',
          streetAddress: location.addressLine1,
          // addressLine2 looks like "KwaMashu, 4051": the area, then the postal code.
          addressLocality: location.addressLine2.replace(/,?\s*\d{4}$/, ''),
          postalCode: location.addressLine2.match(/\d{4}$/)?.[0],
          addressRegion: 'KwaZulu-Natal',
          addressCountry: 'ZA',
        },
        geo: { '@type': 'GeoCoordinates', latitude: location.lat, longitude: location.lng },
        ...(location.phone && { telephone: location.phone }),
        ...(location.openingHours && { openingHours: location.openingHours }),
      })),
    ],
  }
}

/** The full menu with prices in rand. Goes on the /menu page. */
export function menuStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Menu',
    '@id': `${SITE_URL}/menu#menu`,
    name: 'Nambita Cafe Menu',
    url: `${SITE_URL}/menu`,
    inLanguage: 'en-ZA',
    hasMenuSection: menuSections.map((section) => ({
      '@type': 'MenuSection',
      name: section.title.trim(),
      hasMenuItem: section.items.map((item) => ({
        '@type': 'MenuItem',
        name: item.name.trim(),
        description: item.description,
        image: absoluteUrl(item.image),
        offers: { '@type': 'Offer', price: item.price.toFixed(2), priceCurrency: 'ZAR' },
      })),
    })),
  }
}

/** Every menu photo as a full web address, for the image part of the sitemap. */
export function menuImageUrls() {
  return Array.from(new Set(menuSections.flatMap((section) => section.items.map((item) => absoluteUrl(item.image)))))
}

/**
 * Puts structured data in the page as <script type="application/ld+json">. `<` is escaped so text
 * from the menu can never close the script tag early.
 */
export function jsonLdScript(data: object) {
  return { __html: JSON.stringify(data).replace(/</g, '\\u003c') }
}
