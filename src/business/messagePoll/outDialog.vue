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
  <cover v-if="coverShow" style="z-index: 1501">
    <div class="downContainer">
      <div class="flex justify-between m20">
        <span class="font14 dialog-title">{{ title }}</span>
        <el-icon style="font-size: 18px; opacity: 0">
          <Close />
        </el-icon>
      </div>
      <div class="line"></div>
      <div class="detail x20 font12">
        {{ content }}
      </div>
      <div class="tr" style="text-align: center">
        <div class="button dib button-one" @click="sure">{{ $t('buttons.common_confirm') }}</div>
      </div>
    </div>
  </cover>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import cover from '@/components/cover.vue'
import { reactive, toRefs } from 'vue'
import eventBus from '@/utils/eventbus'
import { Close } from '@element-plus/icons'

import { clearLoginInfoAndgoSpace,clearLoginInfo } from '@/business/login/loginUtils'
import {
  getShowOutDialogType,
  noticeTextMap,
  noticeTitleMap,
  setShowOutDialogType,
  isWebMessageType, 
} from './messagePoll'

export default defineComponent({
  components: { cover,Close },
  setup() {
    //out
    // 判断缓存中是否有消息通知(action-two)
    out(getShowOutDialogType())

    function getState() {
      let showOutDialogType = getShowOutDialogType()
      const state = reactive({
        coverShow: isWebMessageType(showOutDialogType),
        title: noticeTitleMap[showOutDialogType] || '',
        content: noticeTextMap[showOutDialogType] || '',
        showcancel: true,
        showOutDialogType: showOutDialogType,
      })
      return state
    }

    let state = getState()
    eventBus.$on('showOutDialog', (messageBean) => {
      // 塞消息通知到缓存中去(action-one) 和上面的 action-two 对应起来
      setShowOutDialogType(messageBean.optType)
      if (isWebMessageType(messageBean.optType)) {
        let newstate = getState()
        state.coverShow = true
        state.title = newstate.title
        state.content = newstate.content
        state.showOutDialogType = newstate.showOutDialogType

        if(Notification.permission === 'granted' && document.visibilityState != "visible"){
          notificationDesktop(newstate);
        }

        //客户端登出处理
        clearLoginInfo();
      }
    })

    function notificationDesktop(newstate){
      Notification.requestPermission().then(function(result) {
        if (result === 'granted') {
          var notification = new Notification(newstate.title, {
            dir: "auto",
            lang: "hi",
            requireInteraction: true,
            icon: "../../src/assets/xiaoxi-center.png",
            body: newstate.content
          });
          notification.onclick = function (event) {
            //回到发送此通知的页面
            window.focus();
          }
        }
      });
    }

    const sure = () => {
      location.hash = '#/noscanLogin';
      state.coverShow = false
    }
    const cancel = () => {
      state.coverShow = false
    }

    // 如果是被强制下线或者被删除账号,就退出登录
    function out(dialogType) {
      if (isWebMessageType(dialogType)) {
        // 这里做下线的东西,清理缓存
        clearLoginInfoAndgoSpace()
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
