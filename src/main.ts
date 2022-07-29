import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'
import { userConnect, getUser } from './assets/user-connect'
import AV from 'leancloud-storage'

const appId = 'iYzWnL2H72jtQgNQPXUvjFqU-gzGzoHsz'
const appKey = 'OR3zEynwWJ7f8bk95AdiGFzJ'
const serverURLs = 'https://api.iming.work'
AV.init({ appId, appKey, serverURLs })

axios.defaults.baseURL = './'
axios.interceptors.request.use(req => {
  if (req.method === 'get') {
    if (!req.params) {
      req.params = {}
    }
    if (!req.params.uid) {
      req.params.uid = getUserFileUid()
    }
  } else if (req.method === 'post') {
    if (!req.data.uid) {
      req.data.uid = getUserFileUid()
    }
  }
  return req
})

function getHashQuery () {
  const hasQueryString = location.hash.substring(location.hash.indexOf('?'))
  if (hasQueryString) {
    const query = new URLSearchParams(hasQueryString)
    const uid = query.get('uid')
    return uid ? { uid, name: query.get('user') } : null
  }
}

function getUserFileUid () {
  let uid
  const query: any = getHashQuery()
  if (query) {
    uid = query.uid
  }
  if (!uid) {
    uid = getUser()?.id
  }
  return uid
}

function startup () {
  const app = createApp(App)
  app.use(router)
  app.mount('#app')
}

if (getHashQuery()) {
  startup()
} else {
  userConnect().then(startup)
}

