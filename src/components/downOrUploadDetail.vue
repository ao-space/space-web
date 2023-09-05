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
  <cover class="center" v-show="state.coverFlag" style="z-index: 1000">
    <div class="downContainer">
      <div class="flex justify-between p20" style="background: white">
        <div class="y-center font14">
          <span
            class="mr40 pointer common-span"
            @click="state.currentType = 'download'"
            :class="{ color337aff: state.currentType === 'download' }"
            >{{ $t('downUpload.download_detail') }}</span
          >
          <span
            class="pointer common-span"
            @click="state.currentType = 'upload'"
            :class="{ color337aff: state.currentType === 'upload' }"
            >{{ $t('downUpload.upload_detail') }}</span
          >
        </div>

        <el-icon @click="showCover" style="font-size: 18px">
          <Close></Close>
        </el-icon>
      </div>
      <div class="line"></div>
      <div class="detail x20" v-show="state.currentType === 'download'">
        <downOrUploadItem
          v-for="item in state.downList"
          :key="item.uuid"
          @closeSingleDown="closeSingleDown"
          @uploadSuccess="uploadSuccess"
          @uploadFail="uploadFail"
          @downloadSuccess="downloadSuccess"
          @subFailLength="subFailLength"
          :item="item"
          @changeTotalProgress="changeTotalProgress"
          :currentNetWorkType="state.currentNetWorkType"
          :type="'download'"
        />
        <div class="x-center y-center y-100 empty" v-show="state.downList.length == 0">
          <img src="@/assets/chuanshu.svg" />
          <span>{{ $t('downUpload.no_task') }}</span>
        </div>
      </div>
      <div class="detail x20" v-show="state.currentType == 'upload'">
        <downOrUploadItem
          div
          v-for="item in state.uploadList"
          :key="item.uuid"
          @closeSingleDown="closeSingleDown"
          @uploadSuccess="uploadSuccess"
          @uploadFail="uploadFail"
          @downloadSuccess="downloadSuccess"
          @subFailLength="subFailLength"
          :item="item"
          @changeTotalProgress="changeTotalProgress"
          :type="'upload'"
          :currentNetWorkType="state.currentNetWorkType"
        />
        <div class="x-center y-center y-100 empty" v-show="state.uploadList.length == 0">
          <img src="@/assets/chuanshu.svg" />
          <span>{{ $t('downUpload.no_task') }}</span>
        </div>
      </div>
      <div class="bottom">
        <div class="y-center">
          <div class="flex">
            <img src="@/assets/qiehuan@2x.png" class="qiehuan" />
            <span class="gray-14">{{ $t('downUpload.network') }}：</span>
            <span class="black-14 fw-b">{{ $t(state.showWebRTC) }}</span>
          </div>
        </div>
      </div>
      <input
        type="file"
        name="file"
        id="uploadFile"
        @change="changeImg"
        style="display: none"
        :webkitdirectory="!!state.webkitdirectory"
      />
    </div>
  </cover>
</template>

<script lang="ts" setup>
import { reactive, onMounted, defineProps, nextTick, onUnmounted } from 'vue'
import cover from './cover.vue'
import { resouceMap } from '@/assets/resourceMap.js'
import downOrUploadItem from './downOrUploadItem.vue'
import { v4 as uuidv4 } from 'uuid'
import eventbus from '@/utils/eventbus'
import { ElMessage } from 'element-plus'
import { t, isChinese } from '@/language/index'
import jisu_on_ch from '@/assets/juyu-on@2x.png'
import jisu_off_ch from '@/assets/juyu-off@2x.png'
import jisu_on_en from '@/assets/jisu_on_en.png'
import jisu_off_en from '@/assets/jisu_off_en.png'
import { maxFolderLevels } from '@/config/fileConfig'

const uuidMap = {}

let state = reactive({
  downList: [],
  uploadList: [],
  resouceMap: resouceMap,
  coverFlag: false,
  totalProgress: 0,
  webkitdirectory: false, // 是否上传文件夹
  failLength: 0,
  floderInfoArr: [], // 文件路径信息
  currentType: 'download', // 当前类型
  lastNum: 0,
  addEventFlag: false,
  bigUploadList: [],
  currentNetWorkType: 1, // 1 互联网 2 局域网
  showWebRTC: 'downUpload.network_wan', // 1 互联网 2 局域网 3 离线
  totalFileLength: 0
})

