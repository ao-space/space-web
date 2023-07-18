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
  <div style="text-align: center;">
    <div style="margin: 20px">
      <el-radio-group v-model="openConsole">
        <el-radio :label="'1'">关闭日志打印</el-radio>
        <el-radio :label="'2'">开启日志打印并拦截(logUtils)</el-radio>
        <el-radio :label="'3'">开启日志打印但不拦截()</el-radio>
      </el-radio-group>
    </div>
    <div style="margin: 20px" v-show="openConsole != '1'">
      <el-radio-group v-model="openNetWork">
        <el-radio :label="'1'">关闭打印请求原生请求响应(主要通过call接口)</el-radio>
        <el-radio :label="'2'">开启打印请求原生请求响应(主要通过call接口)</el-radio>
      </el-radio-group>
    </div>
    <div style="margin: 20px">
      <el-radio-group v-model="openLocalFlag">
        <el-radio :label="1">关闭本地化</el-radio>
        <el-radio :label="2">开启本地化</el-radio>
      </el-radio-group>
    </div>
    <div style="margin: 20px">
      <el-radio-group v-model="openJuyuwang">
        <el-radio :label="'1'">关闭局域网探测</el-radio>
        <el-radio :label="'2'">开启局域网探测</el-radio>
      </el-radio-group>
    </div>

  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
let openNetWork_tmp = localStorage.getItem('debug') || '1'
let openConsole_tmp = localStorage.getItem('showLog') || '1'
let openLocalFlag_tmp = sessionStorage.getItem('web_openLocalFlag') || 2
let tmp = sessionStorage.getItem('webrtc_forward')



let openJuyuwang_tmp = sessionStorage.getItem('wangluo_openJuyuwang') || '2'

if (tmp) {
  tmp = parseInt(tmp)
} else {
  tmp = 1
}
const openJuyuwang = ref(openJuyuwang_tmp)
const openNetWork = ref(openNetWork_tmp)
const openConsole = ref(openConsole_tmp)
const openLocalFlag = ref(parseInt(openLocalFlag_tmp))
const radio = ref(tmp)
// eslint-disable-next-line camelcase

watch(openNetWork,(newVal)=>{
    if(newVal == '1'){
        localStorage.removeItem('debug')
    }else{
        localStorage.setItem('debug',newVal)
    }
})

watch(openJuyuwang,(newVal)=>{
    sessionStorage.setItem('wangluo_openJuyuwang',newVal)
})

watch(openConsole,(newVal)=>{
     localStorage.setItem('showLog',newVal)
})

watch(openLocalFlag,(newVal)=>{
    sessionStorage.setItem('web_openLocalFlag', newVal)
})





watch(radio, (newVal) => {
  sessionStorage.setItem('webrtc_forward', newVal)
})


</script>
