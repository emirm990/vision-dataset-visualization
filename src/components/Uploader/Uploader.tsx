'use client'

import { Button } from '@mui/material'
import { ChangeEvent } from 'react'
import { mutate } from 'swr'

type Props = {
  fileName: string
}

export default function Uploader(props: Props) {
  const {
    fileName,
  } = props

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files

    if (files && files[0]) {
      const file = files[0]
      const formData = new FormData()
      formData.append('file', file)
      formData.append('name', fileName)

      fetch('/api/upload', {
        method: 'POST',
        body: formData
      }).then(() => {
        mutate(`/api/data?fileName=${fileName}.json`)
      })
    }
  }

  return (
    <Button
      variant="contained"
      component="label"
    >
      Upload File ({fileName})
      <input
        accept='.json'
        type="file"
        hidden
        onChange={(e) => handleFileUpload(e)}
      />
    </Button>
  )
}
