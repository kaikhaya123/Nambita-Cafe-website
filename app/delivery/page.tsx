'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Footer from '@/components/layout/Footer'

type QuoteState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; locationName: string; distanceKm: number; fee: number }
  | { status: 'error'; message: string }

const pageEase = [0.22, 1, 0.36, 1] as const

export default function NambitaCafeDeliveryPage() {
  const [address, setAddress] = useState('')
  const [quote, setQuote] = useState<QuoteState>({ status: 'idle' })

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = address.trim()
    if (!trimmed) return

    setQuote({ status: 'loading' })

    try {
      const response = await fetch('/api/delivery-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: trimmed }),
      })
      const data = await response.json()

      if (!response.ok) {
        setQuote({ status: 'error', message: data.error ?? 'Something went wrong. Please try again.' })
        return
      }

      setQuote({ status: 'success', locationName: data.locationName, distanceKm: data.distanceKm, fee: data.fee })
    } catch {
      setQuote({ status: 'error', message: 'Something went wrong. Please try again.' })
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF8F3] [&_h1]:font-teko [&_h2]:font-teko [&_h3]:font-teko">
      <div className="flex items-center justify-center bg-black-900 px-5 py-5 sm:px-8">
        <h1 className="font-teko text-xl uppercase tracking-[0.05em] text-white sm:text-2xl">Delivery Pricing</h1>
      </div>

      <div className="mx-auto max-w-2xl px-5 py-10 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: pageEase }}
          className="text-center"
        >
          <h2 className="font-teko text-2xl uppercase tracking-[0.03em] text-black-900">Get an Instant Delivery Quote</h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-black-900/70">
            Enter your address and we&apos;ll calculate your driving distance from the nearest Nambita Cafe and quote your delivery fee.
          </p>
        </motion.div>

        <form
          onSubmit={handleSubmit}
          className="mx-auto mt-8 flex max-w-2xl items-center gap-3 rounded-full border border-black/15 px-5 py-3"
        >
          <input
            type="text"
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            placeholder="Your Address"
            aria-label="Delivery address"
            className="w-full bg-transparent text-sm text-black-900 placeholder:text-black-900/40 focus:outline-none"
          />
          <button
            type="submit"
            disabled={quote.status === 'loading' || !address.trim()}
            className="shrink-0 rounded-full bg-[#3F6B3C] px-5 py-2 font-hagrid text-xs uppercase tracking-[0.08em] text-white transition-colors duration-200 hover:bg-[#C98A2B] disabled:opacity-60"
          >
            {quote.status === 'loading' ? 'Calculating…' : 'Get Quote'}
          </button>
        </form>

        <div className="mt-8">
          {quote.status === 'error' && (
            <p className="rounded-2xl border border-[#C98A2B]/40 bg-[#F4EFD8] p-5 text-center text-sm font-bold uppercase tracking-[0.04em] text-[#C98A2B]">
              {quote.message}
            </p>
          )}

          {quote.status === 'success' && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: pageEase }}
              className="rounded-2xl border border-black/10 bg-[#F4EFD8] p-6 text-center"
            >
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-black-900/60">Delivering from</p>
              <h3 className="mt-1 font-teko text-lg uppercase tracking-[0.03em] text-black-900">{quote.locationName}</h3>
              <p className="mt-3 text-sm text-black-900/70">{quote.distanceKm} km away</p>
              <p className="mt-4 font-hagrid text-3xl text-[#3F6B3C]">R{quote.fee}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.06em] text-black-900/50">Estimated delivery fee</p>
            </motion.div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}
