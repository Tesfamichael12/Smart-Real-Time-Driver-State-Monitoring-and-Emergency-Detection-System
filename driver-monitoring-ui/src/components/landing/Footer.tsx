import { Shield, Github } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="relative border-t border-white/5 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-5 h-5 text-white/60" />
              <span className="font-bold">SafeDrive Guardian</span>
            </div>
            <p className="text-xs text-white/30 leading-relaxed max-w-xs">
              Smart Real-Time Driver State Monitoring and Emergency Detection System.
              Academic project — Embedded Systems, 2025/26.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-3">Technologies</h4>
            <div className="flex flex-wrap gap-2">
              {['OpenCV', 'MediaPipe', 'React', 'TypeScript', 'Tailwind CSS', 'ESP32', 'MPU6050', 'GPS', 'GSM', 'Wokwi'].map(tech => (
                <span key={tech} className="text-[10px] px-2 py-1 rounded bg-white/5 text-white/40 border border-white/5">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-3">Links</h4>
            <div className="space-y-2 text-xs">
              <a href="#overview" className="block text-white/30 hover:text-white/60 transition-colors">Overview</a>
              <a href="#architecture" className="block text-white/30 hover:text-white/60 transition-colors">Architecture</a>
              <a href="#cv-module" className="block text-white/30 hover:text-white/60 transition-colors">Computer Vision</a>
              <a href="#embedded" className="block text-white/30 hover:text-white/60 transition-colors">Embedded System</a>
              <a href="#team" className="block text-white/30 hover:text-white/60 transition-colors">Team</a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] text-white/20">
            © 2025/26 · Addis Ababa Science and Technology University · College of Engineering · Software Engineering
          </p>
          <p className="text-[10px] text-white/15 max-w-lg text-center">
            This prototype is an assistive safety demonstration and not a certified automotive safety product.
            All data shown is simulated for demonstration purposes.
          </p>
        </div>
      </div>
    </footer>
  )
}
