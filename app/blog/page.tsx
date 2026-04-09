import type { Metadata } from 'next'
import { Suspense } from 'react'
import { supabaseAdmin } from '@/lib/supabase'
import { BlogCard } from '@/components/blog/BlogCard'
import { BlogCategoryFilter } from '@/components/blog/BlogCategoryFilter'
import { Pagination } from '@/components/ui/Pagination'
import type { BlogPost, BlogCategory } from '@/types'

export const metadata: Metadata = {
  title: 'Blog — Insights, Tutorials & More',
  description: 'Read our latest articles on technology, design, productivity, and more.',
}

export const revalidate = 60

const PER_PAGE = 9

interface Props {
  searchParams: { category?: string; page?: string; q?: string }
}

export default async function BlogPage({ searchParams }: Props) {
  const page = Number(searchParams.page) || 1
  const category = searchParams.category || ''
  const search = searchParams.q || ''

  // Posts query
  let query = supabaseAdmin
    .from('blog_posts')
    .select('*', { count: 'exact' })
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .range((page - 1) * PER_PAGE, page * PER_PAGE - 1)

  if (category) query = query.eq('category', category)
  if (search) query = query.ilike('title', `%${search}%`)

  const [{ data: posts, count }, { data: categories }] = await Promise.all([
    query,
    supabaseAdmin.from('blog_categories').select('*').order('name'),
  ])

  const totalPages = Math.ceil((count || 0) / PER_PAGE)
  const featured = posts?.find((p) => p.featured)

  return (
    <div>
      {/* Hero */}
      <div className="relative overflow-hidden py-20 px-4 sm:px-8 text-center border-b border-[var(--border-color)]">
        <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] rounded-full bg-[rgba(90,240,232,0.05)] blur-3xl" />
        <div className="relative container-narrow">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--surface)] border border-[var(--border-color)] text-xs font-medium text-[var(--muted)] uppercase tracking-widest mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent2)]" />
            The Blog
          </div>
          <h1 className="font-serif text-5xl sm:text-6xl tracking-tight mb-4">
            Ideas, <em className="not-italic italic text-[var(--accent2)]">insights</em> &amp; tutorials
          </h1>
          <p className="text-[var(--muted)] text-lg font-light max-w-md mx-auto">
            Deep dives on technology, design, and the modern web.
          </p>
        </div>
      </div>

      <div className="container-app px-4 sm:px-8 py-12">
        {/* Categories */}
        <BlogCategoryFilter categories={(categories as BlogCategory[]) || []} />

        {/* Featured post */}
        {featured && !category && !search && page === 1 && (
          <div className="mb-10">
            <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-widest mb-4">Featured</p>
            <BlogCard post={featured as BlogPost} featured />
          </div>
        )}

        {/* Grid */}
        {!posts?.length ? (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">📭</div>
            <h3 className="font-serif text-2xl mb-2">No posts yet</h3>
            <p className="text-[var(--muted)] text-sm">Check back soon for new content.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(posts as BlogPost[])
              .filter((p) => !p.featured || category || search || page > 1)
              .map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-12">
            <Pagination currentPage={page} totalPages={totalPages} />
          </div>
        )}
      </div>
    </div>
  )
}
