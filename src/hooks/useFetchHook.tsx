import useSWR from 'swr'

export const useFetch = (url: string, fileName?: string) => {
  const urlWithParams = fileName ? `${url}?fileName=${fileName}` : url
  const fetcher = (url: string) => fetch(url).then((res) => res.json())
  const { data, isLoading, error } = useSWR(urlWithParams, fetcher)

  return {
    data,
    isLoading,
    error,
  }
}
