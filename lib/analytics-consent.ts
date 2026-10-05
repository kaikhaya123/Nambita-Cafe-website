'use client'

// Remembers whether the visitor said yes or no to Google Analytics cookies (saved in their browser).
// Google Analytics only loads after "yes" (components/layout/GoogleAnalytics.tsx). The cookie banner
// (components/layout/CookieBanner.tsx) asks until they choose, and "Cookie settings" in the footer asks again.

import { useSyncExternalStore } from 'react'

export type AnalyticsConsent = 'granted' | 'denied' | 'undecided'

// Our Google Analytics "Measurement ID", set in .env.local (and Vercel) as NEXT_PUBLIC_GA_MEASUREMENT_ID.
// It isn't secret: the NEXT_PUBLIC_ start means it's sent to the browser, which Google needs.
// If it's missing, analytics is off and nobody is asked about cookies.
export const MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? ''

// Pages Google must never see: the staff area and login (customer names, phone numbers, orders),
// and the order-success page (its address contains the customer's order number).
const PRIVATE_PATHS = ['/dashboard', '/nambita-staff-access', '/checkout/success']

export function isPrivatePath(pathname: string) {
  return PRIVATE_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))
}

const STORAGE_KEY = 'nambita-analytics-consent'

// Kept here too, so the choice still works for this visit if the browser blocks saving it.
let consent: AnalyticsConsent | null = null
const listeners = new Set<() => void>()

function readSavedConsent(): AnalyticsConsent {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    return saved === 'granted' || saved === 'denied' ? saved : 'undecided'
  } catch {
    return 'undecided'
  }
}

// Google Analytics' own cookies start with "_ga". They're set on the main domain (e.g. .nambitacafe.co.za).
function removeAnalyticsCookies() {
  const mainDomain = window.location.hostname.replace(/^www\./, '')
  for (const cookie of document.cookie.split(';')) {
    const name = cookie.split('=')[0].trim()
    if (!name.startsWith('_ga')) continue
    for (const domain of ['', `; domain=${mainDomain}`, `; domain=.${mainDomain}`]) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domain}`
    }
  }
}

/** Saves the visitor's choice. 'undecided' shows the banner again. Saying no also deletes Google's cookies. */
export function setAnalyticsConsent(next: AnalyticsConsent) {
  consent = next
  try {
    if (next === 'undecided') window.localStorage.removeItem(STORAGE_KEY)
    else window.localStorage.setItem(STORAGE_KEY, next)
  } catch {
    // Saving is blocked (e.g. private browsing): the choice still lasts for this visit.
  }
  if (next !== 'granted') removeAnalyticsCookies()
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  consent ??= readSavedConsent()
  return consent
}

// On the server we can't know the visitor's choice yet.
function getServerSnapshot() {
  return null
}

/** The visitor's choice, or null while the page is first built on the server. */
export function useAnalyticsConsent(): AnalyticsConsent | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
