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
  <div class="menuContainer" :style="`top:${top}px;left:${left}px`">
    <div
      v-for="(item, index) in menuArr"
      :key="index"
      class="item"
      :class="genDivClass(item, index)"
      @click="doAction(item)">
      <span :class="canUse(item) ? '' : 'disabled'">{{ $t(item.name) }}</span>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    menuArr: Array,
  },
  data() {
    return {
      top: 11100,
      left: 11100,
      nomalMenuArr: [],
    }
  },
  methods: {
    genDivClass(item, index) {
      let result = index != 0 && index % 2 == 0 ? 'border-top' : ''
      if (this.canUse(item)) {
        result = result + ' pointer'
      }
      return result
    },
    setPosition({ top, left }) {
      this.top = top
      this.left = left
    },
    /**
     * 设置可用的菜单
     */
    setNomalMenuArr(nomalMenuArr) {
      this.nomalMenuArr = nomalMenuArr
    },
    canUse(item) {
      return (
        this.nomalMenuArr.findIndex((ele) => {
          return ele.action === item.action
        }) > -1
      )
    },
    doAction(item) {
      if (this.canUse(item)) {
        this.$emit('doAction', item)
      }
    },
  },
}
</script>

<style scoped>
.menuContainer {
  width: 114px;
  background: #ffffff;
  box-shadow: 0px 0px 10px 0px rgba(103, 125, 168, 0.2);
  border-radius: 6px;
  padding: 6px 0;
  position: fixed;
  z-index: 900;
  text-align: center;
}
.item {
  font-size: 14px;
  height: 30px;
  line-height: 30px;
  color: #85899c;
}
.item:hover {
  color: #337aff;
  background: rgba(51, 122, 255, 0.1);
}
.border-top {
  border-top: solid #eceef4 1px;
}
.disabled {
  color: rgb(188, 191, 205);
}
</style>
