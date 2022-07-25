import { h, reactive, ref } from 'vue'
import { Dialog } from '../xprocess/component/dialog'
import { Message } from '../xprocess/component/message'
import Signup from '../component/signup-modal-content.vue'
import { findUserByName, signUp, User } from './api'

const userKey = 'xprocess-username'

export async function userConnect () {
  const user = localStore.getObject(userKey)
  if (user) {
    return user
  }
  const userData = reactive<User>({
    name: '',
    id: `${Date.now()}_${Math.ceil(Math.random() * 10000)}`
  })
  return new Promise((resolve, reject) => {
    Dialog({
      title: '欢迎体验 XProcess',
      // @ts-ignore
      content: h(Signup, {
        text: userData.name,
        onUpdateText: (v: string) => {
          userData.name = v
        }
      }),
      confirmText: '开始体验',
      async onConfirm () {
        if (!userData.name.trim()) {
          Message.error('昵称为空，请检查')
          return
        }
        const user = await findUserByName(userData.name)
        if (user) {
          Message.error('昵称已存在，换个试试吧')
        } else {
          await signUp(userData)
          Dialog.close()
          Message.success(`欢迎你，【${userData.name}】!`)
          localStore.setObject(userKey, userData)
          resolve(userData)
        }
      },
      onCancel () {
        reject()
        Message.info('取消注册用户，停止体验!')
      }
    })
  })
}

export function switchUser () {
  const name = ref('')
  Dialog({
    title: '切换用户',
    content: h(Signup, {
      text: name.value,
      tip: '请输入你要切换的昵称',
      onUpdateText: (v: string) => {
        name.value = v
      }
    }),
    confirmText: '确定',
    cancelText: '取消',
    async onConfirm () {
      if (!name.value.trim()) {
        Message.error('昵称为空，请检查')
        return
      }
      const user = await findUserByName(name.value)
      if (user) {
        Message.success('用户已切换')
        localStore.setObject(userKey, user)
        Dialog.close()
        setTimeout(() => {
          location.href = location.pathname
        },  1000)
      } else {
        Message.error('昵称不存在，请检查')
      }
    },
    onCancel () {
      Dialog.close()
    }
  })
}

export function getUser () {
  return localStore.getObject(userKey)
}

const localStore = {
  getString (key: string) {
    return localStorage.getItem(key)
  },

  getObject<T = any> (key: string) {
    const item: string | null = this.getString(key)
    if (item === null) {
      return null
    }
    try {
      return JSON.parse(item) as T
    } catch (e) {
      return null
    }
  },

  setString (key: string, data: any) {
    localStorage.setItem(key, data)
  },

  setObject (key: string, data: any) {
    const local = this.getObject(key)
    if (local) {
      localStorage.setItem(key, JSON.stringify({ ...local, ...data }))
    } else {
      localStorage.setItem(key, JSON.stringify(data))
    }
  },
}