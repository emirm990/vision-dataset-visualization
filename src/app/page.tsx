import testData from '../../public/data/test.json'
import DataVisualization from '@/components/DataVisualization'

export default function Home() {

  return (
    <main>
      <div>
        { testData.map((item) => <DataVisualization key={item.pathLocal} item={item} />) }
      </div>
    </main>
  )
}
