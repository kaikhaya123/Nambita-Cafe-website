'use client'
// Google Analytics: counts visits to the public pages. Switched off in the staff area and on the order-success page.

import Script from 'next/script'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

// Our Google Analytics "Measurement ID", set in .env.local (and Vercel) as NEXT_PUBLIC_GA_MEASUREMENT_ID.
// It isn't secret: the NEXT_PUBLIC_ start means it's sent to the browser, which Google needs.
// If it's missing, analytics simply stays off.
const MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? ''

// Pages Google must never see: the staff area and login (customer names, phone numbers, orders),
// and the order-success page (its address contains the customer's order number).
const PRIVATE_PATHS = ['/dashboard', '/nambita-staff-access', '/checkout/success']

function isPrivatePath(pathname: string) {
  return PRIVATE_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))
}

export default function GoogleAnalytics() {
  const pathname = usePathname()
  const isPrivate = isPrivatePath(pathname)

  // Once Google's script has loaded it stays loaded, even if the visitor moves on to a private page.
  // This flag is Google's own "stop sending" switch, so nothing from a private page is recorded.
  useEffect(() => {
    ;(window as unknown as Record<string, boolean>)[`ga-disable-${MEASUREMENT_ID}`] = isPrivate
  }, [isPrivate])

  // Only on the live site, so testing with `npm run dev` doesn't add fake visits.
  if (process.env.NODE_ENV !== 'production' || isPrivate || !MEASUREMENT_ID) return null

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`} strategy="afterInteractive" />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${MEASUREMENT_ID}');
        `}
      </Script>
    </>
  )
}
