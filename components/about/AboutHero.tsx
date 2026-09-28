'use client'

// About page: top banner with the "About Us" title.

import Image from 'next/image'
import { motion } from 'framer-motion'
import SectionDivider from '@/components/shared/SectionDivider'
import { pageEase } from '@/lib/motion'

export default function AboutHero() {
  return (
    <section className="hero-viewport-page relative overflow-hidden">
      <Image
        src="/Images/fe7b20aa-6c03-4e02-aa92-2129c8aa3dcc.jpg"
        alt="Nambita Cafe About Banner"
        fill
        className="object-cover object-center"
        sizes="100vw"
        priority
      />
      <div
        className="absolute inset-0 z-10"
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.58) 45%, rgba(0,0,0,0.68) 100%)' }}
      />
      <div className="relative z-20 flex h-full flex-col items-center justify-center px-4 text-center sm:px-8 lg:px-12">
        <div className="max-w-4xl">
          {/* Word-split line-mask reveal */}
          <h1 className="m-0 font-teko text-center text-brand-yellow uppercase leading-[1.08] tracking-[0.05em] text-[2.1rem] sm:text-5xl sm:tracking-[0.06em] md:text-6xl drop-shadow-[0_6px_18px_rgba(0,0,0,0.5)]">
            {'About Us'.split(' ').map((word, i) => (
              <span key={i} className="inline-block overflow-hidden">
                <motion.span
                  className="inline-block"
                  initial={{ y: '110%' }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.78, ease: pageEase, delay: 0.12 + i * 0.14 }}
                >
                  {word}{i < 1 ? ' ' : ''}
                </motion.span>
              </span>
            ))}
          </h1>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: 'easeOut', delay: 0.46 }}
            className="mx-auto mt-4 max-w-2xl font-sans text-[0.95rem] leading-6 text-white font-bold sm:text-lg sm:leading-relaxed"
          >
            Welcome to Nambita Cafe, where every cup tells a story.
          </motion.p>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-30">
        <SectionDivider />
      </div>
    </section>
  )
}
