import { useAppStore } from '@/store/appStore'
import { TestItemWithLocalPath } from '@/types/testdata'
import { Box, Button, Checkbox, Drawer, FormControlLabel, List, ListItem, ListSubheader } from '@mui/material'
import ImageSearchIcon from '@mui/icons-material/Image'
import { useState } from 'react'
import styles from './styles.module.css'

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

  const handleImageClick = (image: string) => {
    if (selectedImages.includes(image)) {
      removeSelectedImage(image)
    } else {
      addSelectedImage(image)
    }
  }

  const drawerContent = () => {
    return (
      <Box
        sx={{
          width: 550
        }}
      >
        <List
          subheader={
            <ListSubheader component="div" id="nested-list-subheader">
              Available images
            </ListSubheader>
          }
        >
          {data.map((item) => {
            return (
              <ListItem key={item.localImagePath}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedImages.includes(item.localImagePath)}
                      onClick={() => handleImageClick(item.localImagePath)}
                    />
                  }
                  label={item.localImagePath}
                />
              </ListItem>
            )
          })}
        </List>
      </Box>
    )
  }

  return (
    <>
      <Button
        className={styles.button}
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
        {drawerContent()}
      </Drawer>
    </>
  )
}
