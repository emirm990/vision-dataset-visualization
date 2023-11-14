import { readdir } from 'node:fs/promises'
import path from 'path'
import { promises as fs } from 'fs'

export async function GET() {
  const dir = path.resolve('./public', 'data/config')

  const files = await readdir(dir)
  const config = files.filter((file) => file === 'config.json')[0]
  const jsonFilePath = path.join(dir, config)

  const file = await fs.readFile(jsonFilePath, 'utf8')

  const data = JSON.parse(file)

  console.log(data)
  try {
    return Response.json({ data })
  } catch (err) {
    return Response.error()
  } 
}
