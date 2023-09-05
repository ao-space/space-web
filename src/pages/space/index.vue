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
  <div class="font14">
    <div class="pl16 pr16 pt11 pb11 y-center">
      <!-- 文件操作快捷按钮 -->
      <fileButton
        v-if="category == '' && recordId == 0"
        :foldHistoryList="foldHistoryList"
        @handClickUpload="handClickUpload"
        @createFloder="createFloder"
        v-show="selectedFiles.length == 0"
      ></fileButton>

      <!-- 文件操作按钮 -->
      <actionItem
        :actionsCopy="actionsCopy"
        @doAction="doAction"
        v-show="selectedFiles.length != 0"
      ></actionItem>
      <div class="flex ml-auto">
        <search v-if="recordId == 0" @handleChange="changeList" ref="searchref"></search>
        <DownUpCover></DownUpCover>
        <NotificationCenter class="ml20 mr20" />
        <more></more>
      </div>
    </div>
    <!-- 我的空间和全选状态div -->
    <div class="container tl" v-rect="genContainerHeight">
      <uploadDragVue
        class="upload-demo w-100 h-100 flex"
        @upFileFn="upFileFn"
        :disabled="category !== ''"
      >
        <div class="flex ml19 mt20 mr20">
          <template v-if="recordId > 0">
            <span @click="goIndex" class="not-last-color pointer">
              {{ $t('router.home_main') }}&nbsp>&nbsp
            </span>
            <span class="last-color">
              {{ recordName }}
            </span>
          </template>
          <!-- 拖拽上传 -->
          <template v-else>
            <span
              @click="goMyspace"
              :class="foldHistoryList.length ? 'not-last-color pointer' : 'last-color pointer'"
              >{{ $t(genText()) }}</span
            >
            <span
              style="margin: 0 5px"
              :class="foldHistoryList.length ? 'not-last-color' : 'last-color'"
              >></span
            >
          </template>
          <div
            v-for="(ele, index) in foldHistoryList"
            :key="index"
            class="historyFloder"
            :class="index !== foldHistoryList.length - 1 ? 'not-last-color pointer' : 'last-color'"
          >
            <span
              @click="
                () => {
                  index !== foldHistoryList.length - 1 && goFloder(ele)
                }
              "
              v-if="showName(index)"
              >{{ ele.name }}</span
            >
            <span v-if="showElisps(index)" @click="goLastThree"> ... ></span>
            <!-- 最后一级不显示 -->
            <span
              v-if="index !== foldHistoryList.length - 1 && showName(index) && !showElisps(index)"
              style="margin: 0 5px"
            >
              ></span
            >
          </div>

          <div class="flex ml-auto y-center">
            <span class="font14 select-count mr20" v-show="selectedFiles.length">
              {{ $t('breadcrumb.select_files', selectedFiles.length) }}
            </span>
            <fileFilter
              v-if="recordId == 0 && fileId.length == 0"
              class="mr20"
              :category="category"
            />
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
          <div class="quanxuan-item flex y-center" v-if="sortType == 2">
            <selectState
              :selectedFiles="selectedFiles"
              :fileList="fileList"
              @selectAll="selectAll"
              @clearAll="clearAll"
            />
            <span class="span-disabled" v-if="fileList.length == 0">{{
              $t('buttons.common_select_all')
            }}</span>
            <span v-else>{{ $t('buttons.common_select_all') }}</span>
          </div>

          <!-- 文件部分选中状态  列表-->
          <div class="quanxuan-item flex y-center" v-show="sortType == 1">
            <selectState
              :selectedFiles="selectedFiles"
              :fileList="fileList"
              @selectAll="selectAll"
              @clearAll="clearAll"
            />
            <columnName
              :columnName="$t('space.file_name')"
              @sortFn="sortByName"
              defalutSortType="asc"
              :serflag="serflag"
              :currentSort="currentSort"
              sortColumn="name"
            />
            <columnName
              :columnName="$t('space.modify_time')"
              @sortFn="sortByDate"
              class="floatRight"
              defalutSortType="asc"
              :serflag="serflag || recordId > 0"
              sortColumn="operation_time"
              :currentSort="currentSort"
            />
          </div>
        </div>

        <!-- 拖拽上传 -->

        <div
          class="empty-container flex x-center y-center xy-center"
          v-if="fileList.length === 0 && beginRequest === false && serflag === false"
        >
          <img src="@/assets/emptyinfo.png" alt="" class="empty-img mb10" />
          <span>{{ $t('space.file_drag_upload') }}</span>
        </div>

        <div
          class="empty-container flex x-center y-center xy-center"
          v-if="fileList.length === 0 && serflag === true"
        >
          <img
            src="@/assets/null.png"
            alt=""
            class="empty-img mb10 flex x-center y-center xy-center"
            style="padding-top: 177px"
          />
          <span
            >{{ $t('space.not_contain') }}“<span style="color: #337aff">{{ srinput }}</span
            >”{{ $t('space.contain_file') }}</span
          >
        </div>

        <!-- 文件列表 -->
        <fileList
          v-if="fileList.length !== 0"
          v-model:fileList="fileList"
          v-model:selectedFiles="selectedFiles"
          @fileBlur="blur"
          @enterFloder="enterFloder"
          @genHoverCheck="genHoverCheck"
          @appendSelected="appendSelected"
          @contextmenuSync="contextmenu"
          @spliceFromSelected="spliceFromSelected"
          @clickName="clickName"
          @getMoreFileList="getMoreFileList"
          v-model:sortType="sortType"
          :styleTmp="osString === 'window' ? 'height: calc(100% - 120px)' : ''"
        ></fileList>
      </uploadDragVue>
    </div>

    <!-- 选择文件夹 移动和复制的时候弹窗 -->
    <chooseFileDialog
      v-if="showChooseFile"
      @cancel="showChooseFile = false"
      @sure="makeSure"
      :floderData="floderData"
      :depth="0"
    >
    </chooseFileDialog>

    <!-- 文件详情弹窗 -->
    <fileDetailDialogVue
      v-if="showFileDetail"
      @cancel="showFileDetail = false"
      :fileDetail="fileDetail"
      @sure="showFileDetail = false"
    >
    </fileDetailDialogVue>


    <!-- 图片预览列表 -->
    <imgList
      v-if="showImgList"
      @close="imgListClose"
      :fileList="fileList"
      @deleteImg="deleteFile"
      :currentFile="currentFile"
    ></imgList>
    <!-- 右键菜单 -->
    <Menu v-show="showMenu" :menuArr="actions" ref="menuRef" @doAction="doAction"></Menu>
    <preview ref="previewRef" @deleteFile="deleteFile" />
    <DeleteFileProgress :show="deleteShow" :percentage="deletePercentage" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { showSureModal } from '@/utils/toast'
