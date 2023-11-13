import { readdir } from 'node:fs/promises'
import path from 'path'
import fs from 'fs'

const backupJsonFile = (inputPath: string, outputPath: string) => {
  try {
    const data = fs.readFileSync(inputPath)
    fs.writeFileSync(outputPath, data)

    return true
  } catch (err) {
    return err
  }
}

export async function GET() {
  const dir = path.resolve('./public', 'data')

  const files = await readdir(dir)
  const jsonFile = files.filter((file) => file === 'test.json')[0]
  const jsonFilePath = path.join(dir, jsonFile)
  backupJsonFile(jsonFilePath, 'public/data/backup/test-bak.json')

  try {
    return Response.json({ message: 'success' })
  } catch (err) {
    return Response.error()
  } 
}
