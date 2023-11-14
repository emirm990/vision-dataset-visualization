'use client'
import { TestItemWithLocalPath } from '@/types/testdata'
import Canvas from '../Canvas/Canvas'
import styles from './styles.module.css'
import ControlPanel from '../ControlPanel/ControlPanel'
import { memo, useRef } from 'react'
import { Typography } from '@mui/material'

type Props = {
  item: TestItemWithLocalPath,
}

const DataVisualizedMemoized = memo(function DataVisualization(props: Props){
  const {
    item,
  } = props

  const visualizationContainerRef = useRef<HTMLDivElement>(null)
  const generateFullImagePath = (imagePath: string) => {
    if (imagePath) {
      return `/data/images/${imagePath}`
    }

    return ''
  }

  return (
    <div className={styles.mainContainer} >
      <div className={styles.visualizationContainer} ref={visualizationContainerRef}>
        <Typography variant="subtitle1">
          {item.localImagePath}
        </Typography>
        <Canvas item={item} imagePath={generateFullImagePath(item.localImagePath)} parent={visualizationContainerRef} />
      </div>
      <div>
        <ControlPanel item={item} />
      </div>
    </div>
  )
})

export default DataVisualizedMemoized
