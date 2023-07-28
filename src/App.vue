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
  <div class="start" @click="cancelMenu">
    <router-view></router-view>
  </div>

  <customDialog />
  <!-- 下线通知 或 空间注销 -->
  <OutDialog v-if="needOutDialog" />
  <!-- 切换平台社区版弹框 -->
  <QiehuanDialog  />
</template>

<script>
import eventBus from './utils/eventbus'
import customDialog from '@/components/dialog.vue'
import OutDialog from '@/business/messagePoll/outDialog.vue'
import Vconsole from 'vconsole'
// 小应用获得授权通信页面不需要 推送
const unNeedOutDialogUrlArr = ['#/programAuthorize']


import QiehuanDialog from './components/qiehuanDialog.vue'
export default {
  components: { customDialog, OutDialog, QiehuanDialog },
  name: 'App',
  onmounted() {
    new Vconsole()
  },
  data() {
    let hash = window.location.hash
    let unNeed = unNeedOutDialogUrlArr.findIndex((item) => {
      return hash.indexOf(item) == 0
    })
    return {
      needOutDialog: unNeed == -1,
    }
  },

  methods: {
    cancelMenu() {
      eventBus.$emit('cancelMenu')
    },
  }
}
</script>

<style scoped lang="scss">
.start {
  height: 100% !important;
}
</style>
