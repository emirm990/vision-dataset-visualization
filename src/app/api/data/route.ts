import { readdir } from 'node:fs/promises'
import path from 'path'
import fs, {promises} from 'fs'
import { TestItem } from '@/types/testdata'

const backupJsonFile = (inputPath: string, outputPath: string) => {
  try {
    const data = fs.readFileSync(inputPath)
    fs.writeFileSync(outputPath, data)

    return true
  } catch (err) {
    return err
  }
}

export async function POST(request: Request) {
  const req = await request.json()
  const itemIdentifier = req.updatedItem.pathS3

  const dir = path.resolve('./public', 'data/')
  const files = await readdir(dir)
  const config = files.filter((file) => file === 'test.json')[0]

  if (!config) {
    return Response.error()
  }

  const jsonFilePath = path.join(dir, config)

  const file = await promises.readFile(jsonFilePath, 'utf8')

  backupJsonFile(jsonFilePath, `public/data/backup/test-bak-${new Date().toISOString()}.json`)

  const data = JSON.parse(file)
  const itemToUpdate = data.find((item: TestItem) => item.pathS3 === itemIdentifier)
  const indexOfUpdatedItem = data.findIndex((item: TestItem) => item.pathS3 === itemIdentifier)

  if (!itemToUpdate) {
    return Response.error()
  }

  const updatedItem = {...itemToUpdate, ...req.updatedItem}

  data.splice(indexOfUpdatedItem, 1, updatedItem)
  fs.writeFileSync(jsonFilePath, JSON.stringify(data, null, 2), 'utf8')

  return Response.json({indexOfUpdatedItem, data})
}
