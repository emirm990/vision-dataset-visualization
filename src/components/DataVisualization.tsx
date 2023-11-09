'use client'
import { TestItem } from '@/types/testdata'
import useSWR from 'swr'
import Canvas from './Canvas/Canvas'

type Props = {
  item: TestItem
}

export default function DataVisualization(props: Props){
  const {
    item,
  } = props

  const fetcher = (url: string) => fetch(url).then((res) => res.json())
  const { data } = useSWR('/api/images', fetcher)
  let imagePath = ''

  data?.images.forEach((image: string) => {
    const imagePathNormalized = image.replaceAll('_', '/')
    if (item.pathS3.includes(imagePathNormalized)) {
      imagePath = image
    }
  })

  const generateFullImagePath = (imagePath: string) => {
    if (imagePath) {
      return `/data/images/${imagePath}`
    }

    return ''
  }

  if (!imagePath) {
    return null
  }

  return (
    <div>
      <Canvas item={item} imagePath={generateFullImagePath(imagePath)} />
    </div>
  )
}