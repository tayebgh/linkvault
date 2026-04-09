import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Browser / client-side Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side Supabase with service role (bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ---- STORAGE ----
export const BUCKET = process.env.NEXT_PUBLIC_SUPABASE_BUCKET || 'linkvault-uploads'

export async function uploadFile(
  file: File,
  path: string
): Promise<{ url: string | null; error: string | null }> {
  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(path, file, { upsert: true, cacheControl: '3600' })

  if (error) return { url: null, error: error.message }

  const { data: { publicUrl } } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(data.path)
  return { url: publicUrl, error: null }
}

export async function deleteFile(path: string): Promise<boolean> {
  const { error } = await supabaseAdmin.storage.from(BUCKET).remove([path])
  return !error
}
