'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import type { BlogCategory } from '@/types'

interface Props { categories: BlogCategory[] }

export function BlogCategoryFilter({ categories }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const current = searchParams.get('category') || ''

  const set = (slug: string) => {
    const params = new URLSearchParams(searchParams)
    if (!slug) params.delete('category')
    else params.set('category', slug)
    params.delete('page')
    router.push(`/blog?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-2 flex-wrap mb-8 pb-6 border-b border-[var(--border-color)]">
      <span className="text-xs font-semibold text-[var(--muted)] uppercase tracking-widest mr-2">Topic</span>
      <button
        onClick={() => set('')}
        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
          !current ? 'bg-[var(--accent)] text-[#0d0d10] border-[var(--accent)]' : 'bg-[var(--surface)] text-[var(--muted)] border-[var(--border-color)] hover:text-[var(--text)]'
        }`}
      >
        All
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => set(cat.slug)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
            current === cat.slug ? 'bg-[var(--accent2)] text-[#0d0d10] border-[var(--accent2)]' : 'bg-[var(--surface)] text-[var(--muted)] border-[var(--border-color)] hover:text-[var(--text)]'
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  )
}
