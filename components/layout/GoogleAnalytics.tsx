'use client'
// Google Analytics: counts visits to the public pages, only after the visitor has accepted cookies
// (see lib/analytics-consent.ts). Switched off in the staff area and on the order-success page.

import Script from 'next/script'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { isPrivatePath, MEASUREMENT_ID, useAnalyticsConsent } from '@/lib/analytics-consent'

export default function GoogleAnalytics() {
  const pathname = usePathname()
  const isPrivate = isPrivatePath(pathname)
  const isAllowed = useAnalyticsConsent() === 'granted'

  // Once Google's script has loaded it stays loaded, even if the visitor moves on to a private page or
  // changes their mind about cookies. This flag is Google's own "stop sending" switch, so nothing more is recorded.
  useEffect(() => {
    ;(window as unknown as Record<string, boolean>)[`ga-disable-${MEASUREMENT_ID}`] = isPrivate || !isAllowed
  }, [isPrivate, isAllowed])

  // Only on the live site, so testing with `npm run dev` doesn't add fake visits.
  if (process.env.NODE_ENV !== 'production' || isPrivate || !MEASUREMENT_ID || !isAllowed) return null

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
