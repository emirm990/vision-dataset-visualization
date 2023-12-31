import Plotly, { Config, Data, Layout } from 'plotly.js'
import { useEffect, useState } from 'react'

type Props = {
  id: string,
  data: {
    data: Data[],
    layout: Partial<Layout>
    config: Partial<Config>,
  },
}

export default function Chart(props: Props) {
  const {
    id,
    data
  } = props

  const [root, setRoot] = useState<HTMLDivElement | null>(null)

  useEffect(() => {
    if (root && data) {
      Plotly.react(root, data.data, data.layout, data.config)
    }
  }, [root, data])

  return (
    <div id={id} ref={(ref) => setRoot(ref)}></div>
  )
}
