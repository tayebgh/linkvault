import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { slugify, estimateReadingTime } from '@/lib/utils'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const page = Number(searchParams.get('page')) || 1
  const per_page = Number(searchParams.get('per_page')) || 9
  const category = searchParams.get('category') || ''
  const q = searchParams.get('q') || ''
  const status = searchParams.get('status') || 'published'

  let query = supabaseAdmin
    .from('blog_posts')
    .select('*', { count: 'exact' })
    .eq('status', status)
    .order('published_at', { ascending: false })
    .range((page - 1) * per_page, page * per_page - 1)

  if (category) query = query.eq('category', category)
  if (q) query = query.ilike('title', `%${q}%`)

  const { data, count, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data, count, page, per_page })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { title, slug, excerpt, content, thumbnail_url, category, tags, status,
          meta_title, meta_description, og_image } = body

  if (!title || !content) {
    return NextResponse.json({ error: 'title and content are required' }, { status: 400 })
  }

  const finalSlug = slug ? slugify(slug) : slugify(title)
  const reading_time = estimateReadingTime(content)

  // Check slug uniqueness
  const { data: existing } = await supabaseAdmin.from('blog_posts').select('id').eq('slug', finalSlug).single()
  if (existing) {
    return NextResponse.json({ error: 'A post with this slug already exists' }, { status: 409 })
  }

  const { data, error } = await supabaseAdmin.from('blog_posts').insert({
    title: title.trim(),
    slug: finalSlug,
    excerpt: excerpt?.trim(),
    content,
    thumbnail_url: thumbnail_url || null,
    category: category || 'General',
    tags: Array.isArray(tags) ? tags : (tags || '').split(',').map((t: string) => t.trim()).filter(Boolean),
    author_id: (session.user as any).id,
    author_name: session.user.name || 'Anonymous',
    author_avatar: session.user.image || null,
    status: status || 'draft',
    published_at: status === 'published' ? new Date().toISOString() : null,
    reading_time,
    meta_title: meta_title || null,
    meta_description: meta_description || null,
    og_image: og_image || null,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ post: data }, { status: 201 })
}
