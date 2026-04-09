import { redirect, notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { EditBlogPostClient } from './EditBlogPostClient'

interface Props { params: { slug: string } }

export default async function EditBlogPostPage({ params }: Props) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const { data: post, error } = await supabaseAdmin
    .from('blog_posts')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (error || !post) notFound()

  return <EditBlogPostClient post={post} />
}
