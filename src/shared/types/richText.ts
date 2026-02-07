export type RichTextRun = {
  text: string
  fontFamily: string
  fontSize: number
  fontWeight: number
  fontStyle: 'normal' | 'italic'
  color: string
  letterSpacing: number
  lineHeight: number
  textDecoration: 'none' | 'underline' | 'line-through'
  strokeColor: string
  strokeWidth: number
  shadow: string
}

export type RichTextDoc = {
  runs: RichTextRun[]
  align: 'left' | 'center' | 'right' | 'justify'
  verticalAlign: 'top' | 'middle' | 'bottom'
  padding: { top: number; right: number; bottom: number; left: number }
}

export const DEFAULT_RUN: RichTextRun = {
  text: '',
  fontFamily: 'IBM Plex Sans',
  fontSize: 20,
  fontWeight: 400,
  fontStyle: 'normal',
  color: '#0f172a',
  letterSpacing: 0,
  lineHeight: 1.2,
  textDecoration: 'none',
  strokeColor: '#ffffff',
  strokeWidth: 0,
  shadow: 'none',
}
