import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { link_id } = await req.json()
  if (!link_id) return NextResponse.json({ error: 'link_id required' }, { status: 400 })

  const userId = (session.user as any).id
  const { error } = await supabaseAdmin
    .from('link_bookmarks')
    .insert({ link_id, user_id: userId })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { link_id } = await req.json()
  const userId = (session.user as any).id

  const { error } = await supabaseAdmin
    .from('link_bookmarks')
    .delete()
    .eq('link_id', link_id)
    .eq('user_id', userId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as any).id
  const { data, error } = await supabaseAdmin
    .from('link_bookmarks')
    .select('link_id, links(*)')
    .eq('user_id', userId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ bookmarks: data })
}
