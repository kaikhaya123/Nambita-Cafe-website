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
// It stays still (no pulsing) so it reads as part of the hashtag.
function HandDrawnHeart() {
  return (
    <Image
      src="/Images/Heart-trimmed.png"
      alt=""
      aria-hidden
      width={600}
      height={409}
      sizes="80px"
      priority
      className="ml-[0.08em] inline-block h-[0.8em] w-auto align-baseline brightness-0 invert"
    />
  )
}

export default function HomeHero() {
  return (
    <section className="hero-viewport-home relative w-full overflow-hidden bg-brand-yellow">
      {/* The page's main heading, for Google and screen readers (hidden on screen, sr-only). */}
      <h1 className="sr-only">Nambita Cafe: wings, wors rolls and coffee in KwaMashu and Waterloo, Durban</h1>
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

      {/* Dark fade behind the white headline at the bottom, so it stays readable over bright video frames. */}
      <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-black-900/75 via-black-900/25 to-transparent" />

      {/* Bottom padding is larger below `lg` because the yellow "Order Now" bar (Navbar.tsx) is fixed to the
          bottom of the screen there and covers the lower part of the hero. This keeps the headline well above it. */}
      <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-start justify-end px-5 pb-32 text-left sm:px-8 sm:pb-36 lg:px-12 lg:pb-20">
        {/* Brush-script font: no uppercase or letter-spacing, which would break up the script letters.
            The hashtag is one word with the heart attached (`whitespace-nowrap` keeps them on the same line),
            and it fades up as a single piece so the script letters are never clipped.
            Size: `clamp(smallest, grows with screen width, largest)`. The hashtag + heart is about 6.5× the
            font size wide, so 9vw makes it fill ~60% of a phone screen, and 5.5rem (88px) caps it on desktop.
            The heart is sized in `em`, so it shrinks and grows with the text. */}
        <motion.h2
          className="m-0 whitespace-nowrap font-script font-normal leading-[1.1] text-white text-[clamp(2rem,9vw,5.5rem)] drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.78, ease: pageEase, delay: 0.12 }}
        >
          #ILoveNambita
          <HandDrawnHeart />
        </motion.h2>
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
