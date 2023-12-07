'use client'

import Loader from '@/components/Loader/Loader'
import dynamic from 'next/dynamic'
import { useMemo } from 'react'

export default function Page() {
  const ChartsContainer = useMemo(() => dynamic(() =>
    import('@/components/Chart/ChartsContainer'),{
    ssr: false,
    loading: () => {
      return (
        <Loader label="Loading charts..." />
      )
    }
  }),[])

  return (
    <ChartsContainer />
  )
}
