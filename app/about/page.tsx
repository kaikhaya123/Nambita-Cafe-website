'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import Footer from '@/components/layout/Footer'
import SectionDivider from '@/components/sections/SectionDivider'

const storyHighlights = [
  {
    image: '/Images/slaqa_salon_1771754613830.webp',
    alt: 'Barista preparing coffee at Nambita Cafe',
    copy:
      'From the first pour to the final cup, Nambita Cafe is built around simple quality, warm service, and a relaxed atmosphere that makes every visit feel easy and familiar.',
  },
  {
    video: '/Video/3812149606482491855_preview.mp4',
    alt: 'Guest enjoying refreshments at Nambita Cafe',
    copy:
      'Whether you stop in for coffee, smoothies, or a quick bite, our space is designed to bring people together for casual moments, fresh flavours, and an inviting cafe experience.',
  },
]

const pageEase = [0.22, 1, 0.36, 1] as const

export default function NambitaCafeAbout() {
  return (
    <div className="min-h-screen bg-[#3F6B3C] overflow-x-hidden [&_h1]:font-teko [&_h2]:font-teko [&_h3]:font-teko [&_h4]:font-teko [&_h5]:font-teko [&_h6]:font-teko">

      {/* HERO */}
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
            <h1 className="m-0 font-teko text-center text-[#FFFF00] uppercase leading-[1.08] tracking-[0.05em] text-[2.1rem] sm:text-5xl sm:tracking-[0.06em] md:text-6xl drop-shadow-[0_6px_18px_rgba(0,0,0,0.5)]">
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

      {/* ABOUT COPY */}
      <section className="relative overflow-hidden bg-[#FAF8F3] px-5 py-16 sm:px-8 md:px-10 md:py-24">
        <div className="relative mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7, ease: pageEase }}
            className="space-y-6 text-center"
          >
            <div>
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.65, ease: pageEase }}
              >
                <Image
                  src="/logo/NAMBITA Logo/NambitaL4.webp"
                  alt="Nambita Cafe logo"
                  width={224}
                  height={224}
                  className="mx-auto mb-6 h-auto w-40 object-contain [filter:brightness(0)_saturate(100%)] sm:w-44"
                  sizes="(max-width: 640px) 160px, 176px"
                />
              </motion.div>
              <h2 className="font-teko border-outline mb-4 text-[1.72rem] leading-tight uppercase tracking-[0.05em] text-[#111111] sm:text-4xl sm:tracking-[0.06em] md:text-5xl">
                About Nambita Cafe
              </h2>
              <p className="mx-auto max-w-2xl font-dm-sans text-[0.95rem] leading-7 text-black-900 sm:text-base sm:leading-8 md:text-lg">
                Nambita Cafe was created as a welcoming space for Slaqa Salon clients and the wider community to enjoy quality refreshments and casual bites in a relaxed setting. What began as a simple refreshment corner has grown into a full-service cafe with its own identity, serving freshly brewed coffee, fruit smoothies, toasted bites, pastries, and chilled drinks for people looking to unwind, grab a quick refresher, or enjoy a warm and inviting stop at our KwaMashu and Waterloo locations.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* STORY HIGHLIGHTS — clip-path wipe-up on images */}
      <section className="bg-[#FAF8F3] px-5 pb-16 sm:px-8 md:px-10 md:pb-24">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2 md:gap-10">
          {storyHighlights.map((item, index) => (
            <motion.article
              key={item.alt}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: index * 0.1 }}
              className="space-y-5"
            >
              <div className="relative aspect-[4/5] sm:aspect-[3/4] md:aspect-[2/3] overflow-hidden rounded-lg bg-[#3F6B3C]">
                {/* Clip-path wipe reveal */}
                <motion.div
                  className="absolute inset-0"
                  initial={{ clipPath: 'inset(0 0 100% 0)' }}
                  whileInView={{ clipPath: 'inset(0 0 0% 0)' }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.9, ease: pageEase, delay: 0.05 + index * 0.12 }}
                >
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.alt}
                      fill
                      sizes="100vw"
                      className="object-cover"
                    />
                  ) : (
                    <video
                      src={item.video}
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/30" />
                </motion.div>
              </div>
              <motion.p
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.55, ease: 'easeOut', delay: 0.2 + index * 0.1 }}
                className="max-w-[62ch] text-[0.95rem] leading-7 text-black-900 sm:text-base sm:leading-8 md:text-lg"
              >
                {item.copy}
              </motion.p>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="bg-white-900">
        <Footer />
      </section>
    </div>
  )
}
