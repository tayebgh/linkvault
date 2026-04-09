'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { Send, Globe } from 'lucide-react'
import { LINK_CATEGORIES } from '@/types'

export default function SubmitLinkPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ title: '', url: '', description: '', category: 'Dev Tools', tags: '' })

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Link submitted for review!')
      router.push('/')
    } catch (err: any) {
      toast.error(err.message || 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (status === 'loading') return null

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-[var(--surface)] border border-[var(--border-color)] flex items-center justify-center mx-auto mb-4">
            <Globe size={22} className="text-[var(--accent)]" />
          </div>
          <h1 className="font-serif text-3xl mb-2">Submit a Link</h1>
          <p className="text-sm text-[var(--muted)]">Share a useful website with the community. All links are reviewed before publishing.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[var(--surface)] border border-[var(--border-color)] rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--muted)] uppercase tracking-wider mb-1.5">Website Title *</label>
            <input required value={form.title} onChange={(e) => set('title', e.target.value)} className="field-input" placeholder="e.g. Vercel" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--muted)] uppercase tracking-wider mb-1.5">URL *</label>
            <input required type="url" value={form.url} onChange={(e) => set('url', e.target.value)} className="field-input" placeholder="https://example.com" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--muted)] uppercase tracking-wider mb-1.5">Description *</label>
            <textarea required rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} className="field-input resize-none" placeholder="What is this website about?" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--muted)] uppercase tracking-wider mb-1.5">Category *</label>
            <select value={form.category} onChange={(e) => set('category', e.target.value)} className="field-input">
              {LINK_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--muted)] uppercase tracking-wider mb-1.5">Tags <span className="normal-case font-normal text-[10px]">(comma separated)</span></label>
            <input value={form.tags} onChange={(e) => set('tags', e.target.value)} className="field-input" placeholder="Design, Tools, Free" />
          </div>

          <div className="pt-2">
            <button type="submit" disabled={submitting} className="btn btn-primary w-full justify-center py-3 disabled:opacity-50">
              <Send size={14} /> {submitting ? 'Submitting…' : 'Submit for Review'}
            </button>
            <p className="text-[10px] text-[var(--muted)] text-center mt-3">Links are reviewed by our team within 24 hours.</p>
          </div>
        </form>
      </div>
    </div>
  )
}
