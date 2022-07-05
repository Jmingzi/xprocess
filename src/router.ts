import { createRouter, createWebHashHistory } from 'vue-router'
import List from './views/list.vue'
import File from './views/editor/index.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: List },
    {
      path: '/editor',
      component: File,
      children: [
        {
          path: ':id',
          component: File
        }
      ]
    }
  ]
})

export default router
