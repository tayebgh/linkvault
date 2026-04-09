import { NextAuthOptions, Session, User } from 'next-auth'
import GithubProvider from 'next-auth/providers/github'
import GoogleProvider from 'next-auth/providers/google'
import AzureADProvider from 'next-auth/providers/azure-ad'
import { supabaseAdmin } from './supabase'

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false
      try {
        // Upsert profile in Supabase
        await supabaseAdmin.from('profiles').upsert(
          {
            email: user.email,
            name: user.name || user.email.split('@')[0],
            avatar_url: user.image || null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'email', ignoreDuplicates: false }
        )
        return true
      } catch {
        return true // Don't block sign-in if profile upsert fails
      }
    },
    async jwt({ token, user }) {
      if (user?.email) {
        // Fetch role from Supabase
        const { data } = await supabaseAdmin
          .from('profiles')
          .select('id, role')
          .eq('email', user.email)
          .single()
        token.userId = data?.id
        token.role = data?.role || 'user'
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as Session['user'] & { id: string; role: string }).id = token.userId as string
        ;(session.user as Session['user'] & { id: string; role: string }).role = token.role as string
      }
      return session
    },
  },
}

// Extend next-auth types
declare module 'next-auth' {
  interface Session {
    user: User & { id: string; role: string }
  }
}
declare module 'next-auth/jwt' {
  interface JWT { userId?: string; role?: string }
}
