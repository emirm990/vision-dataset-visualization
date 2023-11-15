import { Result } from '@/types/testdata'
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

type AppStore = {
  selectedImages: string[],
  addSelectedImage: (imageToAdd: string) => void,
  removeSelectedImage: (imageToRemove: string) => void,
  measurements: {[key: string]: Result},
  setMeasurements: (key: string, measurement: Result) => void,
}

export const useAppStore = create<AppStore>()(
  immer(
    subscribeWithSelector((set) => ({
      selectedImages: [],
      addSelectedImage: (imageToAdd) => set((state) => {
        const newImages = [...state.selectedImages, imageToAdd]

        return {
          selectedImages: newImages,
        }
      }),
      removeSelectedImage: (imageToRemove) => set((state) => {
        const newImages = [...state.selectedImages].filter((image) => image !== imageToRemove)

        return {
          selectedImages: newImages,
        }
      }),
      measurements: {},
      setMeasurements: (key, measurement) => set((state) => {
        const coating_line_sections = JSON.parse(JSON.stringify(measurement.coating_line_sections))   
        coating_line_sections[0].foil_start = measurement.foil_start

        if (coating_line_sections.length > 1) {
          coating_line_sections[1].foil_end = measurement.foil_end
        } else {
          coating_line_sections[0].foil_end = measurement.foil_end
        }
        const updatedMeasurement = {...measurement, coating_line_sections}
        state.measurements[key] = updatedMeasurement
      })
    }))
  ))
