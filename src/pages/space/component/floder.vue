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
  <div class="floder" @click="chooseFloder" :style="genStyle()">
    <div class="dib" :class="down ? 'down' : 'out'" @click.stop="triggerFloder"></div>
    <img src="@/assets/floder.png" />
    <span>{{ floderData.name }}</span>
  </div>
  <div v-show="down">
    <floder
      v-for="(item, index) in child"
      :key="index"
      :floder-data="item"
      :floderIdScope="newfloderIdScope"
      :depth="depth + 1"
    ></floder>
  </div>
</template>
<script lang="ts">
import { queryFilelist } from '@/api/index'
import { defineComponent, reactive, toRefs, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
export default defineComponent({
  props: {
    floderData: Object,
    depth: Number,
    floderIdScope: {
      // floderId 祖先练 [grandParentFloderId,parentFloderId]
      type: Array,
      default: [],
    },
  },
  name: 'floder',
  setup(props, context) {
    const { floderData, floderIdScope } = props
    onMounted(() => {
      //   console.log(floderData)
    })
    const hasChild = () => {
      return floderData && floderData.child && floderData.child.length > 0
    }
    const store = useStore()
    let selectedFloderId = computed(() => {
      return store.state.floderId
    })
    // 把自己的uuid加进floderId 链
    let newfloderIdScope = [].concat(floderIdScope)
    newfloderIdScope.push(floderData.uuid)
    let child = computed(() => {
      if (floderData.child && floderData.child.length > 0) {
        return floderData.child.filter((item) => {
          return item.isDir == true
        })
      }
      return []
    })
    const state = reactive({
      down: false,
      choose: false,
      child: child.value || [],
      querying: false,
      newfloderIdScope: newfloderIdScope,
    })
    const chooseFloder = () => {
      console.log('selectedFloderId', selectedFloderId)
      if (selectedFloderId.value === floderData.uuid) {
        store.commit('setFloderId', '')
        store.commit('setFloderIdScope', '')
      } else {
        store.commit('setFloderId', floderData.uuid)
        store.commit('setFloderIdScope', newfloderIdScope)
      }
    }
    const genStyle = () => {
      return `padding-left:${10+props.depth * 10}px;${
        selectedFloderId.value === floderData.uuid ? 'background: rgba(51, 122, 255, 0.1);' : ''
      }`
    }
    const triggerFloder = () => {
      state.down = !state.down
      if (!state.querying && state.child.length == 0) {
        state.querying = true
        // 这里的uuid = -1 代表前端的根目录,但后端根目录的uuid 为空
        queryFilelist({
          uuid: floderData.uuid != -1 ? floderData.uuid : '',
          pageSize: 100000,
          page: 1,
        }).then((res) => {
          if (res.results.fileList) {
            state.child = res.results.fileList.filter((item) => {
              return item.isDir
            })
          }
        })
      }
    }
    return {
      ...toRefs(state),
      chooseFloder,
      genStyle,
      triggerFloder,
    }
  },
})
</script>

<style lang="scss" scoped>
.floder {
  width: 100%;
  height: 60px;
  font-size: 0px;
  display: flex;
  align-items: center;
  cursor: pointer;
  &:hover {
    background: rgba(51, 122, 255, 0.1);
  }
  > img {
    height: 50px;
    width: 50px;
    margin-right: 10px;
    margin-left: 10px;
  }
  > span {
    color: #85899c;
    font-size: 12px;
  }
}
.down {
  height: 0;
  width: 12px;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid #bcbfcd;
}

.out {
  height: 0;
  width: 12px;
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
  border-left: 6px solid #bcbfcd;
}
</style>
