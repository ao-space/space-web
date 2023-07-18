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
  <div class="flex y-center w-100 h-100 login-container">
    <img
      :class="choose('logo', 'logo-en')"
      class="pointer"
      :src="choose(zhLogo, enLogo)"
      @click="go('https://ao.space/', 'https://ao.space/en/')"
    />
    <div class="right-content">
      <img :src="imgsrc" class="headImg" />
      <div class="mb-20 black-22 fw-b">
        <span>{{ userInfo.personalName }}</span>
        <span>{{ $t('login.auto') }}</span>
      </div>
      <span class="black-14">{{ 'https://' + userInfo.userDomain }}</span>
      <div class="mt-32 tc" v-show="status === 1">
        <IscasButton :loading="showLoading" class="button-blue" @click="goSpace">
          {{ $t('login.enter') }}
        </IscasButton>
        <div class="blue-14 fw-b mt-20 pointer" @click="goAoLogin">{{ $t('login.more') }}</div>
      </div>
      <div class="wait tac mt-32" v-show="status === 2">
        <div class="black-20">{{ $t('login.confirm') }}</div>
        <div class="mt-32 pointer blue-14 fw-b" @click="cancelLogin">{{ $t('login.cancel') }}</div>
      </div>
    </div>
    <div class="font14 color-1 div-one">
      <div class="mb10 tac">
        <span
          class="pointer"
          @click="go('https://ao.space/privacy', 'https://ao.space/en/privacy')"
          >{{ $t('login.privacy') }}</span
        >
        <span class="ml19 mr-19">|</span>
        <span
          class="pointer"
          @click="go('https://ao.space/agreement', 'https://ao.space/en/agreement')"
          >{{ $t('login.user') }}</span
        >
      </div>
      <div>{{ $t('login.copyright') }}</div>
    </div>
  </div>
</template>

<script lang="ts">
import { keyMap } from '@/utils/constant'
import { getWebUrl } from '@/business/login/loginUtils'
import { getCacheInfo } from '@/utils/indexdbUtil'
import { chooseByLanguage } from '@/utils/help'
import { autoLogin, pollLogin } from '@/api/index'
import { v4 as uuidv4 } from 'uuid'
import { decryptBussisSerkeyWithRandomIv, setLoginInfo } from '@/auth/index'
import iconimg from '@/assets/touxiang.png'
import JSEncrypt from 'jsencrypt'
import zhLogo from '@/assets/new_logo.png'
import enLogo from '@/assets/英文登录页@2x.png'
import IscasButton from '@/components/IscasButton.vue'

