'use client'

import { deletePost, toggleSave } from '@/lib/posts'
import { supabase } from '@/lib/supabase'
import { useState } from 'react'
import MusicPlayer from '@/components/MusicPlayer'

export default function PostCard({
  post,
  currentUser,
  refresh,
  currentlyPlayingId,
  setCurrentlyPlayingId
}: any) {
  const [saving, setSaving] = useState(false)

  function formatTimeAgo(dateString: string) {
    const date = new Date(dateString + 'Z') // force UTC interpretation
    const diff = Date.now() - date.getTime()

    const minutes = Math.floor(diff / 60000)
    if (minutes < 1) return 'now'
    if (minutes < 60) return `${minutes}m`

    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h`

    const days = Math.floor(hours / 24)
    return `${days}d`
  }

  const handleDelete = async () => {
    if (!confirm('Delete this post?')) return
    await deletePost(post)
    refresh()
  }

  const handleSave = async () => {
    if (!currentUser) {
      window.location.href = '/auth'
      return
    }

    setSaving(true)

    await supabase.from('saved').insert([
      {
        user_id: currentUser.id,
        post_id: post.id
      }
    ])

    setSaving(false)
  }

  return (
    <div id={`post-${post.id}`} className="space-y-3">
      <div className="flex items-end justify-between space-x-1">
        <h2 className="text-base font-medium leading-tight break-all line-clamp-2">
          {post.title}
        </h2>

        <span className="text-xs text-neutral-500">
          {formatTimeAgo(post.created_at)}
        </span>
      </div>

      {post.type === 'audio' && (
        <div className="w-full aspect-square relative">
          {post.cover_url && (
            <img
              src={post.cover_url}
              alt={post.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          {post.type === 'audio' && (
            <MusicPlayer
              postId={post.id}
              mediaUrl={post.media_url}
              coverUrl={post.cover_url}
              currentlyPlayingId={currentlyPlayingId}
              setCurrentlyPlayingId={setCurrentlyPlayingId}
            />
          )}
        </div>
      )}

      {post.type === 'image' && (
        <div className="w-full aspect-square">
          <img
            src={post.media_url}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="flex items-center justify-between text-sm text-neutral-500 leading-none">
        <span>comments</span>

        {currentUser?.id !== post.user_id && post.type === 'audio' && (
          <button
            onClick={async () => {
              try {
                await toggleSave(post.id)
              } catch {
                window.location.href = '/auth'
              }
            }}
            className="hover:text-white transition"
          >
            save
          </button>
        )}

        {currentUser?.id === post.user_id && (
          <button onClick={handleDelete}>delete</button>
        )}
      </div>
    </div>
  )
}
