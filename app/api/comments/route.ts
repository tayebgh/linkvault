import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const postId = searchParams.get('post_id')
  if (!postId) return NextResponse.json({ error: 'post_id required' }, { status: 400 })

  const { data, error } = await supabaseAdmin
    .from('comments')
    .select('*')
    .eq('post_id', postId)
    .eq('status', 'approved')
    .is('parent_id', null)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Fetch replies for each top-level comment
  const withReplies = await Promise.all(
    (data || []).map(async (comment) => {
      const { data: replies } = await supabaseAdmin
        .from('comments')
        .select('*')
        .eq('parent_id', comment.id)
        .eq('status', 'approved')
        .order('created_at', { ascending: true })
      return { ...comment, replies: replies || [] }
    })
  )

  return NextResponse.json({ comments: withReplies })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const session = await getServerSession(authOptions)

  const { post_id, author_name, author_email, content, parent_id } = body
  if (!post_id || !content?.trim()) {
    return NextResponse.json({ error: 'post_id and content are required' }, { status: 400 })
  }

  const name = session?.user?.name || author_name?.trim()
  if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 })

  const { data, error } = await supabaseAdmin.from('comments').insert({
    post_id,
    author_id: (session?.user as any)?.id || null,
    author_name: name,
    author_avatar: session?.user?.image || null,
    author_email: session?.user?.email || author_email || null,
    content: content.trim(),
    parent_id: parent_id || null,
    status: 'approved',
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ comment: data }, { status: 201 })
}
