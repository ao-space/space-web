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
  <div>
    <el-space :size="10">
      <div class="button-img" @click="show = true" >
        <img src="@/assets/upicon.png" />
        <span>{{$t('space.upload')}}</span>
      </div>
      <div
        class="button-img2"
        @click="createFloder"
        v-throttle="500"
        v-if="foldHistoryList.length < maxFolderLevels -1 "
      >
        <img class="img" alt="" src="@/assets/flodercreate.png" />
        <span class="font14">{{$t('buttons.create_folder')}}</span>
      </div>
      <div v-else class="button-img2 disabled-button" >
        <img class="img" alt="" src="@/assets/create-disabled.png" />
        <span class="font14">{{$t('buttons.create_folder')}}</span>
      </div>
    </el-space>
    <el-dialog v-model="show" :show-close="false" :modal="false">
      <div class="menu pointer" @click="handClickUpload(false)">{{$t('buttons.common_upload_file')}}</div>
      <div class="menu pointer" @click="handClickUpload(true)">{{$t('buttons.common_upload_folder')}}</div>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue'
import {maxFolderLevels} from "@/config/fileConfig"
export default  defineComponent({
  props: {
    foldHistoryList: {
      type: Array,
      default: []
    },
  },
  emits: ['handClickUpload', 'createFloder'],
  data() {
    return {
      show: false,
      maxFolderLevels
    }
  },
  methods: {
    createFloder() {
      this.$emit('createFloder')
    },
    handClickUpload(flag) {
      this.show = false
      this.$emit('handClickUpload', flag)
    }
  }
})
</script>

<style lang="scss" scoped>
::v-deep(.el-dialog) {
  position: absolute;
  top: 60px;
  left: 215px;
  width: 110px;
  height: 80px;
  background: #ffffff;
  border-radius: 6px;
  margin: 0px;
}

::v-deep(.el-dialog__body) {
  padding: 10px 0px;
}

::v-deep(.el-dialog__header) {
  display: none;
}
.el-divider--horizontal {
  margin: 10px 0px;
}
.menu {
  padding: 7px 20px;
  font-size: 14px;
  text-align: center;
  &:hover {
    color: #337aff;
    background-color: #eaf1ff;
  }
}

.disabled-button {
  background: #f5f6fa !important;
  color: #dfe0e5 !important;
}
</style>
