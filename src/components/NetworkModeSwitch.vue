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
  <div
    class="flex-xy-center netSwitch"
    :class="{ showSwitch: showSwitch, hideSwitch: !showSwitch }"
  >
    <img alt="" class="mr-10" src="@/assets/change.svg" />
    <div class="black56-14">{{ $t(switchText) }}</div>
    <div class="button-blue ml-10 font-12" @click="networkSwitch">{{ $t('login.switchNow') }}</div>
  </div>
</template>

<script>
import eventBus from '@/utils/eventbus'
import { keyMap } from '../utils/constant'
import networkListener from '@/album/NetworkListener'
import { setUrlClientUUid,getBoxInfo } from '@/business/login/loginUtils'

export default {
  name: 'NetworkModeSwitch',
  data() {
    return {
      showSwitch: false,
      switchText: 'login.switchLan',
      boxLanInfo: {},
      currentNet: 0 //1 互联网，2 局域网，3 ip
    }
  },
  mounted() {
    networkListener.init()
    this.boxLanInfo = getBoxInfo()
    eventBus.$on(networkListener.NetworkChangeEvent, this.networkChangeEvent)

    if (networkListener.isWan()) {
      setTimeout(this.pingLan, 10000)
    }
  },
  methods: {
    pingLan() {
      networkListener
        .pingLan()
        .then(() => {
          this.currentNet = 2
          this.showSwitchDialog()
        })
        .catch(() => {
          networkListener
            .pingIp()
            .then(() => {
              this.currentNet = 3
              this.showSwitchDialog()
            })
            .catch(() => {
              setTimeout(this.pingLan, 10000)
            })
        })
    },
    networkSwitch() {
      let eluoxaeskey = localStorage.getItem(keyMap.eluoxaeskey)
      let serPubkey = localStorage.getItem(keyMap.serPubkey)
      let language = localStorage.getItem(keyMap.language)
      let loginInfo = localStorage.getItem(keyMap.loginInfo)
      let client_uuid = localStorage.getItem(keyMap.clientUUID)
      let params =
        '#/switchLogin?eluoxaeskey=' +
        encodeURIComponent(eluoxaeskey) +
        '&serPubkey=' +
        encodeURIComponent(serPubkey) +
        '&loginInfo=' +
        encodeURIComponent(loginInfo) +
        '&language=' +
        language +
        '&client_uuid=' +
        client_uuid
      let url
      if (this.currentNet === 1) {
        url = 'https://' + this.boxLanInfo.userDomain + '/space/index.html'
      } else if (this.currentNet === 2) {
        url =
          'https://' +
          this.boxLanInfo.lanDomain +
          ':' +
          this.boxLanInfo.tlsPort +
          '/space/index.html'
      } else {
        url = 'http://' + this.boxLanInfo.lanIp + ':' + this.boxLanInfo.port + '/space/index.html'
      }

      setUrlClientUUid(url)
      setTimeout(() => {
        window.location.href = url + params
      }, 1000)
    },
    networkChangeEvent(type) {
      //console.log('NetworkSwitchEvent ===> 尝试切换网络')
      //上线
      if (type !== 3) {
        return
      }

      if (networkListener.isWan()) {
        //切换局域网
        networkListener
          .pingIp()
          .then(() => {
            this.switchText = 'login.switchLan'
            this.currentNet = 3
            this.showSwitchDialog()
          })
          .catch(() => {
            setTimeout(() => {
              this.networkChangeEvent(type)
            }, 5000)
          })
      } else {
        //切换互联网
        networkListener
          .pingWan()
          .then(() => {
            this.switchText = 'login.switchWan'
            this.currentNet = 1
            this.showSwitchDialog()
          })
          .catch(() => {
            setTimeout(() => {
              this.networkChangeEvent(type)
            }, 5000)
          })
      }
    },
    showSwitchDialog() {
      this.showSwitch = true
      setTimeout(() => {
        //console.log("探测，网络未切换")
        this.showSwitch = false
      }, 5000)
    }
  }
}
</script>

<style lang="scss" scoped>
.netSwitch {
  position: absolute;
  left: 50%;
  top: -76px;
  transform: translateX(-50%);
  height: 60px;
  background: #ffffff;
  box-shadow: 0 0 10px 0 rgba(103, 125, 168, 0.2);
  border-radius: 6px;
  padding: 20px;
  z-index: 2023;
  opacity: 0;
}
.showSwitch {
  opacity: 1;
  transition: 1s;
  transform: translate(-50%, 150px);
}
.hideSwitch {
  opacity: 0;
  transition: 1s;
  transform: translate(-50%, -150px);
}
.button-blue {
  width: 72px;
  height: 26px;
}
</style>
