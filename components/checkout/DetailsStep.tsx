'use client'

// Checkout step 1: name, phone, email, pickup branch and notes.

import { motion } from 'framer-motion'
import FieldGroup from '@/components/checkout/FieldGroup'
import StepHeader from '@/components/checkout/StepHeader'
import type { CustomerDetails } from '@/components/checkout/types'
import { cafeLocations } from '@/lib/cafe-locations'

const inputClassName =
  'rounded-xl border border-black/15 bg-white px-4 py-3 font-dm-sans text-sm text-black-900 outline-none focus:border-black-900'

export default function DetailsStep({
  details,
  isValid,
  onFieldChange,
  onContinue,
}: Readonly<{
  details: CustomerDetails
  isValid: boolean
  onFieldChange: (field: keyof CustomerDetails) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  onContinue: () => void
}>) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <StepHeader
        step="details"
        title="Your Details"
        subtitle="Tell us who's collecting and where you'll pick up."
      />

      <form
        className="mt-8 flex flex-col gap-6 rounded-3xl border border-black/10 bg-white p-6 shadow-sm sm:p-8"
        onSubmit={(event) => {
          event.preventDefault()
          if (isValid) onContinue()
        }}
      >
        <FieldGroup label="Contact Info">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="font-dm-sans text-xs uppercase tracking-[0.1em] text-black-900/70">Name</span>
              <input
                required
                value={details.firstName}
                onChange={onFieldChange('firstName')}
                className={inputClassName}
                placeholder="First name"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="font-dm-sans text-xs uppercase tracking-[0.1em] text-black-900/70">Surname</span>
              <input
                required
                value={details.lastName}
                onChange={onFieldChange('lastName')}
                className={inputClassName}
                placeholder="Last name"
              />
            </label>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="font-dm-sans text-xs uppercase tracking-[0.1em] text-black-900/70">Contact Number</span>
            <input
              required
              type="tel"
              value={details.phone}
              onChange={onFieldChange('phone')}
              className={inputClassName}
              placeholder="Phone number"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="font-dm-sans text-xs uppercase tracking-[0.1em] text-black-900/70">Email (optional)</span>
            <input
              type="email"
              value={details.email}
              onChange={onFieldChange('email')}
              className={inputClassName}
              placeholder="you@example.com"
            />
          </label>
        </FieldGroup>

        <FieldGroup label="Pickup Location">
          <div className="flex flex-col gap-2">
            {cafeLocations.map((location) => (
              <label
                key={location.id}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition-colors ${
                  details.pickupLocationId === location.id
                    ? 'border-black-900 bg-black-900/5'
                    : 'border-black/15 bg-white'
                }`}
              >
                <input
                  required
                  type="radio"
                  name="pickupLocationId"
                  value={location.id}
                  checked={details.pickupLocationId === location.id}
                  onChange={onFieldChange('pickupLocationId')}
                  className="mt-1 h-4 w-4 accent-black"
                />
                <span>
                  <span className="block font-dm-sans text-sm font-bold text-black-900">{location.name}</span>
                  <span className="block font-dm-sans text-xs text-black-900/70">
                    {location.addressLine1}, {location.addressLine2}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </FieldGroup>

        <FieldGroup label="Notes">
          <label className="flex flex-col gap-1.5">
            <span className="font-dm-sans text-xs uppercase tracking-[0.1em] text-black-900/70">Notes (optional)</span>
            <input
              value={details.notes}
              onChange={onFieldChange('notes')}
              className={inputClassName}
              placeholder="Gate code, allergies, etc."
            />
          </label>
        </FieldGroup>

        <button
          type="submit"
          disabled={!isValid}
          className="w-full rounded-full bg-black-900 py-4 font-teko font-bold uppercase tracking-[0.05em] text-xl text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          Continue to Review
        </button>
      </form>
    </motion.div>
  )
}
