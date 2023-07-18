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
    <!-- 未全部下载完 -->
    <div class="bottomContainer" v-show="jobList.length > 0">
      <div class="bleft text">
        {{ action }}
        <span class="color337aff">{{ fileName }}</span>
      </div>
      <div>
        <div class="bright font12 color337aff pointer inline-block">
          {{ reason }}
        </div>
        <div class="bright font12 color337aff pointer inline-block ml20" @click="coverFlag = true">
          {{ $t('space.view_details') }}
        </div>
      </div>
    </div>
  </div>
  <cover class="center" v-show="coverFlag" style="z-index: 1000">
    <div class="downContainer" :style="{'height:574px': type === 'upload'}">
      <div class="flex justify-between m20">
        <span>{{ $t('space.task_list') }}</span>
        <el-icon @click="showCover" style="font-size: 18px" class="close">
          <Close></Close>
        </el-icon>
      </div>
      <div class="line"></div>
      <div class="detail x20" :style="{'height:76%': type === 'upload'}">
        <actionItem
          v-for="(item, index) in jobList"
          :key="item.jobId + index"
          :item="item"
          @callback="callback"
        ></actionItem>
      </div>
    </div>
  </cover>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import actionItem from './actionItem.vue'
import cover from './cover.vue'
import eventbus from '@/utils/eventbus'
type netType = 'upload' | 'download'

export default defineComponent({
  props: {
    type: String as PropType<netType>,
    title: String
  },
  components: {
    cover,
    actionItem
  },
  data() {
    return {
      jobList: [],
      coverFlag: false,
      action: '',
      fileName: '',
      reason: ''
    }
  },
  mounted() {
    eventbus.$on('jobListChange', (jobList) => {
      this.jobList = jobList
    })
  },
  methods: {
    showCover() {
      this.coverFlag = false
    },
    callback({ action, fileName, reason }) {
      this.action = action
      this.fileName = fileName
      this.reason = reason
    }
  }
})
</script>

<style lang="scss" scoped>
.inline-block {
  display: inline-block;
}
.button {
  width: 110px;
  height: 34px;
  background: #337aff;
  border-radius: 6px;
  line-height: 34px;
  text-align: center;
  color: #fff;
  font-size: 14px;
}
.downContainer {
  width: 800px;
  height: 510px;
  background: #fff;
  border-radius: 6px;
  color: #85899c;
  z-index: 1000;
}
.bottomContainer {
  border-top: 1px #eceef4 solid;
  height: 44px;
  width: 100%;
  position: relative;
  display: flex;
  justify-content: space-between;
  padding: 0 20px;
  align-items: center;
  background: #fff;
  margin-bottom: 2px;
}
.totalProgress {
  position: absolute;
  left: 0;
  bottom: 0;
  height: 6px;
  background: #337aff;
  width: 50%;
}
.color337aff {
  color: #337aff;
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
  padding: 0 24px 0px 10px;
  height: 80%;
  overflow: auto;
  text-align: left;
}

.text {
  font-size: 12px;
  color: #85899c;
}
</style>
