import useSWR from 'swr'

export const useFetch = (url: string) => {
  const fetcher = (url: string) => fetch(url).then((res) => res.json())
  const { data, isLoading, error } = useSWR(url, fetcher)

  return {
    data,
    isLoading,
    error,
  }
}
