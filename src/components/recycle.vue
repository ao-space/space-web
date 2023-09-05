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
  <div class="rec">
    <div class="pl16 pr16 pt10 pb10 y-center">
      <div class="flex">
        <div class="button-img pointer" style="" @click="showClearCover">
          <img class="img" alt="" src="@/assets/qingkong.png" />
          <span class="font14">{{ $t('buttons.file_clear') }}</span>
        </div>
        <template v-if="selectedFiles.length > 0">
          <div class="button-img2 pointer ml-20 mr-20" @click="showRestoreCover">
            <img class="img" alt="" src="@/assets/huanyuan-.png" />
            <span class="font14">{{ $t('buttons.file_reduction') }}</span>
          </div>
          <div class="button-img2 pointer" @click="showDeleteCover">
            <img class="img" alt="" src="@/assets/del-.png" />
            <span class="font14">{{ $t('buttons.common_delete') }}</span>
          </div>
        </template>
      </div>
      <div class="flex ml-auto">
        <DownUpCover></DownUpCover>
        <NotificationCenter class="ml20 mr20" />
        <more></more>
      </div>
    </div>

    <div class="container" v-rect="genContainerHeight">
      <div class="flex ml19 mt20 mr20">
        <span>{{ $t('router.me_recycle_bin') }}</span>
        <div class="xy-center ml-auto">
          <span class="font14 select-count mr20" v-show="selectedFiles.length">
            {{ $t('breadcrumb.select_files', selectedFiles.length) }}
          </span>
          <img src="@/assets/liebiao.svg" class="img-right pointer mr20" v-if="sortType == 1" />
          <img
            src="@/assets/liebiaogray.svg"
            class="img-right pointer mr20"
            v-else
            @click="changeSortType"
          />
          <img src="@/assets/fangkuai.svg" class="img-right pointer" v-if="sortType == 2" />
          <img
            src="@/assets/fangkuaigray.svg"
            class="img-right pointer"
            v-else
            @click="changeSortType"
          />
        </div>
      </div>

      <div class="mt20 mb20 ml19">
        <!-- 文件部分选中状态  大图-->
        <div class="quanxuan-item flex y-center pointer" v-if="sortType == 2">
          <selectState
            :selectedFiles="selectedFiles"
            :fileList="fileList"
            @selectAll="selectAll"
            @clearAll="clearAll"
          />
          <span :class="fileList.length === 0 ? 'span-disabled' : ''">{{
            $t('buttons.common_select_all')
          }}</span>
        </div>

        <!-- 文件部分选中状态  列表-->
        <div class="quanxuan-item flex y-center" v-if="sortType == 1">
          <selectState
            :selectedFiles="selectedFiles"
            :fileList="fileList"
            @selectAll="selectAll"
            @clearAll="clearAll"
          />
          <div class="column-div">
            <span style="margin-right: 6px; font-weight: 500">{{ $t('space.file_name') }}</span>
          </div>
          <div class="column-div floatRight">
            <span style="margin-right: 6px; font-weight: 500">{{ $t('recycle.delete_time') }}</span>
          </div>
        </div>
      </div>
      <div
        class="w-100 h-100 flex xy-center"
        v-if="fileList.length === 0"
        style="margin-top: -92px"
      >
        <div class="empty-container x-center y-center flex xy-center">
          <img src="@/assets/wu.png" alt="" class="empty-img mb10" />
          <span>{{ $t('recycle.recycle_nodata') }}～</span>
        </div>
      </div>
      <fileListItem
        v-else
        v-model:fileList="fileList"
        v-model:selectedFiles="selectedFiles"
        @genHoverCheck="genHoverCheck"
        @appendSelected="appendSelected"
        @spliceFromSelected="spliceFromSelected"
        v-model:sortType="sortType"
      ></fileListItem>
    </div>
    <DeleteFileProgress :show='deleteShow' text='recycle.restoring' :percentage='deletePercentage'/>
  </div>
</template>

