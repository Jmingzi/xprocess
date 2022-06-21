import Index from './index.vue'
import { h, SetupContext } from 'vue'

export function useLayout () {
  return {
    Layout: {
      setup (props: unknown, context: SetupContext) {
        return () => {
          return h(Index, null, context.slots)
        }
      }
    }
  }
}
