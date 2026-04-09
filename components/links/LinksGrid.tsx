import { supabaseAdmin } from '@/lib/supabase'
import type { Link } from '@/types'
import { LinkCard } from './LinkCard'
import { Pagination } from '@/components/ui/Pagination'

const PER_PAGE = 12

interface Props {
  search: string
  category: string
  page: number
}

export async function LinksGrid({ search, category, page }: Props) {
  let query = supabaseAdmin
    .from('links')
    .select('*', { count: 'exact' })
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .range((page - 1) * PER_PAGE, page * PER_PAGE - 1)

  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
  }
  if (category && category !== 'All') {
    query = query.eq('category', category)
  }

  const { data: links, count, error } = await query

  if (error) {
    return (
      <div className="text-center py-20 text-[var(--muted)]">
        <p className="text-lg mb-2">Failed to load links</p>
        <p className="text-sm">{error.message}</p>
      </div>
    )
  }

  if (!links || links.length === 0) {
    return (
      <div className="text-center py-24">
        <div className="text-5xl mb-4">🔍</div>
        <h3 className="font-serif text-2xl mb-2">No links found</h3>
        <p className="text-[var(--muted)] text-sm">Try adjusting your search or filter.</p>
      </div>
    )
  }

  const totalPages = Math.ceil((count || 0) / PER_PAGE)

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-[var(--muted)]">
          Showing <strong className="text-[var(--text)]">{links.length}</strong> of{' '}
          <strong className="text-[var(--text)]">{count}</strong> links
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {(links as Link[]).map((link) => (
          <LinkCard key={link.id} link={link} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-10">
          <Pagination currentPage={page} totalPages={totalPages} />
        </div>
      )}
    </div>
  )
}
