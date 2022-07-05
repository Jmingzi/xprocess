import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'

axios.interceptors.request.use(req => {
  if (req.method === 'get') {
    if (!req.params) {
      req.params = {}
    }
    req.params.uid = 1
  } else if (req.method === 'post') {
    req.data.uid = 1
  }
  return req
})
// axios.interceptors.response.use<ApiResult<1>>(res => res.data)

const app = createApp(App)
app.use(router)
app.mount('#app')
