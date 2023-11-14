import { useAppStore } from '@/store/appStore'
import { TestItemWithLocalPath } from '@/types/testdata'
import { Box, Button, Divider, Drawer, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup } from '@mui/material'
import ImageSearchIcon from '@mui/icons-material/Image'
import { ChangeEvent, Fragment, useMemo, useState } from 'react'

type Props = {
  data: TestItemWithLocalPath[],
}
export default function FileExplorer(props: Props){
  const {
    data,
  } = props

  const selectedImages = useAppStore((state) => state.selectedImages)
  const addSelectedImage = useAppStore((state) => state.addSelectedImage)
  const removeSelectedImage = useAppStore((state) => state.removeSelectedImage)
  const [isToggleOpen, setIsToggleOpen] = useState(false)

  const handleImageClick = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    selectedImages.forEach((image) => removeSelectedImage(image))
    addSelectedImage(value)
  }

  const drawerContent = useMemo(() => {
    if (!data || data.length < 1) {
      return null
    }

    return (
      <Box
        sx={{
          width: 550,
          padding: 2,
        }}
      >
        <FormControl>
          <FormLabel id="images">Images</FormLabel>
        </FormControl>
        <RadioGroup
          name="radio-buttons-group"
          value={selectedImages.length > 0 ? selectedImages[0] : data[0].localImagePath}
          onChange={handleImageClick}
        >
          {data.map((item) => {
            return (
              <Fragment key={item.localImagePath}>
                <FormControlLabel sx={{mt: 1, mb: 1}} value={item.localImagePath} control={<Radio />} label={item.localImagePath} />
                <Divider />
              </Fragment>
            )
          })}
        </RadioGroup>
      </Box>
    )
  }, [data, selectedImages])

  return (
    <>
      <Button
        sx={{
          position: 'fixed',
          top: '20px',
          left: '20px',
        }}
        onClick={() => setIsToggleOpen(true)}
        endIcon={<ImageSearchIcon />}
        variant="contained"
      >
        Select images
      </Button>
      <Drawer
        anchor="left"
        open={isToggleOpen}
        onClose={() => setIsToggleOpen(false)}
      >
        {drawerContent}
      </Drawer>
    </>
  )
}
