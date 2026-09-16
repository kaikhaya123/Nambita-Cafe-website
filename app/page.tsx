'use client'

import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import Footer from '@/components/layout/Footer'

const menuGridItems = [
  {
    Image: '/Images/Remove Logo from Image-Photoroom-trim.png',
    ImageAlt: 'Classic Combo',
    title: 'Classic Combo',
    desc: 'Toasted favourites and filling bites for clients waiting nearby and locals stopping in hungry.',
  },
  {
    Image: '/Images/Wings_Combo-trim.png',
    ImageAlt: 'Wings Combo',
    title: 'Wings Combo',
    desc: 'Cafe-style coffee served all day for waiting clients and casual local visits.',
  },
  {
    Image: '/Images/ChatGPT Image Jul 13, 2026, 04_26_07 PM-Photoroom.png',
    Images: [
      '/Images/Muffins-Photoroom',
    ],
    ImageAlt: 'Iced Coffee',
    title: 'Iced Coffee',
    desc: 'Daily baked treats that pair well with coffee or hot chocolate.',
  },
  {
    Image: '/Images/Untitled design-Photoroom-trim.png',
    images: [
      '/Images/Untitled design-Photoroom-trim.png',
      '/Images/IMG_2116-Photoroom-trim.png',
    ],
    ImageAlt: 'Smoothies',
    title: 'SMOOTHIES',
    desc: 'Cold fruit blends made for warm Durban afternoons.',
  },
  {
    Image: '/Images/pngegg.png',
    ImageAlt: 'Fried Chips',
    title: 'Fried Chips',
    desc: 'Chilled options over ice when you need a quick cool-down.',
  },
  {
    Image: '/Images/Wings-Photoroom-trim.png',
    ImageAlt: 'Chicken Wings',
    title: 'Wings',
    desc: 'Easy snack options for clients in the area and locals passing through.',
  },
] as const

const aboutFilmstripImages = [
  '/Images/Image-nambita.jpg',
  '/Images/710585744_18364618711233342_2743655767556918703_n.jpg',
  '/Images/Plater for 2.jpeg',
  '/Images/nambitacafe_1776619960157.webp',
  '/Images/slaqa_salon_1776620029550.jpeg',
  '/Images/slaqa_salon_1776794135346.webp',
  '/Images/slaqa_salon_1776620026853.webp',
  '/Images/751668292_18371379598233342_6040821482744936655_n.jpg',
] as const

const pageEase = [0.22, 1, 0.36, 1] as const
const hoverEase = [0.4, 0, 0.2, 1] as const
const motionSettings = {
  slow: { duration: 1, ease: pageEase },
  medium: { duration: 0.95, ease: pageEase },
  quick: { duration: 0.8, ease: pageEase },
  hover: { duration: 0.35, ease: hoverEase },
}

