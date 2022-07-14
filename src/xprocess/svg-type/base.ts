import { paramCase } from 'change-case'
import { Edge } from '../operation/state'
import { CANVAS_STROKE_WIDTH } from '../constant'

export type SvgBase = {
  type: SvgType
  strokeWidth?: number
  stroke?: string
  fill?: string
  start: number[]
  end: number[]
  strokeDasharray?: number
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
  | 'flow-start-stop'
  | 'flow-rect'

export type IFont = {
  content: string
  fontSize: number
  bold: boolean
  italics: boolean
  underline: boolean
  color: string
  horizontalAlign: 'left' | 'center' | 'right'
}

export const STROKE_WIDTH = CANVAS_STROKE_WIDTH

export const DEFAULT_FONT: IFont = {
  content: '',
  fontSize: 12,
  italics: false,
  bold: false,
  underline: false,
  color: '#333333',
  horizontalAlign: 'center'
}

export const DEFAULT_PROPS = {
  strokeWidth: STROKE_WIDTH,
  fill: '#ffffff',
  stroke: '#000000',
  start: [0, 0],
  type: 'rect'
}

export const SVG_TYPE = {
  LINE: 'line',
  RECT: 'rect',
  CIRCLE: 'circle',
  POLYGON: 'polygon',
  TEXT: 'text',
  POLYGON_ARROW_TOP: 'polygon-arrow-top',
  POLYGON_ARROW_BOTTOM: 'polygon-arrow-bottom',
  POLYGON_ARROW_LEFT: 'polygon-arrow-left',
  POLYGON_ARROW_RIGHT: 'polygon-arrow-right',
  FLOW_START_STOP: 'flow-start-stop',
  FLOW_RECT: 'flow-rect'
}

export const DEFAULT_SIZE = {
  rect: [30, 20],
  'flow-start-stop': [30, 15],
  circle: [25, 25],
  polygon: [30, 25],
  text: [30, 25]
}

export const LOCAL_LIST = [
  {
    type: SVG_TYPE.FLOW_START_STOP,
    end: DEFAULT_SIZE['flow-start-stop']
  },
  {
    type: SVG_TYPE.FLOW_RECT,
    round: 0,
    end: DEFAULT_SIZE.rect
  },
  {
    type: SVG_TYPE.RECT,
    round: 5,
    end: DEFAULT_SIZE.rect
  },
  {
    type: SVG_TYPE.CIRCLE,
    end: DEFAULT_SIZE.circle
  },
  {
    type: SVG_TYPE.POLYGON,
    end: DEFAULT_SIZE.polygon
  },
  {
    type: SVG_TYPE.TEXT,
    end: DEFAULT_SIZE.text,
    strokeWidth: 0,
    status: 0,
    fill: 'transparent',
    fontEditable: true
  },
  {
    type: SVG_TYPE.POLYGON_ARROW_LEFT,
    end: DEFAULT_SIZE.polygon
  },
  {
    type: SVG_TYPE.POLYGON_ARROW_RIGHT,
    end: DEFAULT_SIZE.polygon
  },
  {
    type: SVG_TYPE.POLYGON_ARROW_TOP,
    end: DEFAULT_SIZE.polygon.slice().reverse()
  },
  {
    type: SVG_TYPE.POLYGON_ARROW_BOTTOM,
    end: DEFAULT_SIZE.polygon.slice().reverse()
  }
]

export const changeCase = (props: { [k in string]: any }) => {
  const newProps: { [k in string]: any } = {}
  Object.keys(props).forEach(key => {
    newProps[paramCase(key)] = props[key]
  })
  return newProps
}

const removeKeys = [
  'fromLines',
  'toLines',
  'lineType',
  'fromNode',
  'toNode',
  'from-lines',
  'to-lines',
  'line-type',
  'from-node',
  'to-node',
  'font',
  'z-index',
  'zIndex'
]
export const clearCustomProps = (obj: { [k in string]: any }, excludePropsArr: string[]) => {
  const newObj: { [k in string]: any } = {}
  Object.keys(obj).forEach(key => {
    if (!removeKeys.concat(excludePropsArr).includes(key)) {
      newObj[key] = obj[key]
    }
  })
  return newObj
}
