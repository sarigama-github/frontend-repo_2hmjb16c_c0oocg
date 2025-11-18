import Hero from './components/Hero'
import LeadForm from './components/LeadForm'
import Dashboard from './components/Dashboard'
import Actions from './components/Actions'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Top nav */}
      <header className="sticky top-0 z-10 backdrop-blur bg-slate-900/50 border-b border-white/10">
        <div className="mx-auto max-w-7xl px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 via-blue-500 to-orange-400" />
            <span className="font-semibold">Real Estate Voice Agent</span>
          </div>
          <nav className="hidden sm:flex gap-6 text-sm text-white/80">
            <a href="#actions" className="hover:text-white">Actions</a>
            <a href="#leads" className="hover:text-white">Leads</a>
          </nav>
        </div>
      </header>

      <Hero />

      <main className="relative">
        <div className="mx-auto max-w-7xl px-6 pb-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2">
              <Actions onCreated={() => {}} />
              <Dashboard />
            </div>
            <div className="md:col-span-1">
              <h2 className="text-white text-2xl font-semibold mb-3">Add Lead</h2>
              <LeadForm onCreated={() => {}} />
            </div>
          </div>
        </div>
      </main>

      <footer className="py-10 text-center text-white/50 text-sm">
        Built with an AI calling agent workflow: upload leads → run campaign → auto calls → qualify → schedule meeting.
      </footer>
    </div>
  )
}

export default App
