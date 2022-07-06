import { paramCase } from 'change-case'
import {Edge} from "../operation/state";

export type SvgBase = {
  type: SvgType
  strokeWidth?: number
  stroke?: string
  fill?: string
  start: number[]
  end: number[]
}
export type NodeLineAttach = {
  nodeId: number,
  edge: Edge
  ratioX: number
  ratioY: number
}
export type IPropsLine = SvgBase & {
  lineType: 'line' | 'path' | 'polyline'
  fromNode: NodeLineAttach
  toNode: NodeLineAttach
  // controlStart?: number[]
  // controlEnd?: number[]
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
export type IPropsPolygon = SvgBase & {
  points: string
}
export type IPropsText = SvgBase & {
  status: 0 | 1
  width: number
  height: number
}

export type ISvgType = IPropsLine | IPropsRect | IPropsCircle | IPropsPolygon | IPropsText

export type SvgType = 'rect'
  | 'line'
  | 'circle'
  | 'polygon'
  | 'text'
  | 'polygon-arrow-left'
  | 'polygon-arrow-right'
  | 'polygon-arrow-top'
  | 'polygon-arrow-bottom'

export const STROKE_WIDTH = 1

export const DEFAULT_SIZE = {
  // rect: [80, 50],
  // circle: [60, 60],
  // polygon: [80, 60],
  // text: [80, 50]
  rect: [30, 20],
  circle: [25, 25],
  polygon: [30, 25],
  text: [30, 25]
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
  CIRCLE: 'circle',
  POLYGON: 'polygon',
  TEXT: 'text',
  POLYGON_ARROW_TOP: 'polygon-arrow-top',
  POLYGON_ARROW_BOTTOM: 'polygon-arrow-bottom',
  POLYGON_ARROW_LEFT: 'polygon-arrow-left',
  POLYGON_ARROW_RIGHT: 'polygon-arrow-right'
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
