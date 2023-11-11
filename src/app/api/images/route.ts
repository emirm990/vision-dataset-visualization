import path from 'path'
import { readdir } from 'node:fs/promises'

export async function GET() {
  const dir = path.resolve('./public', 'data/images')

  try {
    const files = await readdir(dirs, { recursive: true })
    const images = files.filter((file) => file.includes('.jpg'))
    
    return Response.json({ images })
  } catch (err) {
    return Response.error()
  } 
}
