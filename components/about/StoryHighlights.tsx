'use client'

// About page: two photo/video cards with short story captions. Edit `storyHighlights` to change them.

import Image from 'next/image'
import { motion } from 'framer-motion'
import { pageEase } from '@/lib/motion'

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

// Clip-path wipe-up reveal on each highlight's media.
export default function StoryHighlights() {
  return (
    <section className="bg-brand-offwhite px-5 pb-16 sm:px-8 md:px-10 md:pb-24">
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
            <div className="relative aspect-[4/5] sm:aspect-[3/4] md:aspect-[2/3] overflow-hidden rounded-lg bg-brand-green">
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
              className="max-w-[62ch] text-[0.95rem] leading-7 text-black-900 sm:text-base sm:leading-8"
            >
              {item.copy}
            </motion.p>
          </motion.article>
        ))}
      </div>
    </section>
  )
}