<script>
import { clearRecycle, queryRecyclelist, restoreRecycle } from '@/api/index'
import { genSrc } from '@/assets/resourceMap.js'
import { showSureModal } from '@/utils/toast'
import { ElMessage, ElLoading } from 'element-plus'
import actionItem from '../pages/space/component/actionItem.vue'
import fileListItem from '../pages/space/component/fileList.vue'
import selectState from '../pages/space/component/selectState.vue'
import { useGenHeight } from '@/utils/use'
import columnName from '../pages/space/component/columnName.vue'
import search from '../pages/space/component/search.vue'
import eventBus from '@/utils/eventbus'
import { ActionType } from '@/api/model'
import NotificationCenter from '@/components/NotificationCenter.vue'
import DownUpCover from '@/components/DownUpCover.vue'
import more from '@/components/more.vue'
import { taskPercentage } from '../api'
import DeleteFileProgress from '@/components/DeleteFileProgress.vue'

export default {
  name: 'recycle',
  components: {
    more,
    actionItem,
    fileListItem,
    selectState,
    columnName,
    search,
    NotificationCenter,
    DownUpCover,
    DeleteFileProgress
  },
  setup() {
    let { genContainerHeight } = useGenHeight((el, rect) => {
      let height = window.innerHeight
      el.style.height = height - rect.top - 10 + 'px'
    })
    return {
      genContainerHeight,
    }
  },
  data() {
    return {
      fileList: [],
      selectedFiles: [],
      chooseState: 3,
      actionsCopy: [],
      sortType: 2,
      deleteShow: 0,
      deletePercentage: 0,
    }
  },
  beforeMount: function () {
    eventBus.$off('deleteFileListCacheComplete')
    eventBus.$off('acceptFileActionResult')
  },
  mounted: function () {
    // 当缓存没有加载完成时,肯定没有数据, 通过下面的eventBus 补偿
    this.getRecyclelist()
    // 缓存数据加载完成会被回调
    eventBus.$on('deleteFileListCacheComplete', () => {
      this.getRecyclelist()
    })

    // 文件操作回退
    eventBus.$on('acceptFileActionResult', ({ actionType, targetFileArr, response }) => {
      // 还原失败 就把文件重新放到回收站
      if (actionType === ActionType.RESTORE || actionType === ActionType.DELETE) {
        if (response.code !== 200) {
          //console.log('删除还原失败')
          targetFileArr.forEach((item) => {
            let find = this.fileList.find((file) => file.uuid === item.uuid)
            if (!find) {
              this.fileList.push(item)
            }
          })
        }
      }
    })
  },
  methods: {
    changeList(srinput) {
      if (this.srinput === srinput) {
        return
      }
      // 搜索条件
      this.srinput = srinput
      if (this.srinput !== '') {
        // 开启搜索模式
        this.serflag = true
      } else {
        // 传空搜索 关闭搜索模式
        this.serflag = false
      }
      this._resetFileListAndChooseState()
    },
    resetSer() {
      this.serflag = false
      this.srinput = ''
      if (this.$refs.searchref) {
        this.$refs.searchref.input = ''
      }
    },
    changeSortType() {
      this.sortType = this.sortType === 1 ? 2 : 1
      // 重置页面状态
      // 请求数据

      this._resetFileListAndChooseState()
    },
    _resetFileListAndChooseState() {
      this._resetState()
    },

    _resetState() {
      this.selectedFiles = []
      this.actionsCopy = []
      this.currentFile = ''
    },
    getRecyclelist() {
      queryRecyclelist().then((data) => {
        this.fileList = data.results.fileList || []
        //console.log(data.results.fileList===null);
      })
      //console.log("chooseState   "+this.chooseState)
      if (this.fileList == null) this.chooseState = 3
      else this.chooseState = 1
      //console.log("chooseState   "+this.chooseState)
    },

    showClearCover() {
      let selectedFiles = this.selectedFiles
      this.clear(selectedFiles)
    },
    showDeleteCover() {
      let selectedFiles = this.selectedFiles
      this.delete(selectedFiles)
    },
    showRestoreCover() {
      let selectedFiles = this.selectedFiles
      this.restore(selectedFiles)
    },

    //清空文件
    clear(fileArr, callBack) {
      showSureModal({
        title: this.$t('buttons.file_clear'),
        content: this.$t('recycle.clear_desc'),
        sure: () => {
          let tmpFileList = JSON.parse(JSON.stringify(this.fileList))
          // 这里必须设置为空数组, 代表为清空回收站
          this.fileList = []
          clearRecycle([], tmpFileList).then((res) => {
            if (res.code === 200) {
              ElMessage.success(this.$t('recycle.clear_success'))
              this.getRecyclelist()
              typeof callBack == 'function' && callBack(null)
            } else {
              ElMessage.error(this.$t('recycle.clear_fail'))
              this.fileList = tmpFileList
            }
          })
        },
        cancel: () => {
          console.log('取消')
        }
      })
    },

    //删除文件
    delete(fileArr, callBack) {
      showSureModal({
        title: this.$t('buttons.common_delete'),
        content: this.$t('recycle.del_desc', { name: fileArr[0].name }, fileArr.length),
        sure: () => {
          this.selectedFiles = []
          let uuidArr = fileArr.map((ele) => {
            return ele.uuid
          })
          uuidArr.forEach((uuid) => {
            let index = this.fileList.findIndex((item) => {
              return item.uuid === uuid
            })
            if (index !== -1) {
              this.fileList.splice(index, 1)
            }
          })
          clearRecycle(uuidArr, fileArr).then((res) => {
            if (res.code === 200) {
              ElMessage.success(this.$t('recycle.del_success'))
              typeof callBack == 'function' && callBack(null)
            } else {
              ElMessage.error(this.$t('recycle.del_fail'))
            }
          })
        },
        cancel: () => {
          console.log('取消')
        }
      })
    },

    //还原文件
    restore(fileArr, callBack) {
      showSureModal({
        title: this.$t('buttons.file_reduction'),
        content: this.$t('recycle.restore_desc', { name: fileArr[0].name }, fileArr.length),
        sure: () => {
          this.deleteShow = 1 //显示删除提示
          let uuidArr = fileArr.map((ele) => {
            return ele.uuid
          })
          uuidArr.forEach((uuid) => {
            let index = this.fileList.findIndex((item) => {
              return item.uuid === uuid
            })
            if (index !== -1) {
              this.fileList.splice(index, 1)
            }
          })
          restoreRecycle(uuidArr, JSON.parse(JSON.stringify(fileArr))).then((res) => {
            if (res.code === 200) {
              this.restoreSuccess(callBack,0)
            }else if(res.code === 201){
              this.deleteShow = 2  //设置进度条
              let taskId = res.results.taskId
              let deleteInterval = setInterval(()=>{
                taskPercentage(taskId).then(result=>{
                  console.info("percentage",result)
                  if(result.code === 200){
                    if(result.results.taskStatus === 'success'){
                      clearInterval(deleteInterval)
                      this.restoreSuccess(callBack,deleteInterval)
                    }else if(result.results.taskStatus === 'failed'){
                      this.restoreFailed(deleteInterval)
                    }else{
                      this.deletePercentage =  Math.floor((result.results.processed / result.results.total) * 100)
                    }
                  }else{
                    this.restoreFailed(deleteInterval)
                  }
                }).catch(()=>{
                  this.restoreFailed(deleteInterval)
                })
              },1000)

            } else {
              ElMessage.error(this.$t('recycle.restore_fail'))
            }
          })
        },
        cancel: () => {
          console.log('取消')
        }
      })
    },
    restoreFailed(deleteInterval){
      clearInterval(deleteInterval)
      this.deleteShow = 0
      ElMessage.error(this.$t('recycle.restore_fail'))
    },
    restoreSuccess(callBack, deleteInterval){
      clearInterval(deleteInterval)
      this.deleteShow = 0
      ElMessage.success(this.$t('recycle.restore_success'))
      typeof callBack == 'function' && callBack(null)
    },

    /**
     * 展示文件详情,被子元素调用
     */
    toastFileDetail(fileDetail) {
      this.fileDetail = fileDetail
      this.showFileDetail = true
    },
    _findIndex(item) {
      return this.selectedFiles.findIndex((ele) => {
        return ele.uuid === item.uuid
      })
    },
    /**
     * 全选
     */
    selectAll() {
      this.selectedFiles = [].concat(this.fileList)
      this.changeChooseStateAndActions()
    },
    /**
     * 全部取消
     */
    clearAll() {
      this.selectedFiles = []
      this.changeChooseStateAndActions()
    },
    changeChooseStateAndActions() {
      if (this.fileList == null) {
        this.chooseState = 3 // 不可选择
      } else {
        let lengthOne = this.selectedFiles.length
        let lengthTwo = this.fileList.length
        if (lengthOne && lengthOne === lengthTwo) {
          this.chooseState = 2 // 全选状态
        } else {
          this.chooseState = 1 // 部分选中状态
        }
      }
    },
    /**
     * 判断item 不在selectedFiles
     */
    genHoverCheck(item) {
      return this._findIndex(item) === -1
    },
    /**
     * 单选
     */
    appendSelected(item) {
      if (this._findIndex(item) === -1) {
        this.selectedFiles.push(item)
      }
      this.changeChooseStateAndActions()
    },
    /**
     * 去掉勾选
     */
    spliceFromSelected(item) {
      let index = this._findIndex(item)
      if (index !== -1) {
        this.selectedFiles.splice(index, 1)
      }
      this.changeChooseStateAndActions()
    },
    /**
     * 生成图片类型
     */
    genSrc(item) {
      return genSrc(item)
    }
  }
}
</script>

