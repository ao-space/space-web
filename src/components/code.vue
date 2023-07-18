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
  <div :class="{'input-box':!isMobile,'mobile-box':isMobile}">
    <div
      class="input-content"
      @keydown="keydown"
      @keyup="keyup"
      @paste="paste"
      @input="inputEvent"
    >
      <input
        max="9"
        min="0"
        maxlength="1"
        data-index="0"
        v-model.trim.number="input[0]"
        type="number"
        ref="firstInput"
      />
      <input v-for='(index) in size-1'
        max="9"
        min="0"
        maxlength="1"
        :data-index="index"
        v-model.trim.number="input[index]"
        type="number"
      />
    </div>
  </div>
</template>
<script>
import { isMobile } from '@/utils/help'

export default {
  props: {
    size:Number,
    code: {
      type: String,
      default: '',
    },
  },
  emits: ['inputCode'],
  computed: {
    input() {
      if (new RegExp('^\\d{' + this.size + '}$', 'g').test(this.code.toString())) {
        return this.code.toString().split('')
      } else if (this.pasteResult.length === this.size) {
        return this.pasteResult
      } else {
        return new Array(this.size)
      }
    },
  },
  data() {
    return {
      pasteResult: [],
      isMobile: isMobile()
    }
  },
  mounted() {
    // 等待dom渲染完成，在执行focus,否则无法获取到焦点
    this.$nextTick(() => {
      this.$refs.firstInput.focus()
    })
  },
  methods: {
    // 解决一个输入框输入多个字符
    inputEvent(e) {
      const index = e.target.dataset.index * 1
      const el = e.target
      el.value = el.value.replace(/Digit|Numpad/i, '')
      this.input[index] = el.value
      //   this.$set(this.input, index, el.value)
    },
    clear() {
      for(let i=0;i < this.size;i++){
        this.input[i] = ''
      }
      this.$forceUpdate();
      this.$refs.firstInput.focus()
    },
    keydown(e) {
      const index = e.target.dataset.index * 1
      const el = e.target
      if (e.key === 'Backspace') {
        if (this.input[index] && this.input[index].length > 0) {
          this.input[index] = ''
          this.$forceUpdate()
        } else {
          if (el.previousElementSibling) {
            el.previousElementSibling.focus()
            this.input[index - 1] = ''
          }
        }
      } else if (e.key === 'Delete') {
        if (this.input[index].length > 0) {
          this.input[index] = ''
        } else {
          if (el.nextElementSibling) {
            this.input[1] = ''
          }
        }
        if (el.nextElementSibling) {
          el.nextElementSibling.focus()
        }
      } else if (e.key === 'Home') {
        el.parentElement.children[0] && el.parentElement.children[0].focus()
      } else if (e.key === 'End') {
        el.parentElement.children[this.input.length - 1] &&
          el.parentElement.children[this.input.length - 1].focus()
      } else if (e.key === 'ArrowLeft') {
        if (el.previousElementSibling) {
          el.previousElementSibling.focus()
        }
      } else if (e.key === 'ArrowRight') {
        if (el.nextElementSibling) {
          el.nextElementSibling.focus()
        }
      } else if (e.key === 'ArrowUp') {
        if (this.input[index] * 1 < 9) {
          this.input[index] = (this.input[index] * 1 + 1).toString()
        }
      } else if (e.key === 'ArrowDown') {
        if (this.input[index] * 1 > 0) {
          this.input[index] = (this.input[index] * 1 - 1).toString()
        }
      }
    },
    keyup(e) {
      const index = e.target.dataset.index * 1
      const el = e.target
      // 解决输入e的问题
      el.value = el.value.replace(/Digit|Numpad/i, '').slice(0, 1)
      if (/\d/i.test(el.value)) {
        // 必须在这里符直，否则输入框会是空值
        this.input[index] = el.value || e.code.replace(/Digit|Numpad/i, '')
        el.nextElementSibling && el.nextElementSibling.focus()
        if (!el.nextElementSibling) {
          el.blur()
        }
      } else {
        if (this.input[index] === '') {
          this.input[index] = ''
        }
      }
      this.$emit('inputCode', this.input)
    },
    mousewheel(e) {
      const index = e.target.dataset.index
      if (e.wheelDelta > 0) {
        if (this.input[index] * 1 < 9) {
          this.input[index] = (this.input[index] * 1 + 1).toString()
        }
      } else if (e.wheelDelta < 0) {
        if (this.input[index] * 1 > 0) {
          this.input[index] = (this.input[index] * 1 - 1).toString()
        }
      } else if (e.key === 'Enter') {
        if (this.input.join('').length === this.size) {
          document.activeElement.blur()
        }
      }
      this.$emit('inputCode', this.input)
    },
    paste(e) {
      // 当进行粘贴时
      e.clipboardData.items[0].getAsString((str) => {
        if (str.toString().length === this.size) {
          this.pasteResult = str.split('')
          document.activeElement.blur()
          this.$emit('inputCode', this.input)
          this.pasteResult = []
        } else {
          // 如果粘贴内容不合规，清除所有内容
          this.input[0] = new Array(this.size)
        }
      })
    },
  },
}
</script>
<style scoped lang="scss">
.input-box {
  .input-content {
    display: flex;
    align-items: center;
    input {
      color: inherit;
      outline: none;
      border-radius: 6px;
      border: 1px solid #9A9A9A;
      height: 88px;
      width: 56px;
      font-size: 44px;
      text-align: center;
      &:focus {
        border: 1px solid #337AFF;
      }
    }
    input+input{
      margin-left: 29px;
    }
  }
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none !important;
    margin: 0;
  }
  /* 火狐 */
  input[type='number'] {
    -moz-appearance: textfield;
    padding: 0;
  }
}
.mobile-box{
  .input-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    input {
      color: inherit;
      outline: none;
      border-radius: 6px;
      border: 1px solid #9A9A9A;
      height: 70px;
      width: 42px;
      font-size: 44px;
      text-align: center;
      &:focus {
        border: 1px solid #337AFF;
      }
    }
    input+input{
      margin-left: 0;
    }
  }

  @extend .input-box
}
</style>