export default {
  name: 'Login',
  components: { IscasButton },
  data() {
    let userInfo = localStorage.getItem(keyMap.__getPersonal__)
    if (userInfo) {
      try {
        userInfo = JSON.parse(userInfo).results[0]
      } catch (e) {
        // 发生错误直接去二维码界面
        window.location.href = `${getWebUrl()}#/login`
        userInfo = null
      }
    } else {
      window.location.href = `${getWebUrl()}#/login`
    }

    const origin = window.location.origin
    return {
      status: 1,
      origin,
      userInfo: userInfo || {},
      imgsrc: iconimg,
      enLogo,
      zhLogo,
      showLoading: false
    }
  },

  beforeUnmount() {
    if (this.timeOut) {
      clearTimeout(this.timeOut)
    }
  },
  mounted() {
    // 开始轮询查询结果

    getCacheInfo(keyMap.personHeaderImage).then((res: Blob) => {
      if (res) {
        this.imgsrc = window.URL.createObjectURL(res)
      }
    })
  },
  methods: {
    go(zhPath, enPath) {
      const path = chooseByLanguage(zhPath, enPath)
      window.open(path, '_blank')
    },
    /**
     * 去二维码扫描界面
     */
    goAoLogin() {
      window.location.href = `${getWebUrl()}#/login`
    },
    genParams() {
      const uuid = uuidv4()
      // 截取uuid 的前16 位 作为临时秘钥
      const secret = uuid.replace(/\-/g, '').slice(0, 16)
      localStorage.setItem(keyMap.tmpSecret, secret)

      const encryptor = new JSEncrypt({}) // 创建加密对象实例
      const publickey = localStorage.getItem('serPubkey')
      encryptor.setPublicKey(publickey) // 设置公钥
      const tmpEncryptedSecret = encryptor.encrypt(secret)

      const refreshToken = localStorage.getItem('refreshToken')
      return {
        refreshToken,
        tmpEncryptedSecret: tmpEncryptedSecret
      }
    },

    goSpace() {
      this.showLoading = true
      autoLogin(this.genParams())
        .then((res) => {
          this.dealResult(res, () => {
            // 轮询poll 等等结果
            this.waitResult()
          })
        })
        .catch((e) => {
          this.showLoading = false
        })
    },
    cancelLogin() {
      this.status = 1
      this.showLoading = false
      if (this.timeOut) {
        clearTimeout(this.timeOut)
      }
      if (this.showStautsTwo) {
        clearTimeout(this.showStautsTwo)
      }
    },

    /**
     * 处理返回码为: GW-200 的情况
     */
    async gw200Fn(result) {
      const tmpSecret = localStorage.getItem(keyMap.tmpSecret)

      const { encryptedSecret, algorithmConfig } = result
      // 目前就对称秘钥加密的 这里需要重构 todo
      const [secretKey] = await Promise.all([
        decryptBussisSerkeyWithRandomIv(encryptedSecret, tmpSecret, algorithmConfig)
      ])
      setLoginInfo(result, secretKey)
      window.location.href = window.location.origin + window.location.pathname
    },
    /**
     * 处理返回码为: GW-4045 的情况
     */
    gw4045Fn() {
      this.goAoLogin()
    },
    waitResult() {
      // 每隔1s查询一次结果
      this.timeOut = setTimeout(() => {
        this.dealPoll(() => {
          this.waitResult()
        })
      }, 1000)
    },
    dealPoll(callback4044) {
      pollLogin(this.genParams()).then((res) => {
        this.dealResult(res, callback4044)
      })
    },

    dealResult(res, callback4044) {
      if (res.code === 'GW-4044') {
        // 需要绑定端确认， 我这边需要调用没有poll
        const showStautsTwo = setTimeout(() => {
          this.status = 2
        }, 1000)
        this.showStautsTwo = showStautsTwo

        typeof callback4044 === 'function' && callback4044()
      } else if (res.code === 'GW-200') {
        // 登录成功
        this.gw200Fn(res.results)
      } else if (res.code === 'GW-4045' || res.code === 'GW-4046') {
        // gw-4045 扫描授权超过30天， gw-4046 取消登录
        this.goAoLogin()
      }
    },
    choose(zh, en) {
      return chooseByLanguage(zh, en)
    }
  }
}
</script>

<style scoped lang="scss">
.color-1 {
  color: #b9b9b9;
}

.div-one {
  margin-top: 133px;
}
.logo {
  width: 199px;
  height: 48px;
  top: 30px;
  left: 36px;
  position: absolute;
}

.logo-en {
  width: 356px;
  top: 30px;
  left: 36px;
  position: absolute;
}

::v-deep(.el-loading-mask) {
  background-color: rgba(0, 0, 0, 0);
}

::v-deep(.el-loading-spinner) {
  position: relative;
  margin-top: 0;
  top: 0;
  height: 100%;
  line-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 70px;
  .path {
    stroke: #dfe0e5;
  }
  .circular {
    width: 20px;
    height: 20px;
  }
}

.login-container {
  background: url('@/assets/bg@2x.png');
  background-size: 100% 100%;
  justify-content: center;
  flex-direction: column;
  position: relative;
}
.button-blue {
  width: 200px !important;
  height: 56px !important;
  background: #337AFF;
}
.loading{
  background: #C2D8FF;
}
.headImg {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  margin: 50px auto 26px auto;
}
.right-content {
  width: 420px;
  height: 500px;
  background: #ffffff;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
