'use client'

import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Github, Chrome, Building2 } from 'lucide-react'

export default function LoginPage() {
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session) router.push('/')
  }, [session, router])

  const appName = process.env.NEXT_PUBLIC_APP_NAME || 'LinkVault'

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-[var(--accent)] flex items-center justify-center font-serif font-bold text-2xl text-[#0d0d10] mx-auto mb-4">
            L
          </div>
          <h1 className="font-serif text-3xl mb-2">Welcome back</h1>
          <p className="text-sm text-[var(--muted)]">Sign in to {appName} to continue</p>
        </div>

        {/* Auth providers */}
        <div className="bg-[var(--surface)] border border-[var(--border-color)] rounded-2xl p-6 space-y-3">
          {/* GitHub */}
          <button
            onClick={() => signIn('github', { callbackUrl: '/' })}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--surface2)] border border-[var(--border-color)] text-sm font-medium hover:border-[#3a3a44] hover:bg-[#22222a] transition-all"
          >
            <Github size={18} />
            Continue with GitHub
          </button>

          {/* Google */}
          <button
            onClick={() => signIn('google', { callbackUrl: '/' })}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--surface2)] border border-[var(--border-color)] text-sm font-medium hover:border-[#3a3a44] hover:bg-[#22222a] transition-all"
          >
            <Chrome size={18} className="text-[#4285f4]" />
            Continue with Google
          </button>

          {/* Azure AD */}
          {process.env.NEXT_PUBLIC_AZURE_AD_ENABLED !== 'false' && (
            <button
              onClick={() => signIn('azure-ad', { callbackUrl: '/' })}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--surface2)] border border-[var(--border-color)] text-sm font-medium hover:border-[#3a3a44] hover:bg-[#22222a] transition-all"
            >
              <Building2 size={18} className="text-[#0078d4]" />
              Continue with Microsoft / Azure AD
            </button>
          )}

          <div className="pt-3 border-t border-[var(--border-color)]">
            <p className="text-xs text-[var(--muted)] text-center leading-relaxed">
              By signing in, you agree to our{' '}
              <a href="/terms" className="text-[var(--accent)] hover:underline">Terms</a>{' '}
              and{' '}
              <a href="/privacy" className="text-[var(--accent)] hover:underline">Privacy Policy</a>.
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-[var(--muted)] mt-6">
          {appName} is open-source and self-hostable.
        </p>
      </div>
    </div>
  )
}
