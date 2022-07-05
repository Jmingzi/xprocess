import Editor from './editor/index.vue'
import { State, initState } from './editor/state'
import { h, provide, toRaw } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export type IConfig = {
  api: {
    save: (data: State, fileId?: string) => Promise<string | undefined>,
    share: (data: State, fileId?: string) => Promise<void>
  }
}

export type IProcessState = State

export function useProcess (config: IConfig) {
  return {
    initState,
    Process: {
      setup () {
        const route = useRoute()
        const router = useRouter()
        const id = route.params.id as string

        const save = config.api.save
        config.api.save = async (data: State): Promise<string | undefined> => {
          const dataId = await save(data, id)
          if (dataId || id) {
            await router.replace(`/editor/${dataId ?? id}`)
          }
          return dataId || id
        }

        const share = config.api.share
        config.api.share = async (data: State) => {
          await share(data, id)
          // await router.replace(`/editor?id=${id}`)
        }

        provide('config', config)
        return () => h(Editor)
      }
    }
  }
}
