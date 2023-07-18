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
  <div>
    <div class="y-center pointer" @click="show = true">
      <div class="color-blue fw-b mr-7" >{{ $t(menuName) }}</div>
      <img src="@/assets/arrow.svg" />
    </div>
    <el-dialog v-model="show" :show-close="false" :modal="false">
      <div class="menu pointer" @click="gotoPage('')">{{ $t("space.home_all")}}</div>
      <div class="menu pointer" @click="gotoPage('picture')">{{ $t("space.home_photo")}}</div>
      <div class="menu pointer" @click="gotoPage('video')">{{ $t("space.home_video")}}</div>
      <div class="menu pointer" @click="gotoPage('document')">{{ $t("space.home_document")}}</div>
      <div class="menu pointer" @click="gotoPage('other')">{{ $t("space.home_other")}}</div>
    </el-dialog>
  </div>
</template>

<script>
import { genText } from '@/utils/constant'
export default {
  name: 'fileFilter',
  props: {
    category: String
  },
  data() {
    return {
      show: false,
      menuName: 'space.home_all'
    }
  },
  mounted() {
     this.menuName = genText(this.category,true)
  },
  methods: {
    gotoPage(category) {
      this.show = false
      if (category.length == 0) {
        this.$router.push({ path: '/home/space' })
      } else {
        this.$router.push({ path: '/home/space', query: { category } })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
::v-deep(.el-dialog) {
  position: absolute;
  top: 110px;
  right: 100px;
  width: 116px;
  height: 170px;
  background: #ffffff;
  border-radius: 6px;
  margin: 0px;
}

::v-deep(.el-dialog__body) {
  padding: 10px 0px;
}

::v-deep(.el-dialog__header) {
  display: none;
}
.el-divider--horizontal {
  margin: 10px 0px;
}
.menu {
  padding: 7px 20px;
  font-size: 14px;
  text-align: center;
  &:hover {
    color: #337aff;
    background-color: #eaf1ff;
  }
}

.disabled-button {
  background: #f5f6fa !important;
  color: #dfe0e5 !important;
}
</style>
