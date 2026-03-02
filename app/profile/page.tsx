'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type Post = {
  id: string
  title: string
  type: 'image' | 'audio'
  cover_url?: string | null
  media_url: string
}

export default function ProfilePage() {
  const [posts, setPosts] = useState<Post[]>([])
  const router = useRouter()

  useEffect(() => {
    const fetchUploads = async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (data) setPosts(data)
    }

    fetchUploads()
  }, [])

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-lg mb-6">profile</h1>

      <div className="grid grid-cols-2 gap-4">
        {posts.map((post) => (
          <div
            key={post.id}
            onClick={() => router.push(`/feed?focus=${post.id}`)}
            className="aspect-square bg-neutral-900 overflow-hidden cursor-pointer"
          >
            {post.type === 'image' && (
              <img
                src={post.media_url}
                alt=""
                className="w-full h-full object-cover"
              />
            )}

            {post.type === 'audio' && post.cover_url && (
              <img
                src={post.cover_url}
                alt=""
                className="w-full h-full object-cover"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
