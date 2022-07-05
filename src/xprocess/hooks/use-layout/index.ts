import Index from './index.vue'
import { h, SetupContext } from 'vue'

export function useLayout () {
  return {
    Layout: {
      props: {
        mode: String
      },
      setup (props: unknown, context: SetupContext) {
        // console.log(props)
        return () => {
          // @ts-ignore
          return h(Index, props, context.slots)
        }
      }
    }
  }
}
