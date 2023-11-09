export type TestItem = {
  test: boolean,
  fileName: string,
  fbs: string,
  pathLocal: string,
  pathS3: string,
  batteryType: string,
  tags: string[],
  ppmx: number,
  width: number,
  height: number,
  result: {
    foil_start: number,
    foil_end: number,
    coating_line_sections: 
      {
        foil_start: number,
        foil_end: number,
        coating_start: number,
        coating_end: number,
      }[]
  }
}
