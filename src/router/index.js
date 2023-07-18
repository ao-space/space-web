/*
 * Copyright (c) 2022 Institute of Software Chinese Academy of Sciences (ISCAS)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      redirect: '/home/space'
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/pages/login/index.vue')
    },
    {
      path: '/checkLogin',
      name: 'checkLogin',
      component: () => import('@/pages/login/checkLogin.vue')
    },
    {
      path: '/switchLogin',
      name: 'switchLogin',
      component: () => import('@/pages/login/switchLogin.vue')
    },
    {
      path: '/noscanLogin',
      name: 'noscanLogin',
      component: () => import('@/pages/login/noscan.vue')
    },
    {
      path: '/checkLogin',
      name: 'checkLogin',
      component: () => import('@/pages/login/checkLogin.vue')
    },
    {
      path: '/qrLogin',
      name: 'qrLogin',
      component: () => import('@/pages/login/qrLogin.vue')
    },
    {
      path: '/mobilVideo',
      name: 'mobilVideo',
      component: () => import('@/business/mobilVideoPlay/mobilVideo.vue')
    },
    {
      path: '/home',
      name: 'home',
      component: () => import('@/components/home.vue'),
      children: [
        {
          path: '/home',
          redirect: '/home/index'
        },
        {
          path: '/home/dynamicDetailFile/:recordId',
          name: 'dynamicDetailFile',
          component: () => import('@/pages/space/index.vue')
        },
        {
          path: '/home/space',
          name: 'space',
          component: () => import('@/pages/space/index.vue')
        },
        {
          path: '/home/file/:fileId/:parentId',
          name: 'filespace',
          component: () => import('@/pages/space/index.vue')
        },
        {
          path: '/home/recycle',
          name: 'recycle',
          component: () => import('@/components/recycle.vue')
        },
        {
          path: '/home/setting',
          name: 'setting',
          component: () => import('@/pages/setting/index.vue')
        }
      ]
    }
  ]
})

export default router
