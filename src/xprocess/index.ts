import Editor from './editor/index.vue'
import { State, initState, state, stateCanvasDataChange } from './editor/state'
import { useLayout } from './editor/use-layout'
import { h, provide, SetupContext, Ref } from 'vue'
import { Message } from './component/message'
import { Dialog } from './component/dialog'

export { calEdgeFromNodes } from './utils'

export type IConfig = {
  toHome: () => void
  fileOperators: IFileOperatorItem[]
  isReadonly: () => boolean
}

export type IFileOperatorItem = {
  icon: string
  title: string
  action: (data: State) => void
  condition?: () => boolean
}

export type IProcessState = State

const { layoutSetScroll } = useLayout()

export function useProcess (config: Ref<IConfig>) {
  return {
    initState,
    stateCanvasDataChange,
    Message,
    Dialog,
    layoutSetScroll,
    openListPanel: () => {
      state.showListPanel = true
    },
    Process: {
      setup (props: any, context: SetupContext) {
        provide('config', config.value)
        return () => h(Editor, null, context.slots)
      }
    }
  }
}
