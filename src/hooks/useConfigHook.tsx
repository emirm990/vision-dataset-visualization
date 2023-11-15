import useSWR from 'swr'

export const useConfig = () => {
  const fetcher = (url: string) => fetch(url).then((res) => res.json())
  const { data, isLoading, error } = useSWR('/api/config', fetcher)

  return {
    data,
    isLoading,
    error
  }
}
