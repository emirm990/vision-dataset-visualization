import { readdir } from 'node:fs/promises'
import path from 'path'
import fs, {promises} from 'fs'
import { TestItem } from '@/types/testdata'
export const revalidate = 0

const backupJsonFile = (inputPath: string, outputPath: string) => {
  try {
    const data = fs.readFileSync(inputPath)
    fs.writeFileSync(outputPath, data)

    return true
  } catch (err) {
    return err
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const fileName = searchParams.get('fileName')

  const subPath = fileName ? 'data/test' : 'data'
  const dir = path.resolve('./public', subPath)
  const files = await readdir(dir)
  const config = files.filter((file) => {
    if (fileName) {
      return file === fileName
    }

    return file === 'test.json'
  })[0]

  if (!config) {
    return Response.error()
  }

  const jsonFilePath = path.join(dir, config)

  const file = await promises.readFile(jsonFilePath, 'utf8')

  return Response.json(JSON.parse(file))
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

  const data = JSON.parse(file) as undefined | TestItem[]

  if (!data) {
    return Response.error()
  }

  const indexOfUpdatedItem = data.findIndex((item: TestItem) => item.pathS3 === itemIdentifier)

  if (indexOfUpdatedItem === -1) {
    return Response.error()
  }

  const itemToUpdate = data[indexOfUpdatedItem]

  if (!itemToUpdate) {
    return Response.error()
  }
 
  delete req.updatedItem.localImagePath
  
  const updatedItem: TestItem = {...itemToUpdate, ...req.updatedItem}

  data.splice(indexOfUpdatedItem, 1, updatedItem)
  fs.writeFileSync(jsonFilePath, JSON.stringify(data, null, 2), 'utf8')

  return Response.json({status: 200, message: 'Saved successfully!', item: updatedItem})
}
