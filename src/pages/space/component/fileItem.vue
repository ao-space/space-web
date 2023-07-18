<!--
  ~ Copyright (c) 2022 Institute of Software Chinese Academy of Sciences (ISCAS)
  ~
  ~ Licensed under the Apache License, Version 2.0 (the "License");
  ~ you may not use this file except in compliance with the License.
  ~ You may obtain a copy of the License at
  ~
  ~     http://www.apache.org/licenses/LICENSE-2.0
  ~
  ~ Unless required by applicable law or agreed to in writing, software
  ~ distributed under the License is distributed on an "AS IS" BASIS,
  ~ WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  ~ See the License for the specific language governing permissions and
  ~ limitations under the License.
-->

<template>
  <img
    :src="imgsrc ? imgsrc : genSrc(item)"
    :class="sortType === 1 ? 'imgNew' : 'img'"
    :data-uuid="item.uuid"
    @error="dealError"
    draggable="false"
    @mouseenter="enter"
  />
</template>

<script>
import { genSrc } from '@/assets/resourceMap.js'
import { fileThumb } from '@/api/file'
import localforage from 'localforage'
import { isImgBlob } from '@/utils/help'
import { beginStart, nextTask } from '@/utils/fileThumbDiaodu'
import createingFloder from '@/assets/createing_floder.png'
export default {
  props: {
    item: Object,
    sortType: Number,
  },
  emits:['enter'],
  data() {
    return {
      imgsrc: '',
    }
  },
  mounted() {
    this.dealError = this.dealError.bind(this)
    if (this.item.category === 'picture' || this.item.category === 'video') {
      // 图片 和 视频 显示封面图
      // todo bmp目前不支持 已._开始的文件为备份文件不请求缩略图
      if (this.item.name.indexOf('.bmp') === -1 && !this.item.name.startsWith('._')) {
        this.getBlob()
      }
    }
  },
  methods: {
    enter(){
      this.$emit('enter',this.item)
    },
    genClass(item) {
      let result = ''
      if (item.isDir) {
        result = 'pointer'
      }
      if (this.sortType === 1) {
        result = result + ' imgNew'
      } else {
        result = result + ' img'
      }
    },
    /**
     * 生成图片类型
     */
    genSrc(item) {
      if(item.is_create){
        return createingFloder
      }
      return genSrc(item)
    },
    dealError(e) {
      e.target.src = genSrc(this.item)
    },
    async getBlob() {
      try {
        // 兼容本地化操作
        let uuid = this.item.oldServerUUid ? this.item.oldServerUUid : this.item.uuid
        let blob = await localforage.getItem(uuid + 'thumb')
        this.imgsrc = window.URL.createObjectURL(blob)
      } catch (e) {
        this.beginDown()
      }
    },
    async beginDown() {
      let params = {
        name: this.item.name,
        success: (error,blob) => {
          nextTask()
          isImgBlob(blob).then(() => {
              this.imgsrc = window.URL.createObjectURL(blob)
              localforage.setItem(this.item.uuid + 'thumb', blob)
            },
            () => {},
          )
        },
        autoSave: false,
      }

      // 下载
      let uuid = this.item.uuid
      beginStart(() => {
        fileThumb(params, uuid, '360x360')
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.img {
  width: 70px;
  height: 70px;
  display: block;
  margin: 20px auto 14px auto;
  object-fit: cover;
}

.imgNew {
  width: 30px;
  height: 30px;
  margin: 0 10px 0 7px;
  object-fit: cover;
}
</style>
