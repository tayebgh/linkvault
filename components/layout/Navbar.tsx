'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import Image from 'next/image'
import { Menu, X, Plus, LogOut, User, LayoutDashboard, BookOpen, Link2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/', label: 'Links', icon: Link2 },
  { href: '/blog', label: 'Blog', icon: BookOpen },
]

export function Navbar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const appName = process.env.NEXT_PUBLIC_APP_NAME || 'LinkVault'

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border-color)] bg-[rgba(13,13,16,0.85)] backdrop-blur-xl">
      <div className="container-app flex h-16 items-center justify-between px-4 sm:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent)] flex items-center justify-center font-serif font-bold text-lg text-[#0d0d10]">
            L
          </div>
          <span className="font-semibold text-base tracking-tight">
            {appName.split('').map((char, i) =>
              i === 4 ? <span key={i} className="text-[var(--accent)]">{char}</span> : char
            )}
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                pathname === href || (href !== '/' && pathname.startsWith(href))
                  ? 'text-[var(--text)] bg-[var(--surface)]'
                  : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)]'
              )}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {session ? (
            <>
              <Link href="/links/new" className="hidden sm:flex btn btn-primary text-xs py-2">
                <Plus size={14} /> Submit Link
              </Link>

              {/* Avatar dropdown */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1 rounded-lg hover:bg-[var(--surface)] transition-colors"
                >
                  {session.user.image ? (
                    <Image src={session.user.image} alt={session.user.name || ''} width={32} height={32} className="rounded-full" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center text-[#0d0d10] font-semibold text-sm">
                      {(session.user.name || session.user.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                </button>

                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-52 bg-[var(--surface)] border border-[var(--border-color)] rounded-xl py-2 z-20 shadow-xl">
                      <div className="px-3 py-2 border-b border-[var(--border-color)] mb-1">
                        <div className="text-sm font-medium truncate">{session.user.name}</div>
                        <div className="text-xs text-[var(--muted)] truncate">{session.user.email}</div>
                      </div>
                      {(session.user as any).role === 'admin' || (session.user as any).role === 'editor' ? (
                        <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface2)] transition-colors" onClick={() => setDropdownOpen(false)}>
                          <LayoutDashboard size={14} /> Dashboard
                        </Link>
                      ) : null}
                      <Link href="/blog/new" className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface2)] transition-colors" onClick={() => setDropdownOpen(false)}>
                        <Plus size={14} /> Write Post
                      </Link>
                      <button
                        onClick={() => { setDropdownOpen(false); signOut({ callbackUrl: '/' }) }}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-[var(--surface2)] transition-colors"
                      >
                        <LogOut size={14} /> Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <Link href="/login" className="btn btn-primary text-xs py-2">
              Sign In
            </Link>
          )}

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-[var(--muted)] hover:text-[var(--text)]"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <div className="md:hidden border-t border-[var(--border-color)] bg-[var(--surface)] px-4 py-4 space-y-1">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className={cn(
                'flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium',
                pathname === href ? 'bg-[var(--surface2)] text-[var(--text)]' : 'text-[var(--muted)]'
              )}
            >
              <Icon size={16} /> {label}
            </Link>
          ))}
          {session && (
            <Link href="/links/new" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--accent)]">
              <Plus size={16} /> Submit Link
            </Link>
          )}
        </div>
      )}
    </header>
  )
}
