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
    class="xy-center pointer"
    style="position: relative"
    @click="showDownUpCover"
  >
    <img
      src='@/assets/lixian@2x.png'
      alt=""
      class="renwu ml20"
      v-if="netWorkType === 3"
    />
    <img
      src='@/assets/renwu.svg'
      alt=""
      class="renwu ml20"
      v-if="netWorkType === 1 && taskLength === 0"
    />
    <img
      src="@/assets/jyw@2x.png"
      alt=""
      class="renwu ml20"
      v-if="netWorkType === 2 && taskLength === 0"
    />
    <img
      src="@/assets/chuanshu_1@2x.png"
      alt=""
      class="renwu ml20 poi4"
      v-if="netWorkType === 1 && taskLength !== 0"
    />
    <img
      src="@/assets/chuanshu_2@2x.png"
      alt=""
      class="renwu ml20 poi4"
      v-if="netWorkType === 2 && taskLength !== 0"
    />
    <div class="taskLength flex xy-center" v-show="taskLength">
      <span>{{ taskLength }}</span>
    </div>
  </div>
</template>

<script>
import eventbus from '@/utils/eventbus'
import networkListener from '@/album/NetworkListener'
export default {
  name: 'downupCover',
  data() {
    return {
      taskLength: 0,
      netWorkType: 1, // 1 互联网 p2p 2 局域网 3 离线
    }
  },
  emits: ['handleChange'],
  mounted() {
    this.netWorkType = networkListener.isLocation() ? 2 : 1
    eventbus.$on(networkListener.NetworkChangeEvent,(netWorkType)=>{
      this.netWorkType = netWorkType
      if(netWorkType === 3){
        this.$message.error(this.$t('error.offline_notify'))
      }
    });

    eventbus.$on('unCompletefileNum', (num, netWorkType) => {
      if (num > 99) {
        this.taskLength = '99+'
      } else {
        this.taskLength = num
      }
    })
    window.addEventListener('keydown', this.enter)
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.enter)
  },
  methods: {
    showDownUpCover() {
      eventbus.$emit('showDownUpCover',this.netWorkType)
    },
    keyup() {
      this.input = this.input.replace(
        /[`~!@#$%^&*()\-+=<>?:"{}|,.\/;'\\[\]·~！@#￥%……&*（）——\-+={}|《》？：“”【】、；‘’，。、]/g,
        '',
      )
    },
  },
}
</script>

<style lang="scss">
.renwu {
  width: 34px;
  height: 34px;
  cursor: pointer;
}
.poi4 {
  animation-name: donghua1;
  animation-duration: 0.9s;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}
@keyframes donghua1 {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
.taskLength {
  position: absolute;
  top: 0;
  right: 0;
  background: red;
  width: 16px;
  height: 16px;
  text-align: center;
  border-radius: 50%;
  span {
    color: white;
    font-size: 20px;
    display: inline-block;
    transform: scale(0.5);
    font-weight: 800;
    margin-left: -2px;
    margin-top: -2px;
    z-index: 1;
  }
}
</style>
