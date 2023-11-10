import { TestItem } from '@/types/testdata'
import { useEffect, useRef } from 'react'
import { fabric } from 'fabric' // v5
import type { Canvas as FabricCanvasType } from 'fabric/fabric-impl'
import styles from './styles.module.css'

type Props = {
  item: TestItem,
  imagePath: string,
}

type FabricCanvas = FabricCanvasType & {
  isDragging: boolean,
  lastPosY: number,
  lastPosX: number,
}
export default function Canvas(props: Props){
  const {
    item,
    imagePath,
  } = props

  const fabricRef = useRef<FabricCanvas | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const canvasContainerRef = useRef<HTMLDivElement | null>(null)

  const getWidth = () => {
    return canvasContainerRef.current?.clientWidth
  }

  useEffect(() => {
    const initFabric = () => {
      fabricRef.current = new fabric.Canvas(canvasRef.current, {
        perPixelTargetFind: true,
        imageSmoothingEnabled: false,
        selection: false,
      }) as FabricCanvas
      fabricRef.current.width = getWidth()
    }

    const disposeFabric = () => {
      fabricRef.current?.dispose()
    }

    initFabric()

    const onResize = () => {
      if (fabricRef.current) {
        const width = getWidth()
        if (width) {
          fabricRef.current.setDimensions({width: width, height: 600})
        }
      }
    }

    fabricRef.current?.on('mouse:down', function(opt) {
      const evt = opt.e
      const canvas = fabricRef.current
      if (!canvas) {
        return
      }

      if (evt.altKey === true) {
        canvas.isDragging = true
        canvas.lastPosX = evt.clientX
        canvas.lastPosY = evt.clientY
      }
    })

    fabricRef.current?.on('mouse:move', function(opt) {
      const canvas = fabricRef.current
      if (!canvas) {
        return
      }

      if (canvas.isDragging) {
        const e = opt.e
        const vpt = canvas.viewportTransform
        if (vpt) {
          vpt[4] += e.clientX - canvas.lastPosX
          vpt[5] += e.clientY - canvas.lastPosY
          canvas.requestRenderAll()
          canvas.lastPosX = e.clientX
          canvas.lastPosY = e.clientY
        }
      }
    })
  
    fabricRef.current?.on('mouse:up', function() {
      // on mouse up we want to recalculate new interaction
      // for all objects, so we call setViewportTransform
      const canvas = fabricRef.current
      if (!canvas) {
        return
      }
      const vpt = canvas.viewportTransform
      if (vpt) {
        canvas.setViewportTransform(vpt)
        canvas.isDragging = false
      }
    })
    
    fabricRef.current?.on('mouse:wheel', function(opt) {
      const canvas = fabricRef.current
      const delta = opt.e.deltaY

      if (!canvas) {
        return
      }

      let zoom = canvas.getZoom()

      zoom *= 0.999 ** delta
      if (zoom > 20) zoom = 20
      if (zoom < 0.01) zoom = 0.01
      canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom)

      opt.e.preventDefault()
      opt.e.stopPropagation()
    })
          
    fabricRef.current?.on('object:moving', function(opt) {
      const target = opt.target as fabric.Group
      if (!target) {
        return
      }
      const objects = target.getObjects() as fabric.Object[]
      
      objects.forEach((object) => {
        if (object.name === 'text') {
          const textObject = object as fabric.Text
          const objectPositionLeft = target.left && target.width ? target.left + target?.width / 2 : 0
          textObject.set({
            text: `${target?.name}: ${objectPositionLeft.toFixed(0)}px`
          })
        }
      })
    })

    onResize()
    window.addEventListener('resize', onResize)
    return () => {
      disposeFabric()
      window.removeEventListener('resize', onResize)
    }
  }, [])


  useEffect(() => {
    if (imagePath) {
      const addLine = (x: number, y: number, stroke?: string, label?: string) => {
        const line = new fabric.Line([x, 0, x, y], {
          name: 'line',
          strokeWidth: 10,
          stroke: stroke || 'red',
          opacity: 0.5,
        })
        const text = new fabric.Text(`${label}: ${x}px`, {
          name: 'text',
          textAlign: 'center',
          stroke: stroke,
          fill: stroke,
          backgroundColor: 'white',
          originX: 'center',
          originY: 'center',
          left: x,
          top: y + 50,
        })
        const lineGroup = new fabric.Group([line, text])
        lineGroup.lockMovementY = true
        lineGroup.name = label
        return lineGroup
      }

      const addImage = () => {
        fabric.Image.fromURL(imagePath, function(oImg) {
          const foil_start = addLine(item.result.foil_start, item.height, 'red', 'result.foil_start')
          const foil_end = addLine(item.result.foil_end, item.height, 'red', 'result.foil_end')
          const coatingLineSections = item.result.coating_line_sections.flatMap((section) => {
            const result = []
            result.push(
              addLine(section.coating_start, item.height, 'green', 'section.coating_start'),
              addLine(section.coating_end, item.height, 'green', 'section.coating_end'),
              addLine(section.foil_start, item.height, 'green', 'section.foil_start'),
              addLine(section.foil_end, item.height, 'green', 'section.foil_end')
            )

            return result
          })
          oImg.selectable = false
          fabricRef.current?.add(...[oImg, foil_start, foil_end, ...coatingLineSections])
        })
      }
      
      addImage()
    }
  }, [imagePath])

  useEffect(() => {
    if (fabricRef.current) {
      const ratio = fabricRef.current.getWidth() / item.width
      fabricRef.current.setZoom(ratio)
    }
  }, [item])

  return (
    <div ref={canvasContainerRef} className={styles.canvasContainer}>
      <canvas ref={canvasRef} width={getWidth()} height={600}/>
    </div>
  )
}