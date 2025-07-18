import Hero from '@/components/Hero'
import Features from '@/components/Features'
import Navigation from '@/components/Navigation'

export default function Home() {
  return (
    <div className="min-h-screen bg-base-100">
      <Navigation />
      <Hero />
      <Features />
    </div>
  )
}
