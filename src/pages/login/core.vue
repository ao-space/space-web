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
  <div :class="{'login':!isMobile,'mobile':isMobile}">
    <div v-if='isMobile' class="black-16 fw-b mt-80">{{ $t('login.phone_show_code',{num:version}) }}</div>
    <div v-else class="black-20 fw-b mt-60">{{ $t('login.code') }}</div>
    <span class="err-msg" v-if="errorMsg">{{ $t(errorMsg) }}</span>
    <div class='codeTop'>
      <codeComponent :size="version" @inputCode="inputCode" ref="codeComRef" />
      <div class="y-center mt-23 pointer" @click="showHelp = true">
        <img class="help mr-3" src="@/assets/help.png" />
        <span class="gray-14">{{ $t('login.auth_code_help') }}</span>
      </div>
    </div>
    <help v-show="showHelp" @cancel="showHelp = false" />
  </div>
</template>

<script lang="ts">
import codeComponent from '@/components/code.vue'
import help from '@/components/help.vue'
import JSEncrypt from 'jsencrypt'
import { v4 as uuidv4 } from 'uuid'
import { decryptBussisSerkeyWithRandomIv, setLoginInfo } from '@/auth/index'
import { getParamsFromUrl, platformStr, isMobile, myBrowser } from '@/utils/help'
import { ElLoading } from 'element-plus'
import { errorCodeMap, keyMap } from '@/utils/constant'
import { setAutoLoginFlag, setScanTime } from '@/business/noscan/noscanUntil'
import Vconsole from 'vconsole'
import { loginUtils } from '@/api/LoginUtils'
import { setLanguage } from '@/language/index.js'

let time = 0
export default {
  name: 'Login',
  components: {
    codeComponent,
    help
  },
  data() {
    const platform = platformStr()
    return {
      showHelp: false,
      codeArr: [],
      errorMsg: '',
      platform,
      isMobile: isMobile(),
      version: 4,
    }
  },
  mounted() {
    let { language,version } = this.$route.query
    if(!version){
      version = getParamsFromUrl('version')
    }
    if(!language){
      language = getParamsFromUrl('language')
    }
    if(version === 'v2'){
      this.version = 6
    }
    if(language){
      setLanguage(language)
    }
  },
  methods: {
    showVconsole() {
        if (time > 20) {
          new Vconsole()
        }
        time++
    },
    inputCode(codeArr) {
      this.codeArr = codeArr
      // web 端
      if (this.codeArr.join('').length === this.version) {
        this.login()
      }
    },
    /**
     * 授权登录
     */
    async login() {
      const loadingInstance = ElLoading.service()
      const encryptor = new JSEncrypt({}) // 创建加密对象实例

      // 之前ssl生成的公钥，复制的时候要小心不要有空格
      let { bkey, publickey,version,spaceId } = this.$route.query
      if (!bkey) {
        bkey = getParamsFromUrl('bkey')
      }
      if (!publickey) {
        publickey = getParamsFromUrl('publickey')
      }
      if (!version) {
        version = getParamsFromUrl('version')
      }
      if(!spaceId){
        spaceId = getParamsFromUrl('spaceId')
      }

      publickey = decodeURIComponent(publickey)
      // 把公钥存在本地 refresh token时需要
      localStorage.setItem(keyMap.serPubkey, publickey)
      encryptor.setPublicKey(publickey) // 设置公钥
      const authCode = this.codeArr.join('')
      const uuid = uuidv4()
      // 截取uuid 的前16 位 作为临时秘钥
      const tmpSecret = uuid.replace(/\-/g, '').slice(0, 16)
      localStorage.setItem(keyMap.tmpSecret, tmpSecret)
      let res
      try {
        let params = {
          authCode: encryptor.encrypt(authCode),
          bkey: encryptor.encrypt(bkey),
          tmpEncryptedSecret: encryptor.encrypt(tmpSecret),
          version:encryptor.encrypt(version),
        }
        if(spaceId){
          //局域网昵称或者子域名登录
          params['spaceId'] = encryptor.encrypt(spaceId)
        }
        if (window.__nativeMessage) {
          params = { ...params, ...window.__nativeMessage }
        } else {
          const clientUUID = localStorage.getItem(keyMap.clientUUID) || uuidv4()
          localStorage.setItem(keyMap.clientUUID, clientUUID)
          params = { ...params, terminalType: 'web', terminalMode: myBrowser(), clientUUID: encryptor.encrypt(clientUUID) }
        }

        console.log('请求verify接口参数=====>', params)
        res = await loginUtils.bKeyVerify(params)
        console.log("login res",res)
        console.log("hostname",window.location.hostname)

        if (res.code === 'GW-200') {
          const encryptAuthResult = res.results
          const {
            accessToken,
            encryptedSecret,
            refreshToken,
            boxName,
            boxUUID,
            algorithmConfig,
            aoid,
            boxLanInfo,
          } = encryptAuthResult
          // 目前就对称秘钥加密的
          const [secretKey, newBoxName, newBoxUUID, newAoid] = await Promise.all([
            decryptBussisSerkeyWithRandomIv(encryptedSecret, tmpSecret, algorithmConfig),
            decryptBussisSerkeyWithRandomIv(boxName, tmpSecret, algorithmConfig),
            decryptBussisSerkeyWithRandomIv(boxUUID, tmpSecret, algorithmConfig),
            decryptBussisSerkeyWithRandomIv(aoid, tmpSecret, algorithmConfig)
          ])

          // 把aoid 替换成未加密之前的aoid
          encryptAuthResult.aoid = newAoid
          setLoginInfo(encryptAuthResult, secretKey)

          const msg = JSON.stringify({
            ...encryptAuthResult,
            accessToken: accessToken,
            secretKey: secretKey,
            domain: boxLanInfo.userDomain,
            boxName: newBoxName,
            boxUUID: newBoxUUID,
            refreshToken: refreshToken,
            aoid: newAoid
          })
          if (this.platform === 'android') {
            if (window.JScallAndroidObj) {
              window.JScallAndroidObj.setLoginInfo(msg)
            }
          } else if (this.platform === 'ios') {
            window.webkit.messageHandlers.setLoginInfo.postMessage(msg)
          } else {
            window.location.href = window.location.origin + window.location.pathname
          }
        } else {
          console.log("login error",res)
          this.errorMsg = errorCodeMap[res.code] || res.message
          this.$refs.codeComRef.clear()
        }
      } catch (e) {
        console.log("catch error",e)
        this.$refs.codeComRef.clear()
        const { response } = e
        console.log(response)
        if (response) {
          const code = response.data && response.data.code || response.status
          sessionStorage.setItem('code-error', JSON.stringify(response))
          if (code) {
            this.errorMsg = errorCodeMap[code] || 'error.unknown'
          } else {
            this.errorMsg = response.data.message
          }
        } else {
          // js 代码执行错误
          this.errorMsg = 'error.unknown'
        }
      } finally {
        loadingInstance.close()
        this.codeArr = []
      }
    }
  }
}
</script>

<style scoped lang="scss">
.help {
  width: 15px;
  height: 15px;
}
.login {
  position: relative;
  display: flex;
  align-items: center;
  flex-direction: column;
  .err-msg {
    position: absolute;
    color: #f6222d;
    top: 126px;
  }
  .codeTop{
    margin-top: 90px;
  }
}
.mobile {
  position: relative;
  display: flex;
  padding: 0 46px;
  flex-direction: column;
  .err-msg {
    position: absolute;
    color: #f6222d;
    top: 140px;
  }
  .codeTop{
    margin-top: 77px;
  }
}
</style>
