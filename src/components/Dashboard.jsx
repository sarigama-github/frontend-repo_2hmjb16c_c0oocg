import { useEffect, useMemo, useState } from 'react'

function Tag({ text, color = 'blue' }) {
  // Note: Using a limited set of colors to keep Tailwind happy
  const colorMap = {
    blue: 'bg-blue-500/20 text-blue-300',
    green: 'bg-green-500/20 text-green-300',
    yellow: 'bg-yellow-500/20 text-yellow-300',
    red: 'bg-red-500/20 text-red-300'
  }
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${colorMap[color] || colorMap.blue}`}>{text}</span>
}

function InlineField({ label, children }) {
  return (
    <label className="block text-xs text-white/80">
      <span className="block mb-1">{label}</span>
      {children}
    </label>
  )
}

export default function Dashboard() {
  const [leads, setLeads] = useState([])
  const [scripts, setScripts] = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

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
    } catch (e) {
      setMessage('Failed to load data')
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

  // Per-lead UI state for meeting scheduling
  const [meetingOpenFor, setMeetingOpenFor] = useState(null) // lead id or null
  const [meetingForm, setMeetingForm] = useState({
    senior_name: 'Senior Advisor',
    meeting_time: '', // datetime-local
    duration_minutes: 30,
    title: 'NRI Investment Consultation',
    description: 'Discuss investment options and next steps.'
  })
  const [meetingResult, setMeetingResult] = useState({}) // leadId -> link/info
  const [busyLead, setBusyLead] = useState(null) // leadId currently making request

  const selectedScriptId = useMemo(() => (scripts && scripts[0]?.id) || undefined, [scripts])

  const placeCall = async (leadId) => {
    setBusyLead(leadId)
    setMessage('Placing call...')
    try {
      const res = await fetch(`${baseUrl}/api/calls/place`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead_id: leadId, script_id: selectedScriptId })
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.detail || 'Failed to place call')
      setMessage('Call initiated. The system will update the lead after the call input.')
    } catch (e) {
      setMessage(e.message)
    } finally {
      setBusyLead(null)
      fetchAll()
    }
  }

  const openMeeting = (leadId) => {
    setMeetingOpenFor(leadId)
    setMeetingForm(f => ({ ...f, meeting_time: '' }))
  }

  const scheduleMeeting = async (leadId) => {
    if (!meetingForm.meeting_time) {
      setMessage('Please select a date and time')
      return
    }
    setBusyLead(leadId)
    setMessage('Creating Google Calendar event...')
    try {
      // Convert local datetime to ISO string
      const dt = new Date(meetingForm.meeting_time)
      const payload = {
        lead_id: leadId,
        senior_name: meetingForm.senior_name,
        meeting_time: dt.toISOString(),
        duration_minutes: Number(meetingForm.duration_minutes) || 30,
        title: meetingForm.title,
        description: meetingForm.description
      }
      const res = await fetch(`${baseUrl}/api/meetings/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Failed to create meeting')
      const meetLink = data.hangoutLink || (data.conferenceData && data.conferenceData.entryPoints?.[0]?.uri) || data.htmlLink
      setMeetingResult(prev => ({ ...prev, [leadId]: { meetLink, eventId: data.id } }))
      setMessage('Meeting created successfully')
      setMeetingOpenFor(null)
    } catch (e) {
      setMessage(e.message)
    } finally {
      setBusyLead(null)
      fetchAll()
    }
  }

  return (
    <section id="leads" className="relative">
      <div className="mx-auto max-w-7xl px-6 pb-16">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white text-2xl font-semibold">Leads</h2>
          <div className="flex items-center gap-3">
            <button onClick={fetchAll} className="text-sm text-white/80 hover:text-white">Refresh</button>
            {message && <span className="text-sm text-blue-200">{message}</span>}
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {loading && <p className="text-blue-200">Loading...</p>}
          {!loading && leads.length === 0 && <p className="text-blue-200">No leads yet.</p>}
          {leads.map(l => (
            <div key={l.id} className="rounded-xl border border-white/10 bg-white/5 p-4 text-white">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{l.full_name}</h3>
                <Tag text={l.status} color={l.status === 'running' || l.status === 'interested' ? 'green' : l.status === 'not_interested' ? 'red' : 'yellow'} />
              </div>
              <p className="text-sm text-blue-200 mt-1">{l.phone} {l.state ? `• ${l.state}` : ''}</p>
              {l.notes && <p className="text-xs text-blue-200/80 mt-2">{l.notes}</p>}

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  onClick={() => placeCall(l.id)}
                  disabled={busyLead === l.id}
                  className="rounded bg-blue-500/90 hover:bg-blue-500 disabled:opacity-60 px-3 py-1 text-sm">
                  {busyLead === l.id ? 'Calling...' : 'Call now'}
                </button>
                <button
                  onClick={() => openMeeting(l.id)}
                  className="rounded bg-purple-500/90 hover:bg-purple-500 px-3 py-1 text-sm">
                  Schedule via Google
                </button>
                {meetingResult[l.id]?.meetLink && (
                  <a href={meetingResult[l.id].meetLink} target="_blank" className="text-xs text-blue-200 underline ml-1">Meet Link</a>
                )}
              </div>

              {meetingOpenFor === l.id && (
                <div className="mt-3 rounded-lg border border-white/10 bg-white/5 p-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <InlineField label="Senior name">
                      <input
                        value={meetingForm.senior_name}
                        onChange={e => setMeetingForm(f => ({ ...f, senior_name: e.target.value }))}
                        className="w-full px-3 py-2 rounded bg-white/10 border border-white/10 outline-none"/>
                    </InlineField>
                    <InlineField label="Date & time">
                      <input
                        type="datetime-local"
                        value={meetingForm.meeting_time}
                        onChange={e => setMeetingForm(f => ({ ...f, meeting_time: e.target.value }))}
                        className="w-full px-3 py-2 rounded bg-white/10 border border-white/10 outline-none"/>
                    </InlineField>
                    <InlineField label="Duration (minutes)">
                      <input
                        type="number"
                        min="15"
                        step="5"
                        value={meetingForm.duration_minutes}
                        onChange={e => setMeetingForm(f => ({ ...f, duration_minutes: e.target.value }))}
                        className="w-full px-3 py-2 rounded bg-white/10 border border-white/10 outline-none"/>
                    </InlineField>
                    <InlineField label="Title">
                      <input
                        value={meetingForm.title}
                        onChange={e => setMeetingForm(f => ({ ...f, title: e.target.value }))}
                        className="w-full px-3 py-2 rounded bg-white/10 border border-white/10 outline-none"/>
                    </InlineField>
                  </div>
                  <InlineField label="Description">
                    <textarea
                      value={meetingForm.description}
                      onChange={e => setMeetingForm(f => ({ ...f, description: e.target.value }))}
                      className="w-full mt-2 px-3 py-2 rounded bg-white/10 border border-white/10 outline-none"/>
                  </InlineField>

                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={() => scheduleMeeting(l.id)}
                      disabled={busyLead === l.id}
                      className="rounded bg-purple-500/90 hover:bg-purple-500 disabled:opacity-60 px-3 py-1 text-sm">
                      {busyLead === l.id ? 'Scheduling...' : 'Create event'}
                    </button>
                    <button
                      onClick={() => setMeetingOpenFor(null)}
                      className="rounded bg-white/10 hover:bg-white/20 px-3 py-1 text-sm">
                      Cancel
                    </button>
                  </div>
                </div>
              )}
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