import chooseFileDialog from './component/chooseFileDialog.vue'
import fileDetailDialogVue from './component/fileDetailDialog.vue'
import imgList from './component/imgList.vue'
import search from './component/SearchNew.vue'
import Menu from '../../components/menu.vue'
import selectState from './component/selectState.vue'
import { actions } from './component/actionhelp'
import fileList from './component/fileList.vue'
import fileButton from './component/fileButton.vue'
import preview from './component/preview.vue'
import columnName from './component/columnName.vue'
import { sortFileByDir } from '@/auth/fileAction/fileSort'
import DeleteFileProgress from '@/components/DeleteFileProgress.vue'

import {
  genPromise,
  checkName,
  canOpenImg,
  canOpenFile,
  getPuffixAndSuffix,
  OSnow,
  genFileName
} from '@/utils/help'
import { throttle } from 'lodash'
import actionItem from './component/actionItem.vue'
import { dealOffLine } from '@/utils/offlineHelp'
import uploadDragVue from '@/components/upload-drag.vue'
import {
  queryFilelist,
  deleteFile,
  copyFile,
  moveFile,
  renameFile,
  createdir,
  getSearch,
  taskPercentage
} from '@/api/index'
import { genSrc } from '@/assets/resourceMap.js'
import { ElMessage } from 'element-plus'

import eventBus from '@/utils/eventbus'

