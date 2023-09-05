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
  <div class="search y-center" @mouseover="showClear" @mouseout="hideClear">
    <input
      id="ser_input_search"
      v-model="input"
      :placeholder="$t('buttons.common_search')"
      type="text"
      @blur="inputBlur"
      @focus="inputFocus"
      autocomplete="off"
    />
    <img
      v-show="(clearShow || onFocus) && input.length > 0"
      src="@/assets/del-album.svg"
      class="ml-5 pointer"
      @click="clearSearch"
    />
    <div class="xy-center mr0 ml-auto pointer">
      <img src="@/assets/s.svg" alt="" @click="search" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'SearchNew',
  emits: ['handleChange'],
  data() {
    return {
      input:'',
      clearShow: false,
      onFocus: false
    }
  },
  mounted() {
    this.enter = this.enter.bind(this)
    window.addEventListener('keydown', this.enter)
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.enter)
  },
  methods: {
    showClear() {
      this.clearShow = true
    },
    hideClear() {
      this.clearShow = false
    },
    inputBlur() {
      this.onFocus = false
    },
    inputFocus() {
      this.onFocus = true
    },
    clearSearch() {
      this.input = ''
      this.search()
    },
    search() {
      let name = this.input.trim();
      this.$emit('handleChange', name)
    },
    enter(e) {
      if (e.key == 'Enter') {
        let element = document.activeElement
        if (element.id == 'ser_input_search') {
          this.search()
        }
      }
    }
  }
}
</script>

<style lang="scss">
.search {
  width: 300px;
  height: 34px;
  background-color: #f5f6fa;
  border-radius: 6px;
  padding-left: 10px;
  div {
    width: 34px;
    height: 34px;
    background: #337aff;
    border-radius: 6px;
  }
  input {
    width: 220px;
    background-color: #f5f6fa;
    border: none;
    outline: none;
    color: #464956;
  }
}
</style>
