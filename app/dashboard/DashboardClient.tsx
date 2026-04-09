'use client'

import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Check, X, Plus, Edit, Trash2, Eye, Link2, BookOpen, MessageSquare, Clock, FileText } from 'lucide-react'
import { formatRelativeDate, formatNumber } from '@/lib/utils'
import type { Session } from 'next-auth'

interface Props {
  stats: { totalLinks: number; pendingLinks: number; totalPosts: number; draftPosts: number; totalComments: number }
  recentLinks: any[]
  recentPosts: any[]
  session: Session
}

export function DashboardClient({ stats, recentLinks, recentPosts, session }: Props) {
  const [pendingLinks, setPendingLinks] = useState(recentLinks)
  const [posts, setPosts] = useState(recentPosts)
  const [tab, setTab] = useState<'links' | 'posts'>('links')
  const [processing, setProcessing] = useState<string | null>(null)

  const approveLink = async (id: string) => {
    setProcessing(id)
    const res = await fetch(`/api/links/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'approved' }),
    })
    if (res.ok) {
      setPendingLinks((prev) => prev.filter((l) => l.id !== id))
      toast.success('Link approved!')
    } else {
      toast.error('Failed to approve link')
    }
    setProcessing(null)
  }

  const rejectLink = async (id: string) => {
    setProcessing(id)
    const res = await fetch(`/api/links/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'rejected' }),
    })
    if (res.ok) {
      setPendingLinks((prev) => prev.filter((l) => l.id !== id))
      toast.success('Link rejected')
    } else {
      toast.error('Failed to reject')
    }
    setProcessing(null)
  }

  const deletePost = async (slug: string) => {
    if (!confirm('Delete this post? This cannot be undone.')) return
    const res = await fetch(`/api/blog/${slug}`, { method: 'DELETE' })
    if (res.ok) {
      setPosts((prev) => prev.filter((p) => p.slug !== slug))
      toast.success('Post deleted')
    } else {
      toast.error('Failed to delete post')
    }
  }

  const statCards = [
    { label: 'Live Links', value: stats.totalLinks, icon: Link2, color: 'text-[var(--accent)]' },
    { label: 'Pending Review', value: stats.pendingLinks, icon: Clock, color: 'text-orange-400' },
    { label: 'Published Posts', value: stats.totalPosts, icon: BookOpen, color: 'text-[var(--accent2)]' },
    { label: 'Draft Posts', value: stats.draftPosts, icon: FileText, color: 'text-[var(--muted)]' },
    { label: 'Comments', value: stats.totalComments, icon: MessageSquare, color: 'text-purple-400' },
  ]

  return (
    <div className="container-app px-4 sm:px-8 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl mb-1">Dashboard</h1>
          <p className="text-sm text-[var(--muted)]">Welcome back, {session.user.name}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/blog/new" className="btn btn-outline text-xs py-2">
            <Plus size={13} /> New Post
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-10">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-[var(--surface)] border border-[var(--border-color)] rounded-xl p-4">
            <div className={`${color} mb-2`}><Icon size={18} /></div>
            <div className="font-serif text-2xl font-bold">{formatNumber(value)}</div>
            <div className="text-xs text-[var(--muted)] mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-[var(--surface)] border border-[var(--border-color)] rounded-xl p-1 w-fit">
        {(['links', 'posts'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
              tab === t ? 'bg-[var(--accent)] text-[#0d0d10]' : 'text-[var(--muted)] hover:text-[var(--text)]'
            }`}
          >
            {t === 'links' ? `Pending Links (${pendingLinks.length})` : `Posts (${posts.length})`}
          </button>
        ))}
      </div>

      {/* Links tab */}
      {tab === 'links' && (
        <div className="bg-[var(--surface)] border border-[var(--border-color)] rounded-xl overflow-hidden">
          {pendingLinks.length === 0 ? (
            <div className="text-center py-16 text-[var(--muted)]">
              <Check size={32} className="mx-auto mb-3 text-green-400 opacity-60" />
              <p className="text-sm">No pending links — all caught up!</p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border-color)]">
              {pendingLinks.map((link) => (
                <div key={link.id} className="flex items-start gap-4 p-4 hover:bg-[var(--surface2)] transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-medium truncate">{link.title}</span>
                      <span className="badge badge-muted text-[10px]">{link.category}</span>
                    </div>
                    <p className="text-xs text-[var(--muted)] truncate mb-1">{link.url}</p>
                    <p className="text-xs text-[var(--muted)] line-clamp-1 font-light">{link.description}</p>
                    <p className="text-[10px] text-[var(--muted)] mt-1.5">
                      by {link.submitted_by_name} · {formatRelativeDate(link.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="p-1.5 text-[var(--muted)] hover:text-[var(--text)] rounded-lg hover:bg-[var(--surface2)] transition-colors">
                      <Eye size={14} />
                    </a>
                    <button
                      onClick={() => approveLink(link.id)}
                      disabled={processing === link.id}
                      className="p-1.5 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors disabled:opacity-50"
                    >
                      <Check size={14} />
                    </button>
                    <button
                      onClick={() => rejectLink(link.id)}
                      disabled={processing === link.id}
                      className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Posts tab */}
      {tab === 'posts' && (
        <div className="bg-[var(--surface)] border border-[var(--border-color)] rounded-xl overflow-hidden">
          {posts.length === 0 ? (
            <div className="text-center py-16 text-[var(--muted)]">
              <BookOpen size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm mb-3">No posts yet</p>
              <Link href="/blog/new" className="btn btn-primary text-xs">
                <Plus size={13} /> Write your first post
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border-color)]">
              {posts.map((post) => (
                <div key={post.id} className="flex items-start gap-4 p-4 hover:bg-[var(--surface2)] transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="text-sm font-medium truncate">{post.title}</span>
                      <span className={`badge text-[10px] ${post.status === 'published' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'badge-muted'}`}>
                        {post.status}
                      </span>
                      <span className="badge badge-teal text-[10px]">{post.category}</span>
                    </div>
                    <p className="text-xs text-[var(--muted)] line-clamp-1 font-light mb-1">{post.excerpt}</p>
                    <div className="flex items-center gap-3 text-[10px] text-[var(--muted)]">
                      <span className="flex items-center gap-1"><Eye size={10} /> {formatNumber(post.views)}</span>
                      <span>{formatRelativeDate(post.updated_at)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {post.status === 'published' && (
                      <Link href={`/blog/${post.slug}`} className="p-1.5 text-[var(--muted)] hover:text-[var(--text)] rounded-lg hover:bg-[var(--surface2)] transition-colors">
                        <Eye size={14} />
                      </Link>
                    )}
                    <Link href={`/blog/edit/${post.slug}`} className="p-1.5 rounded-lg bg-[var(--surface2)] border border-[var(--border-color)] text-[var(--muted)] hover:text-[var(--text)] transition-colors">
                      <Edit size={14} />
                    </Link>
                    <button
                      onClick={() => deletePost(post.slug)}
                      className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
