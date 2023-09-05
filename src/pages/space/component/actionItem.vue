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
    class="action-container y-center"
    v-rect="genActionList"
    :style="actionsCopy.length ? 'opacity:1' : 'opacity:0'"
  >
    <div
      v-for="(item, index) in actionOne"
      :key="index"
      class="action-item y-center pointer"
      :style="genActionStyle(item, index, actionOne)"
      @click="doAction(item)"
      :id="'action-item-' + item.action"
    >
      <img :src="item.img" alt="" class="" />
      <span class="mr12 span">{{ $t(item.name) }}</span>
    </div>
    <div
      class="more-item y-center pointer"
      @click="showMenu"
      @blur="disMenu"
      tabindex="2"
      v-show="actionMore.length > 0"
      :style="actionOne.length == 0 ? 'border-left: 0px solid #337aff;' : ''"
    >
      <img src="@/assets/more.png" />
      <span class="mr12 span">{{ $t('buttons.common_more') }}</span>
    </div>
    <Menu
      v-show="showFlag"
      :menuArr="actionMore"
      ref="menuRef"
      @doAction="doAction"
    ></Menu>
  </div>
</template>

<script>
import Menu from '../../../components/menu.vue'
import { debubbe } from '@/utils/help'

export default {
  props: {
    actionsCopy: Array,
  },
  components: {
    Menu,
  },
  data() {
    return {
      actionOne: [],
      actionMore: [],
      rect: {},
      showFlag: false,
    }
  },
  mounted() {
    this.genActionList = debubbe(this.genActionList.bind(this), 50)
    this.tmpResize = window.onresize
    window.onresize = () => {
      this.genActionList(null, this.rect)
      if (typeof this.tmpResize == 'function') {
        this.tmpResize()
      }
    }
  },
  beforeUnmount() {
    window.onresize = this.tmpResize
  },
  watch: {
    actionsCopy() {
      this.$nextTick(() => {
        this.genActionList(null, this.rect)
      })
    },
  },
  methods: {
    /**
     * 利用一开始opacity 为0 但计算布局计算出rect
     * 预计算每个 .action-item 的 left 和 rect
     * 方便下一步计算元素是否在视口中
     */
    genActionList(el, rect) {
      // 保存容器位置
      this.rect = rect
      let actionTmp = []
      let actionOne = []
      let actionMore = []
      this.actionsCopy.forEach((item) => {
        if (item.action !== 'open') {
          // 给 item 添加 left 和 right 方便在下一步计算元素是否在视口中
          // 计算right
          item.width = this.computedTextWidth(item.name)
          actionTmp.push(item)
        }
      })

      let width = window.innerWidth - 462 - 91 - 200
      let countWidth = 0
      actionTmp.forEach((item) => {
        // 101 为更多的距离
        countWidth += item.width
        if (countWidth > width) {
          actionMore.push(item)
        } else {
          actionOne.push(item)
        }
      })
      this.actionOne = actionOne
      this.actionMore = actionMore
    },
    computedTextWidth(name) {
      let realName = this.$t(name)
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      context.font = "14px Arial"
      const {
        width
      } = context.measureText(realName);
      return width + 43;
    },
    genActionStyle(item, index, actionsCopy) {
      if (item.action === 'open') {
        return 'display:none'
      }
      return (index === actionsCopy.length - 1) ? 'border:none' : ''
    },
    doAction(item) {
      this.$emit('doAction', item)
    },
    showMenu(e) {
      let { clientX, clientY } = e
      this.$refs.menuRef.setPosition({
        top: clientY,
        left: clientX,
      })
      this.$refs.menuRef.setNomalMenuArr(this.actionMore)
      this.showFlag = true
    },
    disMenu() {
      setTimeout(() => {
        this.showFlag = false
      }, 500)
    },
  },
}
</script>

<style lang="scss" scoped>
.action-container {
  height: 34px;
  background: #eaf1ff;
  border-radius: 6px;
  padding: 8px 1px 8px 1px;
}
.action-item,
.more-item {
  height: 16px;
  border-right: 1px solid #337aff;
  word-break: keep-all;
  white-space: nowrap;
  img {
    width: 16px;
    height: 16px;
    margin-right: 2px;
    margin-left: 12px;
  }
  font-size: 14px;
  font-weight: 400;
  color: #337aff;
  .span {
    line-height: 32px;
    height: 32px;
    margin-top: 2px;
  }
}
.more-item {
  border-right: 0px solid #337aff;
  border-left: 1px solid #337aff;
}
</style>
