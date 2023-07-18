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
    <div :class="isMobile ? 'downContainer-mobile' : 'downContainer'">
      <div class="title">
        <div class="fw-b black">如何查看授权码</div>
        <el-icon @click="close" style="font-size: 18px">
          <Close></Close>
        </el-icon>
      </div>
      <div class='black-14 body'>
        <div class="item">
          1. 为了防止用户数据被劫持，保障空间内的数据安全，在登录时，需输入本次登录的授权码。
        </div>
        <div class="item">2. 扫码授权登录：授权手机扫码后，页面会显示授权码。</div>
        <div class="item">3. 域名授权登录（仅局域网内使用）：打开身份验证器，查看账号显示的 6 位一次性密码。</div>
        <div class="item">4. 授权码为 6 位数字，有效时间 30 秒，过期自动刷新。</div>
        <div class="flex-x-center code">
          <div class="flex-column flex-xy-center mid-img">
            <img class='img' src="@/assets/pic_1@2x.png" />
            <div class="gray-12 mt-14 mb-20">傲空间 App 首页 - 扫一扫 - 登录授权码</div>
          </div>
          <div class="flex-column flex-xy-center">
            <img class='img' src="@/assets/pic_2@2x.png" />
            <div class="gray-12 mt-14 mb-20">身份验证器 - 账户 - 一次性密码</div>
          </div>
        </div>
      </div>
    </div>
  </cover>
</template>
<script lang="ts">
import { computed, defineComponent } from 'vue'
import cover from '@/components/cover.vue'
import { reactive, toRefs } from 'vue'
import { useStore } from 'vuex'
import { isMobile } from '@/utils/help'
export default defineComponent({
  components: { cover },
  props: { floderData: Object },
  emits: ['sure', 'cancel'],
  setup(props, { emit }) {
    const store = useStore()
    let selectedFloderId = computed(() => {
      return store.state.floderId
    })
    let mobile = isMobile()
    //console.log(mobile)
    const state = reactive({
      title: '',
      content: '',
      showcancel: true,
      canClick: false,
      isMobile: mobile,
    })
    const sure = () => {
      emit('sure')
    }
    const cancel = () => {
      emit('cancel')
    }
    const close = () => {
      emit('cancel')
    }
    return {
      ...toRefs(state),
      sure,
      cancel,
      close,
      selectedFloderId,
    }
  },
})
</script>

<style lang="scss" scoped>
.img {
  width: 190px;
  height: 200px;
}
.item{
  line-height: 22px;
}
.downContainer {
  width: 800px;
  background: #fff;
  border-radius: 6px;
  color: #85899c;
  z-index: 1000;
  .title{
    display: flex;
    border-bottom: solid 1px #ECEEF4;
    padding: 18px 20px;
    font-size: 16px;
    div{
      flex:1;
    }
  }
  .body {
    padding: 32px 40px 12px 40px;
  }
  .code{
    margin-top: 30px;
  }
  .mid-img{
    margin-right: 100px;
  }
}

.downContainer-mobile {
  height: 80vh;
  overflow-y: auto;
  width: 300px;
  .title{
    font-size: 18px;
    border:none;
    padding: 22px 20px;
    div{
      text-align: center;
    }
  }
  .body {
    padding: 0 29px;
  }
  .code{
    margin-top: 20px;
    flex-direction: column;
  }
  .mid-img{
    margin: 0;
  }
  @extend .downContainer
}
</style>
