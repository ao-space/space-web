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
  <div class='button-blue' :class="{'loading':loading}">
    <img v-show='loading' alt="" class="img-15 run mr-5" src="@/assets/loading@2x-white.png" />
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'IscasButton',
  props:{
    loading:{
      type:Boolean,
      default: false,
    }
  }
}
</script>

<style scoped>
.button-blue{
  width: 100px;
  background: linear-gradient(to right, #337AFF , #16B9FF);
}
.loading{
  background: linear-gradient(to right, #C2D8FF , #B9EAFF);
}
</style>