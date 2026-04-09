import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ExternalLink, Bookmark, Eye, Calendar, User, Tag } from 'lucide-react'
import { supabaseAdmin } from '@/lib/supabase'
import { formatNumber, formatDate, getDomain, getFavicon } from '@/lib/utils'
import type { Link as LinkType } from '@/types'

interface Props { params: { id: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { data } = await supabaseAdmin.from('links').select('*').eq('id', params.id).single()
  if (!data) return { title: 'Link Not Found' }
  return {
    title: data.title,
    description: data.description,
    openGraph: { title: data.title, description: data.description, url: data.url },
  }
}

export default async function LinkDetailPage({ params }: Props) {
  const { data: link, error } = await supabaseAdmin
    .from('links')
    .select('*')
    .eq('id', params.id)
    .eq('status', 'approved')
    .single()

  if (error || !link) notFound()

  // Increment views (fire-and-forget)
  supabaseAdmin.from('links').update({ views: (link as LinkType).views + 1 }).eq('id', params.id)

  const l = link as LinkType
  const favicon = l.logo_url || getFavicon(l.url)

  return (
    <div className="container-narrow px-4 sm:px-8 py-12">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors mb-10 group">
        <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
        Back to Library
      </Link>

      {/* Hero card */}
      <div className="bg-[var(--surface)] border border-[var(--border-color)] rounded-2xl p-8 mb-6">
        <div className="flex items-start gap-5 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-[var(--surface2)] border border-[var(--border-color)] flex items-center justify-center overflow-hidden flex-shrink-0">
            {favicon ? (
              <Image src={favicon} alt={l.title} width={40} height={40} className="object-contain" unoptimized />
            ) : (
              <span className="text-2xl font-bold text-[var(--accent)]">{l.title[0]}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-serif text-3xl sm:text-4xl tracking-tight mb-1">{l.title}</h1>
            <p className="text-sm text-[var(--muted)]">{getDomain(l.url)}</p>
          </div>
        </div>

        <p className="text-base text-[var(--muted)] leading-relaxed mb-6 font-light">{l.description}</p>

        {/* Tags */}
        {l.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {l.tags.map((tag) => (
              <span key={tag} className="badge badge-accent">{tag}</span>
            ))}
          </div>
        )}

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <div className="flex items-center gap-1.5 text-xs text-[var(--muted)] px-3 py-1.5 rounded-full bg-[var(--surface2)] border border-[var(--border-color)]">
            <Tag size={11} /> {l.category}
          </div>
          {l.submitted_by_name && (
            <div className="flex items-center gap-1.5 text-xs text-[var(--muted)] px-3 py-1.5 rounded-full bg-[var(--surface2)] border border-[var(--border-color)]">
              <User size={11} /> {l.submitted_by_name}
            </div>
          )}
          <div className="flex items-center gap-1.5 text-xs text-[var(--muted)] px-3 py-1.5 rounded-full bg-[var(--surface2)] border border-[var(--border-color)]">
            <Calendar size={11} /> {formatDate(l.created_at, { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <a
            href={l.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
          >
            Visit Website <ExternalLink size={14} />
          </a>
          <button className="btn btn-outline">
            <Bookmark size={14} /> Bookmark
          </button>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[var(--surface)] border border-[var(--border-color)] rounded-xl p-5">
          <p className="text-xs text-[var(--muted)] uppercase tracking-wider mb-2 flex items-center gap-1.5"><Bookmark size={11} /> Bookmarks</p>
          <p className="font-serif text-3xl">{formatNumber(l.bookmarks)}</p>
          <p className="text-xs text-[var(--muted)] mt-1">people saved this</p>
        </div>
        <div className="bg-[var(--surface)] border border-[var(--border-color)] rounded-xl p-5">
          <p className="text-xs text-[var(--muted)] uppercase tracking-wider mb-2 flex items-center gap-1.5"><Eye size={11} /> Views</p>
          <p className="font-serif text-3xl">{formatNumber(l.views)}</p>
          <p className="text-xs text-[var(--muted)] mt-1">total visits</p>
        </div>
      </div>
    </div>
  )
}
