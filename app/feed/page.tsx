'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Navigation from '@/components/Navigation'
import PostCard from '@/components/PostCard'
import FloatingButton from '@/components/FloatingButton'
import UploadModal from '@/components/UploadModal'
import { useSearchParams } from 'next/navigation'

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

export default function Feed() {
  const [posts, setPosts] = useState<Post[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(
    null
  )

  console.log(currentUser)
  const fetchPosts = async () => {
    const { data } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) setPosts(data)
  }
  const searchParams = useSearchParams()
  const focusId = searchParams.get('focus')

  useEffect(() => {
    fetchPosts()
  }, [])

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      setCurrentUser(data.user)
    }
    getUser()
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
    }, 200) // small delay to ensure render

    return () => clearTimeout(timeout)
  }, [posts, focusId])

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center">
      <Navigation />

      <div className="w-full max-w-xl px-4 py-6 space-y-10">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            currentUser={currentUser}
            refresh={fetchPosts}
            currentlyPlayingId={currentlyPlayingId}
            setCurrentlyPlayingId={setCurrentlyPlayingId}
          />
        ))}
      </div>

      <FloatingButton
        onClick={async () => {
          const { data } = await supabase.auth.getUser()

          if (!data.user) {
            window.location.href = '/auth'
            return
          }

          setUploadOpen(true)
        }}
      />

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
