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

<script lang="ts" setup>
const emit = defineEmits(['update:value'])
const props = defineProps(['value'])
</script>

<template>
  <div class="pointer">
    <img
      v-show="!props.value"
      class="hover-check"
      src="@/assets/switch-close.png"
      alt=""
      draggable="false"
      @click="$emit('update:value',true)"
    />
    <img v-show="props.value" class="checked" alt="" src="@/assets/switch-open.png" draggable="false"  @click="$emit('update:value',false)"/>
  </div>
</template>

<style lang="scss" scoped>
.hover-check,
.checked {
  width: 44px;
  height: 22px;
}
</style>
