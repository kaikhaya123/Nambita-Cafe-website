import type { Metadata } from 'next'

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://nambitacafe.co.za').replace(/\/$/, '')
const DEFAULT_OG_IMAGE = '/logo/NAMBITA Logo/NambitaL4.png'
const DEFAULT_KEYWORDS = [
  'nambita cafe',
  'nambita cafe durban',
  'cafe durban',
  'coffee shop kwamashu',
  'coffee shop waterloo durban',
] as const

type BuildPageMetadataInput = {
  title: string
  description: string
  path: string
  keywords?: string[]
}

export const seoConfig = {
  siteName: 'Nambita Cafe',
  siteUrl: SITE_URL,
  ogImage: DEFAULT_OG_IMAGE,
  ogImages: [
    {
      url: DEFAULT_OG_IMAGE,
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
  const languageAlternates = {
    'en-ZA': url,
    en: url,
    'x-default': url,
  }

  return {
    title,
    description,
    keywords: mergedKeywords,
    alternates: {
      canonical: url,
      languages: languageAlternates,
    },
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
