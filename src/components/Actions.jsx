import { useState } from 'react'

export default function Actions({ onCreated }) {
  const [script, setScript] = useState({ title: 'NRI Real-Estate Pitch', content: `Hi, this is the AI assistant calling on behalf of [Your Company].
We are helping NRIs invest in high-growth real estate projects in India with projected returns of 12-18%.
Would you like to hear a quick overview and schedule a call with our senior advisor?`, language: 'en-US' })
  const [campaign, setCampaign] = useState({ name: 'NRI Outreach - USA', target_states: ['CA', 'NY', 'TX'], nri_only: true })
  const [msg, setMsg] = useState('')
  const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

  const createScript = async () => {
    setMsg('Creating script...')
    const res = await fetch(`${baseUrl}/api/scripts`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(script) })
    const data = await res.json()
    if (!res.ok) return setMsg(data.detail || 'Failed to create script')
    setMsg('Script created')
    onCreated?.()
  }

  const createCampaign = async () => {
    setMsg('Creating campaign...')
    const res = await fetch(`${baseUrl}/api/campaigns`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(campaign) })
    const data = await res.json()
    if (!res.ok) return setMsg(data.detail || 'Failed to create campaign')
    setMsg('Campaign created')
    onCreated?.()
  }

  return (
    <section id="actions" className="relative">
      <div className="mx-auto max-w-7xl px-6 pb-16">
        <h2 className="text-white text-2xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-white">
            <h3 className="font-semibold mb-2">Create Script</h3>
            <input value={script.title} onChange={e=>setScript(s=>({...s, title:e.target.value}))} className="w-full mb-2 px-3 py-2 rounded bg-white/10 border border-white/10" />
            <textarea value={script.content} onChange={e=>setScript(s=>({...s, content:e.target.value}))} className="w-full h-32 mb-2 px-3 py-2 rounded bg-white/10 border border-white/10" />
            <button onClick={createScript} className="rounded bg-blue-500 hover:bg-blue-600 px-4 py-2 font-semibold">Save Script</button>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-white">
            <h3 className="font-semibold mb-2">Create Campaign</h3>
            <input value={campaign.name} onChange={e=>setCampaign(s=>({...s, name:e.target.value}))} className="w-full mb-2 px-3 py-2 rounded bg-white/10 border border-white/10" />
            <input value={campaign.target_states.join(', ')} onChange={e=>setCampaign(s=>({...s, target_states:e.target.value.split(',').map(x=>x.trim()).filter(Boolean)}))} className="w-full mb-2 px-3 py-2 rounded bg-white/10 border border-white/10" placeholder="States CSV e.g. CA, NY" />
            <div className="flex items-center gap-2 mb-2">
              <input id="nri_only" type="checkbox" checked={campaign.nri_only} onChange={e=>setCampaign(s=>({...s, nri_only:e.target.checked}))} className="accent-blue-500" />
              <label htmlFor="nri_only">NRI Only</label>
            </div>
            <button onClick={createCampaign} className="rounded bg-blue-500 hover:bg-blue-600 px-4 py-2 font-semibold">Save Campaign</button>
          </div>
        </div>
        {msg && <p className="mt-3 text-blue-200">{msg}</p>}
      </div>
    </section>
  )
}
