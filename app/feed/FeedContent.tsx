'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useSearchParams } from 'next/navigation'
import Navigation from '@/components/Navigation'
import PostCard from '@/components/PostCard'
import FloatingButton from '@/components/FloatingButton'
import UploadModal from '@/components/UploadModal'

export type Post = {
  id: string
  user_id: string | null
  type: 'audio' | 'image'
  title: string
  media_url: string
  cover_url?: string | null
  rating_avg: number
  rating_count: number
  created_at: string
}

export default function FeedContent() {
  const [posts, setPosts] = useState<Post[]>([])
  const [uploadOpen, setUploadOpen] = useState(false)
  const searchParams = useSearchParams()
  const focusId = searchParams.get('focus')

  const fetchPosts = async () => {
    const { data } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) setPosts(data)
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  useEffect(() => {
    if (!focusId) return

    const timeout = setTimeout(() => {
      const el = document.getElementById(`post-${focusId}`)
      if (el) {
        el.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        })
      }
    }, 200)

    return () => clearTimeout(timeout)
  }, [posts, focusId])

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center">
      <Navigation />

      <div className="w-full max-w-xl px-4 py-6 space-y-10">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} refresh={fetchPosts} />
        ))}
      </div>

      <FloatingButton onClick={() => setUploadOpen(true)} />

      {uploadOpen && (
        <UploadModal
          onClose={() => setUploadOpen(false)}
          onSuccess={() => {
            setUploadOpen(false)
            fetchPosts()
          }}
        />
      )}
    </div>
  )
}
