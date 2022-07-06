import { createRouter, createWebHashHistory } from 'vue-router'
import File from './views/index.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', redirect: '/editor' },
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
