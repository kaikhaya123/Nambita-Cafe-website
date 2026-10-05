'use client'

// Footer link that brings the cookie banner back, so visitors can change their analytics choice.

import { setAnalyticsConsent } from '@/lib/analytics-consent'

export default function CookieSettingsButton({ className }: Readonly<{ className?: string }>) {
  return (
    <button type="button" onClick={() => setAnalyticsConsent('undecided')} className={className}>
      Cookie settings
    </button>
  )
}