function FadingImage({
  images,
  alt,
  className,
}: Readonly<{
  images: ReadonlyArray<string>
  alt: string
  className: string
}>) {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    if (images.length <= 1) return
    const id = setInterval(() => {
      setActiveIndex((current) => (current + 1) % images.length)
    }, 2800)
    return () => clearInterval(id)
  }, [images.length])

  return (
    <div className={`relative ${className}`}>
      <AnimatePresence>
        <motion.div
          key={images[activeIndex]}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          <Image src={images[activeIndex]} alt={alt} fill className="object-contain object-bottom" />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

const heroShowcaseVideo = '/Video/Img 9659_preview.mp4'

export default function NambitaCafe() {
  const menuCarouselRef = useRef<HTMLDivElement | null>(null)

  const scrollMenuCarousel = (direction: 'left' | 'right') => {
    const node = menuCarouselRef.current
    if (!node) return
    node.scrollBy({ left: direction === 'left' ? -320 : 320, behavior: 'smooth' })
  }

  return (
    <div className="relative min-h-screen bg-[#FAF8F3] overflow-x-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <Image
          src="/Images/groovy-coffee-mascot-characters-collection/7a94821c-5908-4105-84ae-5461799e7da5.webp"
          alt="Nambita Cafe background"
          fill
          className="object-cover object-center opacity-10"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[#FAF8F3]" />
      </div>

      <section className="hero-viewport-home relative w-full overflow-hidden bg-[#FFFF00]">
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

        <div className="pointer-events-none absolute inset-0 z-10 bg-black/30" />

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

      <section className="relative overflow-hidden bg-black py-14 sm:py-20">
        <div className="relative mx-auto max-w-[1600px] px-10 sm:px-16">
          <button
            type="button"
            onClick={() => scrollMenuCarousel('left')}
            aria-label="Previous menu items"
            className="absolute left-0 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-center text-white transition-opacity duration-200 hover:opacity-60 sm:flex"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => scrollMenuCarousel('right')}
            aria-label="Next menu items"
            className="absolute right-0 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-center text-white transition-opacity duration-200 hover:opacity-60 sm:flex"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          <div
            ref={menuCarouselRef}
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth py-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {menuGridItems.map((item) => (
              <div
                key={item.title}
                className="group relative z-0 flex h-[390px] w-[240px] shrink-0 snap-start flex-col overflow-hidden rounded-2xl bg-[#FFFF00] p-6 pb-6 transition-all duration-300 hover:z-10 hover:scale-105 hover:bg- sm:h-[470px] sm:w-[280px]"
              >
                <h3 className="h-14 font-teko font-uppercase text-2xl uppercase leading-tight tracking-[0.01em] text-black-900 transition-colors duration-300 group-hover:text-black-900 sm:h-16 sm:text-[1.75rem]">
                  {item.title}
                </h3>
                <div className="relative mx-auto mt-6 h-44 w-44 sm:h-56 sm:w-56">
                  <div className="pointer-events-none absolute bottom-1 left-1/2 h-4 w-3/4 -translate-x-1/2 rounded-[50%] bg-black-900 blur-md" />
                  {'images' in item ? (
                    <FadingImage
                      images={item.images}
                      alt={item.ImageAlt}
                      className="relative h-full w-full"
                    />
                  ) : (
                    <Image
                      src={item.Image}
                      alt={item.ImageAlt}
                      width={200}
                      height={200}
                      className="relative h-full w-full object-contain object-bottom"
                      loading="lazy"
                    />
                  )}
                </div>
                <Link
                  href="/menu"
                  className="relative z-10 mx-auto mt-auto flex h-10 min-h-10 items-center gap-2 font-dm-sans font-bold text-sm uppercase tracking-[0.1em] text-black-900 opacity-100 transition-opacity duration-300 lg:opacity-0 lg:group-hover:opacity-100"
                >
                  Order Now
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-black-900 text-white py-16 sm:py-20">
        <div className="relative container mx-auto px-5 sm:px-6 md:px-8">
          <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-start">
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={motionSettings.medium}
              className="max-w-3xl text-left"
            >
              <h1 className="mt-0 text-3xl font-teko uppercase tracking-[0.01em] text-white sm:text-4xl md:text-5xl">
                {['THE', 'CAFE', 'THAT', 'GREW', 'AROUND', 'THE', 'ROOTS', 'OF', 'SLAQA', 'SALON.'].map((word, wi, words) => {
                  const charOffset = words.slice(0, wi).reduce((sum, w) => sum + w.length + 1, 0)
                  return (
                    <span key={`${word}-${wi}`} className="inline-block whitespace-nowrap">
                      {word.split('').map((char, ci) => (
                        <motion.span
                          key={`${char}-${ci}`}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, amount: 1 }}
                          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: (charOffset + ci) * 0.025 }}
                          className="inline-block"
                        >
                          {char}
                        </motion.span>
                      ))}
                      {wi < words.length - 1 && <span className="inline-block w-[0.3em]" />}
                    </span>
                  )
                })}
              </h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ ...motionSettings.medium, delay: 0.1 }}
              className="max-w-2xl text-left md:text-right md:ml-auto flex flex-col items-start md:items-end justify-start"
            >
              <p className="font-dm-sans text-base leading-7 text-white sm:text-lg">
                Nambita Cafe serves coffee, smoothies, toasted bites, pastries and chilled drinks for salon guests and the neighbourhood alike. Learn more about the cafe&apos;s story, roots, and menu on the about page.
              </p>
              <div className="mt-8 flex justify-start md:justify-end w-full">
                <motion.a
                  href="/about"
                  whileHover={{ y: -2, scale: 1.02 }}
                  className="group relative z-10 inline-flex items-center justify-center gap-3 overflow-hidden rounded-full border-2 border-transparent bg-[#111111] px-6 py-3 text-lg font-semibold uppercase text-white shadow-xl transition duration-200 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-black-900"
                >
                  <span className="relative font-city-bold z-10 leading-none transition-colors duration-700 group-hover:text-white">About Nambita Cafe</span>
                  <svg
                    className="relative z-10 h-8 w-8 rotate-45 rounded-full border border-black-900 bg-white p-2 transition duration-300 ease-linear group-hover:border-none group-hover:rotate-90"
                    viewBox="0 0 16 19"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M7 18C7 18.5523 7.44772 19 8 19C8.55228 19 9 18.5523 9 18H7ZM8.70711 0.292893C8.31658 -0.0976311 7.68342 -0.0976311 7.29289 0.292893L0.928932 6.65685C0.538408 7.04738 0.538408 7.68054 0.928932 8.07107C1.31946 8.46159 1.95262 8.46159 2.34315 8.07107L8 2.41421L13.6569 8.07107C14.0474 8.46159 14.6805 8.46159 15.0711 8.07107C15.4616 7.68054 15.4616 7.04738 15.0711 6.65685L8.70711 0.292893ZM9 18L9 1H7L7 18H9Z"
                      className="fill-black-900"
                    />
                  </svg>
                  <span className="pointer-events-none absolute inset-0 -left-full h-full w-full rounded-full bg-white transition-all duration-700 group-hover:left-0 group-hover:scale-150" />
                </motion.a>
              </div>
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ ...motionSettings.slow, delay: 0.08 }}
          className="mt-10 w-full overflow-hidden border-t border-black-900 bg-black/5 sm:mt-14"
        >
          <div className="h-[360px] w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)] sm:h-[500px]">
            <div className="animate-marquee-strip flex h-full w-max gap-3 sm:gap-4">
              {[...aboutFilmstripImages, ...aboutFilmstripImages].map((src, index) => (
                <div key={`${src}-${index}`} className="relative h-full w-[240px] shrink-0 sm:w-[380px]">
                  <Image
                    src={src}
                    alt="Nambita Cafe atmosphere"
                    fill
                    className="object-cover"
                    sizes="(min-width: 640px) 380px, 240px"
                  />
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  )
}
