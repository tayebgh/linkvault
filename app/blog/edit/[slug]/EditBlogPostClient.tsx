'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Save, Eye, X, ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import { slugify } from '@/lib/utils'
import { RichTextEditor } from '@/components/blog/RichTextEditor'
import type { BlogPost } from '@/types'

const BLOG_CATEGORIES = ['Technology', 'Design', 'Productivity', 'AI & ML', 'Development', 'General']

export function EditBlogPostClient({ post }: { post: BlogPost }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [showSeo, setShowSeo] = useState(false)
  const [form, setForm] = useState({
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt || '',
    content: post.content,
    thumbnail_url: post.thumbnail_url || '',
    category: post.category,
    tags: post.tags?.join(', ') || '',
    status: post.status,
    meta_title: post.meta_title || '',
    meta_description: post.meta_description || '',
    og_image: post.og_image || '',
  })

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }))

  const handleSave = async (status: 'draft' | 'published') => {
    setSaving(true)
    try {
      const res = await fetch(`/api/blog/${post.slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          status,
          tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success(status === 'published' ? 'Post published!' : 'Draft saved!')
      router.push(status === 'published' ? `/blog/${data.post.slug}` : '/dashboard')
    } catch (err: any) {
      toast.error(err.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this post permanently?')) return
    const res = await fetch(`/api/blog/${post.slug}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Post deleted'); router.push('/dashboard') }
    else toast.error('Failed to delete')
  }

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <div className="sticky top-16 z-40 bg-[rgba(13,13,16,0.9)] backdrop-blur-xl border-b border-[var(--border-color)] px-4 sm:px-8 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <select value={form.category} onChange={(e) => set('category', e.target.value)} className="field-input py-1.5 text-xs w-40">
            {BLOG_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <span className={`text-xs px-2 py-1 rounded-full border ${form.status === 'published' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-[var(--surface2)] text-[var(--muted)] border-[var(--border-color)]'}`}>
            {form.status}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleDelete} className="btn btn-danger text-xs py-2">
            <Trash2 size={13} /> Delete
          </button>
          <button onClick={() => handleSave('draft')} disabled={saving} className="btn btn-outline text-xs py-2 disabled:opacity-50">
            <Save size={13} /> Save Draft
          </button>
          <button onClick={() => handleSave('published')} disabled={saving} className="btn btn-primary text-xs py-2 disabled:opacity-50">
            <Eye size={13} /> {saving ? 'Saving…' : 'Publish'}
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-10">
        <input
          type="text"
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
          className="w-full bg-transparent text-4xl sm:text-5xl font-serif placeholder:text-[var(--border-color)] outline-none mb-4 leading-tight"
        />

        <div className="flex items-center gap-2 mb-6">
          <span className="text-xs text-[var(--muted)]">/blog/</span>
          <input value={form.slug} onChange={(e) => set('slug', slugify(e.target.value))} className="field-input text-xs py-1.5 flex-1 max-w-sm" />
        </div>

        <div className="mb-6">
          <label className="block text-xs text-[var(--muted)] font-medium mb-1.5 uppercase tracking-wider">Excerpt</label>
          <textarea rows={2} value={form.excerpt} onChange={(e) => set('excerpt', e.target.value)} className="field-input resize-none" />
        </div>

        <div className="mb-6">
          <label className="block text-xs text-[var(--muted)] font-medium mb-1.5 uppercase tracking-wider">Thumbnail URL</label>
          <div className="flex gap-2">
            <input value={form.thumbnail_url} onChange={(e) => set('thumbnail_url', e.target.value)} className="field-input flex-1" placeholder="https://example.com/image.jpg" />
            {form.thumbnail_url && <button onClick={() => set('thumbnail_url', '')} className="btn btn-ghost text-xs px-2"><X size={13} /></button>}
          </div>
          {form.thumbnail_url && (
            <div className="mt-2 relative aspect-video w-full max-w-sm overflow-hidden rounded-xl bg-[var(--surface2)] border border-[var(--border-color)]">
              <img src={form.thumbnail_url} alt="" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        <div className="mb-6">
          <label className="block text-xs text-[var(--muted)] font-medium mb-1.5 uppercase tracking-wider">Tags</label>
          <input value={form.tags} onChange={(e) => set('tags', e.target.value)} className="field-input" placeholder="Next.js, Supabase, Tutorial" />
        </div>

        <div className="mb-8">
          <label className="block text-xs text-[var(--muted)] font-medium mb-2 uppercase tracking-wider">Content</label>
          <RichTextEditor content={form.content} onChange={(html) => set('content', html)} />
        </div>

        {/* SEO Accordion */}
        <div className="bg-[var(--surface)] border border-[var(--border-color)] rounded-xl overflow-hidden">
          <button type="button" onClick={() => setShowSeo(!showSeo)} className="w-full flex items-center justify-between px-5 py-4 text-sm font-medium hover:bg-[var(--surface2)] transition-colors">
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[var(--accent)]" />SEO Settings</span>
            {showSeo ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {showSeo && (
            <div className="px-5 pb-5 space-y-4 border-t border-[var(--border-color)]">
              <div className="pt-4">
                <label className="block text-xs text-[var(--muted)] font-medium mb-1.5 uppercase tracking-wider">Meta Title</label>
                <input value={form.meta_title} onChange={(e) => set('meta_title', e.target.value)} className="field-input" maxLength={60} />
                <p className="text-[10px] text-[var(--muted)] mt-1">{form.meta_title.length}/60</p>
              </div>
              <div>
                <label className="block text-xs text-[var(--muted)] font-medium mb-1.5 uppercase tracking-wider">Meta Description</label>
                <textarea rows={2} value={form.meta_description} onChange={(e) => set('meta_description', e.target.value)} className="field-input resize-none" maxLength={160} />
                <p className="text-[10px] text-[var(--muted)] mt-1">{form.meta_description.length}/160</p>
              </div>
              <div>
                <label className="block text-xs text-[var(--muted)] font-medium mb-1.5 uppercase tracking-wider">OG Image URL</label>
                <input value={form.og_image} onChange={(e) => set('og_image', e.target.value)} className="field-input" placeholder="Social share image (1200×630)" />
              </div>
              <div className="bg-[var(--surface2)] border border-[var(--border-color)] rounded-xl p-4">
                <p className="text-[10px] text-[var(--muted)] uppercase tracking-wider mb-3">Google Preview</p>
                <div className="text-[var(--accent)] text-sm font-medium truncate">{form.meta_title || form.title}</div>
                <div className="text-green-500 text-xs truncate mt-0.5">{typeof window !== 'undefined' ? window.location.origin : ''}/blog/{form.slug}</div>
                <div className="text-[var(--muted)] text-xs mt-1 line-clamp-2">{form.meta_description || form.excerpt}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
