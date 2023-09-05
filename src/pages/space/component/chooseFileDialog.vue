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
        <span>{{ $t('space.select_folder') }}</span>
        <el-icon @click="close" style="font-size: 18px" class="close">
          <Close></Close>
        </el-icon>
      </div>
      <div class="line"></div>
      <div class="detail font12">
        <floder :floderData="floderData" :depth="1" />
      </div>
      <div class="tr pt-20 pb-20 pr-20">
        <div v-if="selectedFloderId" class="button-tmp dib button-one pointer" @click="sure">
          {{ $t('buttons.common_ok') }}
        </div>
        <div v-else class="button-tmp dib disable">{{ $t('buttons.common_ok') }}</div>
        <div class="button-tmp dib button-two pointer" @click="cancel">{{ $t('buttons.common_cancel') }}</div>
      </div>
    </div>
  </cover>
</template>
<script lang="ts">
import { computed, defineComponent } from 'vue'
import cover from '@/components/cover.vue'
import { reactive, toRefs } from 'vue'
import floder from './floder.vue'
import { useStore } from 'vuex'
export default defineComponent({
  components: { cover, floder },
  props: { floderData: Object },
  emits: ['sure', 'cancel'],
  setup(props, { emit }) {
    const store = useStore()
    let selectedFloderId = computed(() => {
      return store.state.floderId
    })
    let floderIdScope = computed(() => {
      return store.state.floderIdScope
    })

    const state = reactive({
      title: '',
      content: '',
      showcancel: true,
      canClick: false,
    })
    const sure = () => {
      emit('sure', selectedFloderId.value, floderIdScope.value)
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
.button-tmp {
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
  color: white;
  margin-left: 20px;
  background: #337aff;
}
.downContainer {
  width: 800px;
  background: #fff;
  border-radius: 6px;
  color: #85899c;
  z-index: 1000;
}
.m20 {
  margin: 20px;
}
.line {
  width: 100%;
  background: #eceef4;
  height: 1px;
  margin-top: -1px;
}
.detail {
  height: 375px;
  overflow: auto;
}
</style>
