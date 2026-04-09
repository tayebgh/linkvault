import type { Metadata } from 'next'
import { Suspense } from 'react'
import { LinksGrid } from '@/components/links/LinksGrid'
import { LinksHero } from '@/components/links/LinksHero'
import { LinksFilters } from '@/components/links/LinksFilters'

export const metadata: Metadata = {
  title: 'Browse Links — Open Web Library',
  description: 'Discover the best websites, tools, and resources curated by the community.',
}

export const revalidate = 60

export default function HomePage({
  searchParams,
}: {
  searchParams: { q?: string; category?: string; page?: string }
}) {
  return (
    <>
      <LinksHero />
      <div className="container-app px-4 sm:px-8 pb-20">
        <Suspense fallback={<div className="skeleton h-12 w-full mb-6" />}>
          <LinksFilters />
        </Suspense>
        <Suspense fallback={<LinksGridSkeleton />}>
          <LinksGrid
            search={searchParams.q || ''}
            category={searchParams.category || 'All'}
            page={Number(searchParams.page) || 1}
          />
        </Suspense>
      </div>
    </>
  )
}

function LinksGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="skeleton h-48 w-full" />
      ))}
    </div>
  )
}
