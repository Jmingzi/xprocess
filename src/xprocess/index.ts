import Editor from './editor/index.vue'
import { State, initState, state, stateCanvasDataChange } from './editor/state'
import { h, provide, SetupContext, Ref } from 'vue'
import { Message } from './component/message'

export type IConfig = {
  paramsId?: string
  toCreate: () => void
  toDetail: (id: number) => void
  api: {
    save: (data: State, fileId?: string) => Promise<number | undefined>
    share: (data: State, fileId?: string) => Promise<void>
    list: () => Promise<void>
  }
}

export type IProcessState = State

export function useProcess (config: Ref<IConfig>) {
  return {
    initState,
    stateCanvasDataChange,
    Message,
    Process: {
      setup (props: any, context: SetupContext) {
        const { api, paramsId } = config.value
        config.value.api.save = async (data: State): Promise<number | undefined> => {
          const dataId = await api.save(data, paramsId)
          if (dataId) {
            config.value.toDetail(dataId)
          }
          return dataId
        }

        config.value.api.share = async (data: State) => {
          await api.share(data, paramsId)
        }

        provide('config', config)
        return () => h(Editor, null, context.slots)
      }
    }
  }
}
