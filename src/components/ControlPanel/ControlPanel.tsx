import { TestItem } from '@/types/testdata'
import styles from './styles.module.css'
import { Fragment } from 'react'
import { Box, Divider, List, ListItem, ListSubheader, Typography } from '@mui/material'

type Props = {
  item: TestItem,
}

export default function ControlPanel(props: Props) {
  const {
    item,
  } = props

  return (
    <Box className={styles.controlPanelContainer} sx={{  bgcolor: 'background.paper' }}>
      <Typography>width: {item.width}px</Typography>
      <Typography>height: {item.width}px</Typography>
      <Typography>ppmx: {item.ppmx}</Typography>
      <List
        sx={{
          marginTop: 2,
        }}
        subheader={
          <ListSubheader>
            <Typography>Results: </Typography>
          </ListSubheader>
        }>
        <ListItem>foil_start: {item.result.foil_start}</ListItem>
        <ListItem>foil_end: {item.result.foil_end}</ListItem>
        <Divider />
        <List
          subheader={
            <ListSubheader>
              <Typography>Coating sections: </Typography>
            </ListSubheader>
          }
        >
          {item.result.coating_line_sections.map((result, i) => {
            return (
              <Fragment key={i}>
                <ListItem>foil_start: {result.foil_start}px</ListItem>
                <ListItem>foil_start: {result.foil_end}px</ListItem>
                <ListItem>coating_start: {result.coating_start}px</ListItem>
                <ListItem>coating_end: {result.coating_end}px</ListItem>
              </Fragment>
            )
          })}
        </List>
      </List>
    </Box>
  )
}
