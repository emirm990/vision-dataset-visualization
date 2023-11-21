'use client'
import { useFetch } from '@/hooks/useFetchHook'
import { TestItem } from '@/types/testdata'
import { getPlotData } from './plotScripts'
import { useCallback } from 'react'
import Uploader from '@/components/Uploader/Uploader'
import styles from './styles.module.css'
import dynamic from 'next/dynamic'
import { Alert, CircularProgress, Container, Grid, Typography } from '@mui/material'

export default function Page() {
  const { data: actualData }: { data: TestItem[] | null} = useFetch('/api/data', 'actual.json')
  const { data: expectedData }: { data: TestItem[] | null} = useFetch('/api/data', 'manifest.json')

  const getData = useCallback(() => {
    if (actualData && expectedData) {
      return getPlotData(actualData, expectedData)
    }
  }, [actualData, expectedData])

  const data = getData()

  const DynamicChart1 = dynamic(() =>
    import('@/components/Chart/Chart'),{
    ssr: false,
  })

  const DynamicChart2 = dynamic(() =>
    import('@/components/Chart/Chart'),{
    ssr: false,
    loading: () => {
      return (
        <Grid
          container
          spacing={0}
          marginTop="100px"
          direction="column"
          alignItems="center"
          justifyContent="center"
        >
          <CircularProgress />
          <Typography>
            Loading charts...
          </Typography>
        </Grid>
      )
    }
  })


  const checkForErrors = () => {
    if (!actualData || !expectedData) {
      return (
        <Container>
          {!actualData ? <Alert severity="info" sx={{padding: 2, mt: 2}}>Missing actual data file!</Alert> : null}
          {!expectedData ? <Alert severity="info" sx={{padding: 2, mt: 2}}>Missing manifest data file!</Alert> : null}
        </Container>
      )
    }

    return null
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
