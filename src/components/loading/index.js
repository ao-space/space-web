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
import Loading from './Loading.vue'

export const loading = {
  mounted(el, binding,vnode) {
    console.log("binding", Loading)
    if(vnode.props.loadingText){
      Loading.props.text.default = vnode.props.loadingText
    }
    const app = createApp(Loading)
    el.instance = app.mount(document.createElement('div'))
    if (binding.value) {
      appendEl(el)
    }
  },
  updated(el, binding) {
    if (binding.value !== binding.oldValue) {
      binding.value ? appendEl(el) : removeEl(el)
    }
  }
}
// 插入元素
const appendEl = (el) => {
  // 给父元素加个定位，让loading元素定位
  el.style.position = 'relative'
  el?.appendChild(el.instance.$el)
}
// 移除元素
const removeEl = (el) => {
  el.style.position = ''

  // 踩坑：el?.removeChild(el.instance.$el)->直接这样写会报错：
  // Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.（
  // 要删除的节点不是此节点的子节点）
  // 解决：判断一下是否为此节点的子元素再移除（参考：https://www.freesion.com/article/2620879355/）
  let $el = el.instance.$el
  if (el?.contains($el)) {
    el?.removeChild($el)
  }
}
