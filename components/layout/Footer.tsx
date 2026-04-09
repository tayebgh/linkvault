import Link from 'next/link'
import { Github } from 'lucide-react'

export function Footer() {
  const year = new Date().getFullYear()
  const appName = process.env.NEXT_PUBLIC_APP_NAME || 'LinkVault'

  return (
    <footer className="border-t border-[var(--border-color)] py-10 px-4 sm:px-8">
      <div className="container-app flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-[var(--accent)] flex items-center justify-center font-serif font-bold text-sm text-[#0d0d10]">L</div>
          <span className="font-semibold text-sm">{appName}</span>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-[var(--muted)]">
          <Link href="/" className="hover:text-[var(--text)] transition-colors">Links</Link>
          <Link href="/blog" className="hover:text-[var(--text)] transition-colors">Blog</Link>
          <Link href="/sitemap.xml" className="hover:text-[var(--text)] transition-colors">Sitemap</Link>
        </nav>

        <div className="flex items-center gap-4 text-sm text-[var(--muted)]">
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--text)] transition-colors">
            <Github size={16} />
          </a>
          <span>© {year} {appName}</span>
        </div>
      </div>
    </footer>
  )
}
