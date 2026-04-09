'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

export function LinksHero() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const [query, setQuery] = useState(searchParams.get('q') || '')

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams)
    if (query) params.set('q', query)
    else params.delete('q')
    params.delete('page')
    router.push(`/?${params.toString()}`)
  }, [query, searchParams, router])

  return (
    <div className="relative overflow-hidden py-20 px-4 sm:px-8 text-center">
      {/* Background glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-[rgba(232,255,90,0.06)] blur-3xl" />

      <div className="relative container-narrow">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--surface)] border border-[var(--border-color)] text-xs font-medium text-[var(--muted)] uppercase tracking-widest mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
          Open Link Library
        </div>

        <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl leading-[1.07] tracking-tight mb-6">
          Discover the <em className="not-italic italic text-[var(--accent)]">best</em> links<br />
          on the internet
        </h1>

        <p className="text-lg text-[var(--muted)] font-light mb-10 max-w-md mx-auto leading-relaxed">
          A curated, community-driven collection of the most useful websites, tools, and resources.
        </p>

        <form onSubmit={handleSearch} className="relative max-w-lg mx-auto mb-6">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none" />
          <input
            type="search"
            placeholder="Search links, tools, resources…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="field-input pl-11 pr-4 py-3.5 text-base rounded-xl w-full"
          />
        </form>

        {!session && (
          <p className="text-sm text-[var(--muted)]">
            <Link href="/login" className="text-[var(--accent)] hover:underline">Sign in</Link> to bookmark links and submit new ones.
          </p>
        )}
      </div>
    </div>
  )
}
