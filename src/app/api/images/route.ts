import path from 'path'
import { readdir } from 'node:fs/promises'
import fs from 'fs'
import { TestItem } from '@/types/testdata'
import { NextResponse } from 'next/server'

export const revalidate = 0

const checkIfImageIsInJSON = (json: TestItem[],image: string) => {
  if (json.find((item) => item.pathLocal === image)) {
    return true
  }

  return false
}

export async function GET() {
  const dir = path.resolve('public', 'data/images')

  try {
    const files = await readdir(dir, { recursive: true })
    const images = files.filter((file) => file.includes('.jpg')).sort((a, b) => a.localeCompare(b))
    
    const data = fs.readFileSync(path.resolve('public', 'data/manifest.json'), 'utf-8')
    if (!data) {
      return NextResponse.json({
        code: 404,
        images: [],
      })
    }
    const JSONdata = JSON.parse(data) as TestItem[]

    const filteredImages = images.filter((image) => checkIfImageIsInJSON(JSONdata, image))
    return Response.json({ images: filteredImages })
  } catch (err) {
    return Response.error()
  } 
}
