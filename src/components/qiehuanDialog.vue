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
  <cover v-if="showCover" style="z-index: 9999; background-color: white">
    <div class="cover-container flex flex-x-center flex-y-center">
      <div class="downContainer">
        <div class="flex justify-between p-20">
          <span class="font14 dialog-title">平台切换</span>
          <el-icon @click="sure" style="font-size: 18px" class="pointer">
            <CloseBold />
          </el-icon>
        </div>
        <div class="line"></div>
        <div class="detail x20 font12">
          <div class="mb-20">管理员已成功切换到新的空间平台</div>
          <div>{{ platformUrl }}</div>
        </div>
        <div class="tc">
          <div class="button dib button-one" @click="sure">知道了</div>
        </div>
      </div>
    </div>
  </cover>
</template>
<script setup>
import cover from '@/components/cover.vue'
import { ref, onMounted } from 'vue'
import { postMessageToIframe } from '@/utils/iframeUtils'
import eventBus from '@/utils/eventbus'
import { keyMap } from '@/utils/constant'
import { isDev, myBrowser, Cookie } from '@/utils/help'
import { getBoxStatus } from '@/api/index'
const showCover = ref(false)
const platformUrl = ref('')
let queryStr = ''
let otherOrigin = ''

const sure = () => {
  let url = ''
  url = otherOrigin + '/webrtc/loginInfo.html?' + queryStr
  window.location.href = url
}

onMounted(() => {
  eventBus.$on(keyMap.eventOf307, (params) => {
    console.log('发生平台社区版307事件', params)
    //从cookie 中取出
    const tmp = {}
    const client_uuid = Cookie.get('client_uuid')
    if (client_uuid) {
      queryStr = `${queryStr}&client_uuid=${client_uuid}`
      tmp.client_uuid = client_uuid
    }
   
    let origin = params.origin + '/space'
    otherOrigin = origin
    if (isDev()) {
      origin = window.location.origin
    }
   
    let keysArr = [
      keyMap.__getPersonal__,
      keyMap.clientUUID,
      keyMap.eluoxaeskey,
      keyMap.eluoxaccessToken,
      keyMap.loginInfo,
      keyMap.__getPersonal__
    ]
    

    keysArr.forEach((item) => {
      tmp[item] = localStorage.getItem(item)
      if (localStorage.getItem(item)) {
        if (!queryStr) {
          queryStr = `${item}=${localStorage.getItem(item)}`
        } else {
          queryStr += `&${item}=${localStorage.getItem(item)}`
        }
      }
    })

    // 让弹框弹出来
    tankuang(origin, tmp)
    // 第5秒重试下
    retry(origin, tmp, 5000)
    // 第10秒重试下
    retry(origin, tmp, 10000)
  })
})

const tankuang = (origin, tmp) => {
  Promise.all([postMessageToIframe(origin + '/webrtc/loginInfo.html', tmp), getBoxStatus()])
    .then((result) => {
      let [resultOne, resultTwo] = result
      if (resultOne.code == 200) {
        showCover.value = true
      }
      platformUrl.value = resultTwo.platformInfo.platformUrl
    })
    .catch((error) => {
      console.log(error)
    })
}

const retry = (origin, tmp, time) => {
  // 5s 内为弹出，在重新调用下接口
  setTimeout(() => {
    if (!showCover.value) {
      console.log('未弹出切换窗口,重新请求一次', time)
      tankuang(origin, tmp)
    }
  }, time)
}
</script>

<style lang="scss" scoped>
.cover-container {
  background: rgba(0, 0, 0, 0.5);
  width: 100%;
  height: 100%;
}
.dialog-title {
  font-size: 14px;
  font-weight: 500;
  color: #464956;
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
  margin-top: -5%;
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
  font-weight: bold;
  color: #464956;
  flex-direction: column;
}
</style>