const props = defineProps({
  title: String
})
onMounted(() => {
  eventbus.$on('startDownFile', (fileArr: any, callback) => {
    const existFlag = pullFileAndDownLoad(fileArr)
    if (typeof callback == 'function') {
      existFlag ? callback(new Error('文件已存在')) : callback()
    }
  })
  eventbus.$on(
    'startuploadFile',
    (fileArr: string | any[], webkitdirectory: any, floderInfoArr: never[]) => {
      state.floderInfoArr = floderInfoArr
      if (fileArr.length == 0) {
        // 点击上传文件夹和上次文件夹触发
        // 上传文件夹
        setWebkitdirectoryAndUpload(webkitdirectory)
      } else {
        notifyUploadFile(fileArr)
      }
    }
  )
  eventbus.$on('startUploadAlbumFile', (fileList) => {
    notifyUploadFile(fileList)
  })

  /**
   * 打开下载上传详情
   */
  eventbus.$on('showDownUpCover', (netWorkType) => {
    state.coverFlag = true

    if (netWorkType === 1) {
      state.showWebRTC = 'downUpload.network_wan'
    } else if (netWorkType === 2) {
      state.showWebRTC = 'downUpload.network_lan'
    } else if (netWorkType === 3) {
      state.showWebRTC = 'downUpload.network_offline'
    }
  })
})

onUnmounted(() => {
  eventbus.$off('startDownFile')
  eventbus.$off('startUploadAlbumFile')
  eventbus.$off('showDownUpCover')
})

function getSpeedOnImg() {
  return isChinese() ? jisu_on_ch : jisu_on_en
}
function getSpeedOffImg() {
  return isChinese() ? jisu_off_ch : jisu_off_en
}
/**
 * 向外发送未完成的文件数字
 */
function notifyFileNum() {
  let num = findCompleteFileNum()
  let lastNum = state.uploadList.length + state.downList.length - num

  if (lastNum && !window.onbeforeunload) {
    window.onbeforeunload = function (event) {
      event.returnValue = t('downUpload.close_tip')
    }
  }

  if (lastNum == 0) {
    window.onbeforeunload = null
  }
  eventbus.$emit('unCompletefileNum', lastNum)
}

function downloadSuccess(res: any) {
  eventbus.$emit('downloadSuccess', res)
}

function uploadSuccess(res: any) {
  // 文件上传成功回调
  eventbus.$emit('uploadSuccess', res)
  let unCompletefileNum = state.uploadList.length + state.downList.length - findCompleteFileNum()

  if (unCompletefileNum < 100) {
    let taskId = setTimeout(() => {
      clearTimeout(taskId)
      stepUploadFile()
    }, 1000)
  }
}
/**
 * 上传失败失败数加1
 */
function uploadFail() {
  state.failLength = state.failLength + 1
}
/**
 * 清楚该条数据
 */
function subFailLength() {
  state.failLength = state.failLength - 1
}
function setWebkitdirectoryAndUpload(flag: boolean) {
  state.webkitdirectory = flag
  nextTick(() => {
    triggerChooseFile()
  })
}
function clearDownList() {
  state.downList = []
}

/**
 * 向downList中push 文件,并开始下载
 */
function pullFileAndDownLoad(fileArr: any[]) {
  let existFlag = false
  let tmpArr: any[] = []
  // 不在downList 中的元素push 到 downList中
  fileArr.forEach((element: { uuid: any; name: any }) => {
    let findFlag = state.downList.find((item) => {
      return item.uuid == element.uuid
    })
    if (!findFlag) {
      state.downList.push(element)
    } else {
      tmpArr.push(element.name)
    }
  })
  if (tmpArr.length) {
    existFlag = true
    ElMessage.info(t('downUpload.file_already_in', { file: tmpArr.join(',') }))
  }
  notifyFileNum()
  return existFlag
}
function triggerChooseFile() {
  document.getElementById('uploadFile').click()
}

function showCover() {
  state.coverFlag = !state.coverFlag
}
// 删除当前行
function closeSingleDown(item: { uuid: any }, type) {
  let arr = type == 'download' ? state.downList : state.uploadList
  let index = arr.findIndex((ele) => {
    return ele.uuid === item.uuid
  })
  if (index != -1) {
    arr.splice(index, 1)
  }
  notifyFileNum()
}

/**
 * 开始上传文件
 */
function notifyUploadFile(upFileArr: string | any[]) {
  if (upFileArr.length == 0) {
    return
  }
  if (upFileArr.length > 500) {
    state.totalFileLength = upFileArr.length
    let tmp = []
    for (let i = 0; i < upFileArr.length; i++) {
      tmp.push(upFileArr[i])
    }
    state.bigUploadList = tmp
    stepUploadFile()
  } else {
    // todo 这里需要修复bug
    upWrap(upFileArr)
  }
  // 重置value
  document.getElementById('uploadFile').value = ''
}

/**
 * 分次上传文件
 */
function stepUploadFile() {
  if (state.bigUploadList.length > 500) {
    let upFileArr = state.bigUploadList.splice(0, 500)
    upWrap(upFileArr)
  } else {
    let upFileArr = state.bigUploadList.splice(0, state.bigUploadList.length)
    upWrap(upFileArr)
  }
}

