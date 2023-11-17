import { join } from 'path'
import { stat, mkdir, writeFile } from 'fs/promises'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const formData = await request.formData()

  const file = formData.get('file') as Blob | null
  const name = formData.get('name')
  
  if (!file) {
    return NextResponse.json(
      { error: 'File blob is required.' },
      { status: 400 }
    )
  }

  if (file.type !== 'application/json') {
    return NextResponse.json(
      { error: 'Only .json files are allowed.'},
      { status: 415 }
    )
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const relativeUploadDir = '/data/test'
  const uploadDir = join(process.cwd(), 'public', relativeUploadDir)

  try {
    await stat(uploadDir)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    const code = e['code']
    if (code === 'ENOENT') {
      await mkdir(uploadDir, { recursive: true })
    } else {
      console.error(
        'Error while trying to create directory when uploading a file\n',
        e
      )
      return NextResponse.json(
        { error: 'Something went wrong.' },
        { status: 500 }
      )
    }
  }

  try {
    await writeFile(`${uploadDir}/${name}.json`, buffer)
    return NextResponse.json({ fileUrl: `${relativeUploadDir}/${name}.json` })
  } catch (e) {
    console.error('Error while trying to upload a file\n', e)
    return NextResponse.json(
      { error: 'Something went wrong.' },
      { status: 500 }
    )
  }
}
