'use client'
import DataVisualization from '../components/DataVisualization/DataVisualization'
import { TestItem, TestItemWithLocalPath } from '@/types/testdata'
import { useEffect, useState } from 'react'
import FileExplorer from '@/components/FileExplorer/FileExplorer'
import { useAppStore } from '@/store/appStore'
import { Alert, Box, Container } from '@mui/material'
import { useFetch } from '@/hooks/useFetchHook'
import styles from './styles.module.css'

export default function Home() {
  const { data } = useFetch('/api/images')
  const { data: testDataJSON }: { data: TestItem[]} = useFetch('/api/data')
  const selectedImages = useAppStore((state) => state.selectedImages)

  const [testData, setTestData] = useState<TestItemWithLocalPath[]>([])

  const checkImage = (item: TestItem, images: string[]) => {
    const newItem = item as TestItemWithLocalPath
    let hasImage = false
    images.forEach((image) => {
      if (item.pathLocal === image) {
        hasImage = true
        newItem.localImagePath = image
      }
    })

    return hasImage
  }

  useEffect(() => {
    if (data?.images && testDataJSON) {
      const filteredData = testDataJSON.filter((item) => {
        return checkImage(item, data.images)
      }) as TestItemWithLocalPath[]

      setTestData(filteredData)
    }
  }, [data, testDataJSON, selectedImages])


  const itemsToShow = () => {
    const itemsFiltered = testData.filter((item) => {
      return selectedImages.includes(item.localImagePath)
    })
    return itemsFiltered.map((item) => {
      return <DataVisualization key={item.localImagePath} item={item} />
    })
  }

  const renderItems = itemsToShow()
  return (
    <div className={styles.mainContainer}>
      <Container maxWidth={false} disableGutters>
        <Box sx={{ bgcolor: 'background.paper'}}>
          { renderItems.length > 0 
            ? renderItems
            : <Container maxWidth={false}><Alert severity="info" sx={{position: 'relative', top: 100 }}>No images choosen!</Alert></Container>}
        </Box>
      </Container>
      <FileExplorer />
    </div>
  )
}
