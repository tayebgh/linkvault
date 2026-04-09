import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { DashboardClient } from './DashboardClient'

export const metadata: Metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const role = (session.user as any).role
  if (role !== 'admin' && role !== 'editor') redirect('/')

  const [
    { count: totalLinks },
    { count: pendingLinks },
    { count: totalPosts },
    { count: draftPosts },
    { count: totalComments },
    { data: recentLinks },
    { data: recentPosts },
  ] = await Promise.all([
    supabaseAdmin.from('links').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
    supabaseAdmin.from('links').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabaseAdmin.from('blog_posts').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabaseAdmin.from('blog_posts').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
    supabaseAdmin.from('comments').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
    supabaseAdmin.from('links').select('*').eq('status', 'pending').order('created_at', { ascending: false }).limit(10),
    supabaseAdmin.from('blog_posts').select('*').order('updated_at', { ascending: false }).limit(10),
  ])

  return (
    <DashboardClient
      stats={{ totalLinks: totalLinks || 0, pendingLinks: pendingLinks || 0, totalPosts: totalPosts || 0, draftPosts: draftPosts || 0, totalComments: totalComments || 0 }}
      recentLinks={recentLinks || []}
      recentPosts={recentPosts || []}
      session={session}
    />
  )
}
