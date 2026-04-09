import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Clock, Eye, Calendar, Share2 } from 'lucide-react'
import { supabaseAdmin } from '@/lib/supabase'
import { formatDate, formatNumber, absoluteUrl } from '@/lib/utils'
import { CommentSection } from '@/components/blog/CommentSection'
import { ShareButtons } from '@/components/blog/ShareButtons'
import { BlogCard } from '@/components/blog/BlogCard'
import type { BlogPost } from '@/types'

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { data: post } = await supabaseAdmin
    .from('blog_posts')
    .select('*')
    .eq('slug', params.slug)
    .eq('status', 'published')
    .single()

  if (!post) return { title: 'Post Not Found' }

  const p = post as BlogPost
  const title = p.meta_title || p.title
  const description = p.meta_description || p.excerpt || ''
  const image = p.og_image || p.thumbnail_url || '/og-image.png'
  const url = absoluteUrl(`/blog/${p.slug}`)

  return {
    title,
    description,
    openGraph: {
      title, description, url, type: 'article',
      publishedTime: p.published_at,
      authors: [p.author_name || 'Anonymous'],
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
    alternates: { canonical: p.canonical_url || url },
  }
}

export async function generateStaticParams() {
  const { data } = await supabaseAdmin.from('blog_posts').select('slug').eq('status', 'published')
  return (data || []).map((p) => ({ slug: p.slug }))
}

export default async function BlogPostPage({ params }: Props) {
  const { data: post, error } = await supabaseAdmin
    .from('blog_posts')
    .select('*')
    .eq('slug', params.slug)
    .eq('status', 'published')
    .single()

  if (error || !post) notFound()

  const p = post as BlogPost

  // Increment views
  supabaseAdmin.from('blog_posts').update({ views: p.views + 1 }).eq('id', p.id)

  // Related posts
  const { data: related } = await supabaseAdmin
    .from('blog_posts')
    .select('*')
    .eq('status', 'published')
    .eq('category', p.category)
    .neq('id', p.id)
    .limit(3)

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: p.title,
    description: p.excerpt,
    image: p.thumbnail_url,
    datePublished: p.published_at,
    dateModified: p.updated_at,
    author: { '@type': 'Person', name: p.author_name || 'Anonymous' },
    publisher: {
      '@type': 'Organization',
      name: process.env.NEXT_PUBLIC_APP_NAME || 'LinkVault',
      logo: { '@type': 'ImageObject', url: absoluteUrl('/logo.png') },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': absoluteUrl(`/blog/${p.slug}`) },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="container-blog px-4 sm:px-8 py-12">
        {/* Back */}
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors mb-10 group">
          <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Blog
        </Link>

        {/* Category + meta */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <Link href={`/blog?category=${p.category}`} className="badge badge-teal hover:opacity-80 transition-opacity">
            {p.category}
          </Link>
          <div className="flex items-center gap-3 text-xs text-[var(--muted)]">
            <span className="flex items-center gap-1"><Clock size={11} /> {p.reading_time} min read</span>
            <span className="flex items-center gap-1"><Eye size={11} /> {formatNumber(p.views)} views</span>
            {p.published_at && (
              <span className="flex items-center gap-1">
                <Calendar size={11} /> {formatDate(p.published_at, { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <h1 className="font-serif text-4xl sm:text-5xl leading-tight tracking-tight mb-5">{p.title}</h1>

        {/* Excerpt */}
        {p.excerpt && (
          <p className="text-lg text-[var(--muted)] font-light leading-relaxed mb-8 border-l-2 border-[var(--accent)] pl-5">
            {p.excerpt}
          </p>
        )}

        {/* Author row */}
        <div className="flex items-center justify-between flex-wrap gap-4 py-5 border-t border-b border-[var(--border-color)] mb-8">
          <div className="flex items-center gap-3">
            {p.author_avatar ? (
              <Image src={p.author_avatar} alt={p.author_name || ''} width={40} height={40} className="rounded-full" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[var(--accent)] flex items-center justify-center font-bold text-[#0d0d10]">
                {(p.author_name || 'A')[0]}
              </div>
            )}
            <div>
              <p className="text-sm font-semibold">{p.author_name || 'Anonymous'}</p>
              {p.published_at && <p className="text-xs text-[var(--muted)]">{formatDate(p.published_at)}</p>}
            </div>
          </div>
          <ShareButtons title={p.title} url={absoluteUrl(`/blog/${p.slug}`)} />
        </div>

        {/* Thumbnail */}
        {p.thumbnail_url && (
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl mb-10 bg-[var(--surface2)]">
            <Image src={p.thumbnail_url} alt={p.title} fill className="object-cover" priority />
          </div>
        )}

        {/* Content */}
        <div
          className="prose prose-lg max-w-none mb-14"
          dangerouslySetInnerHTML={{ __html: p.content }}
        />

        {/* Tags */}
        {p.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 py-6 border-t border-[var(--border-color)] mb-10">
            <span className="text-xs text-[var(--muted)] font-medium uppercase tracking-wider mr-1">Tags:</span>
            {p.tags.map((tag) => (
              <Link key={tag} href={`/blog?q=${tag}`} className="badge badge-muted hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors">
                {tag}
              </Link>
            ))}
          </div>
        )}

        {/* Share (bottom) */}
        <div className="flex items-center justify-center gap-3 py-8 border-t border-b border-[var(--border-color)] mb-14">
          <span className="text-sm text-[var(--muted)]">Share this post</span>
          <ShareButtons title={p.title} url={absoluteUrl(`/blog/${p.slug}`)} />
        </div>

        {/* Comments */}
        <CommentSection postId={p.id} />

        {/* Related */}
        {related && related.length > 0 && (
          <div className="mt-20">
            <h2 className="font-serif text-2xl mb-6">Related Posts</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {(related as BlogPost[]).map((rp) => (
                <BlogCard key={rp.id} post={rp} />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
