'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props { currentPage: number; totalPages: number }

export function Pagination({ currentPage, totalPages }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const go = (page: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', String(page))
    router.push(`?${params.toString()}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1
  )

  const rendered: (number | '...')[] = []
  for (let i = 0; i < pages.length; i++) {
    if (i > 0 && pages[i] - pages[i - 1] > 1) rendered.push('...')
    rendered.push(pages[i])
  }

  return (
    <div className="flex items-center justify-center gap-1.5">
      <button
        onClick={() => go(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg bg-[var(--surface)] border border-[var(--border-color)] text-[var(--muted)] hover:text-[var(--text)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft size={16} />
      </button>

      {rendered.map((p, i) =>
        p === '...' ? (
          <span key={`dot-${i}`} className="px-2 text-[var(--muted)] text-sm">…</span>
        ) : (
          <button
            key={p}
            onClick={() => go(p as number)}
            className={`w-9 h-9 rounded-lg text-sm font-medium transition-all border ${
              p === currentPage
                ? 'bg-[var(--accent)] text-[#0d0d10] border-[var(--accent)] font-semibold'
                : 'bg-[var(--surface)] text-[var(--muted)] border-[var(--border-color)] hover:text-[var(--text)] hover:border-[#3a3a44]'
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => go(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg bg-[var(--surface)] border border-[var(--border-color)] text-[var(--muted)] hover:text-[var(--text)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  )
}
