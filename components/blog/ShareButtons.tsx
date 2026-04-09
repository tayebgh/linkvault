'use client'

import { Twitter, Linkedin, Link2, Facebook } from 'lucide-react'
import { toast } from 'sonner'

interface Props { title: string; url: string }

export function ShareButtons({ title, url }: Props) {
  const encoded = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)

  const share = (platform: string) => {
    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encoded}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encoded}`,
    }
    window.open(urls[platform], '_blank', 'width=600,height=450')
  }

  const copyLink = async () => {
    await navigator.clipboard.writeText(url)
    toast.success('Link copied!')
  }

  return (
    <div className="flex items-center gap-2">
      <button onClick={() => share('twitter')} className="p-2 rounded-lg bg-[var(--surface)] border border-[var(--border-color)] text-[var(--muted)] hover:text-[#1da1f2] hover:border-[#1da1f2] transition-all" aria-label="Share on Twitter">
        <Twitter size={14} />
      </button>
      <button onClick={() => share('linkedin')} className="p-2 rounded-lg bg-[var(--surface)] border border-[var(--border-color)] text-[var(--muted)] hover:text-[#0077b5] hover:border-[#0077b5] transition-all" aria-label="Share on LinkedIn">
        <Linkedin size={14} />
      </button>
      <button onClick={() => share('facebook')} className="p-2 rounded-lg bg-[var(--surface)] border border-[var(--border-color)] text-[var(--muted)] hover:text-[#4267b2] hover:border-[#4267b2] transition-all" aria-label="Share on Facebook">
        <Facebook size={14} />
      </button>
      <button onClick={copyLink} className="p-2 rounded-lg bg-[var(--surface)] border border-[var(--border-color)] text-[var(--muted)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-all" aria-label="Copy link">
        <Link2 size={14} />
      </button>
    </div>
  )
}
