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
  <cover v-if="coverShow" style="z-index: 1500">
    <div class="downContainer">
      <div class="flex justify-between m20">
        <span class="font14 dialog-title">{{ title }}</span>
        <el-icon @click="coverShow = false" style="font-size: 18px">
          <CloseBold />
        </el-icon>
      </div>
      <div class="line"></div>
      <div class="detail x20 font12">
        {{ content }}
        <slot></slot>
      </div>
      <div class="flex mb-20 mt-20">
        <div class="ml-auto button-blue mr-20" @click="sure">{{ $t('buttons.common_ok') }}</div>
        <div class="button-white mr-20" @click="cancel">{{ $t('buttons.common_cancel') }}</div>
      </div>
    </div>
  </cover>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import cover from '@/components/cover.vue'
import { reactive, toRefs } from 'vue'
import eventBus from '@/utils/eventbus'
export default defineComponent({
  components: { cover },
  setup() {
    let sureFn, cancelFn
    const state = reactive({
      coverShow: false,
      title: '',
      content: '',
      showcancel: true,
    })
    eventBus.$on('showCover', (options) => {
      state.coverShow = true
      sureFn = options.sure
      cancelFn = options.cancel
      state.title = options.title
      state.content = options.content
      state.showcancel = state.showcancel || true // showcancel 默认为true
    })
    const sure = () => {
      state.coverShow = false
      if (typeof sureFn == 'function') {
        sureFn()
      }
    }
    const cancel = () => {
      state.coverShow = false
      if (typeof cancelFn == 'function') {
        cancelFn()
      }
    }
    return {
      ...toRefs(state),
      sure,
      cancel,
    }
  },
})
</script>

<style lang="scss" scoped>
.dialog-title {
  font-size: 14px;
  font-weight: 500;
  color: #333333;
}
.button {
  width: 80px;
  height: 34px;
  border-radius: 6px;
  line-height: 34px;
  text-align: center;
  font-size: 14px;
  cursor: pointer;
}
.button-one {
  background: #337aff;
  color: #fff;
}

.button-two {
  border: 1px solid #337aff;
  background: #fff;
  margin-left: 20px;
  color: #337aff !important;
}

.font14 {
  font-size: 14px;
}
.downContainer {
  width: 540px;
  height: 320px;
  background: #fff;
  border-radius: 6px;
  color: #85899c;
  z-index: 1000;
}

.m20 {
  margin: 20px;
}
.x20 {
  margin: 0 20px;
}
.line {
  width: 100%;
  background: #eceef4;
  height: 1px;
  margin-top: -1px;
}
.detail {
  height: 185px;
  overflow: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 12px;
  font-weight: 400;
  color: #333333;
  text-align: center;
}
</style>
