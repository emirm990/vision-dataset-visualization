import { useAppStore } from '@/store/appStore'
import { Alert, Box, Button, Chip, Divider, Drawer, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup } from '@mui/material'
import ImageSearchIcon from '@mui/icons-material/Image'
import { ChangeEvent, Fragment, useMemo, useState } from 'react'
import { useFetch } from '@/hooks/useFetchHook'
import styles from './styles.module.css'
import { TestItem } from '@/types/testdata'
import FbsFilter from '../FbsFilter/FbsFilter'

export default function FileExplorer(){
  const { data: testDataJSON }: { data: TestItem[]} = useFetch('/api/data')
  const { data: imagesData }: { data: {images: string[]}} = useFetch('/api/images')
  const selectedImages = useAppStore((state) => state.selectedImages)
  const addSelectedImage = useAppStore((state) => state.addSelectedImage)
  const removeSelectedImage = useAppStore((state) => state.removeSelectedImage)
  const selectedFbs = useAppStore((state) => state.selectedFbs)

  const [isToggleOpen, setIsToggleOpen] = useState(false)
  const [showAllImages, setShowAllImages] = useState(true)
  const handleImageClick = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    selectedImages.forEach((image) => removeSelectedImage(image))
    addSelectedImage(value)
    setIsToggleOpen(false)
  }

  const checkIfImageExists = (image: string) => {
    if (imagesData?.images.find((imageFile) => imageFile === image)) {
      return true
    }

    return false
  }

  const filteredData = selectedFbs.length > 0 ? testDataJSON?.filter((item) => selectedFbs.includes(item.fbs)) : testDataJSON
  const images = filteredData?.map((data) => data.pathLocal)
  const filteredImages = images?.filter((image) => checkIfImageExists(image))
  const imagesToRender = showAllImages ? images : filteredImages

  const renderImagesSelector = (images?: string[]) => {
    if (!images || images.length === 0) {
      return <Alert severity="info" sx={{padding: 2, mt: 1}}>No images available!</Alert>
    }

    return images.map((image) => {
      return (
        <Fragment key={image}>
          <FormControlLabel sx={{ mt: 1, mb: 1}} value={image} control={<Radio />} label={image} disabled={!checkIfImageExists(image)} />
          <Divider />
        </Fragment>
      )
    })
  }
  
  const drawerContent = useMemo(() => {
    return (
      <Box
        sx={{
          width: 600,
          padding: 2,
        }}
      >
        <Box
          sx={{
            mt: 2,
            mb: 2,
          }}
        >
          <FbsFilter sx={{width: '100%'}} />
        </Box>
        <FormControl sx={{mb: 2}}>
          <div className={styles.labelContainer}>
            <FormLabel id="images">Images</FormLabel>
            <Chip label={images ? images.length : 0} color="primary" onClick={() => setShowAllImages(true)} variant={showAllImages ? 'filled' : 'outlined'} />
            <Chip label={filteredImages ? filteredImages.length : 0} color="success" onClick={() => setShowAllImages(false)} variant={showAllImages ? 'outlined' : 'filled'}/>
          </div>
        </FormControl>
        <RadioGroup
          name="radio-buttons-group"
          value={selectedImages.length > 0 ? selectedImages[0] : undefined}
          onChange={handleImageClick}
        >
          {renderImagesSelector(imagesToRender)}
        </RadioGroup>
      </Box>
    )
  }, [testDataJSON, selectedImages, imagesData, showAllImages, selectedFbs])

  return (
    <>
      <Button
        sx={{
          position: 'absolute',
          top: '80px',
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
