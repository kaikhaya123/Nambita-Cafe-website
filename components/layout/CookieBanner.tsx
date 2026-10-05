'use client'

// Asks visitors whether Google Analytics may set cookies. Shown on public pages until they choose;
// "Cookie settings" in the footer brings it back. The choice is kept by lib/analytics-consent.ts.

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { isPrivatePath, MEASUREMENT_ID, setAnalyticsConsent, useAnalyticsConsent } from '@/lib/analytics-consent'

export default function CookieBanner() {
  const pathname = usePathname()
  const consent = useAnalyticsConsent()

  // Nothing to ask when analytics is off, on staff pages, or once they've chosen.
  if (!MEASUREMENT_ID || isPrivatePath(pathname) || consent !== 'undecided') return null

  return (
    // Below `lg` the yellow "Order Now" bar (Navbar.tsx) is fixed to the bottom, so this sits above it.
    <div
      role="region"
      aria-label="Cookie choice"
      className="fixed inset-x-0 bottom-[calc(80px+env(safe-area-inset-bottom))] z-[100] flex justify-center px-4 sm:bottom-[calc(96px+env(safe-area-inset-bottom))] lg:bottom-6"
    >
      <div className="w-full max-w-lg rounded-2xl bg-black-900 p-5 text-white shadow-lg">
        <p className="text-sm leading-6">
          May we use Google Analytics cookies to count visits and see which pages people use? Nothing is used for
          ads. Read our{' '}
          <Link href="/privacy#cookies" className="underline underline-offset-2">
            Privacy Policy
          </Link>
          .
        </p>
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={() => setAnalyticsConsent('granted')}
            className="btn btn-sm flex-1 bg-brand-yellow text-black-900"
          >
            Accept
          </button>
          <button
            type="button"
            onClick={() => setAnalyticsConsent('denied')}
            className="btn btn-sm flex-1 border border-white text-white"
          >
            No Thanks
          </button>
        </div>
      </div>
    </div>
  )
}
