'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { Save, Eye, Upload, X, ChevronDown, ChevronUp } from 'lucide-react'
import { slugify } from '@/lib/utils'
import { RichTextEditor } from '@/components/blog/RichTextEditor'
import { LINK_CATEGORIES } from '@/types'

const BLOG_CATEGORIES = ['Technology', 'Design', 'Productivity', 'AI & ML', 'Development', 'General']

export default function NewBlogPostPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [showSeo, setShowSeo] = useState(false)

  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    thumbnail_url: '',
    category: 'Technology',
    tags: '',
    status: 'draft' as 'draft' | 'published',
    meta_title: '',
    meta_description: '',
    og_image: '',
  })

  // Redirect if not logged in
  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  // Auto-slug from title
  useEffect(() => {
    if (form.title && !form.slug) {
      setForm((f) => ({ ...f, slug: slugify(f.title) }))
    }
  }, [form.title])

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }))

  const handleSave = async (postStatus: 'draft' | 'published') => {
    if (!form.title.trim() || !form.content.trim()) {
      toast.error('Title and content are required')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          status: postStatus,
          tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success(postStatus === 'published' ? 'Post published!' : 'Draft saved!')
      router.push(postStatus === 'published' ? `/blog/${data.post.slug}` : '/dashboard')
    } catch (err: any) {
      toast.error(err.message || 'Failed to save post')
    } finally {
      setSaving(false)
    }
  }

  if (status === 'loading') return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="skeleton w-10 h-10 rounded-full" />
    </div>
  )

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <div className="sticky top-16 z-40 bg-[rgba(13,13,16,0.9)] backdrop-blur-xl border-b border-[var(--border-color)] px-4 sm:px-8 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <select
            value={form.category}
            onChange={(e) => set('category', e.target.value)}
            className="field-input py-1.5 text-xs w-40"
          >
            {BLOG_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <span className={`text-xs px-2 py-1 rounded-full border ${form.status === 'published' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-[var(--surface2)] text-[var(--muted)] border-[var(--border-color)]'}`}>
            {form.status}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => handleSave('draft')} disabled={saving} className="btn btn-outline text-xs py-2 disabled:opacity-50">
            <Save size={13} /> Save Draft
          </button>
          <button onClick={() => handleSave('published')} disabled={saving} className="btn btn-primary text-xs py-2 disabled:opacity-50">
            <Eye size={13} /> {saving ? 'Publishing…' : 'Publish'}
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-10">
        {/* Title */}
        <input
          type="text"
          placeholder="Post title…"
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
          className="w-full bg-transparent text-4xl sm:text-5xl font-serif placeholder:text-[var(--border-color)] outline-none mb-4 leading-tight"
        />

        {/* Slug */}
        <div className="flex items-center gap-2 mb-6">
          <span className="text-xs text-[var(--muted)]">/blog/</span>
          <input
            value={form.slug}
            onChange={(e) => set('slug', slugify(e.target.value))}
            className="field-input text-xs py-1.5 flex-1 max-w-sm"
            placeholder="post-slug"
          />
        </div>

        {/* Excerpt */}
        <div className="mb-6">
          <label className="block text-xs text-[var(--muted)] font-medium mb-1.5 uppercase tracking-wider">Excerpt</label>
          <textarea
            rows={2}
            placeholder="Brief summary of this post…"
            value={form.excerpt}
            onChange={(e) => set('excerpt', e.target.value)}
            className="field-input resize-none"
          />
        </div>

        {/* Thumbnail */}
        <div className="mb-6">
          <label className="block text-xs text-[var(--muted)] font-medium mb-1.5 uppercase tracking-wider">Thumbnail URL</label>
          <div className="flex gap-2">
            <input
              value={form.thumbnail_url}
              onChange={(e) => set('thumbnail_url', e.target.value)}
              className="field-input flex-1"
              placeholder="https://example.com/image.jpg"
            />
            {form.thumbnail_url && (
              <button onClick={() => set('thumbnail_url', '')} className="btn btn-ghost text-xs px-2">
                <X size={13} />
              </button>
            )}
          </div>
          {form.thumbnail_url && (
            <div className="mt-2 relative aspect-video w-full max-w-sm overflow-hidden rounded-xl bg-[var(--surface2)] border border-[var(--border-color)]">
              <img src={form.thumbnail_url} alt="Thumbnail preview" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="mb-6">
          <label className="block text-xs text-[var(--muted)] font-medium mb-1.5 uppercase tracking-wider">Tags <span className="normal-case text-[10px]">(comma separated)</span></label>
          <input
            value={form.tags}
            onChange={(e) => set('tags', e.target.value)}
            className="field-input"
            placeholder="Next.js, Supabase, Tutorial"
          />
        </div>

        {/* Editor */}
        <div className="mb-8">
          <label className="block text-xs text-[var(--muted)] font-medium mb-2 uppercase tracking-wider">Content</label>
          <RichTextEditor
            content={form.content}
            onChange={(html) => set('content', html)}
            placeholder="Write your post content here…"
          />
        </div>

        {/* SEO Accordion */}
        <div className="bg-[var(--surface)] border border-[var(--border-color)] rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setShowSeo(!showSeo)}
            className="w-full flex items-center justify-between px-5 py-4 text-sm font-medium hover:bg-[var(--surface2)] transition-colors"
          >
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
              SEO Settings
            </span>
            {showSeo ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {showSeo && (
            <div className="px-5 pb-5 space-y-4 border-t border-[var(--border-color)]">
              <div className="pt-4">
                <label className="block text-xs text-[var(--muted)] font-medium mb-1.5 uppercase tracking-wider">Meta Title</label>
                <input
                  value={form.meta_title}
                  onChange={(e) => set('meta_title', e.target.value)}
                  className="field-input"
                  placeholder="Override page title for search engines"
                  maxLength={60}
                />
                <p className="text-[10px] text-[var(--muted)] mt-1">{form.meta_title.length}/60</p>
              </div>
              <div>
                <label className="block text-xs text-[var(--muted)] font-medium mb-1.5 uppercase tracking-wider">Meta Description</label>
                <textarea
                  rows={2}
                  value={form.meta_description}
                  onChange={(e) => set('meta_description', e.target.value)}
                  className="field-input resize-none"
                  placeholder="Override description for search engines"
                  maxLength={160}
                />
                <p className="text-[10px] text-[var(--muted)] mt-1">{form.meta_description.length}/160</p>
              </div>
              <div>
                <label className="block text-xs text-[var(--muted)] font-medium mb-1.5 uppercase tracking-wider">OG Image URL</label>
                <input
                  value={form.og_image}
                  onChange={(e) => set('og_image', e.target.value)}
                  className="field-input"
                  placeholder="Social share image URL (1200×630)"
                />
              </div>

              {/* Live SEO preview */}
              <div className="bg-[var(--surface2)] border border-[var(--border-color)] rounded-xl p-4">
                <p className="text-[10px] text-[var(--muted)] uppercase tracking-wider mb-3">Google Preview</p>
                <div className="text-[var(--accent)] text-sm font-medium truncate">
                  {form.meta_title || form.title || 'Post Title'}
                </div>
                <div className="text-green-500 text-xs truncate mt-0.5">
                  {typeof window !== 'undefined' ? window.location.origin : 'https://your-site.com'}/blog/{form.slug || 'post-slug'}
                </div>
                <div className="text-[var(--muted)] text-xs mt-1 line-clamp-2">
                  {form.meta_description || form.excerpt || 'Post description will appear here…'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
