'use client'
import { useFetch } from '@/hooks/useFetchHook'
import { TestItem } from '@/types/testdata'
import { getPlotData } from './plotScripts'
import { ChangeEvent, useCallback, useMemo } from 'react'
import Uploader from '@/components/Uploader/Uploader'
import styles from './styles.module.css'
import dynamic from 'next/dynamic'
import { Alert, Container, TextField } from '@mui/material'
import Loader from '@/components/Loader/Loader'
import { useAppStore } from '@/store/appStore'
import FbsFilter from '@/components/FbsFilter/FbsFilter'

export default function Page() {
  const { data: actualData, isLoading: isLoadingActualData }: { data: TestItem[] | null, isLoading: boolean} = useFetch('/api/data', 'actual.json')
  const { data: expectedData, isLoading: isLoadingExpectedData }: { data: TestItem[] | null, isLoading: boolean} = useFetch('/api/data', 'manifest.json')

  const threshold = useAppStore((state) => state.threshold)
  const setThreshold = useAppStore((state) => state.setThreshold)
  const selectedFbs = useAppStore((state) => state.selectedFbs)

  const getData = useCallback(() => {
    if (actualData && expectedData) {
      return getPlotData(actualData, expectedData, threshold, selectedFbs)
    }
  }, [actualData, expectedData, threshold, selectedFbs])

  const data = getData()

  const DynamicChart1 = useMemo(() => dynamic(() =>
    import('@/components/Chart/Chart'),{
    ssr: false,
    loading: () => {
      return (
        <Loader label="Loading pie chart..." />
      )
    }
  }),[])

  const DynamicChart2 = useMemo(() => dynamic(() =>
    import('@/components/Chart/Chart'),{
    ssr: false,
    loading: () => {
      return (
        <Loader label="Loading scatter chart..." />
      )
    }
  }), [])

  const handleThresholdChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = Number(e.target.value)

    if (value >= 0) {
      setThreshold(value)
    }
  }

  const checkForErrors = () => {
    if (data?.error) {
      return (
        <Container maxWidth={false}>
          <Alert severity="error" sx={{padding: 2, mt: 2}}>{data.error}</Alert>
        </Container>
      )
    }
    if (!actualData || !expectedData) {
      return (
        <Container maxWidth={false}>
          {!actualData ? <Alert severity="error" sx={{padding: 2, mt: 2}}>Missing actual data file!</Alert> : null}
          {!expectedData ? <Alert severity="error" sx={{padding: 2, mt: 2}}>Missing manifest data file!</Alert> : null}
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
        <FbsFilter sx={{ width: '600px' }}/>
        <TextField label="Threshold" type="number" variant="standard" onChange={(e) => handleThresholdChange(e)} value={threshold} />
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
