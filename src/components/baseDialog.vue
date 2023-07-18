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
  <cover style="z-index: 1500">
    <div class="downContainer" :style="style?style:''">
      <div class="flex justify-between m20">
        <span class="font14 dialog-title">{{ title }}</span>
        <el-icon @click="cancel" style="font-size: 18px">
          <Close></Close>
        </el-icon>
      </div>
      <div class="line"></div>
      <slot name="content"></slot>

      <slot name="footer">
        <div class="tr pt10 pr40 pb40 pl10">
          <div class="button dib button-one" @click="sure">{{ sureText }}</div>
          <div class="button dib button-two" @click="cancel">取消</div>
        </div>
      </slot>
    </div>
  </cover>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import cover from '@/components/cover.vue'

import { Close } from '@element-plus/icons'
export default defineComponent({
  props: { title: String, sureText: { type: String, default: '确定' } ,style:String},
  components: { cover, Close },

  methods: {
    sure() {
      this.$emit('sure')
    },
    cancel() {
      this.$emit('cancel')
    },
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

</style>
