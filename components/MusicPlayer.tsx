'use client'

import { useEffect, useRef, useState } from 'react'

export default function MusicPlayer({
  postId,
  mediaUrl,
  coverUrl,
  currentlyPlayingId,
  setCurrentlyPlayingId
}: {
  postId: string
  mediaUrl: string
  coverUrl?: string | null
  currentlyPlayingId: string | null
  setCurrentlyPlayingId: React.Dispatch<React.SetStateAction<string | null>>
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [loop, setLoop] = useState(false)

  const isPlaying = currentlyPlayingId === postId

  const togglePlay = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      setCurrentlyPlayingId(null)
    } else {
      setCurrentlyPlayingId(postId)
    }
  }

  // Sync play/pause with global state
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.play()
    } else {
      audio.pause()
    }
  }, [isPlaying])

  // Attach loop property dynamically
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.loop = loop
    }
  }, [loop])

  // Progress + duration
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateProgress = () => {
      setProgress(audio.currentTime)
    }

    const setMeta = () => {
      setDuration(audio.duration)
    }

    const handleEnded = () => {
      if (!loop) {
        setCurrentlyPlayingId(null)
        setProgress(0)
      }
    }

    const handlePause = () => {
      setCurrentlyPlayingId((prev) => (prev === postId ? null : prev))
    }

    const handlePlay = () => {
      setCurrentlyPlayingId(postId)
    }

    audio.addEventListener('timeupdate', updateProgress)
    audio.addEventListener('loadedmetadata', setMeta)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('play', handlePlay)

    return () => {
      audio.removeEventListener('timeupdate', updateProgress)
      audio.removeEventListener('loadedmetadata', setMeta)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('play', handlePlay)
    }
  }, [loop, postId])

  const handleSeek = (e: any) => {
    if (!audioRef.current) return
    const value = Number(e.target.value)
    audioRef.current.currentTime = value
    setProgress(value)
  }

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return '0:00'
    const mins = Math.floor(time / 60)
    const secs = Math.floor(time % 60)
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  return (
    <div className="relative w-full aspect-square bg-neutral-900 overflow-hidden">
      {/* Cover */}
      {coverUrl && (
        <img
          src={coverUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      <audio ref={audioRef} src={mediaUrl} />

      {/* Center Play Button */}
      <div className="absolute inset-0 flex items-center justify-center">
        <button
          onClick={togglePlay}
          className="
            w-12 h-12 sm:w-14 sm:h-14
            rounded-full
            bg-white/20 backdrop-blur-md
            text-white
            text-lg sm:text-xl
            flex items-center justify-center
            hover:bg-white/30
            transition
          "
        >
          {isPlaying ? '❚❚' : '▶'}
        </button>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-3 space-y-2 text-xs">
        <input
          type="range"
          min="0"
          max={duration || 0}
          value={progress}
          onChange={handleSeek}
          style={{
            background: `linear-gradient(to right, white ${
              duration ? (progress / duration) * 100 : 0
            }%, #525252 ${duration ? (progress / duration) * 100 : 0}%)`
          }}
          className="
    w-full
    h-1
    appearance-none
    rounded-full
    bg-neutral-600
    [&::-webkit-slider-thumb]:appearance-none
    [&::-webkit-slider-thumb]:w-3
    [&::-webkit-slider-thumb]:h-3
    [&::-webkit-slider-thumb]:rounded-full
    [&::-webkit-slider-thumb]:bg-white
  "
        />

        <div className="flex items-center justify-between">
          <span className="leading-none">
            {formatTime(progress)} / {formatTime(duration)}
          </span>
          <button
            onClick={() => setLoop(!loop)}
            className={`flex items-center justify-center rounded-full text-xl sm:text-lg leading-none transition ${loop ? 'text-white' : 'text-neutral-500'}`}
          >
            ⟲
          </button>
        </div>
      </div>
    </div>
  )
}
