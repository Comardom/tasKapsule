import {createRouter, createWebHashHistory} from 'vue-router'

import Centro from '@/components/Centro.vue'
import TestPage from '@/components/TestPage.vue'
import TestPage1 from '@/components/TestPage1.vue'
import EgoMe from "@/components/EgoMe.vue";

const router = createRouter({
  //带 # 的哈希模式，适配electron
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',           // 首页，URL 是 https://qwerty.uiop/#/
      name: 'centro',
      component: Centro,
    },
    {
      path: '/test',       // URL 是 https://qwerty.uiop/#/test
      name: 'test',
      component: TestPage,
    },
    {
      path: '/test1',
      name: 'test1',
      component: TestPage1,
    },
    {
      path: '/ego-me',
      name: 'ego-me',
      component: EgoMe,
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    },
  ],
})

export default router
