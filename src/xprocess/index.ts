import Editor from './editor/index.vue'
import { State, initState, state, stateCanvasDataChange } from './editor/state'
import { h, provide, SetupContext, Ref } from 'vue'
import { Message } from './component/message'

export type IConfig = {
  toHome: () => void
  fileOperators: IFileOperatorItem[]
}

export type IFileOperatorItem = {
  icon: string
  title: string
  action: (data: State) => void
  condition?: () => boolean
}

export type IProcessState = State

export function useProcess (config: Ref<IConfig>) {
  return {
    initState,
    stateCanvasDataChange,
    Message,
    openListPanel: () => {
      state.showListPanel = true
    },
    Process: {
      setup (props: any, context: SetupContext) {
        provide('config', config)
        return () => h(Editor, null, context.slots)
      }
    }
  }
}
