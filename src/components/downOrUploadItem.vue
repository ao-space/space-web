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
  <div class="item" :style="genContainerStyle()">
    <img :src="genSrc()" class="filetype" />
    <div class="ml10 mt2 w72">
      <a
        class="db text fw600 mb2 overflow-ellipsis"
        :style="genAStyle()"
        :title="item.name"
        href="javascript:0"
        >{{ item.name }}</a
      >
      <span class="db text fw200">{{ genTotalText() }}</span>
    </div>
    <span class="ml40 text fw400 w46" v-if="loaded != total && percent != 100">{{ speed }}</span>
    <span v-else class="ml40 text fw400 w46" style="opacity: 0">占位</span>
    <div class="ml36">
      <div class="progressContainer">
        <div class="progress" :style="{ width: process + '%' }"></div>
      </div>
      <span class="text mt6 dib" :style="genStatusStyle()" v-if="!isPause">{{
        $t(genStatusText()) + reson
      }}</span>
      <span class="text mt6 dib" :style="genStatusStyle()" v-else>{{
        $t('downUpload.state_pause')
      }}</span>
    </div>
    <img
      src="@/assets/jixu.png"
      v-if="isPause && status != 2 && status != 3"
      style="width: 18px; height: 18px"
      class="mr-19 ml29 pointer"
      @click="resume"
    />
    <img
      src="@/assets/pause.png"
      v-if="!isPause && status != 2 && status != 3"
      style="width: 18px; height: 18px"
      class="ml29 pointer"
      @click="pause"
    />

    <el-icon @click="closeSingleDown" style="font-size: 18px" class="pointer ml19">
      <Close />
    </el-icon>
  </div>
</template>

<script>
import { httpfileDownUtil } from '@/business/fileDown/sequelDownUtil'
const downMap = {
  0: 'downUpload.down_wait',
  1: 'downUpload.down_download',
  2: 'downUpload.down_complete',
  3: 'downUpload.down_fail'
}
const upMap = {
  0: 'downUpload.upload_wait',
  1: 'downUpload.upload_download',
  2: 'downUpload.upload_complete',
  3: 'downUpload.upload_fail'
}
import { saveAs } from 'file-saver'
import { showSureModal } from '@/utils/toast'
import { genSrc } from '@/assets/resourceMap.js'
import {
  httpfileUploadUtil as httpfileUploadUtilNew
} from '@/business/fileUp/sequelUpUtilNew'
import { ElMessage } from 'element-plus'

