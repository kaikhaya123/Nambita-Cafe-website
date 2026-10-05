// Tests the check that a Yoco payment matches the order before it's marked paid.

import { describe, expect, it } from 'vitest'
import { paymentMismatch } from './yoco-payment'

// Supabase returns money columns as text, e.g. "85.00".
const order = { total: '85.00', yoco_checkout_id: 'ch_123' }

describe('paymentMismatch', () => {
  it('accepts the exact amount in cents and rand', () => {
    expect(paymentMismatch({ amount: 8500, currency: 'ZAR', metadata: { checkoutId: 'ch_123' } }, order)).toBeNull()
  })

  it('accepts a payment without a checkout id', () => {
    expect(paymentMismatch({ amount: 8500, currency: 'ZAR' }, order)).toBeNull()
  })

  it('rejects a different amount', () => {
    expect(paymentMismatch({ amount: 100, currency: 'ZAR' }, order)).toMatch(/order total is 8500/)
  })

  it('rejects a missing amount', () => {
    expect(paymentMismatch({ currency: 'ZAR' }, order)).not.toBeNull()
  })

  it('rejects another currency', () => {
    expect(paymentMismatch({ amount: 8500, currency: 'USD' }, order)).toMatch(/currency/)
  })

  it("rejects another order's checkout", () => {
    expect(paymentMismatch({ amount: 8500, currency: 'ZAR', metadata: { checkoutId: 'ch_999' } }, order)).toMatch(/checkout/)
  })

  it('handles cents without rounding errors', () => {
    expect(paymentMismatch({ amount: 1999, currency: 'ZAR' }, { total: 19.99, yoco_checkout_id: null })).toBeNull()
  })
})
