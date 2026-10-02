// Wrapper for the checkout pages (/checkout and /checkout/success). Keeps them out of search results:
// they only make sense with a cart or an order number.

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Checkout | Nambita Cafe',
  robots: { index: false, follow: true },
}

export default function CheckoutLayout({ children }: { readonly children: React.ReactNode }) {
  return children
}
