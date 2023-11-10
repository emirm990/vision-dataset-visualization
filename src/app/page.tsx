import DataVisualization from '../components/DataVisualization/DataVisualization'
import testData from '../../public/data/test.json'


export default function Home() {

  return (
    <main>
      <div>
        { testData.map((item) => <DataVisualization key={item.pathLocal} item={item} />) }
      </div>
    </main>
  )
}
