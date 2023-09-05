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
  <el-input
    class="ser flex x-center"
    clearable
    v-model.trim="input"
    size="small"
    placeholder="搜索我的文件"
    id="ser_input_search"
    maxlength="10"
    show-word-limit
  >
    <template #append>
      <div
        class="flex x-center y-center xy-center"
        style="width: 34px; height: 34px; background: #337aff; border-radius: 6px; cursor: pointer"
      >
        <img src="@/assets/s.png" alt="" @click="sear" />
      </div>
    </template>
  </el-input>
  <div
    class="flex x-center y-center xy-center pointer"
    style="position: relative"
    @click="showDownUpCover"
  >
    <img
      src="@/assets/renwu.svg"
      alt=""
      class="renwu ml20"
      v-if="netWorkType == 1 && taskLength == 0"
    />
    <img
      src="@/assets/jyw@2x.png"
      alt=""
      class="renwu ml20"
      v-if="netWorkType == 2 && taskLength == 0"
    />
    <img
      src="@/assets/chuanshu_1@2x.png"
      alt=""
      class="renwu ml20 poi4"
      v-if="netWorkType == 1 && taskLength != 0"
    />
    <img
      src="@/assets/chuanshu_2@2x.png"
      alt=""
      class="renwu ml20 poi4"
      v-if="netWorkType == 2 && taskLength != 0"
    />
    <div class="taskLength flex xy-center" v-show="taskLength">
      <span>{{ taskLength }}</span>
    </div>
  </div>
</template>

<script>
import eventbus from '@/utils/eventbus'
export default {
  name: 'sear',
  data() {
    return {
      input: '',
      taskLength: 0,
      netWorkType: 1, // 1 代表wifi 2代表局域网
    }
  },
  props: ['category'],
  emits: ['handleChange'],
  mounted() {
    this.enter = this.enter.bind(this)
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
      eventbus.$emit('showDownUpCover')
    },
    sear() {
      let name = this.input
      this.$emit('handleChange', name)
    },
    enter(e) {
      if (e.key == 'Enter') {
        let element = document.activeElement
        if (element.id == 'ser_input_search') {
          this.sear()
        }
      }
    },
  },
}
</script>

<style lang="scss">
.ser {
  width: 300px;
  height: 32px;
  background: #f5f6fa;
  border-radius: 6px;
  text-align: right;
  margin-left: 0px;
}
.el-input-group__append {
  //padding: 0px 0px 0px 7px;
  //margin: 0px 0px 0px 7px;
  //border: 0px;
  padding:0px;
}
.el-input-group__prepend {
  //padding: 0px 0px 0px 7px;
  //margin: 0px 0px 0px 7px;
  padding:0px;
}
.el-input--small .el-input__inner {
  height: 34px;
  line-height: 34px;
}
.el-input__suffix.span {
  background: #f5f6fa;
}
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
