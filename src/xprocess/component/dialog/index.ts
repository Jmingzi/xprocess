import Component from './xdialog.vue'
import { ref, createApp } from 'vue'

interface IDialogConfig {
  message: string
  cancelText?: string
  confirmText?: string
  onCancel?: () => void
  onConfirm?: () => void
}

const showDialog = ref(false)

export function Dialog (config?: IDialogConfig) {
  const div = document.createElement('div')
  const app = createApp(Component, {
    ...config,
    show: showDialog
  })
  app.mount(div)
  showDialog.value = true
}

Dialog.confirm = function (message: string) {
  return new Promise((resolve, reject) => {
    Dialog({
      message,
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