export default {
  props: {
    item: Object,
    type: String, // 'upload' | 'download'
    currentNetWorkType: String | Number
  },
  emits: [
    'closeSingleDown',
    'changeTotalProgress',
    'subFailLength',
    'uploadFail',
    'uploadSuccess',
    'downloadSuccess'
  ],
  data() {
    return {
      percent: 0,
      status: 0,
      loaded: 0,
      total: 0,
      speed: '', // 速度
      reson: '', // 失败原因
      isPause: false, // 是否暂停
      uploadId: '', // 上传任务id
      pauseedSaveInfo: {
        // 暂停时存在的信息
        res: '', // Blob| json | response
        status: 0,
        progress: {
          percent: 0,
          loaded: 0,
          total: 0
        }
      },
      stop: false, // 是否停止
      timeBegin: 0, // 开始时间
      timeEnd: 0 // 结束时间
    }
  },
  computed: {
    process() {
      if (this.percent > 100) {
        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
        this.percent = 100
      }
      return this.percent
    }
  },
  mounted() {
    this.beginRequest()
    this.timeBegin = 0
  },
  methods: {
    genSrc() {
      if (this.item) {
        return genSrc(this.item)
      }
    },
    async beginRequest() {
      const params = {
        name: this.item.name,
        success: (_error, res, allNum) => {
          if (!this.isPause) {
            this.changeSuccess(res)
          } else {
            this.pauseedSaveInfo.res = res
            this.pauseedSaveInfo.status = 2
          }
          // hack 修复成功时percent != 100 的bug
          setTimeout(() => {
            if (this.loaded !== this.total) {
              this.changeProgress('100', this.total, this.total)
            }
          }, 50)
          // 统计数据
          this.statistics(allNum)
        },
        fail: (response) => {
          if (!this.isPause) {
            //console.log('文件失败')
            this.changeFail(response)
          } else {
            this.pauseedSaveInfo.res = response
            this.pauseedSaveInfo.status = 3
          }
        },
        progress: (percent, all) => {
          if (this.status === 3 || this.status === 2) {
            return
          }
          this.status = 1
          const { loaded, total } = all
          if (!this.isPause) {
            this.changeProgress(percent, loaded, total)
          } else {
            this.pauseedSaveInfo.progress = {
              percent,
              loaded,
              total
            }
          }
          // hack  把上传id 传过来，方便上传过程中取消
          if (all.uploadId) {
            this.uploadId = all.uploadId
          }
        },
        autoSave: false,
        begin: () => {
          if (this.status === 3 || this.status === 2) {
            return
          }
          this.status = 1
          if (!this.timeBegin) {
            //console.log('开始下载或者上传')
            this.timeBegin = new Date().getTime()
            const loaded = this.loaded
            this.genSpeed(loaded)
          }
        },
        type: this.type
      }

      if (this.type === 'upload') {
        // 上传
        params.file = this.item.file
        params.name = this.item.name

        this.actionMap = await httpfileUploadUtilNew(params, this.item.path)
      } else {
        // 下载

        params.fileSize = this.item.size

        this.actionMap = await httpfileDownUtil(params, this.item)
      }
    },

    // 计算统计数据
    statistics(allNum) {
      this.timeEnd = new Date().getTime()
      const constTime = (this.timeEnd - this.timeBegin) / 1000

      let speed = (this.total / constTime).toFixed(2)
      if (speed < 1024) {
        if (speed <= 0) {
          speed = '0.00KB/S'
        } else {
          speed = Number(this.speed).toFixed(2) + 'KB/S'
        }
      } else {
        speed = Number(speed / (1024 * 1024)).toFixed(2) + 'MB/S'
      }
      let text = `统计耗时-文件:${this.item.name},大小:${this.genTotalText()}-${
        this.type == 'upload' ? '上传' : '下载'
      }-耗时(${constTime})s,速度:${speed}`
      if (allNum) {
        text += `,其上传下载总数:${allNum.totalNum},http数量:${
          allNum.httpNum ? allNum.httpNum : 0
        }`
      }
      console.log(text)
    },

    changeProgress(percent, loaded, total) {
      this.percent = percent
      this.loaded = loaded
      this.total = total
      this.$emit('changeTotalProgress', this.item.uuid, percent)
    },

    changeSuccess(res) {
      // 状态为失败了 不能在变成成功
      if (this.status === 3) {
        return
      }
      this.status = 2
      if (this.type === 'upload') {
        this.$emit('uploadSuccess', res)
      }
      if (this.type === 'download') {
        this.$emit('downloadSuccess', this.item)
        // 保存文件
        if (!this.stop) {
          saveAs(res, this.item.name)
        }
      }
    },
    changeFail(response) {
      if (this.status === 2 || this.status === 3) {
        // 成功不能变成失败
        return
      }
      if (this.actionMap && typeof this.actionMap.cancel === 'function') {
        this.actionMap.cancel()
      }

      this.status = 3
      if (this.type === 'upload') {
        // 上传失败,通知父元素
        this.$emit('uploadFail')
      }
      if (response && response.code == '1036') {
        this.reson = this.$t('downUpload.insufficient')
      }
      //  文件不存在
      if (response && response.code === 1003) {
        ElMessage.error(this.$t('downUpload.no_exist'))
        this._sureDelete()
      }
    },

    /**
     * 补齐success|fail|progress 等回调事件
     */
    resumeStatus() {
      const { status, progress, res } = this.pauseedSaveInfo
      if (status === 2 || status === 3) {
        this.status = status
        if (status === 2) {
          // 成功
          this.changeSuccess(res)
        }

        if (status === 3) {
          // 失败
          this.changeFail(res)
        }
        const { percent, loaded, total } = progress
        this.changeProgress(percent, loaded, total)
      }
    },

    resume() {
      this.isPause = false
      this.actionMap.resume()
      this.resumeStatus()
    },

    pause() {
      this.isPause = true
      this.actionMap.pause()
    },
    /**
     * 清除计时器
     */
    clearTimeCircle() {
      if (this._timeCircle) {
        clearTimeout(this._timeCircle)
      }
    },
    async closeSingleDown() {
      showSureModal({
        title: this.$t('space.delete_file'),
        content: this.$t('space.delete_content', { name: this.item.name }),
        sure: () => {
          this._sureDelete()
        },
        cancel: () => {
          console.log('取消')
        }
      })
    },

    _sureDelete() {
      if (this.actionMap) {
        this.actionMap.cancel(this.status, this.uploadId)
        this.stop = true
      }
      this.$emit('closeSingleDown', this.item, this.type)
      if (this.status === 3) {
        // 下载失败
        this.$emit('subFailLength')
      }
    },
    /**
     * 计算下载速度
     */
    genSpeed(lastLoad) {
      this.speed = this.loaded - lastLoad
      if (this.speed < 1024) {
        if (this.speed < 0) {
          this.speed = 0
        }
        this.speed = Number(this.speed).toFixed(2) + 'KB/S'
      } else {
        this.speed = Number(this.speed / (1024 * 1024)).toFixed(2) + 'MB/S'
      }
      if (this.loaded !== this.total || this.loaded === 0) {
        const loaded = this.loaded
        this._timeCircle = setTimeout(() => {
          this.genSpeed(loaded)
        }, 980)
      }
    },
    genStatusText() {
      let map
      if (this.type === 'upload') {
        map = upMap
      } else {
        map = downMap
      }

      return map[this.status]
    },
    genContainerStyle() {
      if (this.status === '3') {
        return 'background: rgba(51, 122, 255, 0.1);'
      }
      return ''
    },
    // todo 需要确定文件的size
    genTotalText() {
      if (this.total === 0) {
        return ''
      }
      if (!this.genTotalText.totalMb) {
        if (this.total < 1024 * 1024) {
          this.genTotalText.totalMb = parseFloat(Number(this.total / (1024 * 1)).toFixed(2)) // kb
        } else {
          this.genTotalText.totalMb = parseFloat(Number(this.total / (1024 * 1024)).toFixed(2))
        }
      }

      const totalMb = this.genTotalText.totalMb
      if (this.total === this.loaded) {
        if (this.total < 1024 * 1024) {
          return `${totalMb}KB/${totalMb}KB`
        }
        return `${totalMb}MB/${totalMb}MB`
      }
      let loaded = this.loaded / 1024
      if (this.total < 1024 * 1024) {
        loaded = parseFloat(Number(loaded).toFixed(2))
        if (loaded > totalMb) {
          loaded = totalMb
        }
        return `${loaded}KB/${totalMb}KB`
      } else {
        if (loaded < 1024) {
          return `${Number(loaded).toFixed(2)}KB/${totalMb}MB`
        } else {
          loaded = parseFloat(Number(loaded / 1024).toFixed(2))
          if (loaded > totalMb) {
            loaded = totalMb
          }
          return `${loaded}MB/${totalMb}MB`
        }
      }
    },
    genStatusStyle() {
      if (this.status == 2) {
        return 'color:#85899C'
      }
      if (this.status == 3) {
        return 'color:#F6222D'
      }
      return ''
    },

    genAStyle() {
      if (this.loaded != this.total && this.percent != 100) {
        return 'max-width: 90px; display: inline-block;color:#464956 '
      }
      return 'max-width: 150px; display: inline-block;color:#464956 '
    }
  },
  beforeUnmount() {
    this.clearTimeCircle()
  }
}
</script>

<style lang="scss" scoped>
.w72 {
  width: 72px;
}
.w46 {
  width: 46px;
}
.mt2 {
  margin-top: 2px;
}
.ml32 {
  margin-left: 32px;
}
.ml40 {
  margin-left: 40px;
}
.mt6 {
  margin-top: 6px;
}
.ml36 {
  margin-left: 36px;
}
.filetype {
  width: 50px;
  height: 50px;
}

.text {
  font-size: 12px;
  color: #464956;
  font-weight: 600;
  text-decoration: none;
  user-select: none;
  border-bottom: none;
  &:hover {
    cursor: default;
  }
}
.mb2 {
  margin-bottom: 2px;
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
.progressContainer {
  width: 380px;
  height: 6px;
  background: rgba(51, 122, 255, 0.1);
  border-radius: 3px;
  position: relative;
  .progress {
    position: absolute;
    height: 100%;
    background: #337aff;
    border-radius: 3px;
  }
}
.item {
  display: flex;
  align-items: center;
  padding: 20px 10px 20px 0px;
  width: 720px;
  border-bottom: #eceef4 1px solid;
}
</style>
