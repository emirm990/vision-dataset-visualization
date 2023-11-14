import { Result, TestItem } from '@/types/testdata'
import styles from './styles.module.css'
import { Fragment, useEffect, useState } from 'react'
import { Box, Button, Chip, Divider, FormControl, InputLabel, List, ListItem, ListSubheader, MenuItem, Select, TextField, Typography } from '@mui/material'
import { useAppStore } from '@/store/appStore'
import RefreshIcon from '@mui/icons-material/Refresh'
import useSWR from 'swr'

type Props = {
  item: TestItem,
}

export default function ControlPanel(props: Props) {
  const {
    item,
  } = props

  const fetcher = (url: string) => fetch(url).then((res) => res.json())
  const { data: config } = useSWR('/api/config', fetcher)


  const measurements = useAppStore((state) => state.measurements)
  const setMeasurements = useAppStore((state) => state.setMeasurements)

  const [tags, setTags] = useState(config?.data?.tags ? config.data.tags : [])
  
  const batteryTypes = [
    'one',
    'two',
    'thre_long',
  ]

  const handleValueChanged = (measurements: Result) => {
    setMeasurements(item.pathS3, measurements)
  }

  const handleResetValues = () => {
    setMeasurements(item.pathS3, item.result)
  }

  const checkisTagActive = (tag: string) => {
    if (item.tags.includes(tag)) {
      return true
    }

    return false
  }

  useEffect(() => {
    if (config?.data?.tags) {
      setTags(config.data.tags)
    }
  }, [config?.data])

  useEffect(() => {
    setMeasurements(item.pathS3, item.result)
  }, [])

  return (
    <Box className={styles.controlPanelContainer} sx={{  bgcolor: 'background.paper' }}>
      <Typography>{item.fbs}</Typography>
      <Typography>width: {item.width}px</Typography>
      <Typography>height: {item.width}px</Typography>
      <Typography>ppmx: {item.ppmx}</Typography>
      <FormControl fullWidth sx={{mt: 2}}>
        <InputLabel id="battery-type-label">Battery type</InputLabel>
        <Select
          labelId="battery-type-label"
          label="Battery type"
        >
          {batteryTypes.map((battery) => <MenuItem key={battery} value={battery}>{battery}</MenuItem>)}
        </Select>
        <Typography sx={{mt: 2}}>Tags: </Typography>
        <div className={styles.tagsContainer} >
          {tags.map((tag: string) => <Chip key={tag} label={tag} color={checkisTagActive(tag) ? 'primary' : undefined} onClick={() => console.log()} /> )}
        </div>
        <List
          sx={{
            marginTop: 2,
          }}
          subheader={
            <ListSubheader>
              <Typography>Results: </Typography>
            </ListSubheader>
          }>
          <ListItem>
          foil_start:
            <TextField
              sx={{marginLeft: 1}}
              value={measurements[item.pathS3]?.foil_start}
              onChange={(e) => handleValueChanged({...measurements[item.pathS3], foil_start: Number(e.target.value)})}
              type='number'
              variant='standard'
            />
          </ListItem>
          <ListItem>
          foil_end:
            <TextField
              sx={{marginLeft: 1}}
              value={measurements[item.pathS3]?.foil_end}
              onChange={(e) => handleValueChanged({...measurements[item.pathS3], foil_end: Number(e.target.value)})}
              type='number'
              variant='standard'
            />
          </ListItem>
          <Divider />
          <List
            subheader={
              <ListSubheader>
                <Typography>Coating sections: </Typography>
              </ListSubheader>
            }
          >
            {measurements[item.pathS3]?.coating_line_sections.map((result, i) => {
              return (
                <Fragment key={i}>
                  <ListItem>
                  foil_start:
                    <TextField
                      disabled
                      sx={{marginLeft: 1}}
                      value={result.foil_start}
                      onChange={(e) => {
                        const coatingSections = [...measurements[item.pathS3].coating_line_sections]
                        const coatingSection = {...coatingSections[i]}
                        coatingSection.foil_start = Number(e.target.value)
                        coatingSections[i] = coatingSection
                        handleValueChanged(
                          {
                            ...measurements[item.pathS3],
                            coating_line_sections: [
                              ...coatingSections
                            ]
                          }
                        )}
                      }
                      type='number'
                      variant='standard'
                    />
                  </ListItem>
                  <ListItem>
                  foil_end:
                    <TextField
                      disabled
                      sx={{marginLeft: 1}}
                      value={result.foil_end}
                      onChange={(e) => {
                        const coatingSections = [...measurements[item.pathS3].coating_line_sections]
                        const coatingSection = {...coatingSections[i]}
                        coatingSection.foil_end = Number(e.target.value)
                        coatingSections[i] = coatingSection
                        handleValueChanged(
                          {
                            ...measurements[item.pathS3],
                            coating_line_sections: [
                              ...coatingSections
                            ]
                          }
                        )}
                      }
                      type='number'
                      variant='standard'
                    />
                  </ListItem>
                  <ListItem>
                  coating_start:
                    <TextField
                      sx={{marginLeft: 1}}
                      value={result.coating_start}
                      onChange={(e) => {
                        const coatingSections = [...measurements[item.pathS3].coating_line_sections]
                        const coatingSection = {...coatingSections[i]}
                        coatingSection.coating_start = Number(e.target.value)
                        coatingSections[i] = coatingSection
                        handleValueChanged(
                          {
                            ...measurements[item.pathS3],
                            coating_line_sections: [
                              ...coatingSections
                            ]
                          }
                        )}
                      }
                      type='number'
                      variant='standard'
                    />
                  </ListItem>
                  <ListItem>
                  coating_end:
                    <TextField
                      sx={{marginLeft: 1}}
                      value={result.coating_end}
                      onChange={(e) => {
                        const coatingSections = [...measurements[item.pathS3].coating_line_sections]
                        const coatingSection = {...coatingSections[i]}
                        coatingSection.coating_end = Number(e.target.value)
                        coatingSections[i] = coatingSection
                        handleValueChanged(
                          {
                            ...measurements[item.pathS3],
                            coating_line_sections: [
                              ...coatingSections
                            ]
                          }
                        )}
                      }
                      type='number'
                      variant='standard'
                    />
                  </ListItem>
                </Fragment>
              )
            })}
          </List>
        </List>
      </FormControl>

      <div className={styles.buttonContainer}>
        <Button
          variant='outlined'
          onClick={() => handleResetValues()}
          endIcon={
            <RefreshIcon />
          }
        >Reset values</Button>
      </div>
    </Box>
  )
}
