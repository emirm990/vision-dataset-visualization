import fs from 'fs'
import path from 'path'
  
export async function GET() {
	const dir = path.resolve('./public', 'data/images')

	const images = fs.readdirSync(dir)

	return Response.json({ images })
}
