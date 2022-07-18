import Editor from './editor/index.vue'
import { State, initState, state, stateCanvasDataChange } from './editor/state'
import { h, provide, SetupContext, Ref, computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Message } from './component/message'

export type IConfig = {
  paramsId?: string
  api: {
    save: (data: State, fileId?: string) => Promise<number | undefined>
    share: (data: State, fileId?: string) => Promise<void>
    list: () => Promise<void>
    addNew: () => void
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
        const route = useRoute()
        const router = useRouter()

        const save = config.value.api.save
        config.value.api.save = async (data: State): Promise<number | undefined> => {
          const id = route.params.id as string
          const dataId = (await save(data, id)) ?? (id ? Number(id) : undefined)
          if (dataId) {
            await router.replace(`/editor/${dataId}`)
          }
          return dataId
        }

        const share = config.value.api.share
        config.value.api.share = async (data: State) => {
          const id = route.params.id as string
          await share(data, id)
          // await router.replace(`/editor?id=${id}`)
        }

        provide('config', config)
        return () => h(Editor, null, context.slots)
      }
    }
  }
}
