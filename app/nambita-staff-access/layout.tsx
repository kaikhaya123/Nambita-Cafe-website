// Wrapper for the staff login pages. Hides them from search engines.

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Staff Login | Nambita Cafe',
  robots: { index: false, follow: false },
}

export default function StaffAccessLayout({ children }: { readonly children: React.ReactNode }) {
  return <div className="min-h-screen bg-brand-offwhite font-dm-sans text-black-900">{children}</div>
}
