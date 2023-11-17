'use client'
import Plotly, { Config, Data, Layout } from 'plotly.js'
import { useEffect, useState } from 'react'

type Props = {
  data: {
    data: Data[],
    layout: Partial<Layout>
    config: Partial<Config>,
  },
}

export default function Chart(props: Props) {
  const {
    data
  } = props

  const [root, setRoot] = useState<HTMLDivElement | null>(null)

  useEffect(() => {
    if (root) {
      Plotly.newPlot(root, data.data, data.layout, data.config)
    }
  }, [root, data])

  return (
    <div id="plot" ref={(ref) => setRoot(ref)}></div>
  )
}
