'use client'
import DataVisualization from '../components/DataVisualization/DataVisualization'
import testDataJSON from '../../public/data/test.json'
import useSWR from 'swr'
import { TestItem, TestItemWithLocalPath } from '@/types/testdata'
import { useEffect, useState } from 'react'
import FileExplorer from '@/components/FileExplorer/FileExplorer'
import { useAppStore } from '@/store/appStore'

export default function Home() {
  const fetcher = (url: string) => fetch(url).then((res) => res.json())
  const { data } = useSWR('/api/images', fetcher)
  const selectedImages = useAppStore((state) => state.selectedImages)

  const [testData, setTestData] = useState<TestItemWithLocalPath[]>([])

  const checkImage = (item: TestItem, images: string[]) => {
    const newItem = item as TestItemWithLocalPath
    let hasImage = false
    images.forEach((image) => {
      const imagePathNormalized = image.replaceAll('_', '/')

      if (item.pathS3.includes(imagePathNormalized) || item.pathLocal === image) {
        hasImage = true
        newItem.localImagePath = image
      }
    })

    return hasImage
  }

  useEffect(() => {
    if (data?.images) {
      const filteredData = testDataJSON.filter((item) => {
        return checkImage(item, data.images)
      }) as TestItemWithLocalPath[]

      setTestData(filteredData)
    }
  }, [data])


  const itemsToShow = () => {
    const itemsFiltered = testData.filter((item) => {
      return selectedImages.includes(item.localImagePath)
    })
    return itemsFiltered.map((item) => {
      return <DataVisualization key={item.localImagePath} item={item} />
    })
  }

  return (
    <>
      <main>
        <div>
          { itemsToShow() }
        </div>
      </main>
      <FileExplorer data={testData} />
    </>
  )
}
