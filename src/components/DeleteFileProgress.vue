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
  <div class="loading-container flex-xy-center" v-show='show > 0'>
    <div class="flex-xy-center flex-column" style="width: 240px" v-show='show === 2'>
      <el-progress  :percentage="percentage" color="#337AFF" :show-text="false" class="w-100" />
      <div class="mt-20 black-14">{{ showDetetePercentage }}</div>
    </div>
    <div class="flex-xy-center flex-column" v-show='show === 1'>
      <img  alt="" class="img-30 run2" src="@/assets/loading@2x.png" />
      <div class="mt-20 black-14">{{ showDelete }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DeleteFileProgress',
  props: {
    show:{
      type: Number,
      default: 0
    },
    percentage: {
      type: Number,
      default: 0
    },
    text: {
      type: String,
      default: 'space.file_del'
    }
  },
  computed: {
    showDelete() {
      return this.$t(this.text)
    },
    showDetetePercentage() {
      return this.$t(this.text) + '...' + this.percentage + '%'
    }
  }
}
</script>

<style lang="scss" scoped>
.loading-container {
  height: 100%;
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
  background-color: rgba(255,255,255,0.9);
  z-index: 2000;
}
::v-deep(.el-progress-bar__outer){
  background-color: #E3E5F0;
}
</style>
