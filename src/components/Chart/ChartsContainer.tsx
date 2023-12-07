'use client'
import { useFetch } from '@/hooks/useFetchHook'
import { TestItem } from '@/types/testdata'
import { getPlotData } from './plotScripts'
import { ChangeEvent, useCallback, useEffect, useRef } from 'react'
import Uploader from '@/components/Uploader/Uploader'
import styles from './styles.module.css'
import { Alert, Container, TextField } from '@mui/material'
import Loader from '@/components/Loader/Loader'
import { useAppStore } from '@/store/appStore'
import FbsFilter from '@/components/FbsFilter/FbsFilter'
import Plotly from 'plotly.js'
import Chart from '@/components/Chart/Chart'

export default function Page() {
  const { data: actualData, isLoading: isLoadingActualData }: { data: TestItem[] | null, isLoading: boolean} = useFetch('/api/data', 'actual.json')
  const { data: expectedData, isLoading: isLoadingExpectedData }: { data: TestItem[] | null, isLoading: boolean} = useFetch('/api/data', 'manifest.json')

  const PIE_ID = 'pie'
  const SCATTER_ID = 'scatter'

  const threshold = useAppStore((state) => state.threshold)
  const setThreshold = useAppStore((state) => state.setThreshold)
  const selectedFbs = useAppStore((state) => state.selectedFbs)

  const pageContainerRef = useRef<HTMLDivElement>(null)

  const getData = useCallback(() => {
    if (actualData && expectedData) {
      return getPlotData(actualData, expectedData, threshold, selectedFbs)
    }
  }, [actualData, expectedData, threshold, selectedFbs])

  const data = getData()

  const handleThresholdChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = Number(e.target.value)

    if (value >= 0) {
      setThreshold(value)
    }
  }

  const updateCharts = (width = 800) => {
    const updatePie = {
      width: width,
      height: 400,
      responsive: true
    }
    const updateScatter = {
      width: width,
      height: 600
    }
    const pie = document.getElementById(PIE_ID)
    const scatter = document.getElementById(SCATTER_ID)

    if (pie) {
      Plotly.relayout(pie, updatePie)
    }

    if (scatter) {
      Plotly.relayout(scatter, updateScatter)
    }
  }
  const handleBeforePrint = () => {
    updateCharts()
  }

  const handleAfterPrint = () => {
    const width = pageContainerRef.current?.clientWidth ? pageContainerRef.current?.clientWidth - 40 : undefined
    updateCharts(width)
  }

  useEffect(() => {
    window.onbeforeprint = handleBeforePrint
    window.onafterprint = handleAfterPrint
    window.onresize = handleAfterPrint
  }, [])

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
    <div ref={pageContainerRef} className={styles.pageContainer}>
      <div className={styles.uploadButtonsContainer}>
        <FbsFilter sx={{ width: '600px' }}/>
        <TextField label="Threshold" type="number" variant="standard" onChange={(e) => handleThresholdChange(e)} value={threshold} />
        <div className={styles.inputButtons}>
          <Uploader fileName={'actual'} />
          <Uploader fileName={'manifest'} />
        </div>
      </div>
      <div>
        {checkForErrors()}
        {data?.data.pie && actualData ? <Chart id={PIE_ID} data={data.data.pie} />: null}
        {data?.data.scatter && expectedData ? <Chart id={SCATTER_ID} data={data.data.scatter} /> : null}
      </div>
    </div>
  )
}
