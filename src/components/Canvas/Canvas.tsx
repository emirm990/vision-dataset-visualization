import { TestItem } from '@/types/testdata'
import { useEffect, useRef } from 'react'
import { fabric } from 'fabric' // v5

type Props = {
  item: TestItem,
  imagePath: string,
}

export default function Canvas(props: Props){
	const {
		item,
		imagePath,
	} = props

	const fabricRef = useRef<fabric.Canvas | null>(null)
	const canvasRef = useRef<HTMLCanvasElement | null>(null)

	const getWidth = () => {
		return document.body.getBoundingClientRect().width
	}

	useEffect(() => {
		const initFabric = () => {
			fabricRef.current = new fabric.Canvas(canvasRef.current)
			fabricRef.current.width = getWidth()
		}

		const disposeFabric = () => {
			fabricRef.current?.dispose()
		}

		initFabric()

		const onResize = () => {
			if (fabricRef.current) {

				fabricRef.current.setDimensions({width: getWidth(), height: 600})
				fabricRef.current.setViewportTransform([1, 0, 0, 1, 0, 0])
			}
		}


		onResize()
		window.addEventListener('resize', onResize)
		return () => {
			disposeFabric()
			window.removeEventListener('resize', onResize)
		}
	}, [])


	useEffect(() => {
		if (imagePath) {
			const addLine = (x: number, y: number, stroke?: string) => {
				const line = new fabric.Line([x, 0, x, y], {
					strokeWidth: 10,
					stroke: stroke || 'red'
				})

				return line
			}

			const addImage = () => {
				fabric.Image.fromURL(imagePath, function(oImg) {
					const foil_start = addLine(item.result.foil_start, item.height)
					const foil_end = addLine(item.result.foil_end, item.height)
					const coatingLineSections = item.result.coating_line_sections.flatMap((section) => {
						const result = []
						result.push(
							addLine(section.coating_start, item.height, 'green'),
							addLine(section.coating_end, item.height, 'green'),
							addLine(section.foil_start, item.height, 'green'),
							addLine(section.foil_end, item.height, 'green')
						)

						return result
					})
					const lineGroup = new fabric.Group([foil_start, foil_end, ...coatingLineSections])

					const group = new fabric.Group([ oImg, lineGroup ], {
						left: 0,
						top: 0,
						angle: 0,
					})
					fabricRef.current?.add(group)

					// group.on('selected', () => {
					//   fabricRef.current?.setZoom(1)
					// })
          
					// group.on('selected', () => {
					//   const items = group.getObjects();
					//   group.destroy();
					//   fabricRef.current?.remove(group);
					//   items.forEach(function(item) {
					//     item.set('dirty', true);
					//   })
					//   fabricRef.current?.add.apply(fabricRef.current, items);
					//   fabricRef.current?.renderAll();
					// })

					// lineGroup.on('selected', () => {
					//   const items = lineGroup.getObjects();
					//   lineGroup.destroy();
					//   fabricRef.current?.remove(lineGroup);
					//   items.forEach(function(item) {
					//     item.set('dirty', true);
					//   })
					//   fabricRef.current?.add.apply(fabricRef.current, items);
					//   fabricRef.current?.renderAll();
					// })
				})
			}
      
			addImage()
		}
	}, [imagePath])

	useEffect(() => {
		if (fabricRef.current) {
			// const ratio = fabricRef.current.getWidth() / item.width
			fabricRef.current.setZoom(1)
		}
	}, [item])

	console.log(fabricRef.current?.fireRightClick)
	return <canvas ref={canvasRef} width={getWidth()} height={600}/>
}