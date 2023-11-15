import { Result, TestItem } from '@/types/testdata'
import styles from './styles.module.css'
import { Fragment, useEffect, useState } from 'react'
import { Box, Button, Chip, Divider, FormControl, InputLabel, List, ListItem, ListSubheader, MenuItem, Select, SelectChangeEvent, TextField, Typography } from '@mui/material'
import { useAppStore } from '@/store/appStore'
import RefreshIcon from '@mui/icons-material/Refresh'
import SaveIcon from '@mui/icons-material/Save'
import { useConfig } from '@/hooks/useConfigHook'

type Props = {
  item: TestItem,
}

export default function ControlPanel(props: Props) {
  const {
    item,
  } = props

  const { data: config }= useConfig()

  const measurements = useAppStore((state) => state.measurements)
  const setMeasurements = useAppStore((state) => state.setMeasurements)

  const [allTags, setAllTags] = useState(config?.data?.tags ? config.data.tags : [])
  const [itemTags, setItemTags] = useState(item.tags)
  const [batteryType, setBatteryType] = useState(item.batteryType)

  const handleValueChanged = (measurements: Result) => {
    setMeasurements(item.pathS3, measurements)
  }

  const handleResetValues = () => {
    setMeasurements(item.pathS3, item.result)
    setItemTags(item.tags)
    setBatteryType(item.batteryType)
  }

  const handleSaveValues = async () => {
    const updatedResults = {...item.result, ...measurements[item.pathS3]}
    const updatedItem = {...item, ...{batteryType: batteryType, tags: itemTags}}
    updatedItem.result = updatedResults

    await fetch('/api/data', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({updatedItem})
    })
  }

  const checkisTagActive = (tag: string) => {
    if (itemTags.includes(tag)) {
      return true
    }

    return false
  }

  const handleBatteryTypeChanged = (e: SelectChangeEvent<string>) => {
    const value = e.target.value

    setBatteryType(value)
  }

  const handleTagClicked = (tag: string, isChecked: boolean) => {
    if (isChecked) {
      setItemTags((state: string[]) => {
        return state.filter((stateTag) => stateTag !== tag)
      })
    } else {
      setItemTags((state: string[]) => {
        return [...state, tag]
      })
    }
  }

  useEffect(() => {
    if (config?.data?.tags) {
      setAllTags(config.data.tags)
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
          value={batteryType}
          onChange={(e) => handleBatteryTypeChanged(e)}
        >
          {config?.data?.batteryTypes ? (config.data.batteryTypes as string[]).map((battery) => <MenuItem key={battery} value={battery}>{battery}</MenuItem>) : null}
        </Select>
        <Typography sx={{mt: 2}}>Tags: </Typography>
        <div className={styles.tagsContainer} >
          {allTags.map((tag: string) => <Chip key={tag} label={tag} color={checkisTagActive(tag) ? 'primary' : undefined} onClick={() => handleTagClicked(tag, checkisTagActive(tag))} /> )}
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
        >Reset</Button>
        <Button
          variant='contained'
          onClick={() => handleSaveValues()}
          endIcon={
            <SaveIcon />
          }
        >Save</Button>
      </div>
    </Box>
  )
}
