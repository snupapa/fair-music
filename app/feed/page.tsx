'use client'

import { Suspense } from 'react'
import FeedContent from './FeedContent'

export const dynamic = 'force-dynamic'

export default function Feed() {
  return (
    <Suspense fallback={null}>
      <FeedContent />
    </Suspense>
  )
}
