'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { LINK_CATEGORIES } from '@/types'

export function LinksFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const current = searchParams.get('category') || 'All'

  const setCategory = (cat: string) => {
    const params = new URLSearchParams(searchParams)
    if (cat === 'All') params.delete('category')
    else params.set('category', cat)
    params.delete('page')
    router.push(`/?${params.toString()}`)
  }

  const all = ['All', ...LINK_CATEGORIES]

  return (
    <div className="flex items-center gap-2 flex-wrap mb-6 pb-6 border-b border-[var(--border-color)]">
      <span className="text-xs font-semibold text-[var(--muted)] uppercase tracking-widest mr-2">Filter</span>
      {all.map((cat) => (
        <button
          key={cat}
          onClick={() => setCategory(cat)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
            current === cat
              ? 'bg-[var(--accent)] text-[#0d0d10] border-[var(--accent)]'
              : 'bg-[var(--surface)] text-[var(--muted)] border-[var(--border-color)] hover:text-[var(--text)] hover:border-[#3a3a44]'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  )
}
