import { paramCase } from 'change-case'

export type SvgBase = {
  type: SvgType
  strokeWidth?: number;
  stroke?: string;
  fill?: string;
  start: number[];
  end: number[];
}

export type IPropsLine = SvgBase & {
  lineType: 'line' | 'path'
  controlStart?: number[];
  controlEnd?: number[];
}

export type IPropsRect = SvgBase & {
  round: number
  width: number
  height: number
}

export type IPropsCircle = SvgBase & {
  width: number
  height: number
}

export type ISvgType = IPropsLine | IPropsRect | IPropsCircle

export type SvgType = 'rect' | 'line' | 'circle'

export const STROKE_WIDTH = 2

export const DEFAULT_SIZE = {
  rect: [70, 40],
  circle: [40, 40]
}

export const DEFAULT_PROPS = {
  strokeWidth: STROKE_WIDTH,
  fill: '#ffffff',
  stroke: '#000000',
  start: [0, 0],
  type: 'rect'
}

export const SVG_TYPE: { [k in string]: SvgType } = {
  LINE: 'line',
  RECT: 'rect',
  CIRCLE: 'circle'
}

export const changeCase = (props: { [k in string]: any }) => {
  const newProps: { [k in string]: any } = {}
  Object.keys(props).forEach(key => {
    newProps[paramCase(key)] = props[key]
  })
  return newProps
}

export const clearCustomProps = (obj: { [k in string]: any }, excludePropsArr: string[]) => {
  const newObj: { [k in string]: any } = {}
  Object.keys(obj).forEach(key => {
    if (!['from-lines', 'to-lines'].concat(excludePropsArr).includes(key)) {
      newObj[key] = obj[key]
    }
  })
  return newObj
}
