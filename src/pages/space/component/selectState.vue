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
    src="@/assets/quanxuan.png"
    alt=""
    class="quanxuan-img pointer"
    @click="selectAll"
    v-if="fileList.length != 0 && selectedFiles.length != fileList.length"
  />
  <img
    src="@/assets/checked.png"
    alt=""
    class="quanxuan-img pointer"
    @click="clearAll"
    v-if="selectedFiles.length != 0 && selectedFiles.length == fileList.length"
  />
  <img src="@/assets/quanxuan-disabled.png" alt="" class="quanxuan-img" v-if="fileList.length == 0" />
</template>

<script>
export default {
  props: {
    fileList: {
      type: Array,
      default: [],
    },
    selectedFiles: {
      type: Array,
      default: [],
    },
  },
  emits: ['selectAll', 'clearAll'],
  methods: {
    selectAll() {
      this.$emit('selectAll')
    },
    clearAll() {
      this.$emit('clearAll')
    },
  },
}
</script>

<style lang="scss" scoped>
.quanxuan-img {
  width: 16px;
  height: 16px;
  margin-right: 5px;
}
</style>
