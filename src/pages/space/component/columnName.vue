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
  <div class="column-div pointer" @click="sortFn()">
    <span style="margin-right: 6px; font-weight: 500">{{ columnName }}</span>
    <div v-if="!serflag">
      <img
        src="@/assets/desc.png"
        class="sort-img"
        v-show="sortType == 'desc' && showImg"
        v-throttle="100"
      />
      <img
        src="@/assets/asc.png"
        class="sort-img"
        v-show="sortType == 'asc' && showImg"
        v-throttle="100"
      />

      <img
        src="@/assets/sortpng.png"
        class="sort-img"
        v-show="!showImg"
        v-throttle="100"
      />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    columnName: {
      type: String,
      default: '',
    },
    defalutSortType: {
      type: String,
      default: 'desc',
    },
    serflag: {
      type: Boolean,
      default: false,
    },
    sortColumn: String, // updated_time
    currentSort: String, // name desc updated_time desc
  },
  emits: ['sortFn'],
  data() {
    return {
      sortType: this.defalutSortType, // desc 降 || asc 升
    }
  },
  computed: {
    showImg() {
      let sortColumn = this.currentSort.split(' ')[0]
      return sortColumn == this.sortColumn
    },
  },
  methods: {
    sortFn() {
      if (this.sortType == 'desc') {
        this.sortType = 'asc'
      } else {
        this.sortType = 'desc'
      }
      this.$emit('sortFn', this.sortType)
    },
    resetSortType() {
      this.sortType = 'desc'
    },
  },
}
</script>

<style lang="scss" scoped>
.sort-img {
  width: 12px;
  height: 12px;
}
.column-div {
  font-size: 14px;
  color: #464956;
  div {
    display: inline-block;
  }
}
</style>
