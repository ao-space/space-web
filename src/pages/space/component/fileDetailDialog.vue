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
  <cover>
    <div class="downContainer">
      <div class="flex justify-between m20">
        <span class="font14">{{ $t('space.detail_info') }}</span>
        <el-icon @click="close" style="font-size: 18px" class="close">
          <Close></Close>
        </el-icon>
      </div>
      <div class="line"></div>
      <div class="detail pl31 pt9 font12">
        <div class="item mt20">
          <img :src="getSrc(fileDetail)" class="imgone" />
          <span style="font-weight: 500" class="ml10">{{ fileDetail.name }}</span>
        </div>
        <div class="item mt20">
          <span class="leftspan">{{ $t('space.location') }}</span>
          <span class="rightspan">{{ dealPath(fileDetail.path) }}</span>
        </div>
        <div class="item mt20">
          <span class="leftspan">{{ $t('space.size') }}</span>
          <span class="rightspan">{{ dealSize(fileDetail.size) }}</span>
        </div>
        <div class="item mt20">
          <span class="leftspan">{{ $t('space.modify_time') }}</span>
          <span class="rightspan">{{ uptime }}</span>
        </div>
      </div>
    </div>
  </cover>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import cover from '@/components/cover.vue'
import dayjs from 'dayjs'
import { genSrc } from '@/assets/resourceMap.js'

export default defineComponent({
  components: { cover },
  props: { floderData: Object, fileDetail: Object },
  emits: ['sure', 'cancel'],
  setup(props, { emit }) {
    const sure = () => {
      emit('sure')
    }
    const cancel = () => {
      emit('cancel')
    }
    const close = () => {
      emit('cancel')
    }
    const uptime = dayjs(props.fileDetail.operationAt).format('YYYY-MM-DD HH:mm:ss')

    const dealSize = (size) => {
      let tmp = size / 1024
      if (tmp < 1024) {
        return Number(tmp).toFixed(2) + 'KB'
      } else {
        return Number(tmp / 1024).toFixed(2) + 'MB'
      }
    }
    const getSrc = () => {
      return genSrc(props.fileDetail)
    }

    return {
      sure,
      cancel,
      close,
      dealSize,
      uptime,
      getSrc
    }
  },
  methods: {
    dealPath(filePath) {
      if (filePath.indexOf('/') == 0) {
        let myspace = this.$t('space.home_myspace')
        filePath = filePath.replace(/\//, '/' + myspace + '/')
      }
      if (filePath.lastIndexOf('/') == filePath.length - 1) {
        filePath = filePath.substr(0, filePath.length - 1)
      }
      return filePath
    }
  }
})
</script>

<style lang="scss" scoped>
.item {
  display: flex;
  align-items: center;
  .leftspan {
    display: inline-block;
    width: 106px;
    color: #bcbfcd;
    text-align: left;
  }
  .rightspan {
    color: #85899c;
    font-weight: 400;
    line-height: 1.3;
    width: calc(100% - 116px);
    overflow: hidden; /*超出内容隐藏*/
    text-overflow: ellipsis; /*超出内容为省略号*/
    display: -webkit-box; /*内容不换行*/
    -webkit-line-clamp: 3; /*超出几行*/
    -webkit-box-orient: vertical; /*从上到下垂直排列子元素*/
  }
}
.imgone {
  width: 20px;
  height: 20px;
}
.button {
  width: 80px;
  height: 34px;

  border-radius: 6px;
  line-height: 34px;
  text-align: center;

  font-size: 14px;
}
.disable {
  background: #dfe0e5;
  color: #bcbfcd;
}
.button-one {
  background: #337aff;
  color: #fff;
}

.button-two {
  border: 1px solid #337aff;
  color: #337aff !important;
  margin-left: 20px;
}
.downContainer {
  width: 540px;
  height: 340px;
  background: #fff;
  border-radius: 6px;
  color: #85899c;
  z-index: 1000;
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
  height: 205px;
  overflow: auto;
}
</style>
