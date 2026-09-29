'use client'

// Home page: sideways-scrolling yellow cards that preview menu favourites. Edit `menuGridItems` to change them.

import Image from 'next/image'
import Link from 'next/link'
import { useRef } from 'react'
import FadingImage from '@/components/home/FadingImage'

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

export default function MenuCarousel() {
  const menuCarouselRef = useRef<HTMLDivElement | null>(null)

  const scrollMenuCarousel = (direction: 'left' | 'right') => {
    const node = menuCarouselRef.current
    if (!node) return
    node.scrollBy({ left: direction === 'left' ? -320 : 320, behavior: 'smooth' })
  }

  return (
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
              className="group relative z-0 flex h-[390px] w-[240px] shrink-0 snap-start flex-col overflow-hidden rounded-2xl bg-brand-yellow p-6 pb-6 transition-all duration-300 hover:z-10 hover:scale-105 hover:bg- sm:h-[470px] sm:w-[280px]"
            >
              <h3 className="h-14 font-teko font-uppercase text-2xl uppercase leading-tight tracking-[0.01em] text-black-900 transition-colors duration-300 group-hover:text-black-900 sm:h-16">
                {item.title}
              </h3>
              <div className="relative mx-auto mt-6 h-44 w-44 sm:h-56 sm:w-56">
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
                className="relative z-10 mx-auto mt-auto flex h-10 min-h-10 items-center gap-2 font-teko font-bold uppercase tracking-[0.05em] text-lg text-black-900 opacity-100 transition-opacity duration-300 lg:opacity-0 lg:group-hover:opacity-100"
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
  )
}