import { clearCacheByuuid } from '@/utils/indexdbUtil'
import { genText, keyMap } from '@/utils/constant'
import loginOut from '@/components/loginOut.vue'
import { useGenHeight } from '@/utils/use'
import { fileActionInstance } from '@/auth/local'
import { ActionType } from '@/api/model'
import { getFlodHistory, setFlodHistory } from './component/foldHistoryHelp'
import NotificationCenter from '@/components/NotificationCenter.vue'
import more from '@/components/more.vue'
import fileFilter from './component/fileFilter.vue'
import DownUpCover from '@/components/DownUpCover.vue'
const maxFolderNum = 5 - 1
export default defineComponent({
  name: 'space',
  components: {
    chooseFileDialog,
    fileDetailDialogVue,
    imgList,
    Menu,
    actionItem,
    fileList,
    fileButton,
    search,
    preview,
    loginOut,
    selectState,
    columnName,
    NotificationCenter,
    more,
    uploadDragVue,
    fileFilter,
    DownUpCover,
    DeleteFileProgress
  },
  data() {
    const category = this.$route.query.category || ''
    const fileId = this.$route.params.fileId || ''
    let actionArray = actions.map((item) => {
      return item
    })


    const osString = OSnow()
    return {
      recordId: 0,
      recordName: '',
      fileId,
      category: category, // 类型 图片 视频 音频 文档
      actionsCopy: [],
      actions: actionArray,

      showImgList: false,
      showChooseFile: false,
      floderData: {
        name: this.$t('space.home_myspace'),
        uuid: '-1', // -1 代表根目录 前端有,后端没有
        child: []
      },
      fileList: [],
      beginRequest: false,
      selectedFiles: [],

      // 文件详情信息
      showFileDetail: false,
      // 分享文件
      fileDetail: {},

      showMenu: false,

      actionFlag: '',

      foldHistoryList: [], // 文件夹访问记录

      pageNum: 1,
      totalNum: 2,
      loading: false,

      currentSort: 'name asc', // 排序条件

      editAction: '', // createFloder=>创建文件夹  rename=> 重命名
      floderNameArr: [], // 文件名称数组
      serflag: false, // 是否是搜索模式
      srinput: '',

      currentFile: '', // 当前右键的文件
      sortType: JSON.parse(localStorage.getItem(keyMap.fileSortType)) || 2, // 1列表  2方块
      osString: osString,
      deleteShow: 0,
      deletePercentage: 0
    }
  },
  mounted() {
    let recordId = this.$route.params.recordId
    if (recordId) {
      this.recordId = +recordId
    }

    if (this.recordId == 0 && this.category.length == 0) {
      this.genFoldHistoryList()
    }

    /**
     * 节流
     */
    this.batchCreateDir = throttle(this.batchCreateDir.bind(this), 1000, {
      trailing: true,
      leading: false
    })

    this.initFileList()
    eventBus.$on('cancelMenu', () => {
      this.showMenu = false
    })
    // 上传完成后刷新列表
    // todo 如果在上传的时候切换到回收站等非空间页面,会导致本地缓存中的数据不一致。需等2分钟后后台刷新
    eventBus.$on('uploadSuccess', (res) => {
      const fileInfo = res.results
      let parentFloderInfo
      if (this.foldHistoryList.length > 0) {
        parentFloderInfo = this.foldHistoryList[this.foldHistoryList.length - 1]
      }
      // console.log(res, 1111, '更新缓存', this.foldHistoryList)
      fileActionInstance
        .updateCache({
          type: 'add',
          fileList: this.fileList,
          fileInfo,
          currentFloderInfo: parentFloderInfo
        })
        .then((fileList) => {
          this.fileList = fileList
        })
    })

    // 文件操作回退
    eventBus.$on('acceptFileActionResult', ({ actionType, uuid, response, oldName }) => {
      if (actionType == ActionType.CREATEFloder) {
        fileActionInstance.callFnByOpenFlag(() => {
          this.selectedFiles = []
          if (response.code == 200) {
            const fileInfo = response.results
            // 更新文件信息
            this.fileSplice(this.fileList, uuid, fileInfo)
          } else {
            console.log(response, '文件创建失败')
            // 删除创建的文件夹
            this.fileSplice(this.fileList, uuid, null)
          }
        }, null)
      } else if (actionType == ActionType.COPY) {
        // todo 这里想一想怎么还原
      } else if (actionType === 'move') {
        this.moveFile(uuid)
      } else if (actionType == ActionType.RENAME) {
        fileActionInstance.callFnByOpenFlag(
          () => {
            if (response.code != 200) {
              console.log(response, '重命名失败')
              const fileInfo = this.fileList.find((item) => item.uuid == uuid)
              fileInfo.name = oldName
              this.fileSplice(this.fileList, uuid, fileInfo)
            }
          },
          () => {
            if (response.code == 200) {
              this.initFileList()
            }
          }
        )
      }
    })
  },
  beforeUnmount() {
    eventBus.$off('cancelMenu')
    eventBus.$off('uploadSuccess')
    eventBus.$off('acceptFileActionResult')
    this.__clearScrollLister && this.__clearScrollLister()
  },
  computed: {
    currentDirUuid() {
      return this.fileId
    }
  },
  setup() {
    const { genContainerHeight } = useGenHeight((el, rect) => {
      const height = window.innerHeight
      if (el) {
        el.style.height = height - rect.top - 10 + 'px'
      }
    })
    return {
      genContainerHeight
    }
  },
  methods: {
    // 返回倒数第三层
    goLastThree() {
      const length = this.foldHistoryList.length
      const ele = this.foldHistoryList[length - 3]
      this.goFloder(ele)
    },
    showName(index) {
      const length = this.foldHistoryList.length
      if (length <= maxFolderNum) {
        return true
      } else {
        if (index == 0 || index == 1 || index == length - 1 || index == length - 2) {
          return true
        } else {
          return false
        }
      }
    },
    // 展示...>
    showElisps(index) {
      const length = this.foldHistoryList.length
      if (length > maxFolderNum && index == 2) {
        return true
      }
      return false
    },
    goIndex() {
      this.$router.push('/home/index')
    },
    imgListClose() {
      this.showImgList = false
      this._resetFileListAndChooseState()
    },
    genFoldHistoryList() {
      this.foldHistoryList = getFlodHistory(this.$route)
    },
    /**
     开启本地化调用localFn 否则调用 onLineFn
     */
    callFnByLocal(localFn, onLineFn) {
      fileActionInstance.callFnByOpenFlag(localFn, onLineFn)
    },
    sortByName(sortType) {

      if (sortType == 'desc') {
        this.currentSort = 'name desc'
      } else {
        this.currentSort = 'name asc'
      }
      if (this.recordId > 0) {
        if (sortType == 'desc') {
          this.fileList.sort((a, b) => {
            return a.name.localeCompare(b.name, 'zh-Hans-CN')
          })
        } else {
          this.fileList.sort((a, b) => {
            return b.name.localeCompare(a.name, 'zh-Hans-CN')
          })
        }
      } else {
        this._resetFileListAndChooseState()
      }
    },
    sortByDate(sortType) {

      if (sortType == 'desc') {
        this.currentSort = 'operation_time asc'
      } else {
        this.currentSort = 'operation_time desc'
      }

      if (this.recordId > 0) {
        if (sortType == 'desc') {
          this.fileList.sort((a, b) => {
            return b.operationAt - a.operationAt
          })
        } else {
          this.fileList.sort((a, b) => {
            return a.operationAt - b.operationAt
          })
        }
      } else {
        this._resetFileListAndChooseState()
      }
    },
    /**
     * 切换列表模式,清除文件选择状态
     */
    changeSortType() {
      this.sortType = this.sortType == 1 ? 2 : 1
      // 在本web端，每一次改变文件视图，有效期为下一次改变或下一次登录
      localStorage.setItem(keyMap.fileSortType, this.sortType)
      // 重置页面状态
      // 请求数据
      this._resetFileListAndChooseState()
    },
    /**
     * 搜索时,清除文件选择状态
     */
    changeList(srinput) {
      dealOffLine(() => {
        if (this.srinput == srinput) {
          return
        }
        // 搜索条件
        this.srinput = srinput
        if (this.srinput != '') {
          // 开启搜索模式
          this.serflag = true
        } else {
          // 传空搜索 关闭搜索模式
          this.serflag = false
        }
        this._resetFileListAndChooseState()
      })
    },

    /**
     * 取后缀
     */
    genSuffix(item) {
      if (item.isDir) {
        return ''
      } else {
        if (item.name) {
          return getPuffixAndSuffix(item.name).suffix
        }
        return ''
      }
    },
    /**
     * 左上角提示语
     */
    genText() {
      return genText(this.category)
    },
    /**
     * 去指定的目录下面,清除文件选择状态
     */
    goFloder(item) {
      const path = item.path
      let parentUuid = path == '/' ? '-1' : item.parentUuid
      if (!parentUuid) {
        parentUuid = fileActionInstance.pathToUUidMap(path) || '-1'
      }

      // 去除child 防止child 超长导致超过 localstorage空间
      const { child, ...other } = item

      setFlodHistory(
        {
          ...other,
          parentUuid
        },
        this.$route
      )
      this.$router.push({
        path: `/home/file/${item.uuid}/${parentUuid}`
      })
    },
    /**
     * 去我的空间,清除文件选择状态
     */
    goMyspace() {
      setFlodHistory({ uuid: '-1', name: '我的空间', parentUuid: '' }, this.$route)
      this.$router.push({
        path: '/home/space'
      })
    },
    /**
     * 重置搜索条件
     */
    resetSer() {
      this.serflag = false
      this.srinput = ''
      if (this.$refs.searchref) {
        this.$refs.searchref.input = ''
      }
    },
    /**
     * 右键菜单
     */
    contextmenu(e) {
      let { clientX, clientY } = e
      const uuid = e.target.dataset.uuid
      // 找到元素
      const item = this.fileList.find((ele) => {
        return ele.uuid == uuid
      })
      // 调用单选
      const included = this.selectedFiles.some((ele) => {
        return ele.uuid == item.uuid
      })
      if (!included) {
        this.selectedFiles = [item]
      }
      // 设置currentFile
      this.currentFile = item
      this.changeChooseStateAndActions()

      // 设置右键菜单位置
      this.$nextTick(() => {
        const menuRef = this.$refs.menuRef
        // 计算菜单的位置 防止菜单超出屏幕
        const height = window.innerHeight
        // 菜单的高度为230
        if (clientY + 230 > height) {
          const offsetTop = clientY + 250 - height
          clientY = clientY - offsetTop
        }
        if (menuRef) {
          menuRef.setPosition({
            top: clientY,
            left: clientX
          })
          menuRef.setNomalMenuArr(this.actionsCopy)
        }
        this.showMenu = true
      })
    },
    /**
     * 创建文件夹
     */
    createFloder() {
      this.editAction = 'createFloder'
      // 创建文件夹
      const uuid = new Date().getTime()
      const nameArray = this.fileList.map((item) => {
        return item.name
      })
      const name = genFileName(nameArray)
      this.fileList.unshift({
        uuid: uuid,
        name: name,
        isDir: true,
        is_create: true,
        editabled: true
      })
      setTimeout(() => {
        this.$nextTick(() => {
          this._force(uuid)
        })
      })
    },

    checkNameWrap(folderName, target) {
      if (!checkName(folderName)) {
        target && target.focus()
        ElMessage.error(this.$t('space.file_name_only'))
        return false
      }
      return true
    },
    /**
     * 编辑失去焦点时,可重命名和新增文件夹
     * 重命名时清除文件选择状态
     */
    blur({ uuid, folderName, target, rawName }) {
      folderName = folderName.replace(/\s/g, '')

      if (this.editAction == 'createFloder') {
        if (!this.checkNameWrap(folderName, target)) {
          return
        }
        const index = this.fileList.findIndex((item) => {
          return item.uuid == uuid
        })
        if (index != -1) {
          const tmp = this.fileList[index]
          tmp.editabled = false
          tmp.name = folderName
          this.fileList.splice(index, 1, tmp)
        }
        this.floderNameArr.push({ folderName, uuid })
        this.batchCreateDir()
      } else {
        // 重命名
        let suffix = ''

        const item = this.fileList.find((ele) => {
          return ele.uuid == uuid
        })
        if (item.editabled == false) {
          return
        }

        if (folderName == '' || folderName == rawName) {
          item.editabled = false
          return
        }
        if (!this.checkNameWrap(folderName, target)) {
          // 如果名称不合法,则恢复原名称
          if (rawName) {
            item.editabled = false
          }
          return
        }

        // 计算后缀
        const tmpSuffix = this.genSuffix(item)
        tmpSuffix ? (suffix = '.' + tmpSuffix) : ''

        // 找到这个元素
        item.oldName = item.name
        item.name = folderName + suffix
        item.editabled = false
        this.callFnByLocal(() => {
          this.fileSplice(this.fileList, uuid, item)
        }, null)
        // 重命名
        renameFile(uuid, folderName + suffix, item).then((res) => {
          if (res.code == 200) {
            ElMessage.success(this.$t('space.rename_success'))
          } else {
            ElMessage.error(this.$t('space.rename_fail'))
          }
          // 重置状态
          this._resetState()
        })
      }
    },
    /**
     * 文件删除及替换
     */
    fileSplice(fileList, uuid, fileInfo) {
      const index = this._findIndex(fileList, uuid)
      if (index != -1) {
        if (fileInfo) {
          // 文件信息存在就替换
          fileList.splice(index, 1, fileInfo)
        } else {
          fileList.splice(index, 1)
        }
      }
    },
    /**
     * 批量新增文件夹
     */
    batchCreateDir() {
      const tmp = []
      // this.initFloderChild()
      this.floderNameArr.forEach(({ folderName, uuid }) => {
        // 是刚创建的
        const promise = createdir({
          currentDirUuid: this.currentDirUuid,
          folderName,
          localUUid: uuid
        })
          .then((res) => {
            if (res.code == 200) {
              ElMessage.success(this.$t('space.create_success'))
            } else {
              ElMessage.error(this.$t('space.create_fail'))
            }
            return Promise.resolve()
          })
          .catch((e) => {
            return Promise.resolve()
          })
        tmp.push(promise)
      })
      this.floderNameArr = []
      Promise.all(tmp).then(() => {
        this.callFnByLocal(null, () => {
          this.initFileList()
        })
      })
    },
    /**
     * 点击文件，进入到文件夹下 清除文件选择状态
     */
    enterFloder(item) {
      if (item.is_create) {
        // 如果是未完成创建完成的文件夹，就不进入
        return
      }
      // 防止重复进入
      if (this.currentDirUuid == item.uuid) {
        return
      }
      if (item.isDir) {
        this.goFloder(item)
      } else {
        this.currentFile = item
        this.tryOpenFile(item)
      }
    },

    /**
     * 点击名称
     */
    clickName(item) {
      if (item.isDir) {
        this.enterFloder(item)
      } else {
        this.currentFile = item
        this.tryOpenFile(item)
      }
    },
    tryOpenFile(item) {
      if (item.category == 'picture' || item.category == 'video') {
        this.showImgList = true
      } else {
        this.$refs.previewRef.openFile(item)
      }
    },
    /**
     * 获得更多文件列表
     */
    getMoreFileList() {
      if (this.pageNum >= this.totalNum) {
        return
      }
      if (!this.loading) {
        this.pageNum = this.pageNum + 1
        this._getFileList('more')
      }
    },
    /**
     * 调用文件列表接口
     */
    _getFileList(type) {
      this.loading = true
      let params: any = {}
      if (this.category) {
        params.category = this.category
      }
      // 为列表需加上排序条件
      if (this.sortType == 1) {
        params.orderBy = this.currentSort
      }

      const { res, rej, promise } = genPromise()

      // 搜索模式 取getSearch  非搜索模式查询文件列表
      const requestApi = this.serflag ? getSearch : queryFilelist
      params = this.serflag ? { name: this.srinput } : params

      //this.fileId ? (params.uuid = this.fileId) : ''
      if (this.fileId) {
        params.uuid = this.fileId
      }
      params.pageSize = 100
      params.page = this.pageNum

      requestApi(params).then((data) => {
        this.loading = false
        if (data.code == 200) {
          if (type == 'init') {
            this.fileList = sortFileByDir(data.results.fileList || [])
          } else {
            this.fileList = this.fileList.concat(data.results.fileList || [])
          }
          this.totalNum = data.results.pageInfo.total
          res()
        } else {
          rej()
        }
      })
      return promise
    },
    /**
     * 初始化文件列表
     */
    initFileList() {
      this.pageNum = 1
      return this._getFileList('init')
    },

    /**
     * 展示文件详情,被子元素调用
     */
    toastFileDetail(fileDetail) {
      this.fileDetail = fileDetail
      this.showFileDetail = true
    },

    _findIndex(fileArray, uuid) {
      const index = fileArray.findIndex((ele) => {
        return ele.uuid == uuid
      })
      return index
    },
    /**
     * 全选
     */
    selectAll() {
      this.selectedFiles = []
      this.selectedFiles = [].concat(
        this.fileList.filter((item) => {
          return !item.is_create
        })
      )
      this.changeChooseStateAndActions()
    },
    /**
     * 全部取消
     */
    clearAll() {
      this.selectedFiles = []
      this.changeChooseStateAndActions()
    },
    /**
     * 重置文件列表及全选状态
     */
    _resetFileListAndChooseState() {
      this.initFileList().then(() => {
        this._resetState()
      })
    },

    _resetState() {
      this.selectedFiles = []
      this.actionsCopy = []
      this.currentFile = ''
    },
    /**
     * 改变actions 和  全选状态
     */
    changeChooseStateAndActions() {
      const lengthOne = this.selectedFiles.length
      // 当选择多个的时候 重命名不可用
      if (lengthOne == 0) {
        // 一个未选中
        this.actionsCopy = []
      } else {
        if (lengthOne == 1) {
          // todo 这里需要修改 选中一个 先不过滤
          this.actionsCopy = this.actions
        } else {
          // 选中多个  重命名和查看详细信息不可用
          this.actionsCopy = this.actions.filter((item) => {
            return item.action != 'rename' && item.action != 'detail'
          })
        }
      }

      // 当选择的文件中有文件夹时,不可下载
      let flag = false
      let imgFlag = false
      let fileFlag = false
      // 只要有一个文件夹
      flag = this.selectedFiles.some((item) => {
        return item.isDir
      })
      imgFlag = this.selectedFiles.some((item) => {
        return canOpenImg(item.name)
      })
      fileFlag = this.selectedFiles.some((item) => {
        return canOpenFile(item.name)
      })
      // 文件夹不能下载和打开
      if (flag) {
        this.actionsCopy = this.actionsCopy.filter((item) => {
          return item.action != 'download' && item.action != 'open'
        })
      }
      // 图片 和 文档不能同时打开
      if (imgFlag && fileFlag) {
        this.actionsCopy = this.actionsCopy.filter((item) => {
          return item.action != 'open'
        })
      }
      // 一次只能打开一个pdf 和 txt
      let fileCount = 0
      this.selectedFiles.forEach((item) => {
        if (canOpenFile(item.name)) {
          fileCount = fileCount + 1
        }
      })
      if (fileCount > 1) {
        this.actionsCopy = this.actionsCopy.filter((item) => {
          return item.action != 'open'
        })
      }
    },
    /**
     * 判断item 不在selectedFiles
     */
    genHoverCheck(item) {
      return this._findIndex(this.selectedFiles, item.uuid) == -1
    },
    /**
     * 单选
     */
    appendSelected(item) {
      if (this._findIndex(this.selectedFiles, item.uuid) == -1) {
        this.selectedFiles.push(item)
      }
      if (item.category == 'picture') {
        // 设置点击了哪张图片
        this.imgCurrentItem = item
      }
      this.changeChooseStateAndActions()
    },
    /**
     * 去掉勾选
     */
    spliceFromSelected(item) {
      const index = this._findIndex(this.selectedFiles, item.uuid)
      if (index != -1) {
        this.selectedFiles.splice(index, 1)
      }
      this.changeChooseStateAndActions()
    },
    /**
     * 生成图片类型
     */
    genSrc(item) {
      return genSrc(item)
    },

    /**
     * 图片列表中,删除按钮的操作,文件删除
     */
    deleteFile({ fileInfo, callBack }) {
      this._deleteFile([fileInfo], callBack)
    },
    _deleteFile(fileArr, callBack) {
      showSureModal({
        title: this.$t('space.delete_file', fileArr.length),
        content:
          fileArr.length == 1
            ? this.$t('space.file_recycle_bin', { name: fileArr[0].name })
            : this.$t('space.file_recycle_bins'),
        sure: () => {
          this.deleteShow = 1 //显示删除提示

          const uuidArr = fileArr.map((ele) => {
            return ele.uuid
          })
          deleteFile(uuidArr, fileArr).then((res) => {
            if (res.code == 200) {
              this.deleteSuccess(uuidArr, callBack, 0)
            } else if (res.code == 201) {
              this.deleteShow = 2 //设置进度条
              let taskId = res.results.taskId
              let deleteInterval = setInterval(() => {
                taskPercentage(taskId)
                  .then((result) => {
                    console.info('percentage', result)
                    if (result.code === 200) {
                      if (result.results.taskStatus === 'success') {
                        clearInterval(deleteInterval)
                        this.deleteSuccess(uuidArr, callBack, deleteInterval)
                      } else if (result.results.taskStatus === 'failed') {
                        this.deleteFailed(deleteInterval)
                      } else {
                        this.deletePercentage = Math.floor(
                          (result.results.processed / result.results.total) * 100
                        )
                      }
                    } else {
                      this.deleteFailed(deleteInterval)
                    }
                  })
                  .catch(() => {
                    this.deleteFailed(deleteInterval)
                  })
              }, 1000)
            } else {
              ElMessage.error(this.$t('space.delete_fail'))
            }
          })
        },
        cancel: () => {
          console.log('取消')
        }
      })
    },
    deleteFailed(deleteInterval) {
      clearInterval(deleteInterval)
      this.deleteShow = 0
      ElMessage.error(this.$t('space.delete_fail'))
    },
    deleteSuccess(uuidArr, callBack, deleteInterval) {
      clearInterval(deleteInterval)
      this.deleteShow = 0 //关闭删除框
      ElMessage.success(this.$t('space.delete_success'))
      typeof callBack === 'function' && callBack(null)
      // 尝试清理缓存
      uuidArr.forEach((uuid) => {
        clearCacheByuuid(uuid)
      })
      // fix bug 453
      this._resetState()
      this.changeChooseStateAndActions()
      this.initFileList()
    },
    /**
     * 展示delete弹框
     */
    showDeleteCover() {
      const selectedFiles = this.selectedFiles
      this._deleteFile(selectedFiles)
    },
    /**
     * 复制和移动 确定
     */
    makeSure(uuid, floderIdScope) {
      if (uuid == -1) {
        // 前端uuid 为-1 代表为根目录,但后端根目录 uuid空
        uuid = ''
      }
      if (this.actionFlag == 'move') {
        // 移动
        this.moveFile(uuid, floderIdScope)
      } else {
        // 复制
        this.copyFile(uuid)
      }
    },
    /**
     * 右键菜单
     */
    doAction(item) {
      if (item.action == 'download') {
        // 下载
        this.beginDownFile()
      } else if (item.action == 'detail') {
        // 详情
        this.toastFileDetail(this.selectedFiles[0])
      } else if (item.action == 'remove') {
        this.showDeleteCover(item)
      } else if (item.action == 'move') {
        this.showChooseFile = true
        this.actionFlag = 'move'
      } else if (item.action == 'rename') {
        this.selectedFiles[0].editabled = true // 设置可编辑
        this.editAction = 'rename'
        this.$forceUpdate()
        this.$nextTick(() => {
          // todo 这里有bug
          const uuid = this.selectedFiles[0].uuid
          this._force(uuid)
        })
      } else if (item.action == 'copy') {
        dealOffLine(() => {
          this.showChooseFile = true
          this.actionFlag = 'copy'
        })
      } else if (item.action == 'open') {
        this.tryOpenFile(this.selectedFiles[0])
      } else if (item.action == 'cancelChecked') {
        // 取消选中
        this.clearAll()
      } 
    },

    /**
     * 修改文件名
     */
    _force(uuid) {
      const targetId = uuid + '_editabled'
      const element = document.getElementById(targetId)
      element.focus()
    },

    /**
     * 移动文件
     * uuid => 目的路径的uuid
     * floderIdScope => 目的路径的uuid及祖先的uuid
     */
    moveFile(uuid, floderIdScope) {
      const moveingUUidArr = this.selectedFiles.map((item) => {
        return item.uuid
      })
      let flag = false
      for (let i = 0; i < moveingUUidArr.length; i++) {
        const moveuuid = moveingUUidArr[i]
        // 判断被移动的文件夹是否是目的文件夹本身或者目的文件夹的祖先
        flag = floderIdScope.some((floderId) => {
          return floderId == moveuuid
        })
        if (flag) {
          break
        }
      }
      // 判断
      const bakFileList = JSON.parse(JSON.stringify(this.fileList))

      if (!flag) {
        this.callFnByLocal(() => {
          moveingUUidArr.forEach((tmpUUid) => {
            // 从源文件列表中删除
            this.fileSplice(this.fileList, tmpUUid)
          })
        }, null)
        this.showChooseFile = false
        moveFile(uuid, moveingUUidArr, JSON.parse(JSON.stringify(this.selectedFiles))).then(
          (res) => {
            this.callFnByLocal(
              () => {
                if (res.code != 200) {
                  // 失败就还原
                  this.fileList = bakFileList
                }
              },
              () => {
                if (res.code == 200) {
                  this.initFileList()
                }
              }
            )
            if (res.code == 200) {
              ElMessage.success(this.$t('space.move_suc'))
            } else {
              if (res.message) {
                ElMessage.error(res.message)
              } else {
                ElMessage.error(this.$t('space.move_fail'))
              }
            }
            // fix bug 453
            this._resetState()
          },
          (err) => {
            console.log(err)
          }
        )
      } else {
        ElMessage.error(this.$t('space.move_fail_self'))
      }
    },

    /**
     * 复制文件
     */
    copyFile(uuid) {
      const targetUUidArr = this.selectedFiles.map((item) => {
        return item.uuid
      })
      this.showChooseFile = false
      copyFile(uuid, targetUUidArr, JSON.parse(JSON.stringify(this.selectedFiles))).then((res) => {
        // fix bug 453
        this._resetState()
        if (res.code == 200) {
          ElMessage.success(this.$t('space.copy_suc'))
        } else {
          if (res.message) {
            ElMessage.error(res.message)
          } else {
            ElMessage.error(this.$t('space.copy_fail'))
          }
        }
      })
    },

    /**
     * 下载文件
     */
    beginDownFile() {
      dealOffLine(() => {
        eventBus.$emit('startDownFile', this.selectedFiles)
      })
    },
    upFileFn(files) {
      dealOffLine(() => {
        eventBus.$emit('startuploadFile', files, false, this.foldHistoryList)
      })
    },

    /**
     * 上传文件或上传文件夹
     */
    handClickUpload(flag) {
      dealOffLine(() => {
        eventBus.$emit('startuploadFile', [], flag, this.foldHistoryList)
      })
    }
  }
})
</script>

<style lang="scss" scoped>
.video-child-one {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  z-index: 7;
  background-color: #000000;
  opacity: 0.7;
}

.video-child-two {
  width: 70%;
  height: 70%;
  position: fixed;
  left: 50%;
  top: 50%;
  z-index: 37;
  transform: translate(-50%, -50%);
}
.floatRight {
  margin-left: auto;
  margin-right: 26vw;
  width: 130px;
  text-align: left;
}
.not-last-color {
  color: #337aff;
}
.last-color {
  color: #85899c;
}

.select-count {
  float: right;
}
.img-right {
  width: 20px;
  height: 20px;
}
.historyFloder {
  display: inline-block;
}

.span-disabled {
  color: #dfe0e5;
}
.upload-demo {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
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

.empty-container {
  flex-direction: column;
  color: #bcbfcd;
  font-size: 14px;
  height: 100%;
}
.container {
  overflow: hidden;
  border-top: 1px solid #f5f6fa;
}
</style>
