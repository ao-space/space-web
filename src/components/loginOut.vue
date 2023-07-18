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
  <img :src="iconimg" class="touxiang" />
  </div>
</template>

<script lang="ts">
import { genParams } from '@/auth/index'
import axios from 'axios'
import { RealCallRequest } from '@/api/model'
import { urlConfig } from '@/config/networkConfig'
import iconimg from '../assets/touxiang.png'
import { setCacheInfo } from '@/utils/indexdbUtil'
import { keyMap } from '@/utils/constant'

let baseUrl = urlConfig.baseUrl
import { decryptFile } from '@/auth/index'

export default {
  data() {
    return {
      showLoginOut: false,
      iconimg: iconimg,
    }
  },
  beforeMount() {
    this.gimgapi()
  },
  methods: {
    async gimgapi() {
      let params: RealCallRequest<any> = {
        apiVersion: 'v1',
        apiName: 'image_show',
        responseType: 'blob',
        serviceName: 'eulixspace-account-service',
        headers: {
          clientUUID: 'clientUUID',
          responseType: 'blob',
        },
        entity: {
          responseType: 'blob',
        },
      }
      let result = await genParams(params)
      axios({
        method: 'post',
        header: {
          contentType: 'application/json',
        },
        url: `${baseUrl}/space/v1/api/gateway/download`,
        contentType: 'application/json',
        responseType: 'blob',
        data: result,
      })
        .then(function (data) {
          return decryptFile(data.data)
        })
        .then((data) => {
          let blob = new Blob([data], { type: ' image/png' })
          setCacheInfo(keyMap.personHeaderImage, blob)
          let URL = window.URL.createObjectURL(blob)
          this.iconimg = URL
        })
    },
  },
}
</script>

<style lang="scss" scoped>
.touxiang {
  width: 32px;
  height: 32px;
  border-radius: 50%
}
</style>
