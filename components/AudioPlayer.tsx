'use client'

import { useRef, useEffect, useState } from 'react'
import { Post } from '@/app/feed/FeedContent'

export default function AudioPlayer({ post }: { post: Post }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)

  const togglePlay = () => {
    if (!audioRef.current) return

    if (playing) {
      audioRef.current.pause()
      setPlaying(false)
    } else {
      audioRef.current.play()
      setPlaying(true)
    }
  }

  return (
    <div className="relative w-full aspect-square bg-neutral-900 flex items-center justify-center">
      {post.cover_url && (
        <img
          src={post.cover_url}
          alt={post.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      <audio ref={audioRef} src={post.media_url} />

      <button
        onClick={togglePlay}
        className="relative z-10 w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white text-2xl"
      >
        {playing ? '❚❚' : '▶'}
      </button>
    </div>
  )
}
