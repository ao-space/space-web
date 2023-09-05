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
  <el-menu>
    <el-menu-item index="1"><i class="el-icon-s-home el-font"></i>首页</el-menu-item>
    <el-menu-item index="2"><i class="el-icon-s-cooperation"></i>文件</el-menu-item>
    <el-menu-item index="3" @click="goto('/Mobilebox')"
      ><i class="el-icon-s-comment"></i>信箱</el-menu-item
    >
    <el-menu-item index="4"><i class="el-icon-delete-solid"></i>回收</el-menu-item>
    <el-menu-item index="5" @click="goto('/Bluelan')"
      ><i class="el-icon-connection"></i>蓝牙</el-menu-item
    >
    <el-menu-item index="6" @click="goto('/Crypto')"
      ><i class="el-icon-unlock"></i>密钥</el-menu-item
    >
    <el-menu-item index="7" @click="goto('/Test')"><i class="el-icon-box"></i>测试</el-menu-item>
  </el-menu>
</template>

<script>
export default {
  name: 'Left',
  methods: {
    goto(path) {
      console.log(this.$router)
      this.$router.push(path)
    },
  },
}
</script>

<style scoped>
.el-menu {
  border-right-width: 0px;
  width: 17.6vw !important;
}

.el-menu-item {
  font-size: 1.3vw;
  font-weight: normal;
  height: 13vh;
  width: 100% !important;
  padding-top: 3.7vh;
  padding-left: 0vw !important;
  padding-right: 0vw !important;
}

.el-menu-item [class^='el-icon-'] {
  margin-right: 5px !important;
  width: 2.3vw;
}

.el-menu-item i {
  font-size: 1.3vw;
  color: #303133;
  padding-left: 0.1vw;
  padding-right: 0.3vw;
}
</style>
