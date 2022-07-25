import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'
import { userConnect, getUser } from './assets/user-connect'

axios.defaults.baseURL = './'
axios.interceptors.request.use(req => {
  if (req.method === 'get') {
    if (!req.params) {
      req.params = {}
    }
    req.params.uid = getUser()?.id
  } else if (req.method === 'post') {
    req.data.uid = getUser()?.id
  }
  return req
})

userConnect().then(() => {
  const app = createApp(App)
  app.use(router)
  app.mount('#app')
})

