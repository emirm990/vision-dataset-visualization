'use client'
import { TestItemWithLocalPath } from '@/types/testdata'
import Canvas from '../Canvas/Canvas'
import styles from './styles.module.css'
import ControlPanel from '../ControlPanel/ControlPanel'
import { memo } from 'react'
import { Divider, Typography } from '@mui/material'

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
        <Typography variant="subtitle1">
          {item.localImagePath}
        </Typography>
        <Canvas item={item} imagePath={generateFullImagePath(item.localImagePath)} />
      </div>
      <div>
        <ControlPanel item={item} />
      </div>
      <Divider />
    </div>
  )
})

export default DataVisualizedMemoized
