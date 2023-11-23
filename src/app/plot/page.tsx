'use client'
import { useFetch } from '@/hooks/useFetchHook'
import { TestItem } from '@/types/testdata'
import { getPlotData } from './plotScripts'
import { useCallback } from 'react'
import Uploader from '@/components/Uploader/Uploader'
import styles from './styles.module.css'
import dynamic from 'next/dynamic'
import { Alert, Container } from '@mui/material'
import Loader from '@/components/Loader/Loader'

export default function Page() {
  const { data: actualData, isLoading: isLoadingActualData }: { data: TestItem[] | null, isLoading: boolean} = useFetch('/api/data', 'actual.json')
  const { data: expectedData, isLoading: isLoadingExpectedData }: { data: TestItem[] | null, isLoading: boolean} = useFetch('/api/data', 'manifest.json')

  const getData = useCallback(() => {
    if (actualData && expectedData) {
      return getPlotData(actualData, expectedData)
    }
  }, [actualData, expectedData])

  const data = getData()

  const DynamicChart1 = dynamic(() =>
    import('@/components/Chart/Chart'),{
    ssr: false,
    loading: () => {
      return (
        <Loader label="Loading pie chart..." />
      )
    }
  })

  const DynamicChart2 = dynamic(() =>
    import('@/components/Chart/Chart'),{
    ssr: false,
    loading: () => {
      return (
        <Loader label="Loading scatter chart..." />
      )
    }
  })


  const checkForErrors = () => {
    if (!actualData || !expectedData) {
      return (
        <Container maxWidth={false}>
          {!actualData ? <Alert severity="info" sx={{padding: 2, mt: 2}}>Missing actual data file!</Alert> : null}
          {!expectedData ? <Alert severity="info" sx={{padding: 2, mt: 2}}>Missing manifest data file!</Alert> : null}
        </Container>
      )
    }

    return null
  }

  if (isLoadingActualData || isLoadingExpectedData) {
    return (
      <Loader label="Loading JSON data" />
    )
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.uploadButtonsContainer}>
        <Uploader fileName={'actual'} />
        <Uploader fileName={'manifest'} />
      </div>
      <div>
        {checkForErrors()}
        {data?.data.pie && actualData ? <DynamicChart1 data={data.data.pie} />: null}
        {data?.data.scatter && expectedData ? <DynamicChart2 data={data.data.scatter} /> : null}
      </div>
    </div>
  )
}
