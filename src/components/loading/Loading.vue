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
  <div class="loading-container flex-xy-center">
    <div class="flex-xy-center flex-column">
      <img alt="" class="img-30 run2" src="@/assets/loading@2x.png" />
      <div class="mt-15 gray-14">{{ showText }}</div>
    </div>
  </div>
</template>

<script>
import { t } from '@/language'
export default {
  name: 'Loading',
  props:{
    text: {
      type: String,
      default: 'notify.loading'
    }
  },
  computed:{
    showText(){
      return t(this.text)
    }
  },
}
</script>

<style lang="scss" scoped>
.loading-container {
  height: 100%;
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
  background-color: #ffffff;
  z-index: 2000;
}
</style>
