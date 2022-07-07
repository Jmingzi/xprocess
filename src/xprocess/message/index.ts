import { defineComponent, h, ref, createApp, App, nextTick } from 'vue'
import iconSuccess from './icon/success.png'
import iconError from './icon/error.png'
import iconInfo from './icon/info.png'
import './index.less'

const icon = {
  success: iconSuccess,
  error: iconError,
  info: iconInfo
}
const queen: App[] = []

type IOption = { text: string, type: 'success' | 'error' | 'info' }

const Component = defineComponent({
  props: {
    option: Object,
    div: Object,
    index: Number
  },
  setup (p, context) {
    // @ts-ignore
    const props: { option: IOption, div: HTMLDivElement, index: number } = p
    const show = ref(true)
    const top = ref('-100%')
    nextTick(() => {
      top.value = `${(props.index - 1) * 50 + 20}px`
    })

    setTimeout(() => {
      top.value = '-100%'
      queen.splice(props.index - 1, 1)
      setTimeout(() => {
        show.value = false
        document.body.removeChild(props.div)
      }, 500)
    }, 3000 + 500)

    return () => h('div', {
      class: `message ${props.option.type}`,
      style: {
        top: top.value
      }
    }, [
      h('img', { src: icon[props.option.type], width: 15 }),
      h('span', { class: 'message__text' }, props.option.text)
    ])
  }
})

export function Message (option: IOption) {
  const div = document.createElement('div')
  const app = createApp(Component, { option, div, index: queen.length + 1 })
  queen.push(app)
  document.body.appendChild(div)
  app.mount(div)
}

Message.info = (text: string) => {
  Message({ type: 'info', text })
}

Message.success = (text: string) => {
  Message({ type: 'success', text })
}

Message.error = (text: string) => {
  Message({ type: 'error', text })
}
