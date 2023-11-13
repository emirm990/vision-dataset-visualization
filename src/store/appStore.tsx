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
        state.measurements[key] = measurement
      })
    }))
  ))
