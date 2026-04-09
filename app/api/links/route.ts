import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { getFavicon } from '@/lib/utils'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const page = Number(searchParams.get('page')) || 1
  const per_page = Number(searchParams.get('per_page')) || 12
  const category = searchParams.get('category') || ''
  const q = searchParams.get('q') || ''
  const status = searchParams.get('status') || 'approved'

  let query = supabaseAdmin
    .from('links')
    .select('*', { count: 'exact' })
    .eq('status', status)
    .order('created_at', { ascending: false })
    .range((page - 1) * per_page, page * per_page - 1)

  if (category && category !== 'All') query = query.eq('category', category)
  if (q) query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`)

  const { data, count, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data, count, page, per_page })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { title, url, description, category, tags } = body

  if (!title || !url || !description) {
    return NextResponse.json({ error: 'title, url, description are required' }, { status: 400 })
  }

  // Normalize URL
  const normalizedUrl = url.startsWith('http') ? url : `https://${url}`

  // Check duplicate
  const { data: existing } = await supabaseAdmin.from('links').select('id').eq('url', normalizedUrl).single()
  if (existing) return NextResponse.json({ error: 'This link already exists' }, { status: 409 })

  const logo_url = getFavicon(normalizedUrl)
  const tagsArray = Array.isArray(tags) ? tags : (tags || '').split(',').map((t: string) => t.trim()).filter(Boolean)

  const { data, error } = await supabaseAdmin.from('links').insert({
    title: title.trim(),
    url: normalizedUrl,
    description: description.trim(),
    category: category || 'Other',
    tags: tagsArray,
    logo_url,
    submitted_by: (session.user as any).id,
    submitted_by_name: session.user.name || session.user.email,
    status: 'pending', // requires admin approval
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ link: data }, { status: 201 })
}
