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
  <div v-if="isMobile()">
    <Core />
  </div>
  <div v-else class="flex-y-center w-100 h-100 login-container">
    <img
      :class="choose('logo', 'logo-en')"
      class="pointer"
      :src="choose(zhLogo, enLogo)"
      @click="go('https://ao.space/', 'https://ao.space/en/')"
    />
    <div class="core-div">
      <Core />
    </div>
    <div class="font-20 color-1 div-one">
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

<script>
import { isMobile, chooseByLanguage } from '@/utils/help'
import Core from './core.vue'
import zhLogo from '@/assets/new_logo.png'
import enLogo from '@/assets/英文登录页@2x.png'
export default {
  name: 'Login',
  components: {
    Core
  },
  data() {
    return { zhLogo, enLogo }
  },
  methods: {
    isMobile() {
      return isMobile()
    },
    go(zhPath, enPath) {
      const path = chooseByLanguage(zhPath, enPath)
      window.open(path, '_blank')
    },
    choose(zh, en) {
      return chooseByLanguage(zh, en)
    }
  }
}
</script>

<style scoped lang="scss">
@function pxtoVw($args) {
  @return $args + px;
}
.relative {
  position: relative;
}
.logo {
  width: pxtoVw(133);
  height: pxtoVw(32);
  top: pxtoVw(30);
  left: pxtoVw(37);
  position: absolute;
}

.logo-en {
  width: pxtoVw(356);
  top: pxtoVw(30);
  left: pxtoVw(37);
  position: absolute;
}

.color-1 {
  color: #b9b9b9;
}

.div-one {
  margin-top: pxtoVw(133);
}
.core-div {
  width: pxtoVw(600);
  height: pxtoVw(480);
  border-radius: 6px;
  background: white;
}
.login-container {
  background: url('@/assets/bg@2x.png');
  background-size: 100% 100%;
  justify-content: center;
  flex-direction: column;
  position: relative;
}
</style>
