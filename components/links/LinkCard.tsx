'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Bookmark, Eye, ArrowRight } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { formatNumber, getDomain, getFavicon } from '@/lib/utils'
import type { Link as LinkType } from '@/types'

interface Props {
  link: LinkType
  isBookmarked?: boolean
}

export function LinkCard({ link, isBookmarked: initialBookmarked = false }: Props) {
  const { data: session } = useSession()
  const [bookmarked, setBookmarked] = useState(initialBookmarked)
  const [bookmarkCount, setBookmarkCount] = useState(link.bookmarks)
  const [imgError, setImgError] = useState(false)

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!session) { toast.error('Sign in to bookmark links'); return }

    const next = !bookmarked
    setBookmarked(next)
    setBookmarkCount((c) => c + (next ? 1 : -1))

    const res = await fetch('/api/bookmarks', {
      method: next ? 'POST' : 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ link_id: link.id }),
    })
    if (!res.ok) {
      setBookmarked(!next)
      setBookmarkCount((c) => c + (next ? -1 : 1))
      toast.error('Something went wrong')
    } else {
      toast.success(next ? 'Bookmarked!' : 'Removed bookmark')
    }
  }

  const favicon = !imgError ? (link.logo_url || getFavicon(link.url)) : null

  return (
    <article className="card flex flex-col gap-4 p-5 group">
      {/* Header */}
      <div className="flex items-start gap-3">
        {/* Logo */}
        <div className="w-11 h-11 rounded-xl bg-[var(--surface2)] border border-[var(--border-color)] flex items-center justify-center overflow-hidden flex-shrink-0">
          {favicon ? (
            <Image
              src={favicon}
              alt={link.title}
              width={28}
              height={28}
              onError={() => setImgError(true)}
              className="object-contain"
              unoptimized
            />
          ) : (
            <span className="text-lg font-bold text-[var(--accent)]">{link.title[0]}</span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm leading-tight truncate mb-0.5">{link.title}</h3>
          <p className="text-xs text-[var(--muted)] truncate">{getDomain(link.url)}</p>
        </div>

        <span className="badge badge-muted flex-shrink-0 text-[10px]">{link.category}</span>
      </div>

      {/* Description */}
      <p className="text-sm text-[var(--muted)] leading-relaxed font-light line-clamp-3 flex-1">
        {link.description}
      </p>

      {/* Tags */}
      {link.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {link.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="badge badge-accent text-[10px]">{tag}</span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-[var(--border-color)]">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBookmark}
            className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
              bookmarked ? 'text-[var(--accent)]' : 'text-[var(--muted)] hover:text-[var(--text)]'
            }`}
            aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark'}
          >
            <Bookmark size={13} fill={bookmarked ? 'currentColor' : 'none'} />
            {formatNumber(bookmarkCount)}
          </button>

          <div className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
            <Eye size={13} />
            {formatNumber(link.views)}
          </div>
        </div>

        <Link
          href={`/links/${link.id}`}
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-[var(--surface2)] border border-[var(--border-color)] hover:bg-[var(--accent)] hover:text-[#0d0d10] hover:border-[var(--accent)] transition-all"
        >
          View <ArrowRight size={12} />
        </Link>
      </div>
    </article>
  )
}
