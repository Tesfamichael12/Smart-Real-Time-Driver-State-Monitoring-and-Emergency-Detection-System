import { Play, FileText, ArrowRight } from 'lucide-react'

export default function FinalCTASection({ onOpenDashboard }: { onOpenDashboard: () => void }) {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/[0.02] rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          See the System <span className="text-gradient">Respond in Real Time</span>
        </h2>
        <p className="text-lg text-white/40 mb-10 max-w-2xl mx-auto">
          Watch the full system in action — from computer vision fatigue detection to embedded crash response and GSM/SOS alerting.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <button onClick={onOpenDashboard} className="btn-primary inline-flex items-center gap-2">
            <Play className="w-4 h-4" />
            Launch Dashboard
          </button>
          <a href="#architecture" className="btn-secondary inline-flex items-center gap-2">
            <FileText className="w-4 h-4" />
            View Architecture
          </a>
          <a href="#cv-module" className="btn-ghost inline-flex items-center gap-2 border border-white/10 rounded-xl px-6 py-3">
            Explore Technology
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  )
}
