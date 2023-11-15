'use client'
import { TestItemWithLocalPath } from '@/types/testdata'
import Canvas from '../Canvas/Canvas'
import styles from './styles.module.css'
import ControlPanel from '../ControlPanel/ControlPanel'
import { memo, useEffect, useRef } from 'react'
import { Typography } from '@mui/material'
import { useAppStore } from '@/store/appStore'

type Props = {
  item: TestItemWithLocalPath,
}

const DataVisualizedMemoized = memo(function DataVisualization(props: Props){
  const {
    item,
  } = props

  const setMeasurements = useAppStore((state) => state.setMeasurements)
  const visualizationContainerRef = useRef<HTMLDivElement>(null)
  const generateFullImagePath = (imagePath: string) => {
    if (imagePath) {
      return `/data/images/${imagePath}`
    }

    return ''
  }

  useEffect(() => {
    setMeasurements(item.pathS3, item.result)
  }, [item])

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
