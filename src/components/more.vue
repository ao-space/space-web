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
      <img src="@/assets/more-point.svg" @click="showMore" />
    </div>
    <el-dialog v-model="show" :show-close="false" :modal="false">
      <div class="menu pointer" @click="helpCenter">{{ $t('buttons.more_help') }}</div>
      <el-divider />
      <div class="menu pointer" @click="dow">{{ $t('buttons.more_download') }}</div>
      <el-divider />
      <div class="menu pointer y-center" @mouseover="subShow = true" @mouseout="subShow = false">
        <span>{{ $t('buttons.more_language') }}</span>
        <img class="ml-auto" src="@/assets/arrowgray-right.svg" />
      </div>
      <div class="subMenu" v-show="subShow" @mouseover="subShow = true" @mouseout="subShow = false">
        <div class="menu pointer y-center" @click="choseLang('zh-CN')">
          简体中文
          <img v-show="lang === 'zh-CN'" class="ml-auto" src="@/assets/xuanze.svg" />
        </div>
        <div class="menu pointer y-center" @click="choseLang('en-US')">
          English
          <img v-show="lang === 'en-US'" class="ml-auto" src="@/assets/xuanze.svg" />
        </div>
      </div>
      <el-divider />
      <div class="menu pointer" @click="loginout">{{ $t('buttons.more_logout') }}</div>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { keyMap } from '@/utils/constant'
import {
  clearLoginInfoAndgoSpace,
  isAdmin,
  getPersonInfo,
  getWebUrl
} from '@/business/login/loginUtils'
import { dealOffLine } from '@/utils/offlineHelp'
import { terminalLogout } from '@/api/terminal'
import { setLanguage, getLanguage } from '@/language/index'
import { chooseByLanguage } from '@/utils/help'

export default {
  name: 'more',
  data() {
    return {
      show: false,
      currentFunc: null,
      showInstall: true,
      subShow: false,
      lang: '',
      optionStatus: 'off'
    }
  },
  mounted() {
    this.lang = getLanguage()

  },
  methods: {
    choseLang(lang) {
      setLanguage(lang)
      this.lang = lang
      this.hideMore()
    },
    loginout() {
      this.hideMore()
      dealOffLine(() => {
        const person = getPersonInfo()
        const params = { aoid: person.aoId, clientUUID: localStorage.getItem(keyMap.clientUUID) }
        terminalLogout(params).then((res) => {
          console.log(res)
        })
        setTimeout(() => {
          clearLoginInfoAndgoSpace()
        }, 1000)
      })
    },
    helpCenter() {
      this.hideMore()
      setTimeout(function () {
        let str = window.location.hostname
        const helpUrl = chooseByLanguage('/support/help', '/en/support/help')
        window.open(`${getWebUrl()}${helpUrl}?userDomain=${str}`, '_blank')
      }, 300)
    },
    dow() {
      this.hideMore()

      setTimeout(function () {
        const downUrl = chooseByLanguage('/download', '/en/download')
        window.open(`${getWebUrl()}${downUrl}`, '_blank')
      }, 300)
    },
    showMore() {
      this.show = true
    },
    hideMore() {
      this.show = false
    }
  }
}
</script>
<style lang="scss" scoped>
::v-deep(.el-dialog__body) {
  padding: 0;
}
::v-deep(.el-dialog) {
  position: absolute;
  top: 50px;
  right: 20px;
  width: 260px;
  background: #ffffff;
  box-shadow: 0px 0px 10px 0px rgba(103, 125, 168, 0.2);
  border-radius: 6px;
  margin: 0px;
}
::v-deep(.el-dialog__header) {
  display: none;
}
::v-deep(.el-divider--horizontal) {
  margin: 10px 0;
}
.menu {
  padding: 7px 10px 7px 20px;
  font-size: 14px;
  &:hover {
    color: #337aff;
    background-color: #eaf1ff;
  }
  position: relative;
  margin: 5px 0px;
}
.subMenu {
  width: 200px;
  height: 96px;
  background: #ffffff;
  box-shadow: 0px 0px 10px 0px rgba(103, 125, 168, 0.2);
  border-radius: 6px;
  margin: 0;
  position: absolute;
  top: 100px;
  right: 260px;
  padding: 10px 0px;
}
.subMenuInstall {
  height: 60px;
  top: 180px;
  @extend .subMenu;
}
</style>
