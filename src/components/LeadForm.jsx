import { useState } from 'react'

const initial = {
  full_name: '',
  email: '',
  phone: '',
  country: 'USA',
  state: '',
  nri: true,
  source: 'manual',
  interest_level: 'medium',
  notes: ''
}

export default function LeadForm({ onCreated }) {
  const [form, setForm] = useState(initial)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMsg('')
    try {
      const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
      const res = await fetch(`${baseUrl}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, email: form.email || undefined, state: form.state || undefined })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Failed to create lead')
      setMsg('Lead saved')
      setForm(initial)
      onCreated?.(data)
    } catch (err) {
      setMsg(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="bg-white/5 border border-white/10 rounded-xl p-4 text-white">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input name="full_name" value={form.full_name} onChange={handleChange} placeholder="Full name" className="px-3 py-2 rounded bg-white/10 border border-white/10 outline-none" required />
        <input name="email" value={form.email} onChange={handleChange} placeholder="Email (optional)" className="px-3 py-2 rounded bg-white/10 border border-white/10 outline-none" />
        <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone (+1...)" className="px-3 py-2 rounded bg-white/10 border border-white/10 outline-none" required />
        <input name="state" value={form.state} onChange={handleChange} placeholder="State (e.g., CA)" className="px-3 py-2 rounded bg-white/10 border border-white/10 outline-none" />
        <div className="flex items-center gap-2">
          <input id="nri" type="checkbox" name="nri" checked={form.nri} onChange={handleChange} className="accent-blue-500" />
          <label htmlFor="nri">NRI</label>
        </div>
        <select name="interest_level" value={form.interest_level} onChange={handleChange} className="px-3 py-2 rounded bg-white/10 border border-white/10 outline-none">
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>
      <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Notes" className="w-full mt-3 px-3 py-2 rounded bg-white/10 border border-white/10 outline-none" />
      <div className="mt-3 flex items-center gap-3">
        <button disabled={loading} className="rounded bg-blue-500 hover:bg-blue-600 transition-colors px-4 py-2 font-semibold">
          {loading ? 'Saving...' : 'Add Lead'}
        </button>
        {msg && <span className="text-sm text-blue-200">{msg}</span>}
      </div>
    </form>
  )
}
