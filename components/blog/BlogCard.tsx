import Link from 'next/link'
import Image from 'next/image'
import { Clock, Eye, Calendar, User } from 'lucide-react'
import { formatNumber, formatRelativeDate, truncate } from '@/lib/utils'
import type { BlogPost } from '@/types'

interface Props {
  post: BlogPost
  featured?: boolean
}

const CATEGORY_COLORS: Record<string, string> = {
  Technology: 'badge-teal',
  Design: 'badge-accent',
  Productivity: '',
  'AI & ML': '',
  Development: 'badge-teal',
  General: 'badge-muted',
}

export function BlogCard({ post, featured = false }: Props) {
  if (featured) {
    return (
      <Link href={`/blog/${post.slug}`} className="group block">
        <article className="bg-[var(--surface)] border border-[var(--border-color)] rounded-2xl overflow-hidden hover:-translate-y-1 transition-all duration-200 hover:border-[#3a3a44] hover:shadow-2xl">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Thumbnail */}
            <div className="relative aspect-video md:aspect-auto overflow-hidden bg-[var(--surface2)]">
              {post.thumbnail_url ? (
                <Image
                  src={post.thumbnail_url}
                  alt={post.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-serif text-6xl text-[var(--border-color)]">{post.title[0]}</span>
                </div>
              )}
              <div className="absolute top-4 left-4">
                <span className={`badge ${CATEGORY_COLORS[post.category] || 'badge-accent'}`}>{post.category}</span>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 flex flex-col justify-center">
              <div className="flex items-center gap-3 text-xs text-[var(--muted)] mb-4">
                <span className="flex items-center gap-1"><Clock size={11} /> {post.reading_time} min read</span>
                <span className="flex items-center gap-1"><Eye size={11} /> {formatNumber(post.views)}</span>
              </div>

              <h2 className="font-serif text-2xl sm:text-3xl tracking-tight mb-3 group-hover:text-[var(--accent)] transition-colors leading-tight">
                {post.title}
              </h2>

              {post.excerpt && (
                <p className="text-[var(--muted)] text-sm leading-relaxed font-light mb-6">
                  {truncate(post.excerpt, 140)}
                </p>
              )}

              <div className="flex items-center gap-3 mt-auto">
                {post.author_avatar && (
                  <Image src={post.author_avatar} alt={post.author_name || ''} width={28} height={28} className="rounded-full" />
                )}
                <div className="text-xs text-[var(--muted)]">
                  <span className="text-[var(--text)] font-medium">{post.author_name || 'Anonymous'}</span>
                  {' · '}{post.published_at ? formatRelativeDate(post.published_at) : ''}
                </div>
              </div>
            </div>
          </div>
        </article>
      </Link>
    )
  }

  return (
    <Link href={`/blog/${post.slug}`} className="group block h-full">
      <article className="card h-full flex flex-col overflow-hidden">
        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden bg-[var(--surface2)]">
          {post.thumbnail_url ? (
            <Image
              src={post.thumbnail_url}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[var(--surface)] to-[var(--surface2)]">
              <span className="font-serif text-5xl text-[var(--border-color)]">{post.title[0]}</span>
            </div>
          )}
          <div className="absolute top-3 left-3">
            <span className={`badge ${CATEGORY_COLORS[post.category] || 'badge-accent'} text-[10px]`}>{post.category}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1 gap-3">
          <div className="flex items-center gap-3 text-[10px] text-[var(--muted)]">
            <span className="flex items-center gap-1"><Clock size={10} /> {post.reading_time} min</span>
            <span className="flex items-center gap-1"><Eye size={10} /> {formatNumber(post.views)}</span>
            <span className="flex items-center gap-1"><Calendar size={10} />{post.published_at ? formatRelativeDate(post.published_at) : 'Draft'}</span>
          </div>

          <h3 className="font-serif text-lg leading-snug tracking-tight group-hover:text-[var(--accent)] transition-colors line-clamp-2">
            {post.title}
          </h3>

          {post.excerpt && (
            <p className="text-xs text-[var(--muted)] leading-relaxed font-light line-clamp-2 flex-1">
              {post.excerpt}
            </p>
          )}

          <div className="flex items-center gap-2 mt-auto pt-3 border-t border-[var(--border-color)]">
            {post.author_avatar ? (
              <Image src={post.author_avatar} alt={post.author_name || ''} width={22} height={22} className="rounded-full flex-shrink-0" />
            ) : (
              <div className="w-5 h-5 rounded-full bg-[var(--accent)] flex items-center justify-center text-[8px] font-bold text-[#0d0d10] flex-shrink-0">
                {(post.author_name || 'A')[0]}
              </div>
            )}
            <span className="text-xs text-[var(--muted)] truncate">{post.author_name || 'Anonymous'}</span>
          </div>
        </div>
      </article>
    </Link>
  )
}
