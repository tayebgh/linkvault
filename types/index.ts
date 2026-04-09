// ============================================
// LinkVault — Global TypeScript Types
// ============================================

export type UserRole = 'user' | 'editor' | 'admin'

export interface Profile {
  id: string
  email: string
  name?: string
  avatar_url?: string
  role: UserRole
  bio?: string
  website?: string
  created_at: string
  updated_at: string
}

// ---- LINKS ----

export type LinkStatus = 'pending' | 'approved' | 'rejected'
export type LinkCategory = 'AI Tools' | 'Dev Tools' | 'Design' | 'Productivity' | 'Marketing' | 'Finance' | 'Education' | 'Entertainment' | 'News' | 'Other'

export const LINK_CATEGORIES: LinkCategory[] = [
  'AI Tools', 'Dev Tools', 'Design', 'Productivity',
  'Marketing', 'Finance', 'Education', 'Entertainment', 'News', 'Other'
]

export interface Link {
  id: string
  title: string
  url: string
  description: string
  logo_url?: string
  category: LinkCategory
  tags: string[]
  submitted_by?: string
  submitted_by_name?: string
  views: number
  bookmarks: number
  status: LinkStatus
  featured: boolean
  created_at: string
  updated_at: string
}

export interface LinkWithBookmark extends Link {
  is_bookmarked?: boolean
}

// ---- BLOG ----

export type PostStatus = 'draft' | 'published' | 'archived'

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt?: string
  content: string
  thumbnail_url?: string
  category: string
  tags: string[]
  author_id?: string
  author_name?: string
  author_avatar?: string
  status: PostStatus
  featured: boolean
  views: number
  reading_time: number
  // SEO
  meta_title?: string
  meta_description?: string
  og_image?: string
  canonical_url?: string
  // Timestamps
  published_at?: string
  created_at: string
  updated_at: string
}

export interface BlogCategory {
  id: string
  name: string
  slug: string
  description?: string
  color: string
  post_count: number
  created_at: string
}

// ---- COMMENTS ----

export type CommentStatus = 'pending' | 'approved' | 'spam'

export interface Comment {
  id: string
  post_id: string
  author_id?: string
  author_name: string
  author_avatar?: string
  author_email?: string
  content: string
  parent_id?: string
  status: CommentStatus
  likes: number
  created_at: string
  updated_at: string
  replies?: Comment[]
  is_liked?: boolean
}

// ---- API RESPONSES ----

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  per_page: number
  total_pages: number
}

export interface ApiError {
  error: string
  message?: string
  status?: number
}

// ---- FORMS ----

export interface LinkFormData {
  title: string
  url: string
  description: string
  category: LinkCategory
  tags: string
}

export interface BlogPostFormData {
  title: string
  slug: string
  excerpt: string
  content: string
  thumbnail_url?: string
  category: string
  tags: string
  status: PostStatus
  meta_title?: string
  meta_description?: string
  og_image?: string
}

export interface CommentFormData {
  author_name: string
  author_email: string
  content: string
  parent_id?: string
}
