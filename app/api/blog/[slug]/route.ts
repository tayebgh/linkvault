import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { slugify, estimateReadingTime } from '@/lib/utils'

interface Context { params: { slug: string } }

export async function GET(_: NextRequest, { params }: Context) {
  const { data, error } = await supabaseAdmin
    .from('blog_posts')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ post: data })
}

export async function PATCH(req: NextRequest, { params }: Context) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { title, content, status, ...rest } = body

  const updates: Record<string, any> = { ...rest, updated_at: new Date().toISOString() }
  if (title) { updates.title = title.trim(); if (!body.slug) updates.slug = slugify(title) }
  if (content) { updates.content = content; updates.reading_time = estimateReadingTime(content) }
  if (status) {
    updates.status = status
    if (status === 'published') updates.published_at = new Date().toISOString()
  }

  const { data, error } = await supabaseAdmin
    .from('blog_posts')
    .update(updates)
    .eq('slug', params.slug)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ post: data })
}

export async function DELETE(_: NextRequest, { params }: Context) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const role = (session.user as any).role
  if (role !== 'admin' && role !== 'editor') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { error } = await supabaseAdmin.from('blog_posts').delete().eq('slug', params.slug)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
