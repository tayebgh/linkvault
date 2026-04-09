'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { Heart, MessageCircle, Reply, Send } from 'lucide-react'
import { formatRelativeDate } from '@/lib/utils'
import type { Comment, CommentFormData } from '@/types'

interface Props { postId: string }

export function CommentSection({ postId }: Props) {
  const { data: session } = useSession()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [form, setForm] = useState<CommentFormData>({
    author_name: session?.user?.name || '',
    author_email: session?.user?.email || '',
    content: '',
  })

  useEffect(() => {
    fetch(`/api/comments?post_id=${postId}`)
      .then((r) => r.json())
      .then((data) => { setComments(data.comments || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [postId])

  useEffect(() => {
    if (session?.user) {
      setForm((f) => ({ ...f, author_name: session.user.name || '', author_email: session.user.email || '' }))
    }
  }, [session])

  const handleSubmit = async (e: React.FormEvent, parentId?: string) => {
    e.preventDefault()
    if (!form.content.trim()) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, post_id: postId, parent_id: parentId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      const newComment = data.comment as Comment
      if (parentId) {
        setComments((prev) =>
          prev.map((c) =>
            c.id === parentId ? { ...c, replies: [...(c.replies || []), newComment] } : c
          )
        )
      } else {
        setComments((prev) => [newComment, ...prev])
      }
      setForm((f) => ({ ...f, content: '' }))
      setReplyTo(null)
      toast.success('Comment posted!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to post comment')
    } finally {
      setSubmitting(false)
    }
  }

  const handleLike = async (commentId: string) => {
    if (!session) { toast.error('Sign in to like comments'); return }
    await fetch('/api/comments/like', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comment_id: commentId }),
    })
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId ? { ...c, likes: c.likes + 1, is_liked: true } : {
          ...c,
          replies: c.replies?.map((r) =>
            r.id === commentId ? { ...r, likes: r.likes + 1, is_liked: true } : r
          ),
        }
      )
    )
  }

  return (
    <div>
      <h2 className="font-serif text-2xl mb-8 flex items-center gap-2">
        <MessageCircle size={22} className="text-[var(--accent2)]" />
        Comments ({comments.length})
      </h2>

      {/* Comment form */}
      <div className="bg-[var(--surface)] border border-[var(--border-color)] rounded-2xl p-6 mb-8">
        <h3 className="text-sm font-semibold mb-4 text-[var(--muted)] uppercase tracking-wider">Leave a comment</h3>
        <form onSubmit={(e) => handleSubmit(e)}>
          {!session && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs text-[var(--muted)] mb-1.5 font-medium">Name *</label>
                <input
                  required
                  value={form.author_name}
                  onChange={(e) => setForm((f) => ({ ...f, author_name: e.target.value }))}
                  className="field-input"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-xs text-[var(--muted)] mb-1.5 font-medium">Email</label>
                <input
                  type="email"
                  value={form.author_email}
                  onChange={(e) => setForm((f) => ({ ...f, author_email: e.target.value }))}
                  className="field-input"
                  placeholder="your@email.com"
                />
              </div>
            </div>
          )}

          <div className="mb-3">
            <label className="block text-xs text-[var(--muted)] mb-1.5 font-medium">Comment *</label>
            <textarea
              required
              rows={4}
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              className="field-input resize-none"
              placeholder="Share your thoughts…"
            />
          </div>

          <button type="submit" disabled={submitting} className="btn btn-primary disabled:opacity-50">
            <Send size={14} /> {submitting ? 'Posting…' : 'Post Comment'}
          </button>
        </form>
      </div>

      {/* Comments list */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => <div key={i} className="skeleton h-24 w-full rounded-xl" />)}
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12 text-[var(--muted)]">
          <MessageCircle size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No comments yet. Be the first!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onLike={handleLike}
              onReply={(id) => setReplyTo(replyTo === id ? null : id)}
              replyTo={replyTo}
              onReplySubmit={handleSubmit}
              submitting={submitting}
              session={session}
              form={form}
              setForm={setForm}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function CommentItem({ comment, onLike, onReply, replyTo, onReplySubmit, submitting, session, form, setForm }: {
  comment: Comment
  onLike: (id: string) => void
  onReply: (id: string) => void
  replyTo: string | null
  onReplySubmit: (e: React.FormEvent, parentId?: string) => void
  submitting: boolean
  session: any
  form: CommentFormData
  setForm: (fn: (f: CommentFormData) => CommentFormData) => void
}) {
  return (
    <div>
      <div className="bg-[var(--surface)] border border-[var(--border-color)] rounded-xl p-5">
        <div className="flex items-start gap-3">
          {comment.author_avatar ? (
            <Image src={comment.author_avatar} alt={comment.author_name} width={36} height={36} className="rounded-full flex-shrink-0" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-[var(--surface2)] border border-[var(--border-color)] flex items-center justify-center text-sm font-semibold text-[var(--accent)] flex-shrink-0">
              {comment.author_name[0]?.toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-sm font-semibold">{comment.author_name}</span>
              <span className="text-xs text-[var(--muted)]">{formatRelativeDate(comment.created_at)}</span>
            </div>
            <p className="text-sm text-[var(--muted)] leading-relaxed whitespace-pre-wrap">{comment.content}</p>
            <div className="flex items-center gap-3 mt-3">
              <button
                onClick={() => onLike(comment.id)}
                className={`flex items-center gap-1.5 text-xs transition-colors ${comment.is_liked ? 'text-red-400' : 'text-[var(--muted)] hover:text-red-400'}`}
              >
                <Heart size={12} fill={comment.is_liked ? 'currentColor' : 'none'} /> {comment.likes}
              </button>
              <button
                onClick={() => onReply(comment.id)}
                className="flex items-center gap-1.5 text-xs text-[var(--muted)] hover:text-[var(--accent)] transition-colors"
              >
                <Reply size={12} /> Reply
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-8 mt-2 space-y-2">
          {comment.replies.map((reply) => (
            <div key={reply.id} className="bg-[var(--surface2)] border border-[var(--border-color)] rounded-xl p-4">
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-full bg-[var(--surface)] border border-[var(--border-color)] flex items-center justify-center text-xs font-semibold text-[var(--accent2)] flex-shrink-0">
                  {reply.author_name[0]?.toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold">{reply.author_name}</span>
                    <span className="text-[10px] text-[var(--muted)]">{formatRelativeDate(reply.created_at)}</span>
                  </div>
                  <p className="text-xs text-[var(--muted)] leading-relaxed">{reply.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Inline reply form */}
      {replyTo === comment.id && (
        <div className="ml-8 mt-2">
          <form onSubmit={(e) => onReplySubmit(e, comment.id)} className="bg-[var(--surface2)] border border-[var(--accent)] border-opacity-30 rounded-xl p-4">
            {!session && (
              <input
                value={form.author_name}
                onChange={(e) => setForm((f) => ({ ...f, author_name: e.target.value }))}
                className="field-input mb-2 text-sm py-2"
                placeholder="Your name"
                required
              />
            )}
            <textarea
              rows={2}
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              className="field-input resize-none text-sm mb-2"
              placeholder={`Reply to ${comment.author_name}…`}
              required
            />
            <div className="flex gap-2">
              <button type="submit" disabled={submitting} className="btn btn-primary text-xs py-1.5">
                <Send size={12} /> {submitting ? 'Posting…' : 'Reply'}
              </button>
              <button type="button" onClick={() => onReply(comment.id)} className="btn btn-ghost text-xs py-1.5">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
