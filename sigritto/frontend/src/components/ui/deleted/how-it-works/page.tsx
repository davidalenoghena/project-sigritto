import HowItWorksHero from "@/components/how-it-works-hero"
import FeatureSection from "@/components/feature-section"
import ProcessFlow from "@/components/process-flow"
import FAQSection from "@/components/faq-section"
import CTASection from "@/components/cta-section"

export default function HowItWorks() {
    return (
        <main className="min-h-screen bg-black/[0.96] antialiased bg-grid-white/[0.02]">
            <HowItWorksHero />
            <FeatureSection />
            <ProcessFlow />
            <FAQSection />
            <CTASection />
        </main>
    )
}

