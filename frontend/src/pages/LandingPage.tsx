import { useEffect } from 'react'
import { Hero } from '../components/landing/Hero'
import { HowItWorks } from '../components/landing/HowItWorks'
import { DemoPreview } from '../components/landing/DemoPreview'

export function LandingPage() {
  useEffect(() => {
    if (window.location.hash === '#how-it-works') {
      const el = document.getElementById('how-it-works')
      el?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [])

  return (
    <>
      <Hero />
      <HowItWorks />
      <DemoPreview />
    </>
  )
}
