'use client'

// Home page: full-screen video banner with the "#I Love Nambita" headline.

import Image from 'next/image'
import { motion } from 'framer-motion'
import { pageEase } from '@/lib/motion'

const heroShowcaseVideo = '/Video/Img 9659_preview.mp4'

// Calligraphy heart after the headline (public/Images/Heart-trimmed.png).
// Heart-trimmed.png is Heart.png with the empty space around the heart cut off, so the image
// box is exactly the heart. That lets it line up with the text: the heart's bottom loop sits on
// the same baseline as the letters, and its height is set in `em` so it scales with the text.
// The PNG is black line art; `brightness-0 invert` turns it white to match the headline.
function HandDrawnHeart() {
  return (
    <motion.span
      aria-hidden
      className="ml-[0.15em] inline-block align-baseline"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 14, delay: 0.6 }}
      style={{ transformOrigin: 'bottom center' }}
    >
      {/* Gentle heartbeat once it has popped in. Grows from the bottom so it stays on the baseline. */}
      <motion.span
        className="block"
        animate={{ scale: [1, 1.08, 1, 1.05, 1] }}
        transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 1.2, delay: 1.3, ease: 'easeInOut' }}
        style={{ transformOrigin: 'bottom center' }}
      >
        <Image
          src="/Images/Heart-trimmed.png"
          alt=""
          width={600}
          height={409}
          sizes="120px"
          priority
          className="block h-[0.8em] w-auto brightness-0 invert drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]"
        />
      </motion.span>
    </motion.span>
  )
}

export default function HomeHero() {
  return (
    <section className="hero-viewport-home relative w-full overflow-hidden bg-brand-yellow">
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-label="Nambita Cafe"
          className="absolute inset-0 h-full w-full object-cover object-center"
        >
          <source src={heroShowcaseVideo} type="video/mp4" />
        </video>
      </div>

      <div className="pointer-events-none absolute inset-0 z-10 bg-black" />

      <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-start justify-end px-5 pb-14 text-left sm:px-8 sm:pb-16 lg:px-12 lg:pb-20">
        {/* Brush-script font: no uppercase or letter-spacing, which would break up the script letters. */}
        <h2 className="m-0 font-lucy font-normal text-white leading-[1.08] text-[2.25rem] drop-shadow-[0_6px_18px_rgba(0,0,0,0.5)] sm:text-5xl md:text-6xl">
          {['#I', 'Love', 'Nambita '].map((word, i) => (
            <span key={word} className="inline-block overflow-hidden">
              <motion.span
                className="inline-block"
                initial={{ y: '110%' }}
                animate={{ y: 0 }}
                transition={{ duration: 0.78, ease: pageEase, delay: 0.12 + i * 0.14 }}
              >
                {word}
                {i < 2 ? ' ' : ''}
              </motion.span>
            </span>
          ))}
          <HandDrawnHeart />
        </h2>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-8 z-20 hidden justify-center lg:flex">
        <motion.svg
          width="30"
          height="30"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-white drop-shadow-md"
          animate={{ y: [0, 7, 0], opacity: [0.65, 1, 0.65] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <polyline points="6 9 12 15 18 9" />
        </motion.svg>
      </div>
    </section>
  )
}
