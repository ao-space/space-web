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
  <el-container class="content">
    <el-header>
      <img class="pic" src="@/assets/logo.png" />
    </el-header>
    <el-container>
      <el-aside><Left /></el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import Left from './Left.vue'
import Default from './Default.vue'

export default {
  name: 'layout',
  components: {
    Left,
    Default,
  },
}
</script>

<style scoped>
.el-header {
  padding-left: 1.3vw;
  padding-top: 1vh;
  padding-bottom: 1vh;
  box-shadow: 0px 2px 5px #000;
  text-align: left;
}
.content {
  height: 100vh;
}
.el-aside {
  margin-top: 0.7vh;
  border-right: solid 1px #dcdfe6;
  width: 17.7vw !important;
}
.pic {
  height: 100%;
  text-align: left;
}
</style>
