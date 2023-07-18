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
    <div class="pointer">
      <img src="@/assets/xiaoxi.svg" @click="showCenter" />
      <span class="redpoint" v-if="hasNew" />
    </div>
    <el-dialog v-model="show" @open="init" :show-close="false" :modal="false">
      <template #header>
        <div class="my-header">
          <div class="font16 fw-b clear-black">{{ $t('notify.notify_title') }}</div>
          <div class='y-center pointer' @click="clearNotification" v-if="notifyList.length !== 0">
            <img src="@/assets/del-center.svg" />
            <span class="ml-2 color-blue">{{ $t('notify.notify_clear') }}</span>
          </div>
          <div class='y-center pointer' @click="clearNotification" v-if="notifyList.length === 0">
            <img src="@/assets/del-center-grey.svg" />
            <span class="ml-2 color-grey">{{ $t('notify.notify_clear') }}</span>
          </div>
        </div>
      </template>
      <div
        class="file_container"
        style="height: 490px"
        v-infinite-scroll="getMoreList"
        v-if="notifyList.length !== 0"
      >
        <div v-for="item in notifyList" class='message' :class="item.optType == 'memories'? 'pointer':''" @click='goAlbum(item)'>
          <div class="my-header">
            <el-space>
              <img src="@/assets/xiaoxi-center.png" />
              <span class="fw-b">{{ item.title }}</span>
            </el-space>
            <span class="color-grey">{{ item.messageTime }}</span>
          </div>
          <div class="color-grey" style="padding: 8px 0px 0px 28px">
            {{ item.content }}
          </div>
        </div>
      </div>
      <div v-if="notifyList.length === 0" style="height: 490px" class="xy-center">
        <div class="flex flex-column">
          <img src="@/assets/wuxiaoxi.png" />
          <span class="color-grey">{{ $t('notify.nodata') }}</span>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { clearAllNotification, getNotification } from '../api/safe'
import { ElMessage, ElNotification } from 'element-plus'
import { getMessageBean } from '../business/messagePoll/messagePoll'
import eventBus from '@/utils/eventbus'
import { localCacheManageInstance } from '@/auth/local'

export default {
  name: 'NotivicationCenter',
  data() {
    return {
      show: false,
      notifyList: [],
      page: 1,
      hasNew: false,
      total: 0,
    }
  },
  mounted() {
    let self = this
    //下线消息通知
    eventBus.$on('showOutDialog', function (messageObj) {
      self.notifyList.unshift(messageObj)
      self.hasNew = true
    })
    //申请桌面通知权限
    Notification.requestPermission();

    //备份消息通知
    eventBus.$on('backupNotify', (messageObj) => {
      //清理本地化缓存
      localCacheManageInstance.clearLocalCache()
      //弹出消息框
      ElNotification({
        title: messageObj.title,
        message: messageObj.content,
        duration: 3000,
        offset: 50,
      })
      //消息列表
      self.notifyList.unshift(messageObj)
      self.hasNew = true
    })
  },
  methods: {
    goAlbum(item){
      if(item.optType == 'memories'){
        this.hideCenter()
        this.$router.push("/smartPhoto/5/"+item.albumId+"?collect=false")
      }
    },
    getMoreList() {
      if (this.page >= this.total) {
        return
      }
      this.page++
      this.requestNotification()
    },
    init() {
      this.requestNotification()
    },
    requestNotification() {
      let self = this
      self.hasNew = false
      getNotification(this.page).then(function (result) {
        if (result.code === 'GW-200' && result.results.pageInfo.total > 0) {
          self.formatNotification(result.results.notification)
        }
      })
    },
    formatNotification(data) {
      let messageList = []
      for (let i = 0; i < data.length; i++) {
        let dialog = getMessageBean(data[i])
        messageList.push(dialog)
      }
      if (this.page === 1) {
        this.notifyList = messageList
      } else {
        this.notifyList.push(...messageList)
      }
    },
    clearNotification() {
      let self = this
      clearAllNotification().then(function (result) {
        console.log(result)
        if (result.code === 'GW-200') {
          self.notifyList = []
        } else {
          ElMessage({
            message: '清空消息错误',
            type: 'error',
            center: true,
          })
        }
      })
    },
    showCenter() {
      this.show = true
    },
    hideCenter(){
      this.show = false
    }
  },
}
</script>
<style lang="scss" scoped>
.file_container {
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 4px;
}
.file_container::-webkit-scrollbar {
  width: 5px;
}
.file_container::-webkit-scrollbar-thumb {
  border-radius: 10px;
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
  background: rgba(0, 0, 0, 0.2);
}
.file_container::-webkit-scrollbar-track {
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
  border-radius: 0;
  background: rgba(0, 0, 0, 0.1);
}

.redpoint {
  background: rgba(250, 60, 0, 1);
  position: absolute; /*根据父元素绝对定位*/
  width: 5px;
  height: 5px;
  top: 0; /*在父元素的内部的顶部*/
  right: 0; /*在父元素的内部的右边*/
  -webkit-border-radius: 50%;
  -moz-border-radius: 50%;
  border-radius: 50%;
}
::v-deep(.el-dialog__body) {
  padding: 10px 2px 10px 9px;
}

::v-deep(.el-dialog__header) {
  padding: 16px 13px 13px 15px;
}
.message{
  padding: 9px 6px;
  margin-bottom: 10px;
  &:hover{
    background-color: #EAF1FF;
  }
}

::v-deep(.el-dialog) {
  position: absolute;
  top: 50px;
  right: 70px;
  width: 300px;
  height: 574px;
  background: #ffffff;
  border-radius: 6px;
  margin: 0px;
}
.my-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}
</style>
