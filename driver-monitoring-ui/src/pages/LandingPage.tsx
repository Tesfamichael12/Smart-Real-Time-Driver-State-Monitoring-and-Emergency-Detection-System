import Navbar from '../components/landing/Navbar'
import Hero from '../components/landing/Hero'
import ProblemSection from '../components/landing/ProblemSection'
import SolutionSection from '../components/landing/SolutionSection'
import ArchitectureSection from '../components/landing/ArchitectureSection'
import CVModuleSection from '../components/landing/CVModuleSection'
import EmbeddedSection from '../components/landing/EmbeddedSection'
import StateMachineSection from '../components/landing/StateMachineSection'
import DemoPreview from '../components/landing/DemoPreview'
import TestingSection from '../components/landing/TestingSection'
import ImpactSection from '../components/landing/ImpactSection'
import TeamSection from '../components/landing/TeamSection'
import FinalCTASection from '../components/landing/FinalCTASection'
import Footer from '../components/landing/Footer'

interface LandingPageProps {
  onOpenDashboard: () => void
}

export default function LandingPage({ onOpenDashboard }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar onOpenDashboard={onOpenDashboard} />
      <Hero onOpenDashboard={onOpenDashboard} />
      <ProblemSection />
      <SolutionSection />
      <ArchitectureSection />
      <CVModuleSection />
      <EmbeddedSection />
      <StateMachineSection />
      <DemoPreview onOpenDashboard={onOpenDashboard} />
      <TestingSection />
      <ImpactSection />
      <TeamSection />
      <FinalCTASection onOpenDashboard={onOpenDashboard} />
      <Footer />
    </div>
  )
}
