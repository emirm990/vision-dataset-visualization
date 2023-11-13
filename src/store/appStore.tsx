import { create } from 'zustand'

type AppStore = {
  selectedImages: string[],
  addSelectedImage: (imageToAdd: string) => void,
  removeSelectedImage: (imageToRemove: string) => void,
}
export const useAppStore = create<AppStore>((set) => ({
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
  })
}))
