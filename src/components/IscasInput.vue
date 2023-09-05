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
  <div class="flex">
    <div
      class="iscasInput y-center"
      :class="{ border: showBorder }"
      @mouseover="showClear"
      @mouseout="hideClear"
    >
      <input
        :value="modelValue"
        :placeholder="placeholder"
        :type="inputType"
        @change="change"
        @input="inputChange"
        @focus="showBorder = true"
        @blur="showBorder = false"
        autocomplete="off"
      />
      <img
        v-show="clearShow && modelValue.length > 0"
        src="@/assets/del-album.svg"
        class="ml-5 pointer"
        @click="clear"
      />
    </div>
    <img
      v-show="type === 'password'"
      src="@/assets/eye.svg"
      class="ml-5 pointer"
      @click="showPassword"
    />
  </div>
</template>

<script>
export default {
  name: 'IscasInput',
  emits: ['change', 'update:modelValue'],
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: 'text'
    },
    placeholder: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      clearShow: false,
      inputType: this.type,
      showBorder: false
    }
  },
  methods: {
    showPassword() {
      if (this.inputType === 'text') {
        this.inputType = 'password'
      } else {
        this.inputType = 'text'
      }
    },
    showClear() {
      this.clearShow = true
    },
    hideClear() {
      this.clearShow = false
    },
    change() {
      this.$emit('change')
    },
    inputChange(event) {
      this.$emit('update:modelValue', event.target.value)
    },
    clear() {
      this.$emit('update:modelValue', '')
    }
  }
}
</script>

<style scoped lang="scss">
.iscasInput {
  width: 100%;
  height: 34px;
  color: #bcbfcd;
  background-color: #f5f6fa;
  border-radius: 6px;
  padding: 0 10px;
  input {
    flex:1;
    background-color: #f5f6fa;
    border: none;
    outline: none;
    color: #464956;
    &:-webkit-autofill {
      transition: background-color 5000s ease-in-out 0s;
    }
  }
}
.border {
  border: 1px solid #337aff;
}
</style>
