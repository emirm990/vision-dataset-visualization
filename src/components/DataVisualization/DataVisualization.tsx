'use client'
import { TestItem } from '@/types/testdata'
import useSWR from 'swr'
import Canvas from '../Canvas/Canvas'
import styles from './styles.module.css'
import ControlPanel from '../ControlPanel/ControlPanel'

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
    if (item.pathS3.includes(imagePathNormalized) || item.pathLocal === image) {
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
    <div className={styles.mainContainer}>
      <div className={styles.visualizationContainer}>
        <h1>{item.fbs}</h1>
        <Canvas item={item} imagePath={generateFullImagePath(imagePath)} />
      </div>
      <div>
        <ControlPanel item={item} />
      </div>
    </div>
  )
}