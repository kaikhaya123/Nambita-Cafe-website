'use client'

// Cross-fades between several images every few seconds (used on menu carousel cards).

import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function FadingImage({
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
