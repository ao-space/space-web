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

import { onMounted, onBeforeUnmount } from 'vue'

export function useGenHeight(rawGenHeight) {
  let recttmp = {}
  let resize = window.onresize
  let eltmp = { el: null }
  let height = window.innerHeight
  function genContainerHeightWrap(el, rect) {
    !el && (el = eltmp.el)
    eltmp.el = el
    !rect && (rect = recttmp)
    recttmp = rect
    if(el){
      rawGenHeight(el, rect)
    }
  }
  let genContainerHeight = genContainerHeightWrap
  onMounted(() => {
    window.onresize = (arg) => {
      if ((height! = window.innerHeight)) {
        genContainerHeight(null, null)
        height = window.innerHeight
      }

      typeof resize == 'function' && resize(arg)
    }
  })
  onBeforeUnmount(() => {
    window.onresize = resize
  })
  return {
    genContainerHeight,
  }
}

export function useGenWidth(rawGenWidth) {
  let recttmp = {}
  let resize = window.onresize
  let eltmp = { el: null }
  let width = window.innerWidth
  function genContainerWidthWrap(el, rect) {
    !el && (el = eltmp.el)
    eltmp.el = el
    !rect && (rect = recttmp)
    recttmp = rect
    if(el){
      rawGenWidth(el, rect)
    }
  }
  let genContainerWidth = genContainerWidthWrap
  onMounted(() => {
    window.onresize = (arg) => {
      if ((width! = window.innerWidth)) {
        genContainerWidth(null, null)
        width = window.innerWidth
      }

      typeof resize == 'function' && resize(arg)
    }
  })
  onBeforeUnmount(() => {
    window.onresize = resize
  })
  return {
    genContainerWidth,
  }
}
