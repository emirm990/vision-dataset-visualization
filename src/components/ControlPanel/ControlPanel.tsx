import { TestItem } from '@/types/testdata'
import styles from './styles.module.css'
import { Fragment } from 'react'

type Props = {
  item: TestItem,
}

export default function ControlPanel(props: Props) {
  const {
    item,
  } = props

  return (
    <div className={styles.controlPanelContainer}>
      <p>width: {item.width}px</p>
      <p>height: {item.width}px</p>
      <p>ppmx: {item.ppmx}</p>
      <ul className={`${styles.list} ${styles.outsideList}`}>
        <li>foil_start: {item.result.foil_start}</li>
        <li>foil_end: {item.result.foil_end}</li>
        <ul className={`${styles.list} ${styles.insideList}`}>
          <p>Results: </p>
          { item.result.coating_line_sections.map((result, i) => {
            return (
              <Fragment key={i}>
                <li>foil_start: {result.foil_start}px</li>
                <li>foil_start: {result.foil_end}px</li>
                <li>coating_start: {result.coating_start}px</li>
                <li>coating_end: {result.coating_end}px</li>
              </Fragment>
            )
          })}
        </ul>
      </ul>
    </div>
  )
}