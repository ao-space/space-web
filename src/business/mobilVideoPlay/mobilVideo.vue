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
  <div class="h-100 xy-center">
    <video
      ref="video"
      :class="videoStyle"
      @loadedmetadata="videoMetadata"
      style="object-fit: contain"
      :src="src"
      controls="controls"
      autoplay
      muted
    ></video>
  </div>
</template>
<script lang="ts">
import { getParamsFromUrl, base64ToByteArray, byteArrayToHexString } from '../../utils/help'
import { sendAesKeyAndIvToServiceWorker } from '@/utils/serviceworkerUtil.js'

export default {
  data() {
    return {
      src: '',
      videoStyle: 'w-100'
    }
  },
  mounted: function () {
    let baseUrl = getParamsFromUrl('baseUrl')
    let eluoxaccessToken = getParamsFromUrl('eluoxaccessToken')
    let uuid = getParamsFromUrl('uuid')

    let eluoxaeskey = getParamsFromUrl('eluoxaeskey')
    let rawIv = getParamsFromUrl('initializationVector')
    let nativeIv = base64ToByteArray(rawIv)
    let cryptojsIv = byteArrayToHexString(nativeIv)

    sendAesKeyAndIvToServiceWorker({
      cryptojsIv: cryptojsIv,
      key: eluoxaeskey,
      rawIv: rawIv
    })

    let isSafari = false
    if (/Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent)) {
      isSafari = true
    }

    let videoUrl =
      baseUrl +
      '/space/v1/api/gateway/mf/' +
      eluoxaccessToken +
      '/uuid%3A' +
      uuid +
      '?encrypted=true'
    if (isSafari) {
      videoUrl += '&isSafari=true'
    }
    this.src = videoUrl
  },
  methods: {
    videoMetadata() {
      if (this.$refs.video.videoHeight > this.$refs.video.videoWidth) {
        this.videoStyle = 'y-100'
      }
    }
  }
}
</script>
