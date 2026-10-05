// About page (URL: /about). Sections live in components/about.

import Footer from '@/components/layout/Footer'
import AboutHero from '@/components/about/AboutHero'
import AboutIntro from '@/components/about/AboutIntro'
import StoryHighlights from '@/components/about/StoryHighlights'

export default function NambitaCafeAbout() {
  return (
    <div className="min-h-screen bg-brand-green overflow-x-hidden [&_h1]:font-teko [&_h2]:font-teko [&_h3]:font-teko [&_h4]:font-teko [&_h5]:font-teko [&_h6]:font-teko">
      <AboutHero />
      <AboutIntro />
      <StoryHighlights />

      <section className="bg-[#000000]">
        <Footer />
      </section>
    </div>
  )
}
