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
  <div class="item font12" :style="{ 'background: rgba(51, 122, 255, 0.1);': item.status === 3 }">
    <div class="flex y-center" style="width: 200px">
      <img :src="genSrc()" class="filetype" />
      <span class="ml10 fw500 color-one overflow-ellipsis w95">
        {{ fileName }}
      </span>
    </div>
    <div>
      <span class="color-three">{{ actionName }}</span>
    </div>
    <div>
      {{ genTime() }}
    </div>
    <div class="color-two">
      {{ statusName }}
    </div>
  </div>
</template>

<script>
import { genSrc } from '@/assets/resourceMap.js'
import dayjs from 'dayjs'
import { t } from '@/language/index'

export default {
  props: {
    item: Object
  },
  emits: ['callback'],
  data() {
    return {
      actionNameMap: {
        1: t('notify.create'),
        2: t('notify.move'),
        3: t('notify.delete'),
        4: t('notify.rename'),
        5: t('notify.copy'),
        6: t('notify.restore'),
        7: t('notify.clear_restore'),
      },
      statusMap: {
        1: t('notify.wait_execution'),
        2: t('notify.opera_fail'),
        3: t('notify.opera_suc')
      },
      statusName: '',
      actionName: '',
      fileName: '',
      targetFileInfo: {},
    }
  },
  computed: {
    moreFile() {
      return Array.isArray(this.item.targetFileInfo) && this.item.targetFileInfo.length > 1
    }
  },
  mounted() {
    this.statusName = this.statusMap[this.item.status]
    this.actionName = this.actionNameMap[this.item.actionType]

    if (Array.isArray(this.item.targetFileInfo)) {
      this.targetFileInfo = this.item.targetFileInfo[0]
    } else {
      this.targetFileInfo = this.item.targetFileInfo
    }
    if (this.moreFile) {
      this.fileName = t('notify.many_files',{name:this.targetFileInfo.name,count:this.item.targetFileInfo.length})
    } else {
      this.fileName = this.targetFileInfo.name
    }

    // 通知外面是成功还是失败
    setTimeout(() => {
      this.$emit('callback', {
        action: this.actionName,
        fileName: this.fileName,
        reason: this.statusName
      })
    }, 500)
  },
  methods: {
    genTime() {
      return dayjs(this.targetFileInfo.createdAt).format('YYYY-MM-DD HH:mm:ss')
    },
    genSrc() {
      if (this.moreFile) {
        return genSrc({ is_moreFile: true })
      }
      return genSrc(this.targetFileInfo)
    }
  }
}
</script>

<style lang="scss" scoped>
.color-three {
  color: #85899c;
}

.second-span {
  margin: 0 4px;
}
.w104 {
  max-width: 104px;
  display: inline-block;
  vertical-align: bottom;
}
.w95 {
  width: 95px;
}
.filetype {
  width: 50px;
  height: 50px;
}

.color-one {
  color: #464956;
}
.ml10 {
  margin-left: 10px;
}
.fw500 {
  font-weight: 500;
}
.fw200 {
  font-weight: 200;
}
.color-two {
  color: #f6222d;
}
.item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 10px 20px 0px;
  width: 720px;
  border-bottom: #eceef4 1px solid;
}
</style>
