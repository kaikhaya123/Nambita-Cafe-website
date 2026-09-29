'use client'

// Home page: "The cafe that grew around the roots of Slaqa Salon" section with the scrolling photo strip.

import Image from 'next/image'
import { motion } from 'framer-motion'
import { motionSettings } from '@/lib/motion'

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

export default function AboutTeaser() {
  return (
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
            <h1 className="mt-0 text-3xl font-teko uppercase tracking-[0.01em] text-white sm:text-4xl">
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
            <p className="font-sans text-base leading-7 text-white sm:text-lg">
              Nambita Cafe serves coffee, smoothies, toasted bites, pastries and chilled drinks for salon guests and the neighbourhood alike. Learn more about the cafe&apos;s story, roots, and menu on the about page.
            </p>
            <div className="mt-8 flex justify-start md:justify-end w-full">
              <motion.a
                href="/about"
                whileHover={{ y: -2, scale: 1.02 }}
                className="btn group relative z-10 gap-3 bg-white pr-2 text-black-900 shadow-xl transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-black-900"
              >
                <span className="relative">About Nambita Cafe</span>
                <svg
                  className="relative h-8 w-8 rotate-45 rounded-full border border-black-900 bg-white p-2 transition duration-300 ease-linear group-hover:rotate-90"
                  viewBox="0 0 16 19"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M7 18C7 18.5523 7.44772 19 8 19C8.55228 19 9 18.5523 9 18H7ZM8.70711 0.292893C8.31658 -0.0976311 7.68342 -0.0976311 7.29289 0.292893L0.928932 6.65685C0.538408 7.04738 0.538408 7.68054 0.928932 8.07107C1.31946 8.46159 1.95262 8.46159 2.34315 8.07107L8 2.41421L13.6569 8.07107C14.0474 8.46159 14.6805 8.46159 15.0711 8.07107C15.4616 7.68054 15.4616 7.04738 15.0711 6.65685L8.70711 0.292893ZM9 18L9 1H7L7 18H9Z"
                    className="fill-black-900"
                  />
                </svg>
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
  )
}
