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

import { createApp } from 'vue'
import App from './App.vue'
import { throttle } from '@/utils/help'
import './assets/css/common-new.css'
import './assets/css/common.css'
import './assets/css/index.css'
import './assets/css/style.css'
import './assets/css/button.scss'
import './assets/css/font.css'
import 'video.js/dist/video-js.css'
import 'tachyons'
import router from './router'
import store from '@/store'
import installElementPlus from './plugins/element'
import i18n from '@/language/index'
import 'default-passive-events'
import './utils/LogUtils'


let app = createApp(App)
installElementPlus(app)

import { loading } from './components/loading'
app.directive("request",loading);



import * as Sentry from '@sentry/vue'
import { Integrations } from '@sentry/tracing'
import { noLoginUrlArr } from '@/config/routerConfig'
const hostname = window.location.hostname
if (hostname.indexOf('.ao.space') > -1) {
  Sentry.init({
    app,
    dsn: 'https://72794e9b861243c8ab80135822323bc2@sentry.eulix.xyz/8',
    integrations: [new Integrations.BrowserTracing()],

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0
  })
}

// 添加路由守卫
router.beforeEach(async (to, from, next) => {
  let name = to.name
  if (noLoginUrlArr.indexOf(name) > -1) {
    next()
  } else {
    let loginFlag = localStorage.getItem('eluoxaccessToken')
    if (!loginFlag) {
      next("/qrLogin")
    } else {
      next()
    }
  }
})
/**
 * 添加节流指令
 */
app.directive('throttle', {
  mounted(el, binding, vnode) {
    if (el._vei && el._vei.onClick && !el._vei.onClick._throttle) {
      let wrapClick = throttle(el._vei.onClick.value, isNaN(binding.value) ? 100 : binding.value)
      el._vei.onClick.value = wrapClick
      el._vei.onClick._throttle = true
    }
  }
})

/**
 * 添加计算布局指令
 */
app.directive('rect', {
  mounted(el, binding, vnode) {
    let rect = el.getBoundingClientRect()
    let fn = binding.value
    if (typeof fn === 'function') {
      fn(el, rect)
    }
  }
})

app.use(i18n).use(router).use(store).mount('#app')
