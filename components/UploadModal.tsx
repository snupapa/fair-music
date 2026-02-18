'use client'

import { useEffect, useRef, useState } from 'react'
import { uploadPost } from '@/lib/posts'
import { supabase } from '@/lib/supabase'

export default function UploadModal({
  onClose,
  onSuccess
}: {
  onClose: () => void
  onSuccess: () => void
}) {
  const [type, setType] = useState<'image' | 'audio'>('image')
  const [title, setTitle] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [cover, setCover] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const cameraRef = useRef<HTMLInputElement | null>(null)
  const galleryRef = useRef<HTMLInputElement | null>(null)
  const audioRef = useRef<HTMLInputElement | null>(null)
  const coverRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    setFile(null)
    setCover(null)
  }, [type])

  const canUpload =
    type === 'image'
      ? Boolean(title.trim() && file)
      : Boolean(title.trim() && file && cover)

  const handleSubmit = async () => {
    if (!canUpload || uploading) return
    if (title.trim().length === 0) return

    if (title.length > 120) {
      alert('Title must be under 120 characters.')
      return
    }

    setUploading(true)

    const { data } = await supabase.auth.getUser()
    if (!data.user) {
      window.location.href = '/auth'
      return
    }

    try {
      await uploadPost({ type, title, file, cover })
      onSuccess()
    } catch (err: any) {
      alert(err.message)
      setUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center px-4">
      <div className="bg-neutral-900 p-6 w-full max-w-sm rounded-xl space-y-6">
        {/* Tabs */}
        <div className="flex justify-center space-x-8 text-sm">
          <button
            onClick={() => setType('image')}
            className={type === 'image' ? 'text-white' : 'text-neutral-500'}
          >
            image
          </button>
          <button
            onClick={() => setType('audio')}
            className={type === 'audio' ? 'text-white' : 'text-neutral-500'}
          >
            music
          </button>
        </div>

        {/* Title */}
        <input
          type="text"
          maxLength={120}
          placeholder="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="bg-black p-3 w-full rounded-md outline-none"
        />

        {/* IMAGE TAB */}
        {type === 'image' && (
          <div className="space-y-4">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              ref={cameraRef}
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />

            <input
              type="file"
              accept="image/*"
              ref={galleryRef}
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => cameraRef.current?.click()}
                className="w-full bg-neutral-800 p-3 rounded-md"
              >
                take photo
              </button>

              <button
                type="button"
                onClick={() => galleryRef.current?.click()}
                className="w-full bg-neutral-800 p-3 rounded-md"
              >
                choose from gallery
              </button>
            </div>

            {file && (
              <img
                src={URL.createObjectURL(file)}
                className="w-full aspect-square object-cover rounded-md"
                alt="preview"
              />
            )}
          </div>
        )}

        {/* MUSIC TAB */}
        {type === 'audio' && (
          <div className="space-y-5">
            {/* Hidden inputs */}
            <input
              type="file"
              accept=".mp3,.m4a,audio/mpeg,audio/mp4"
              ref={audioRef}
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />

            <input
              type="file"
              accept="image/*"
              ref={coverRef}
              className="hidden"
              onChange={(e) => setCover(e.target.files?.[0] || null)}
            />

            {/* Buttons */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => audioRef.current?.click()}
                className="w-full bg-neutral-800 p-3 rounded-md"
              >
                choose mp3 file
              </button>

              {file && (
                <p className="text-xs text-neutral-400 truncate">
                  selected: {file.name}
                </p>
              )}

              <button
                type="button"
                onClick={() => coverRef.current?.click()}
                className="w-full bg-neutral-800 p-3 rounded-md"
              >
                choose cover image
              </button>

              {cover && (
                <img
                  src={URL.createObjectURL(cover)}
                  className="w-full aspect-square object-cover rounded-md"
                  alt="cover preview"
                />
              )}
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-between items-center pt-2">
          <button onClick={onClose} className="text-sm text-neutral-400">
            cancel
          </button>

          <button
            disabled={!canUpload || uploading}
            onClick={handleSubmit}
            className={`px-5 py-2 rounded-md ${
              canUpload && !uploading
                ? 'bg-white text-black'
                : 'bg-neutral-700 text-neutral-400'
            }`}
          >
            {uploading ? 'uploading...' : 'upload'}
          </button>
        </div>
      </div>
    </div>
  )
}
