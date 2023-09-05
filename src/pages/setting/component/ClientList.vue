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
  <div class="notify-container">
    <div class="title mt20 mb20 wb">
      {{ $t('setting.terminal_desc') }}
      <span class='color-blue'>{{ $t('setting.ip_reference') }}</span>
    </div>
    <el-table stripe :data="dataList">
      <el-table-column :label="$t('setting.terminal_name')" width="240">
        <template #default="scope">
          <div class='y-center'>
            <span>{{ scope.row.terminalModel }}</span>
            <div v-if="scope.row.isSelf"  class="little-title">{{ $t('setting.current_device') }}</div>
            <div v-if="scope.row.isBangding" class="little-title" >{{ $t('setting.bound_device') }}</div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="terminalType" :label="$t('setting.terminal_type')" width="150" />
      <el-table-column :label="$t('setting.login_location')" width="150">
        <template #default="scope">
          {{ dealAddress(scope.row.address) }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('setting.login_last_time')" width="200">
        <template #default="scope">
          {{ parseTime(scope.row.loginTime) }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('setting.operation')">
        <template #default="scope">
          <span
            v-if="!scope.row.isSelf && !scope.row.isBangding"
            class="xiaxian pointer"
            @click="offline(scope.row)"
          >
            {{ $t('setting.offline') }}
          </span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { terminalAllInfo, getTerminalInfo, terminalInfoDelete } from '@/api/terminal'
import { showSureModal } from '@/utils/toast'
import { ElMessage } from 'element-plus'
import { errorCodeMap } from '@/utils/constant'
import dayjs from 'dayjs'

export default defineComponent({
  data() {
    return {
      dataList:[],
    }
  },
  mounted() {
    this.queryData();
  },
  methods: {

    queryData(){
      let safe = this;
      Promise.all([terminalAllInfo(), getTerminalInfo()]).then((res) => {
        let [allInfo, terminalInfo] = res
        let clientUUID = localStorage.getItem('clientUUID')

        let terInfo = terminalInfo && terminalInfo?.results[0]
        let results = allInfo.results
        results.forEach((item) => {
          if (item.uuid == clientUUID) {
            item.isSelf = true
          }
          if (item.uuid == terInfo.clientUUID) {
            item.isBangding = true
          }
        })
        safe.dataList = allInfo.results
      })
    },
    parseTime(time) {
      return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
    },
    dealAddress(address) {
      return address && address.split('|')[3]
    },
    offline(row) {
      showSureModal({
        title: this.$t('setting.offline_terminal'),
        content: this.$t('setting.offline_confirm'),
        sure: () => {
          terminalInfoDelete({ aoid: row.aoid, clientUUID: row.uuid }).then((res) => {
            if (res.code == 'ACC-200' || res.code == 'ACC-4034') {
              ElMessage.success(this.$t('setting.offline_success'))
              this.queryData();
            } else {
              ElMessage.error(this.$t('setting.offline_fail', {error:(errorCodeMap[res.code] || res.message)}))
              this.queryData();
            }
          })
        },
        cancel: () => {
            console.log('取消')
        }
      })
    }
  }
})
</script>

<style lang="scss" scoped>
.notify-container {
}
.title {
  font-size: 12px;
  font-weight: 400;
  color: #85899c;
}

::v-deep(.el-table th.el-table__cell > .cell) {
  font-size: 14px;
  font-weight: 500;
  color: #464956;
}

.little-title {
  height: 16px;
  background: #FFFFFF;
  border-radius: 8px;
  border: 1px solid #337AFF;
  margin-left: 4px;
  font-size: 12px;
  color: #337AFF;
  line-height: 14px;
  padding: 0 5px;
}

.xiaxian {
  width: 78px;
  height: 30px;
  line-height: 30px;
  text-align: center;
  background: #eaf1ff;
  border-radius: 6px;
  display: inline-block;
}
</style>
