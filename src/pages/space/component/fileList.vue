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
  <div
    id="file_container"
    :style="styleTmp"
    v-infinite-scroll="getMoreFileList"
    @mousedown.stop="handleMouseDown"
  >
    <div
      class="mask"
      v-show="showMask"
      :style="{
        width: maskPosition.width + 'px',
        left: maskPosition.left + 'px',
        height: maskPosition.height + 'px',
        top: maskPosition.top + 'px'
      }"
    ></div>
    <div class="w-100 file-container" :class="sortType == 2 ? 'pl20' : ''">
      <div
        v-for="(item, index) in fileList"
        :ref="'fileItem-' + item.uuid"
        :key="item.uuid || index"
        :data-uuid="item.uuid"
        :class="genClass(item)"
        class="pointer"
        @click="enterOrCheck(item)"
        draggable="false"
        @contextmenu.prevent="contextmenu"
      >
        <img
          class="hover-check"
          src="@/assets/hover-check.png"
          alt=""
          v-if="genHoverCheck(item)"
          :data-uuid="item.uuid"
          draggable="false"
          @click.stop="checkTrigger(item)"
        />
        <img
          v-else
          class="checked"
          alt=""
          src="@/assets/checked.png"
          :data-uuid="item.uuid"
          draggable="false"
          @click.stop="cancelTrigger(item)"
        />
        <fileItem
          :item="item"
          @click.stop="clickName($e, item)"
          @enter="enter"
          :sortType="sortType"
        />

        <div
          class="file-name overflow-span"
          :titile="item.name"
          v-if="!item.editabled"
          :data-uuid="item.uuid"
          @mouseenter="enter(item)"
        >
          <span
            class="name-hover pointer"
            :data-uuid="item.uuid"
            @click.stop="clickName($e, item)"
            >{{ item.name }}</span
          >
        </div>

        <div v-else class="file-name-editabled clear-scrollbar">
          <input
            contenteditable="true"
            class="editabled-span"
            :id="item.uuid + '_editabled'"
            @blur="blur"
            @keydown.enter.prevent="spankeydown"
            :data-uuid="item.uuid"
            :value="genEditFileName(item)"
          />
        </div>
        <div class="float-right pointer" v-if="sortType === 1">
          {{ updateTime(item) }}
        </div>

        <div
          class="file-detail"
          :class="sortType === 1 ? 'new-file-detail' : ''"
          :id="'file-detail' + item.uuid"
        >
          <div class="detail-item">{{ $t('space.file_name') }}: {{ item.name }}</div>
          <div class="detail-item" :style="`opacity:${item.isDir ? 0 : 1}`">
            {{ $t('space.size') }}: {{ dealSize(item) }}
          </div>
          <div class="detail-item">{{ $t('space.modify_time') }} : {{ updateTime(item) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { genSrc } from '@/assets/resourceMap.js'
import dayjs from 'dayjs'
import fileItem from './fileItem.vue'
import { throttle } from 'lodash'
import { debounce } from '@/utils/help'
export default {
  components: {
    fileItem
  },
  props: {
    fileList: {
      type: Array,
      default: []
    },
    selectedFiles: {
      type: Array,
      default: []
    },
    styleTmp: String,
    sortType: Number // 1列表  2方块
  },
  emits: [
    'fileBlur', // 文件被打断
    'enterFloder', // 点击文件
    'genHoverCheck', //
    'appendSelected',
    'spliceFromSelected',
    'contextmenuSync', // 右键菜单
    'clickName', //点击名称
    'getMoreFileList' // 向上滑动获得更多
  ],
  data() {
    return {
      showMask: false,
      parentLeft: 0,
      parentTop: 0,
      parentDom: null,
      maskPosition: {
        startX: 0,
        startY: 0,
        top: 0,
        left: 0,
        width: 0,
        height: 0
      }
    }
  },
  mounted() {
    /**
     * 节流
     */
    this.enterFloder = throttle(this.enterFloder.bind(this), 1000, {
      trailing: false,
      leading: true
    })

    this.enter = debounce(this.enter.bind(this), 100, true)
  },
  methods: {
    enterOrCheck(item) {
      this.enterFloder(item)
    },
    handleMouseDown(event) {
      let className = event.target.className
      if (
        className === 'checked' ||
        className === 'hover-check' ||
        className === 'file-item pointer' ||
        className === 'new-file-item pointer' ||
        className === 'seleted new-file-item pointer' ||
        className === 'selected file-item pointer' ||
        className === 'img' ||
        className === 'name-hover pointer' ||
        className === 'float-right pointer'
      ) {
        return
      }

      this.maskPosition.startX = event.clientX
      this.maskPosition.startY = event.clientY

      this.parentDom = document.getElementById('file_container')
      this.parentDom.addEventListener('mousemove', this.handleMouseMove)
      this.parentDom.addEventListener('mouseup', this.handleMouseUp)
      let rect = this.parentDom.getBoundingClientRect()
      this.parentLeft = rect.left
      this.parentTop = rect.top
      this.maskPosition.left = event.clientX - this.parentLeft
      this.maskPosition.top = event.clientY - this.parentTop

      this.showMask = true
    },
    handleMouseMove(event) {
      this.maskPosition.left = Math.min(event.clientX, this.maskPosition.startX) - this.parentLeft
      this.maskPosition.top = Math.min(event.clientY, this.maskPosition.startY) - this.parentTop
      this.maskPosition.width = Math.abs(event.clientX - this.maskPosition.startX)
      this.maskPosition.height = Math.abs(event.clientY - this.maskPosition.startY)

      for (let item of this.fileList) {
        if (this.contains(this.$refs['fileItem-' + item.uuid][0])) {
          this.$emit('appendSelected', item)
        }
      }
    },
    contains(element) {
      let rect = element.getBoundingClientRect()
      const maxX = Math.max(
        rect.x + rect.width,
        this.maskPosition.left + this.maskPosition.width + this.parentLeft
      )
      const maxY = Math.max(
        rect.y + rect.height,
        this.maskPosition.top + this.maskPosition.height + this.parentTop
      )
      const minX = Math.min(rect.x, this.maskPosition.left + this.parentLeft)
      const minY = Math.min(rect.y, this.maskPosition.top + this.parentTop)
      return (
        maxX - minX <= rect.width + this.maskPosition.width &&
        maxY - minY <= rect.height + this.maskPosition.height
      )
    },
    handleMouseUp() {
      this.showMask = false
      this.maskPosition = {
        top: 0,
        left: 0,
        width: 0,
        height: 0
      }
      this.parentDom.removeEventListener('mousemove', this.handleMouseMove)
      this.parentDom.removeEventListener('mouseup', this.handleMouseUp)
    },
    enter(item) {
      setTimeout(() => {
        let elem = document.getElementById(`file-detail${item.uuid}`)
        if (!elem) return
        if (!elem) {
          return
        }
        let rect = elem.getBoundingClientRect()
        let width = window.innerWidth
        let height = window.innerHeight
        let { right, bottom } = rect
        elem.style.left = ''
        elem.style.top = ''
        if (this.sortType === 1) {
          elem.style.left = '240px'
        } else {
          if (right > width) {
            elem.style.left = '-30px'
          }
        }
        if (this.sortType === 1) {
          elem.style.top = '50px'
        } else {
          if (bottom > height) {
            elem.style.top = '-100px'
          }
        }
        elem.style.opacity = 1
      }, 500)
    },
    getMoreFileList() {
      this.$emit('getMoreFileList')
    },
    genClass(item) {
      let result = ''
      if (this.sortType !== 1 && !this.genHoverCheck(item)) {
        result = 'seleted'
      }
      if (this.sortType === 1) {
        if (item.is_create) { // 
            result = result + ' hover-check-none'
        }
        result = result + ' new-file-item'
      } else {
        if (item.is_create) { // hover-check-none
            result = result + ' hover-check-none'
        }
        result = result + ' file-item'
      }
      return result
    },
    dealSize(item) {
      let tmp = item.size / 1024
      if (tmp < 1024) {
        return Number(tmp).toFixed(2) + 'KB'
      } else {
        return Number(tmp / 1024).toFixed(2) + 'MB'
      }
    },
    updateTime(item) {
      return dayjs(item.operationAt).format('YYYY-MM-DD HH:mm:ss')
    },
    genEditFileName(item) {
      if (item.isDir) {
        return item.name
      } else {
        if (item.name) {
          let lastIndex = item.name.lastIndexOf('.')
          if (lastIndex !== -1) {
            return item.name.substring(0, lastIndex)
          }
          return item.name
        }
        return ''
      }
    },
    spankeydown(e) {
      e.target.blur()
    },
    /**
     * 编辑失去焦点时,可重命名和
     */
    blur(e) {
      let uuid = e.target.dataset.uuid
      let folderName = e.target.value
      let item = this.fileList.find((item) => item.uuid == uuid)
      this.$emit('fileBlur', {
        uuid,
        folderName,
        target: e.target,
        rawName: item && this.genEditFileName(item)
      })
    },
    enterFloder(item) {
      this.$emit('enterFloder', item)
    },
    /**
     * 生成图片类型
     */
    genSrc(item) {
      return genSrc(item)
    },
    clickName(e, item) {
      this.$emit('clickName', item)
    },
    /**
     * 判断item 不在selectedFiles
     */
    genHoverCheck(item) {
      return this._findIndex(item) === -1
    },
    _findIndex(item) {
      return this.selectedFiles.findIndex((ele) => {
        return ele.uuid === item.uuid
      })
    },
    checkTrigger(item) {
      if (item.is_create) {
        return
      }
      this.$emit('appendSelected', item)
    },
    cancelTrigger(item) {
      if (item.is_create) {
        return
      }
      this.$emit('spliceFromSelected', item)
    },

    /**
     * 右键菜单
     */
    contextmenu(e) {
      this.$emit('contextmenuSync', e)
    }
  }
}
</script>

<style lang="scss" scoped>
.mask {
  position: absolute;
  background: rgba(51, 122, 255, 0.2);
  border: 1px solid #337aff;
  z-index: 100;
}
#file_container {
  position: relative;
  height: calc(100% - 77px);
  overflow-y: scroll;
}
.file-container {
  flex-wrap: wrap;
  height: 100%;
}
.new-file-item {
  width: 100%;
  height: 50px;
  font-size: 14px;
  font-weight: 400;
  color: #464956;
  display: flex;
  position: relative;
  align-items: center;
  padding-left: 20px;
  &:nth-of-type(2n) {
    background: white;
  }
  &:nth-of-type(2n + 1) {
    background: #fafafa;
  }
  .img {
    width: 30px;
    height: 30px;
    margin: 0 10px 0 7px;
  }
  .hover-check,
  .checked {
    width: 16px;
    height: 16px;
  }
  &:hover {
    background: rgba(51, 122, 255, 0.1);
    .hover-check {
      display: block;
    }
    .file-detail {
      display: block;
    }
  }

  .float-right {
    margin-right: 26vw;
    margin-left: auto;
  }
}

.hover-check-none{
   .hover-check {
    display: none !important;
   }
}
.file-item {
  width: 110px;
  height: 130px;
  font-size: 14px;
  font-weight: 400;
  margin: 0 26px 22px 0;
  color: #464956;
  text-align: center;
  display: inline-block;
  position: relative;
  &:hover {
    background: rgba(51, 122, 255, 0.1);
    border-radius: 6px;
    .hover-check {
      display: block;
      &:hover {
        border: 1px solid #337aff;
        border-radius: 50%;
      }
    }
    .file-detail {
      display: block;
    }
  }
  .img {
    width: 70px;
    height: 70px;
    display: block;
    margin: 20px auto 14px auto;
  }
  .hover-check,
  .checked {
    position: absolute;
    width: 16px;
    height: 16px;
    top: 10px;
    left: 10px;
  }

  .hover-check {
    display: none;
  }
  .editabled-span {
    width: 100px;
  }
}
.seleted {
  background: rgba(51, 122, 255, 0.1);
  border-radius: 6px;
  .hover-check {
    display: block;
    border: 1px solid #337aff;
    border-radius: 50%;
  }
}

.file-detail {
  display: none;
  box-sizing: content-box;
  padding: 10px;
  background: #ffffff;
  box-shadow: 0 0 10px 0 rgba(103, 125, 168, 0.12);
  border-radius: 6px;
  position: absolute;
  z-index: 1;
  top: 100px;
  left: 100px;
  text-align: left;
  opacity: 0;
}

.file-name {
  display: inline-block;
  min-width: 70px;
  position: relative;

  &:hover {
    color: #337aff;
  }
}

.name-hover {
  text-decoration: none;
  color: inherit;
  user-select: none;
  border-bottom: none;
  &:hover {
    color: #337aff;
  }
}
.overflow-span {
  display: block;
  word-break: keep-all;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.file-name-editabled {
  height: 32px;
  padding: 6px 0 9px 0;
  background: #fff;
  box-shadow: 0px 0px 10px 0px rgba(103, 125, 168, 0.2);
  border-radius: 6px;
  border: 1px solid #337aff !important;
  margin-top: -6px;
  max-width: 128px;
  white-space: nowrap;
  overflow-x: scroll;
  display: block;
  overflow-y: hidden;
}
.detail-item {
  font-size: 12px;
  color: #85899c;
  white-space: nowrap;
  line-height: 20px;
  height: 20px;
}
</style>