<style scoped lang="scss">
.rec {
  text-align: left;
  color: #85899c;
}
.select-count {
  float: right;
}
.column-div {
  font-size: 14px;
  color: #464956;
  div {
    display: inline-block;
  }
}
.floatRight {
  margin-left: auto;
  margin-right: 26vw;
  width: 130px;
  text-align: left;
}
.img-right {
  width: 20px;
  height: 20px;
}
.button-r {
  background-color: #337aff;
  color: #fff;
  width: 100px;
  height: 34px;
  border-radius: 6px;
  font-weight: 400;
  font-size: 14px;
  .img {
    width: 16px;
    height: 16px;
    margin-right: 4px;
  }
}
.huishou {
  width: 78px;
  height: 34px;
  background: #dfe0e5;
  border-radius: 6px;
  color: #fff;
  font-weight: 400;
  font-size: 14px;
}
.huishou- {
  width: 78px;
  height: 34px;
  background: #eaf1ff;
  border-radius: 6px;
  color: #337aff;
  font-weight: 400;
  font-size: 14px;
}

.historyFloder {
  display: inline-block;
}
.seleted {
  background: rgba(51, 122, 255, 0.1);
  border-radius: 6px;
}
.file-item {
  width: 130px;
  height: 130px;
  font-size: 12px;
  font-weight: 400;
  color: #85899c;
  text-align: center;
  display: inline-block;
  overflow: hidden;
  position: relative;

  .hover-check,
  .checked {
    position: absolute;
    width: 16px;
    height: 16px;
    top: 10px;
    left: 10px;
  }
  .hover-check {
    display: none;
  }
  &:hover {
    background: rgba(51, 122, 255, 0.1);
    border-radius: 6px;
    .hover-check {
      display: block;
    }
  }
  .img {
    width: 70px;
    height: 70px;
    display: block;
    margin: 20px auto 14px auto;
  }
  .file-name {
    display: inline-block;
    min-width: 70px;
    height: 16px;
    line-height: 16px;
    overflow: hidden;
  }
}
.body {
  background: #f9fafd;
}
.span-disabled {
  color: #dfe0e5;
}
.space {
  height: 92%;
  position: relative;
  text-align: left;
  color: #85899c;
  overflow: auto;
}
.empty-img {
  width: 224px;
  height: 224px;
}

.quanxuan-item {
  height: 16px;
  span {
    height: 16px;
    line-height: 16px;
  }
  em {
    color: #337aff;
  }
}
.action-container {
  height: 34px;
  background: #eaf1ff;
  border-radius: 6px;
  padding: 9px 1px 9px 1px;
}
.action-item {
  height: 16px;
  border-right: 1px solid #337aff;
  img {
    width: 16px;
    height: 16px;
    margin-right: 2px;
    margin-left: 12px;
  }
  font-size: 14px;
  font-weight: 400;
  color: #337aff;
  .span {
    line-height: 34px;
    height: 34px;
    margin-top: 3px;
  }
}
.empty-container {
  flex-direction: column;
  color: #bcbfcd;
  font-size: 14px;
}
.container {
  overflow: hidden;
  border-top: 1px solid #f5f6fa;
}
</style>
