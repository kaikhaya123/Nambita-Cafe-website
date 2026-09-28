// Shared types for the checkout steps.

export type Step = 'details' | 'review' | 'processing'

export interface CustomerDetails {
  firstName: string
  lastName: string
  phone: string
  email: string
  pickupLocationId: string
  notes: string
}

export const emptyDetails: CustomerDetails = {
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  pickupLocationId: '',
  notes: '',
}
