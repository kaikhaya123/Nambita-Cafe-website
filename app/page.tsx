// Home page (URL: /). Just puts the home sections in order; each section lives in components/home.

import Image from 'next/image'
import Footer from '@/components/layout/Footer'
import HomeHero from '@/components/home/Hero'
import MenuCarousel from '@/components/home/MenuCarousel'
import AboutTeaser from '@/components/home/About'

export default function NambitaCafe() {
  return (
    <div className="relative min-h-screen bg-brand-offwhite overflow-x-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <Image
          src="/Images/groovy-coffee-mascot-characters-collection/7a94821c-5908-4105-84ae-5461799e7da5.webp"
          alt="Nambita Cafe background"
          fill
          className="object-cover object-center opacity-10"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-brand-offwhite" />
      </div>

      <HomeHero />
      <MenuCarousel />
      <AboutTeaser />

      <Footer />
    </div>
  )
}
