import { useEffect, useState } from 'react'

function Tag({ text, color = 'blue' }) {
  return <span className={`inline-flex items-center rounded-full bg-${color}-500/20 text-${color}-300 text-xs px-2 py-0.5`}>{text}</span>
}

export default function Dashboard() {
  const [leads, setLeads] = useState([])
  const [scripts, setScripts] = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)

  const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [leadsRes, scriptsRes, campaignsRes] = await Promise.all([
        fetch(`${baseUrl}/api/leads`).then(r => r.json()),
        fetch(`${baseUrl}/api/scripts`).then(r => r.json()),
        fetch(`${baseUrl}/api/campaigns`).then(r => r.json()),
      ])
      setLeads(leadsRes)
      setScripts(scriptsRes)
      setCampaigns(campaignsRes)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  const startCampaign = async (id) => {
    await fetch(`${baseUrl}/api/campaigns/${id}/start`, { method: 'POST' })
    fetchAll()
  }

  const pauseCampaign = async (id) => {
    await fetch(`${baseUrl}/api/campaigns/${id}/pause`, { method: 'POST' })
    fetchAll()
  }

  return (
    <section id="leads" className="relative">
      <div className="mx-auto max-w-7xl px-6 pb-16">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white text-2xl font-semibold">Leads</h2>
          <button onClick={fetchAll} className="text-sm text-white/80 hover:text-white">Refresh</button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {loading && <p className="text-blue-200">Loading...</p>}
          {!loading && leads.length === 0 && <p className="text-blue-200">No leads yet.</p>}
          {leads.map(l => (
            <div key={l.id} className="rounded-xl border border-white/10 bg-white/5 p-4 text-white">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{l.full_name}</h3>
                <Tag text={l.status} />
              </div>
              <p className="text-sm text-blue-200 mt-1">{l.phone} {l.state ? `• ${l.state}` : ''}</p>
              {l.notes && <p className="text-xs text-blue-200/80 mt-2">{l.notes}</p>}
            </div>
          ))}
        </div>

        <div className="mt-10">
          <h2 className="text-white text-2xl font-semibold mb-3">Campaigns</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {campaigns.map(c => (
              <div key={c.id} className="rounded-xl border border-white/10 bg-white/5 p-4 text-white">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{c.name}</h3>
                  <Tag text={c.status} color={c.status === 'running' ? 'green' : 'yellow'} />
                </div>
                {c.target_states && c.target_states.length > 0 && (
                  <p className="text-sm text-blue-200 mt-1">States: {c.target_states.join(', ')}</p>
                )}
                <div className="mt-3 flex gap-2">
                  {c.status !== 'running' ? (
                    <button onClick={() => startCampaign(c.id)} className="rounded bg-green-500/80 hover:bg-green-500 px-3 py-1 text-sm">Start</button>
                  ) : (
                    <button onClick={() => pauseCampaign(c.id)} className="rounded bg-yellow-500/80 hover:bg-yellow-500 px-3 py-1 text-sm">Pause</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
