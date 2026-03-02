'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type Post = {
  id: string
  title: string
  cover_url: string | null
  media_url: string
}

export default function MusicPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const router = useRouter()

  useEffect(() => {
    const fetchSaved = async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('saved_music')
        .select('posts(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (!data) return

      const extracted = data.map((item: any) => item.posts)
      setPosts(extracted)
    }

    fetchSaved()
  }, [])

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-lg mb-6">music</h1>

      <div className="grid grid-cols-2 gap-4">
        {posts.map((post) => (
          <div
            key={post.id}
            onClick={() => router.push(`/feed?focus=${post.id}`)}
            className="aspect-square bg-neutral-900 overflow-hidden cursor-pointer"
          >
            {post.cover_url && (
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
