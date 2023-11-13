'use client'
import { TestItemWithLocalPath } from '@/types/testdata'
import Canvas from '../Canvas/Canvas'
import styles from './styles.module.css'
import ControlPanel from '../ControlPanel/ControlPanel'
import { memo } from 'react'

type Props = {
  item: TestItemWithLocalPath,
}

const DataVisualizedMemoized = memo(function DataVisualization(props: Props){
  const {
    item,
  } = props

  const generateFullImagePath = (imagePath: string) => {
    if (imagePath) {
      return `/data/images/${imagePath}`
    }

    return ''
  }

  return (
    <div className={styles.mainContainer}>
      <div className={styles.visualizationContainer}>
        <h1>{item.localImagePath}</h1>
        <Canvas item={item} imagePath={generateFullImagePath(item.localImagePath)} />
      </div>
      <div>
        <ControlPanel item={item} />
      </div>
    </div>
  )
})

export default DataVisualizedMemoized
