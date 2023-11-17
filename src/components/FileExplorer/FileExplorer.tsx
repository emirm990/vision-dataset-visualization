import { useAppStore } from '@/store/appStore'
import { Box, Button, Divider, Drawer, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup } from '@mui/material'
import ImageSearchIcon from '@mui/icons-material/Image'
import { ChangeEvent, Fragment, useMemo, useState } from 'react'
import { useFetch } from '@/hooks/useFetchHook'

export default function FileExplorer(){
  const { data: imageData }: { data: {images: string[]}} = useFetch('/api/images')

  const selectedImages = useAppStore((state) => state.selectedImages)
  const addSelectedImage = useAppStore((state) => state.addSelectedImage)
  const removeSelectedImage = useAppStore((state) => state.removeSelectedImage)
  const [isToggleOpen, setIsToggleOpen] = useState(false)

  const handleImageClick = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    selectedImages.forEach((image) => removeSelectedImage(image))
    addSelectedImage(value)
    setIsToggleOpen(false)
  }

  const drawerContent = useMemo(() => {
    if (!imageData || imageData.images.length < 1) {
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
          value={selectedImages.length > 0 ? selectedImages[0] : undefined}
          onChange={handleImageClick}
        >
          {imageData.images.map((image) => {
            return (
              <Fragment key={image}>
                <FormControlLabel sx={{mt: 1, mb: 1}} value={image} control={<Radio />} label={image} />
                <Divider />
              </Fragment>
            )
          })}
        </RadioGroup>
      </Box>
    )
  }, [imageData, selectedImages])

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
