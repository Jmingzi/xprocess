import Component from './xdialog.vue'
import { ref, h, render, VNode } from 'vue'

interface IDialogConfig {
  message?: string
  cancelText?: string
  confirmText?: string
  onCancel?: () => void
  onConfirm?: () => void
  content?: VNode
}

const showDialog = ref(false)

export function Dialog (config?: IDialogConfig) {
  const content = config?.content
  delete config?.content
  const vNode = h(Component, {
    ...config,
    show: showDialog
  }, {
    default: () => content
  })
  render(vNode, document.createElement('div'))
  showDialog.value = true
}

Dialog.confirm = function (message: string | IDialogConfig) {
  return new Promise((resolve, reject) => {
    Dialog({
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

function closeDialog () {
  showDialog.value = false
}