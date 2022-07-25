import Component from './xdialog.vue'
import { ref, h, render, VNode } from 'vue'

interface IDialogConfig {
  title?: string
  message?: string
  cancelText?: string
  confirmText?: string
  onCancel?: () => void
  onConfirm?: () => void
  content?: VNode
}

const showDialog = ref(false)
let div: HTMLDivElement

export function Dialog (config?: IDialogConfig) {
  const content = config?.content
  delete config?.content
  const vNode = h(Component, {
    ...config,
    show: showDialog,
    onClose: closeDialog
  }, {
    default: () => content
  })
  div = document.createElement('div')
  render(vNode, div)
  showDialog.value = true
}

Dialog.confirm = function (message: string | IDialogConfig) {
  return new Promise((resolve, reject) => {
    Dialog({
      cancelText: '取消',
      confirmText: '确定',
      ...(typeof message === 'string' ? { message } : message),
      onCancel: () => {
        closeDialog()
        reject()
      },
      onConfirm: () => {
        closeDialog()
        resolve(void 0)
      }
    })
  })
}

Dialog.close = closeDialog

function closeDialog () {
  showDialog.value = false
  if (div) {
    // unmount vNode
    setTimeout(() => {
      render(null, div)
    }, 500)
  }
}