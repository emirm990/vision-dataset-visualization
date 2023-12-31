import { Result, TestItem } from '@/types/testdata'
import { RefObject, useEffect, useRef } from 'react'
import { fabric } from 'fabric' // v5
import type { Canvas as FabricCanvasType } from 'fabric/fabric-impl'
import styles from './styles.module.css'
import { useAppStore } from '@/store/appStore'
import { getDiff, rdiffResult } from 'recursive-diff'

type Props = {
  item: TestItem,
  imagePath: string,
  parent: RefObject<HTMLDivElement>
}

type FabricCanvas = FabricCanvasType & {
  isDragging: boolean,
  lastPosY: number,
  lastPosX: number,
}

fabric.Object.prototype.objectCaching = false

export default function Canvas(props: Props){
  const {
    item,
    imagePath,
    parent,
  } = props

  const fabricRef = useRef<FabricCanvas | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const canvasContainerRef = useRef<HTMLDivElement | null>(null)
  let visibilityTimeout: NodeJS.Timeout

  const setMeasurements = useAppStore((state) => state.setMeasurements)

  const labels = {
    result : ['foil_start', 'foil_end'],
    section: ['coating_start', 'coating_end'],
  }

  const getWidth = () => {
    if(parent.current) {
      return parent.current.getBoundingClientRect().width - 60
    }
  }

  const getHeight = () => {
    if (parent.current) {
      return parent.current.getBoundingClientRect().height - 125
    }
  }

  const getRatio = () => {
    if (fabricRef.current) {
      return fabricRef.current.getWidth() / item.width
    }
  }

  const updateLinePosition = (canvas: FabricCanvas,value: number, target: string) => {
    const measurementLines = canvas.getObjects().filter((object) => {
      if (object.name?.includes(target)) {
        return true
      }

      return false
    })

    measurementLines.forEach((lineGroup) => {
      clearTimeout(visibilityTimeout)
      const group = lineGroup as fabric.Group
      if (group.name === target) {
        const groupWidth = group.width

        if (groupWidth) {
          group.left = value - (groupWidth / 2)
          const text = group.getObjects().filter((item) => item.name === 'text')[0] as fabric.Text

          if (text) {
            text.text = `${target}: ${value}px`
          }
          canvas.renderAll()
        }
      }
    })
  }

  const measurementsLineSub = useAppStore.subscribe(
    (state) => state.measurements[item.pathS3],
    (next, prev) => {
      if (prev) {
        const delta = getDiff(prev,next)

        const canvas = fabricRef.current
        const generateFullPath = (delta: rdiffResult) => {
          if (!delta) {
            return
          }
          let path = delta.path[0]
          if (delta.path[1] !== undefined) {
            path = `${path}[${delta.path[1]}]`
          }
          if (delta.path[2] !== undefined) {
            path = `${path}.${delta.path[2]}`
          }

          return path as string
        }

        const path = generateFullPath(delta[0])
        if (canvas && path) {
          const groups = fabricRef.current?.getObjects().filter((object) => object.type === 'group') as fabric.Group[]
          const target = groups?.find((group) => group.name === path)
          if (target) {
            canvas.setActiveObject(target)
          }

          updateLinePosition(canvas, delta[0].val, path)
        }
      }
    }
  )

  useEffect(() => {
    const initFabric = () => {
      fabricRef.current = new fabric.Canvas(canvasRef.current, {
        perPixelTargetFind: true,
        imageSmoothingEnabled: false,
        selection: false,
        enableRetinaScaling: true,
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
        const height = getHeight()

        if (width && height) {
          fabricRef.current.setDimensions({width: width, height: height})
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
      if (zoom > 100) zoom = 100
      canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom)
      canvas.fire('zoom')
      opt.e.preventDefault()
      opt.e.stopPropagation()
    })
          
    fabricRef.current?.on('mouse:dblclick', function() {
      const canvas = fabricRef.current
      
      if (canvas) {
        const objects = canvas.getObjects()

        const image = objects.find((object) => {
          return object.type === 'image'
        }) as fabric.Image
        const scale = canvas.getWidth() / image.getScaledWidth()
        canvas.setViewportTransform([scale, 0, 0, scale, 0, 0])
        canvas.fire('zoom')
        canvas.renderAll()
      }
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
          if ( objectPositionLeft > item.width && target.width) {
            target.left = item.width - target.width / 2
            return
          }
          if (objectPositionLeft < 0 && target.width) {
            target.left = 0 - target.width / 2
            return
          }
          const name = object.group?.name
          textObject.set({
            text: `${name}: ${objectPositionLeft.toFixed(0)}px`
          })
          const splitedName = name?.split('.')
          if (splitedName) {
            const indexAndLabel = splitedName[0].replace(/[[\]']+/g, '.').split('.')
            const currentState = useAppStore.getState().measurements[item.pathS3]
            const newState = JSON.parse(JSON.stringify(currentState)) // hack around read only object when setting 
            if (splitedName[1]) {
              if (indexAndLabel[0] != null && indexAndLabel[1] != null && newState[indexAndLabel[0]][indexAndLabel[1]][splitedName[1]] != null) {
                newState[indexAndLabel[0]][indexAndLabel[1]][splitedName[1]] = Number(objectPositionLeft.toFixed(0))
              }
            } else {
              newState[splitedName[0]] = Number(objectPositionLeft.toFixed(0))
            }
            setMeasurements(item.pathS3, newState)
          }
        }
      })
    })

    fabricRef.current?.on('mouse:over', function(opt) {
      if (opt.target?.type === 'group') {
        const group = opt.target as fabric.Group
        const objects = group.getObjects()
        const canvas = fabricRef.current
        const zoom = canvas?.getZoom()
        
        const line = objects.find((object) => {
          return object.type === 'line'
        })
        const text = objects.find((object) => {
          return object.type === 'text'
        })

        if (line) {
          if (zoom && zoom < 1) {
            const strokeWidth = 10 / zoom < 20
              ? 10 / zoom
              : 20
            line.strokeWidth = strokeWidth
          }
          line.backgroundColor = line.stroke
        }
        if (text) {
          const mousePosition = canvas?.getPointer(opt.e)
          if (mousePosition && line?.height) {
            const adjustedZoom = zoom && zoom < 1 ? zoom : 1
            if (text.width) {
              text.left = text.width / 2 + 25
            }
            text.top = (mousePosition.y - line.height / 2) + 25 / adjustedZoom
          }
          text.visible = true
          fabricRef.current?.renderAll()
        }
      }
    })

    fabricRef.current?.on('mouse:out', function(opt) {
      if (opt.target?.type === 'group') {
        const group = opt.target as fabric.Group
        const objects = group.getObjects()
        const zoom = fabricRef.current?.getZoom() ?? 1

        const text = objects.find((object) => {
          return object.type === 'text'
        })
        const line = objects.find((object) => {
          return object.type === 'line'
        })
        if (line) {
          line.backgroundColor = undefined
          line.strokeWidth = zoom < 1 
            ? 1 / zoom
            : 1
        }
        if (text) {
          text.top = text.data.top
          text.left = text.data.left
          text.visible = false
          fabricRef.current?.renderAll()
        }
      }
    })

    fabricRef.current?.on('zoom', function() {
      const canvas = fabricRef.current
      if (canvas) {
        const zoom = canvas.getZoom()

        const measurementLines = canvas.getObjects().filter((object) => {
          if (object.name?.includes('foil') || object.name?.includes('sections')) {
            return true
          }
  
          return false
        })
  
        measurementLines.forEach((item) => {
          const group = item as fabric.Group
  
          const lines = group.getObjects().filter((object) => object.name === 'line') as fabric.Line[]
          const texts = group.getObjects().filter((object) => object.name === 'text') as fabric.Text[]
  
          lines.forEach((line) => {
            if (line.strokeWidth) {
              if (zoom < 1) {
                line.strokeWidth = 1 / zoom
              }
            }
          })
  
          texts.forEach((text) => {
            if (zoom < 1) {
              text.fontSize = 16 / zoom
            }
          })
        })
      }
    })
  
    onResize()
    window.addEventListener('resize', onResize)
    return () => {
      disposeFabric()
      window.removeEventListener('resize', onResize)
      measurementsLineSub()
    }
  }, [])


  useEffect(() => {
    if (imagePath) {
      const addLine = (x: number, y: number, stroke?: string, label?: string) => {
        const zoom = fabricRef.current?.getZoom() ?? 1
        const line = new fabric.Line([x, 0, x, y], {
          name: 'line',
          strokeWidth: zoom < 1 
            ? 1 / zoom
            : 1,
          stroke: stroke || 'red',
          opacity: 0.5,
          hasControls: false,
          originX: 'left',
        })
        const text = new fabric.Text(`${label}: ${x}px`, {
          name: 'text',
          textAlign: 'center',
          stroke: stroke,
          fill: stroke,
          backgroundColor: 'white',
          originX: 'center',
          originY: 'bottom',
          left: x,
          top: y + 25,
          hasControls: false,
          visible: false,
          data: {
            top: y + 25,
            left: x,
          },
          fontSize: zoom < 1
            ? 16 / zoom
            : 16
        })

        const lineGroup = new fabric.Group([line, text], {
          lockMovementY: true,
          name: label,
          hasControls: false,
          hasBorders: false,
        })

        return lineGroup
      }

      const addImage = () => {
        fabric.Image.fromURL(imagePath, function(oImg) {
          const results = labels.result.map((label) => {
            return addLine(item.result[label as keyof Pick<Result, 'foil_start' | 'foil_end'>], item.height, 'red', `${label}`)
          })
          const coatingLineSections = item.result.coating_line_sections.flatMap((section, i) => {
            return labels.section.map((label) => {
              return addLine(section[label as keyof typeof section], item.height, 'green', `coating_line_sections[${i}].${label}`)
            })
          })
          oImg.selectable = false
          oImg.noScaleCache = true
          fabricRef.current?.add(...[oImg, ...results, ...coatingLineSections])
        })
      }
      
      addImage()
    }
  }, [imagePath])

  useEffect(() => {
    if (fabricRef.current) {
      const currentZoom = fabricRef.current.getZoom()
      const ratio = getRatio()
      if (ratio) {
        fabricRef.current.setZoom(currentZoom === 1 ? ratio : currentZoom)
      }
    }
  }, [item])

  return (
    <div ref={canvasContainerRef} className={styles.canvasContainer}>
      <canvas ref={canvasRef} width={getWidth()} height={getHeight()}/>
    </div>
  )
}
