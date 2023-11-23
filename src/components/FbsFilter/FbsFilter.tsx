import { useFetch } from '@/hooks/useFetchHook'
import { useAppStore } from '@/store/appStore'
import { TestItem } from '@/types/testdata'
import { Autocomplete, Box, SxProps, TextField, Theme } from '@mui/material'
import { SyntheticEvent } from 'react'

type Props = {
  sx?: SxProps<Theme>
}

export default function FbsFilter(props: Props){
  const {
    sx
  } = props
  const { data: manifestData }: { data: TestItem[] | null, isLoading: boolean} = useFetch('/api/data', 'manifest.json')

  const fbsList = [...new Set(manifestData ? manifestData.map((item) => item.fbs) : [])].sort()

  const selectedFbs = useAppStore((state) => state.selectedFbs)
  const setSelectedFbs = useAppStore((state) => state.setSelectedFbs)

  const handleFbsChanged = (_: SyntheticEvent<Element, Event>, value: string[]) => {
    setSelectedFbs(value)
  }

  return (
    <Box sx={{...sx}}>
      <Autocomplete
        multiple
        disableCloseOnSelect
        limitTags={2}
        onChange={(e, value) => handleFbsChanged(e, value)}
        options={fbsList}
        defaultValue={selectedFbs}
        ChipProps={{
          size: 'small',
          variant: 'outlined',
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="standard"
            label="Select fbs"
          />
        )
        }
      >
      </Autocomplete>
    </Box>
  )
}
