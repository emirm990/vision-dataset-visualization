'use client'
import Chart from '@/components/Chart/Chart'
import { useFetch } from '@/hooks/useFetchHook'
import { TestItem } from '@/types/testdata'
import { getPlotData } from './plotScripts'
import { useCallback } from 'react'

export default function Page() {
  const { data: actualData }: { data: TestItem[]} = useFetch('/api/data', 'actual.json')
  const { data: expectedData }: { data: TestItem[]} = useFetch('/api/data', 'manifest.json')

  const getData = useCallback(() => {
    if (actualData && expectedData) {
      return getPlotData(actualData, expectedData)
    }
  }, [actualData, expectedData])

  const data = getData()

  return (
    <>
      {data?.data.pie ? <Chart data={data.data.pie} /> : null}
      {data?.data.scatter ? <Chart data={data.data.scatter} /> : null}
    </>
  )
}
