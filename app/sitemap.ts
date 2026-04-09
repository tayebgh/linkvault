import { MetadataRoute } from 'next'
import { supabaseAdmin } from '@/lib/supabase'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'https://linkvault.app'

  const { data: posts } = await supabaseAdmin
    .from('blog_posts')
    .select('slug, updated_at')
    .eq('status', 'published')

  const { data: links } = await supabaseAdmin
    .from('links')
    .select('id, updated_at')
    .eq('status', 'approved')

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${base}/blog`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ]

  const postRoutes: MetadataRoute.Sitemap = (posts || []).map((p) => ({
    url: `${base}/blog/${p.slug}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const linkRoutes: MetadataRoute.Sitemap = (links || []).map((l) => ({
    url: `${base}/links/${l.id}`,
    lastModified: new Date(l.updated_at),
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  return [...staticRoutes, ...postRoutes, ...linkRoutes]
}