function upWrap(upFileArr) {
  for (let i = 0; i < upFileArr.length; i++) {
    const upFile = upFileArr[i]
    if (upFile.size === 0) {
      continue
    }
    console.log('fileInfo', upFile)
    let path = ''
    if (upFile.webkitRelativePath) {
      const lastIndex = upFile.webkitRelativePath.lastIndexOf('/')
      if (lastIndex !== -1 && lastIndex !== 0) {
        path = upFile.webkitRelativePath.slice(0, lastIndex + 1)
      }
    }
    if (state.floderInfoArr.length > 0) {
      const lastFloderInfo = state.floderInfoArr[state.floderInfoArr.length - 1]
      path = lastFloderInfo.path + lastFloderInfo.name + '/' + path
    } else {
      path = '/' + path
    }

    const fileInfo = {
      name: upFile.name, // 文件名称
      uuid: uuidv4(), // 唯一标示
      file: upFile,
      path: path
    }
    console.log('filePath', fileInfo)
    state.uploadList.push(fileInfo)
    uuidMap[fileInfo.uuid] = fileInfo
    notifyFileNum()
  }
}

function changeImg(e: { target: { files: any } }) {
  let upFileArr = [...e.target.files].filter((item) => {
    return item.size > 0
  })
  let max = maxFolderLevels - state.floderInfoArr.length
  for (let i = 0; i < upFileArr.length; i++) {
    let upFile = upFileArr[i]
    let webkitRelativePath = upFile.webkitRelativePath
    let pathArr = webkitRelativePath.split('/')
    if (pathArr.length && pathArr.length - 1 > max) {
      ElMessage.info(
        t('downUpload.folder_limit', { file: upFile.webkitRelativePath, count: maxFolderLevels })
      )
      return
    }
  }
  notifyUploadFile(upFileArr)
}
// todo 后期待优化
const changeTotalProgress = (uuid: string | number, progress: string) => {
  if (parseInt(progress) == 100) {
    // 添加下载成功标志位
    uuidMap[uuid] = {}
    uuidMap[uuid].downReady = true
    notifyFileNum()
  }
}

function findCompleteFileNum() {
  let num = 0
  for (let i = 0; i < state.downList.length; i++) {
    let ele = state.downList[i]
    if (uuidMap[ele.uuid]?.downReady) {
      num++
    }
  }

  for (let i = 0; i < state.uploadList.length; i++) {
    let ele = state.uploadList[i]
    if (uuidMap[ele.uuid]?.downReady) {
      num++
    }
  }
  return num
}
</script>

<style lang="scss" scoped>
.qiehuan {
  height: 16px;
  width: 16px;
  margin-right: 6px;
}
.bottom {
  padding-left: 20px;
  height: 76px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.inline-block {
  display: inline-block;
}

.empty {
  flex-direction: column;
  flex: 1;
  > span {
    font-weight: 400;
    color: #85899c;
    font-size: 14px;
    margin-top: 10px;
  }
}

.common-span {
  font-size: 14px;

  font-weight: 400;
}
.button {
  width: 110px;
  height: 34px;
  background: #337aff;
  border-radius: 6px;
  line-height: 34px;
  text-align: center;
  color: #fff;
  font-size: 14px;
}
.downContainer {
  width: 800px;
  height: 584px;
  background: #fff;
  border-radius: 6px;
  color: #85899c;
  z-index: 1000;
  background: #f5f6fa;
  overflow: hidden;
}
.bottomContainer {
  border-top: 1px #eceef4 solid;
  height: 44px;
  width: 100%;
  position: relative;
  display: flex;
  justify-content: space-between;
  padding: 0 20px;
  align-items: center;
  background: #fff;
  margin-bottom: 2px;
}
.totalProgress {
  position: absolute;
  left: 0;
  bottom: 0;
  height: 6px;
  background: #337aff;
  width: 50%;
}
.color337aff {
  color: #337aff;
  font-size: 14px;
  font-weight: 500;
}

.m20 {
  margin: 20px;
}
.x20 {
  margin: 0 20px;
}
.line {
  width: 100%;
  background: #eceef4;
  height: 1px;
  margin-top: -1px;
}
.detail {
  padding: 0 24px 0px 10px;
  overflow-y: auto;
  overflow-x: hidden;
  text-align: left;
  height: 449px;
  flex: 1;
  &::-webkit-scrollbar {
    width: 5px;
  }
  &::-webkit-scrollbar-thumb {
    border-radius: 10px;
    box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
    background: rgba(0, 0, 0, 0.2);
  }
  &::-webkit-scrollbar-track {
    box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
    border-radius: 0;
    background: rgba(0, 0, 0, 0.1);
  }
}

.more-file {
  height: 74px;
  background: white;
  flex-direction: row-reverse;
}
.text {
  font-size: 12px;
  color: #85899c;
}
</style>
