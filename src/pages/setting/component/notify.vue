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
    <div class="title mt20 mb20">
      {{ $t('notify.message_title') }}
    </div>
    <Table
      ref="questionTable"
      :dataModal="tableStruct"
      :fetchFunction="fetchFunction"
      size="small"
      :unNeedPagination="true"
      :stripe='true'
    >
      <template v-slot="scope">
        <span v-if="scope.$label == $t('setting.login_last_time')">{{ parseTime(scope.row.loginTime) }}</span>
        <div v-if="scope.$label == $t('setting.terminal_name')" class="y-center">
          <span>{{ scope.row.terminalModel }}</span>
          <img v-show="scope.row.isSelf" class="little-title" src="@/assets/dangqian.png" />
          <img v-show="scope.row.isBangding" src="@/assets/bangding.png" class="little-title" />
        </div>
        {{ scope.$label == $t('setting.login_location') ? dealAddress(scope.row.address) : '' }}
        <span
          v-if="scope.$label == $t('setting.operation') && !scope.row.isSelf && !scope.row.isBangding"
          class="xiaxian pointer"
          @click="offline(scope.row)"
        >
          {{ $t('setting.offline') }}
        </span>
      </template>
    </Table>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import Table from '@/components/table.vue'
import { tableStruct } from './index-column'
import { terminalAllInfo, getTerminalInfo, terminalInfoDelete } from '@/api/terminal'
import { showSureModal } from '@/utils/toast'
import { ElMessage } from 'element-plus'
import { errorCodeMap } from '@/utils/constant'
import dayjs from 'dayjs'
export default defineComponent({
  components: { Table },
  data() {
    return {
      tableStruct,
    }
  },
  methods: {
    fetchFunction(pageParams) {
      return Promise.all([terminalAllInfo(), getTerminalInfo()]).then((res) => {
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
        return {
          dataList: allInfo.results,
          total: allInfo.results.length,
        }
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
              this.$refs.questionTable.queryData()
            } else {
              ElMessage.error(this.$t('setting.offline_fail',{error: (errorCodeMap[res.code] || res.message)}))
              this.$refs.questionTable.queryData()
            }
          })
        },
        cancel: () => {
            console.log('取消')
        },
      })
    },
  },
})
</script>

<style lang="scss" scoped>
.notify-container {
}
.title {
  font-size: 14px;
  font-weight: 400;
  color: #85899c;
}

::v-deep .el-table th.el-table__cell > .cell {
  font-size: 14px;
  font-weight: 500;
  color: #464956;
}

.little-title {
  width: 40px;
  height: 16px;
  margin-left: 4px;
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
