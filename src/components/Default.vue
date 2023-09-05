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
  <div class="right">
    <span class="welcom">欢 迎 您 来 到 傲 来 空 间</span>
  </div>
</template>

<script>
export default {
  name: 'Default',
}
</script>

<style scoped>
.right {
  background-image: url(../assets/back.jpg);
  background-repeat: no-repeat;
  background-attachment: scroll;
  background-position: center;
  height: 100%;
  width: 100%;
}
.welcom {
  font-size: 3vw;
  text-align: center;
  display: inline-block;
  padding-top: 3vh;
  color: #409eff;
}
</style>
