import { defineComponent, h, ref, createApp, App } from 'vue'
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
    const top = ref('0')
    const opacity = ref(0)
    setTimeout(() => {
      top.value = `${(props.index - 1) * 50 + 20}px`
      opacity.value = 1
    }, 100)
    setTimeout(() => {
      top.value = `${parseInt(top.value) - 50}px`
      queen.pop()
      opacity.value = 0
      setTimeout(() => {
        show.value = false
        document.body.removeChild(props.div)
      }, 500)
    }, 2000 + 500)

    return () => h('div', {
      class: `message ${props.option.type}`,
      style: {
        top: top.value,
        opacity: opacity.value
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
