import { Result, TestItem } from '@/types/testdata'
import { Config, Data, Layout } from 'plotly.js'

type ManifestResult = {
  ImgArr: string[];
  FbsArr: string[];
  ResultArr: Result[];
}

type PieMap = Map<'foil_start' | 'foil_end' | 'coating_start' | 'coating_end',{
  success: number;
  failure: number;
}>

export const getPlotData = (actual: TestItem[], expected: TestItem[]) => {
  if (actual.length !== expected.length){
    alert('expected and actual manifest files ar not the same length! ')
    throw new Error('Arrays do not have the same length')
  }
  
  // read in manifest file and add listener to button
  const manifestDiff = subtractManifestResults(actual, expected)
    
  // on-button clicked render
  // function changeColor() {
  //   const numberInput = Math.abs(document.getElementById('numberInput').value)
  //   const pieMap = pieDataExtract(manifestDiff.ResultArr, numberInput)
  //   piePlot(pieMap)
  //   scatterPlot(manifestDiff, numberInput)
  // }
  
  // subtract actual and expected manifest files assumption is they are the same format
  function subtractObjects(obj1: object | null, obj2: object | null): Result {
    const result: {[key: string]: unknown | unknown[]} = {}

    function subtractValues(value1: unknown, value2: unknown): unknown {
      if (Array.isArray(value1) && Array.isArray(value2)) {
        // If both values are arrays, subtract corresponding elements
        return value1.map((el, index) => subtractValues(el, value2[index]))
      } else if (typeof value1 === 'object' && typeof value2 === 'object') {
        // If both values are objects, recursively subtract them
        return subtractObjects(value1, value2)
      } else if (typeof value1 === 'number' && typeof value2 === 'number') {
        // If both values are numbers, subtract them
        return value1 - value2
      } else {
        // Otherwise, keep the original value
        return value1
      }
    }
  
    for (const key in obj1) {
      const temp = key as keyof typeof obj1
      if (Object.prototype.hasOwnProperty.call(obj1, temp) && Object.prototype.hasOwnProperty.call(obj2, temp) && obj2) {
        result[temp] = subtractValues(obj1[temp], obj2[temp])
      } else {
        // If the key is unique to one of the objects, keep its value
        result[temp] = obj1[temp]
      }
    }
  
    for (const key in obj2) {
      const temp = key as keyof typeof obj2
      if (Object.prototype.hasOwnProperty.call(obj2, key) && !Object.prototype.hasOwnProperty.call(obj1, key)) {
        // If the key is unique to one of the objects, keep its value
        result[key] = obj2[temp]
      }
    }

    return result as Result
  }
  
  // subtract manifest results assumption is they are the same format
  function subtractManifestResults(actual: TestItem[], expected: TestItem[]) {
    // Check if arrays have equal length
    if (expected.length !== actual.length) {
      throw new Error('Arrays do not have the same length')
    }
  
    const ImgArr = []
    const FbsArr = []
    const ResultArr: Result[] = []
  
    // Subtract corresponding elements from each array using a for loop
    for (let i = 0; i < expected.length; i++) {
      ResultArr.push(subtractObjects(actual[i].result, expected[i].result))
      FbsArr.push(expected[i].fbs)
      ImgArr.push(expected[i].fileName)
    }
    return {ImgArr, FbsArr, ResultArr}
  }
  
  // extract piePlot foilStart foilEnd, coatingStart and CoatingEnd data based on threshold
  function pieDataExtract(errObj: Result[], th=2) {
    const myMap: Map<'foil_start' | 'foil_end' | 'coating_start' | 'coating_end', { success: number, failure: number}> = new Map()
    myMap.set('foil_start', {success: 0, failure:0 })
    myMap.set('foil_end', {success: 0, failure:0 })
    myMap.set('coating_start', {success: 0, failure:0 })
    myMap.set('coating_end', {success: 0, failure:0 })
  
    for (let i = 0; i < errObj.length; i++) {
      // foil Start
      if (errObj[i].foil_start <= th && errObj[i].foil_start >= -th){
        const foilStart = myMap.get('foil_start')
        if (foilStart) {
          foilStart.success += 1
        }
      }else{
        const foilStart = myMap.get('foil_start')
        if (foilStart) {
          foilStart.failure += 1
        }
      }
      // foil End
      if (errObj[i].foil_end <= th && errObj[i].foil_end >= -th){
        const foilEnd = myMap.get('foil_end')
        if (foilEnd) {
          foilEnd.success += 1
        }
      }else{
        const foilEnd = myMap.get('foil_end')
        if (foilEnd) {
          foilEnd.failure += 1
        }
      }
  
      for (let j = 0; j < errObj[i].coating_line_sections.length; j++) {
        // coating Start
        if (errObj[i].coating_line_sections[j].coating_start <= th && errObj[i].coating_line_sections[j].coating_start >= -th){
          const coatingStart =  myMap.get('coating_start')
          if (coatingStart) {
            coatingStart.success += 1
          }
        }else{
          const coatingStart =  myMap.get('coating_start')
          if (coatingStart) {
            coatingStart.failure += 1
          }
        }
        // coating End
        if (errObj[i].coating_line_sections[j].coating_end <= th && errObj[i].coating_line_sections[j].coating_end >= -th){
          const coating_end =  myMap.get('coating_end')
          if (coating_end) {
            coating_end.success += 1
          }
        }else{
          const coating_end =  myMap.get('coating_end')
          if (coating_end) {
            coating_end.failure += 1
          }
        }
      }
    }
    return myMap
  }
  
  // Render Pie plot
  function piePlot(pieMap: PieMap): { data: Data[], layout: Partial<Layout>, config: Partial<Config> } {
    const piTotal = [0,0]
    for (const [, value] of pieMap) {
      // Accumulate sums for 'success' and 'failure'
      piTotal[0] += value.success
      piTotal[1] += value.failure
    }
  
    const foilStart = pieMap.get('foil_start')
    const foilEnd = pieMap.get('foil_end')
    const coatingStart = pieMap.get('coating_start')
    const coatingEnd = pieMap.get('coating_end')

    
    const piPass = foilStart && foilEnd && coatingStart && coatingEnd ? [
      foilStart.success / (foilStart.success + foilStart.failure),
      foilEnd.success / (foilEnd.success + foilEnd.failure),
      coatingStart.success / (coatingStart.success + coatingStart.failure),
      coatingEnd.success / (coatingEnd.success + coatingEnd.failure)
    ] : []

    const piFail = foilStart && foilEnd && coatingStart && coatingEnd ? [
      foilStart.failure / (foilStart.success + foilStart.failure),
      foilEnd.failure / (foilEnd.success + foilEnd.failure),
      coatingStart.failure / (coatingStart.success + coatingStart.failure),
      coatingEnd.failure / (coatingEnd.success + coatingEnd.failure)
    ] : []
  
    // Plotly Top BarPlot
    const pieData: Data[] = [{
      values: piTotal,
      labels: ['Pass', 'Fail'],
      domain: {column: 0},
      hoverinfo: 'label+percent',
      hole: .4,
      type: 'pie',
      title: {
        text: 'Total'
      },
      marker: {colors: ['#2CA02C', '#FF7F0E']},
    },
    {
      x: ['FoilStart', 'FoilEnd', 'CoatingStart', 'CoatingEnd'],
      y: piPass,
      hoverinfo: 'x+y',
      name: 'Pass',
      type: 'bar',
      xaxis: 'x2',
      marker: {color: '#2CA02C'},
    },
    {
      x: ['FoilStart', 'FoilEnd', 'CoatingStart', 'CoatingEnd'],
      y: piFail,
      hoverinfo: 'x+y',
      name: 'Fail',
      type: 'bar',
      xaxis: 'x2',
      marker: {color: '#FF7F0E'},
    }]
  
    const pieLayout: Partial<Layout> = {
      title: 'Accuracy',
      barmode: 'stack',
      height: 400,
      showlegend: false,
      grid: {rows: 1, columns: 2}
    }
  
    const pieConfig: Partial<Config> = {
      displayModeBar:true,
      doubleClick: 'reset+autosize',
      responsive: true,
      scrollZoom: true,
    }
    
    return {
      data: pieData,
      layout: pieLayout,
      config: pieConfig,
    }
  }
  
  
  function scatterPlot(manifestDiff: ManifestResult, th=2): { data: Data[], layout: Partial<Layout>, config: Partial<Config>} {
    const samplesNo = manifestDiff.ResultArr.length
    
    const fs = {x: Array.from(Array(manifestDiff.ResultArr.length).keys()),
      y: manifestDiff.ResultArr.map((obj) => obj.foil_start),
      text: textArr( manifestDiff.ResultArr,  manifestDiff.ImgArr,  manifestDiff.FbsArr, samplesNo, 'foil_start'),
    }
    const fe = {x: Array.from(Array(manifestDiff.ResultArr.length).keys()),
      y: manifestDiff.ResultArr.map((obj) => obj.foil_end),
      text: textArr( manifestDiff.ResultArr,  manifestDiff.ImgArr,  manifestDiff.FbsArr, samplesNo, 'foil_end'),
    }
    const cs0 = {x: Array.from(Array(manifestDiff.ResultArr.length).keys()),
      y: manifestDiff.ResultArr.map((obj) => obj.coating_line_sections[0].coating_start),
      text: textArr( manifestDiff.ResultArr,  manifestDiff.ImgArr,  manifestDiff.FbsArr, samplesNo, 'coating_line_sections.0.coating_start'),
    }
    const ce0 = {x: Array.from(Array(manifestDiff.ResultArr.length).keys()),
      y: manifestDiff.ResultArr.map((obj) => obj.coating_line_sections[0].coating_end),
      text: textArr( manifestDiff.ResultArr,  manifestDiff.ImgArr,  manifestDiff.FbsArr, samplesNo, 'coating_line_sections.0.coating_end'),
    }
    const cs1 = {x: Array.from(Array(manifestDiff.ResultArr.length).keys()),
      y: manifestDiff.ResultArr.map((obj) => obj.coating_line_sections[1]?.coating_start),
      text: textArr( manifestDiff.ResultArr,  manifestDiff.ImgArr,  manifestDiff.FbsArr, samplesNo, 'coating_line_sections.1.coating_start'),
    }
    const ce1 = {x: Array.from(Array(manifestDiff.ResultArr.length).keys()),
      y: manifestDiff.ResultArr.map((obj) => obj.coating_line_sections[1]?.coating_end),
      text: textArr( manifestDiff.ResultArr,  manifestDiff.ImgArr,  manifestDiff.FbsArr, samplesNo, 'coating_line_sections.1.coating_end'),
    }
  
    function textArr(value: Result[], img: string[], fbs: string[], len: number, element: string) {
      const  arr = []
      for (let i = 0; i < len; i++) {
        let erVal = 0
        if (element === 'foil_start'){
          erVal = value[i].foil_start
        }
        if (element === 'foil_end'){
          erVal = value[i].foil_end
        }
        if (element === 'coating_line_sections.0.coating_start'){
          erVal = value[i].coating_line_sections[0].coating_start
        }
        if (element === 'coating_line_sections.0.coating_end'){
          erVal = value[i].coating_line_sections[0].coating_end
        }
        if (element === 'coating_line_sections.1.coating_start'){
          if (value[i].coating_line_sections.length === 2){
            erVal = value[i].coating_line_sections[1].coating_start
          }
        }
        if (element === 'coating_line_sections.1.coating_end'){
          if (value[i].coating_line_sections.length === 2){
            erVal = value[i].coating_line_sections[1].coating_end
          }
        }
        const st = '<b>Err</b>:'+erVal+'px<br>'+'<b>Img: </b>'+img[i]+'<br><b>FBS: </b>'+fbs[i]+'<br>'+'<extra></extra>'
        arr.push(st)
      }
      return arr
    }
  
    const trace1: Data = {
      x: fs.x,
      y: fs.y,
      type: 'scatter',
      mode: 'markers',
      hovertemplate: '%{text}',
      text: fs.text,
      xaxis: 'x',
      yaxis: 'y1',
    }
  
    const trace2: Data = {
      x: cs0.x,
      y: cs0.y,
      xaxis: 'x',
      yaxis: 'y2',
      hovertemplate: '%{text}',
      text: cs0.text,
      mode: 'markers',
      type: 'scatter'
    }
  
    const trace3: Data = {
      x: ce0.x,
      y: ce0.y,
      xaxis: 'x',
      yaxis: 'y3',
      hovertemplate: '%{text}',
      text: ce0.text,
      mode: 'markers',
      type: 'scatter'
    }
    const trace4: Data = {
      x: cs1.x,
      y: cs1.y,
      xaxis: 'x',
      yaxis: 'y4',
      hovertemplate: '%{text}',
      text: cs1.text,
      mode: 'markers',
      type: 'scatter'
    }
    const trace5: Data = {
      x: ce1.x,
      y: ce1.y,
      xaxis: 'x',
      yaxis: 'y5',
      hovertemplate: '%{text}',
      text: ce1.text,
      mode: 'markers',
      type: 'scatter'
    }
  
    const trace6: Data = {
      x: fe.x,
      y: fe.y,
      xaxis: 'x',
      yaxis: 'y6',
      hovertemplate: '%{text}',
      text: fe.text,
      mode: 'markers',
      type: 'scatter'
    }
  
    const data: Data[] = [trace1, trace2, trace3, trace4, trace5, trace6]
  
    const layout: Partial<Layout> = {
      title: 'Actual vs Expected Error[px]',
      showlegend: false,
      barmode: 'group',
      bargap :0.1,
      grid: {rows: 6, columns: 1},
  
      xaxis:{showticklabels:false},
      xaxis2:{showticklabels:false},
      xaxis3:{showticklabels:false},
      xaxis4:{showticklabels:false},
      xaxis5:{showticklabels:false},
      xaxis6:{showticklabels:false},
  
      yaxis: {title: 'Foil Start', dtick: 2},
      yaxis2: {title: 'Coating Start 0', dtick: 2},
      yaxis3: {title: 'Coating End 0', dtick: 2},
      yaxis4: {title: 'Foil End 1', dtick: 2},
      yaxis5: {title: 'Coating End 1', dtick: 2},
      yaxis6: {title: 'Foil End', dtick: 2}, //range: [-7,7]
  
      shapes: [{type:'rect', x0:0, x1:samplesNo, yref:'y', y0:-th, y1:th, fillcolor: 'green',opacity: 0.2, line: {width:0}},
        {type:'rect', x0:0, x1:samplesNo, yref:'y2', y0:-th, y1:th, fillcolor: 'green',opacity: 0.2, line: {width:0}},
        {type:'rect', x0:0, x1:samplesNo, yref:'y3', y0:-th, y1:th, fillcolor: 'green',opacity: 0.2, line: {width:0}},
        {type:'rect', x0:0, x1:samplesNo, yref:'y4', y0:-th, y1:th, fillcolor: 'green',opacity: 0.2, line: {width:0}},
        {type:'rect', x0:0, x1:samplesNo, yref:'y5', y0:-th, y1:th, fillcolor: 'green',opacity: 0.2, line: {width:0}},
        {type:'rect', x0:0, x1:samplesNo, yref:'y6', y0:-th, y1:th, fillcolor: 'green',opacity: 0.2, line: {width:0}}],
      height: 1000,
    }
  
    const config: Partial<Config> = {
      displayModeBar:true,
      doubleClick: 'reset+autosize',
      responsive: true,
      scrollZoom: true,
    }

    return {
      data,
      layout,
      config,
    }
  }

  const { data: scatterData, layout: scatterLayout, config: scatterConfig } = scatterPlot(manifestDiff, 2)

  const pieMap = pieDataExtract(manifestDiff.ResultArr)
  const { data: pieData, layout: pieLayout, config: pieConfig } = piePlot(pieMap)

  return {
    data: {
      pie: {
        data: pieData,
        layout: pieLayout,
        config: pieConfig,
      },
      scatter: {
        data: scatterData,
        layout: scatterLayout,
        config: scatterConfig,
      }
    }
  }
}

