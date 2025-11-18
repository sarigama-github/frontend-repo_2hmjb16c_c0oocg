import Spline from '@splinetool/react-spline'

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Background gradient aura */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-orange-400/10 pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-6 pt-16 pb-8 sm:pt-20">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80 backdrop-blur">
              AI Voice Agent for Real Estate
            </div>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Automate NRI outreach, qualify interest, and book meetings
            </h1>
            <p className="mt-4 text-lg text-blue-100/90">
              Upload leads, run a campaign, and let the AI call prospects, pitch your projects, capture interest, and schedule callbacks or meetings with your senior advisors.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#actions" className="rounded-lg bg-blue-500 px-5 py-2.5 text-white font-semibold hover:bg-blue-600 transition-colors">Get Started</a>
              <a href="#leads" className="rounded-lg bg-white/10 px-5 py-2.5 text-white hover:bg-white/20 transition-colors">View Leads</a>
            </div>
          </div>
          <div className="h-[360px] rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
            <Spline scene="https://prod.spline.design/4cHQr84zOGAHOehh/scene.splinecode" style={{ width: '100%', height: '100%' }} />
          </div>
        </div>
      </div>
    </section>
  )
}
