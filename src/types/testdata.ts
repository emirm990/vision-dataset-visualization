export type Result = {
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
  result: Result,
}

export type TestItemWithLocalPath = TestItem & {
  localImagePath: string
}
