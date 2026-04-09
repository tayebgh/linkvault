import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'https://linkvault.app'
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/dashboard', '/api/', '/blog/new', '/blog/edit/'] },
    ],
    sitemap: `${base}/sitemap.xml`,
  }
}
