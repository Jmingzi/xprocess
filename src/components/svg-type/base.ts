import { paramCase } from 'change-case'

export type SvgBase = {
  type: SvgType;
  strokeWidth?: number;
  stroke?: string;
  fill?: string;
  width: number;
  height: number;
}

export type CurveProps = SvgBase & {
  direction?: {
    isLeftTop: boolean,
    isRightTop: boolean,
    isRightBottom: boolean,
    isLeftBottom: boolean
  };
  controlStart?: number[];
  controlEnd?: number[];
}

export type RectProps = SvgBase & {
  round?: number;
}

export type ISvgType = CurveProps | RectProps;

export type SvgType = 'rect-round' | 'curve'

export const STROKE_WIDTH = 2

export const DEFAULT_PROPS = {
  width: 100,
  height: 50,
  strokeWidth: STROKE_WIDTH,
  fill: 'transparent',
  stroke: '#000',
}

export const SVG_TYPE: { [k in string]: SvgType } = {
  CURVE: 'curve',
  RECT_ROUND: 'rect-round'
}

export const changeCase = (props: { [k in string]: any }) => {
  const newProps: { [k in string]: any } = {}
  Object.keys(props).forEach(key => {
    newProps[paramCase(key)] = props[key]
  })
  return newProps
}
