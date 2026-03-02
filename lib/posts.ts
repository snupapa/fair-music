import { supabase } from '@/lib/supabase'

async function compressToSquare480(file: File): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image()
    const reader = new FileReader()

    reader.onload = () => {
      img.src = reader.result as string
    }

    img.onload = () => {
      const size = 480
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      canvas.width = size
      canvas.height = size

      const minSide = Math.min(img.width, img.height)
      const sx = (img.width - minSide) / 2
      const sy = (img.height - minSide) / 2

      ctx?.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size)

      canvas.toBlob(
        (blob) => {
          if (!blob) return
          resolve(new File([blob], file.name, { type: 'image/jpeg' }))
        },
        'image/jpeg',
        0.9
      )
    }

    reader.readAsDataURL(file)
  })
}

async function uploadToStorage(file: File) {
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}-${file.name}`

  const { error } = await supabase.storage.from('media').upload(fileName, file)

  if (error) throw error

  const { data } = supabase.storage.from('media').getPublicUrl(fileName)

  return data.publicUrl
}

export async function uploadPost({
  type,
  title,
  file,
  cover
}: {
  type: 'image' | 'audio'
  title: string
  file: File | null
  cover?: File | null
}) {
  if (!file) throw new Error('No file selected')

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  if (type === 'image') {
    const compressed = await compressToSquare480(file)
    const mediaUrl = await uploadToStorage(compressed)

    await supabase.from('posts').insert([
      {
        user_id: user.id,
        type: 'image',
        title: title.trim(),
        media_url: mediaUrl
      }
    ])
  }

  if (type === 'audio') {
    if (!cover) throw new Error('Cover required')

    const compressedCover = await compressToSquare480(cover)

    const audioUrl = await uploadToStorage(file)
    const coverUrl = await uploadToStorage(compressedCover)

    await supabase.from('posts').insert([
      {
        user_id: user.id,
        type: 'audio',
        title: title.trim(),
        media_url: audioUrl,
        cover_url: coverUrl
      }
    ])
  }
}

export async function deletePost(post: any) {
  const extractPath = (url: string) => {
    const parts = url.split('/media/')
    return parts.length > 1 ? parts[1] : ''
  }

  const files: string[] = []

  if (post.media_url) files.push(extractPath(post.media_url))
  if (post.cover_url) files.push(extractPath(post.cover_url))

  if (files.length > 0) {
    await supabase.storage.from('media').remove(files)
  }

  await supabase.from('posts').delete().eq('id', post.id)
}

export async function toggleSave(postId: string) {
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  // Check if already saved
  const { data: existing } = await supabase
    .from('saved_music')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) {
    // Remove save
    await supabase
      .from('saved_music')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', user.id)
  } else {
    // Insert save
    await supabase.from('saved_music').insert({
      post_id: postId,
      user_id: user.id
    })
  }
}
