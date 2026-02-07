export type OCRDet = number[] | number[][]

export type OCRStreamItem = {
  ref: string
  det: OCRDet
}
