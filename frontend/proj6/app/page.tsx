import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { HeroSection } from "@/components/hero-section"
import { HowItWorks } from "@/components/how-it-works"
export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  )
}
