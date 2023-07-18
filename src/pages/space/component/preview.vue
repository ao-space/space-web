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

<style lang="scss" scoped>
.excel-container {
  width: 100%;
}
table {
  table-layout: fixed !important;
  width: 100% !important;
  border-collapse: collapse;
  border: none;
  font-size: 0.23rem;
}

td,
th {
  width: 1px;
  white-space: nowrap; /* 自适应宽度*/
  word-break: keep-all; /* 避免长单词截断，保持全部 */
  border: solid #676767 1px;
  text-align: center;
  white-space: pre-line;
  word-break: break-all !important;
  word-wrap: break-word !important;
  display: table-cell;
  vertical-align: middle !important;
  white-space: normal !important;
  height: auto;
  vertical-align: text-top;
  padding: 2px 2px 0 2px;
  display: table-cell;
}
.previewContainer {
  width: 100vw;
  height: 100vh;
  color: #85899c;
  z-index: 1000;
}
.pdftest {
  width: 800px;
  height: 95vh;
  background: white;
  overflow: auto;
  margin: 0 auto;
  color: black;
  scrollbar-width: none;
}
.unsupport {
  width: 100%;
  height: 94vh;
}
.unsupport > img {
  width: 112px;
  height: 126px;
  margin-top: -60px;
}
.preview-Cover {
  background: #f4f5fb !important;
  z-index: 1002;
}

.preview-actionList {
  margin: 10px auto 0 auto;
  text-align: center;
}
.preview-actionList > img {
  width: 20px;
  height: 20px;
}

.preview-download {
  width: 20px;
  height: 20px;
  margin-right: 54px;
}
.title {
  background: white;
  color: #464956;
  height: 40px;
  align-items: center;
}
</style>
<template>
  <cover v-show="showCover" class="preview-Cover">
    <div class="previewContainer">
      <div class="flex justify-between title pl34 pr32 mb16">
        <span class="font14">{{ fileName }}</span>
        <div class="flex y-center">
          <img
            class="preview-download pointer"
            src="@/assets/preview-down.png"
            alt=""
            v-show="!unsupportflag"
            @click="beginDown"
          />
          <img
            class="preview-download delete pointer"
            src="@/assets/preview-delete.png"
            alt=""
            v-show="!unsupportflag"
            @click="deleteFile"
          />
          <el-icon @click="close" style="font-size: 19px" class="pointer">
            <Close />
          </el-icon>
        </div>
      </div>
      <div id="pdftest" class="pdftest"  v-show="!unsupportflag"></div>
      <div class="unsupport flex-column xy-center" v-show="unsupportflag">
        <img src="@/assets/unsupport.svg" />
        <span>{{ $t('space.preview_support') }}</span>
      </div>
    </div>
  </cover>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import cover from '@/components/cover.vue'
import { fileDownLoad } from '@/api/file'
import { isWord } from '@/assets/resourceMap.js'
import { blobToString, blobToArrayBuffer, getPuffixAndSuffix } from '@/utils/help'
import XLSX from 'xlsx'
import { ElMessage } from 'element-plus'

interface FileInfo {
  name: string
  uuid: string
  [key: string]: any
}
export default defineComponent({
  components: { cover },
  props: {
    floderData: Object,
    fileDetail: Object
  },
  emits: ['deleteFile', 'cancel'],
  data() {
    return {
      showCover: false,
      fileName: '',
      fileInfo: {},
      unsupportflag: false
    }
  },
  methods: {
    close() {
      this.showCover = false
    },
    _downFile(fileInfo: FileInfo, successBack) {
      document.getElementById('pdftest').innerHTML = ''
      this.pdfUrl = ''
      this.showCover = true
      this.fileName = fileInfo.name
      this.fileInfo = fileInfo
      let params = {
        name: fileInfo.name,
        success: (error, blob) => {
          successBack(blob)
        },
        autoSave: false
      }
      fileDownLoad(params, fileInfo.uuid)
    },
    openPdf(pdfInfo: FileInfo) {
      this._downFile(pdfInfo, (blob) => {
        let test = new Blob([blob], {
          type: 'application/pdf;chartset=UTF-8'
        })
        var fileURL = URL.createObjectURL(test)

        console.log(this.pdfUrl)
        document.getElementById(
          'pdftest'
        ).innerHTML = `<iframe src="/space/pdf/web/viewer.html?file=${decodeURI(
          fileURL
        )}" frameborder="0" style="width: 100%; height:95vh;overflow:auto"></iframe>`
      })
    },
    openTxt(txtInfo: FileInfo) {
      this._downFile(txtInfo, (blob) => {
        blobToString(blob).then((result) => {
          let mapStr = {
            '<': '&lt;',
            '>': '&gt;'
          }
          for (let key in mapStr) {
            let rxg = new RegExp(key, 'g')
            result = result.replace(rxg, mapStr[key])
          }
          let rxg = new RegExp(' ', 'g')
          result = result.replace(rxg, '&nbsp;')
          document.getElementById('pdftest').innerHTML =
            '<pre style="width:800px;height:93vh;overflow:auto">' + result + '</pre>'
        })
      })
    },
    openExecl(execlInfo: FileInfo) {
      this._downFile(execlInfo, (blob) => {
        blobToArrayBuffer(blob).then((buffer) => {
          let wb = XLSX.read(buffer, { type: 'buffer' })
          let wsname = wb.SheetNames[0]
          let ws = wb.Sheets[wsname]
          let HTML = XLSX.utils.sheet_to_html(ws)
          document.getElementById('pdftest').innerHTML = HTML
        })
      })
    },
    openWord(wordInfo: FileInfo) {
      this._downFile(wordInfo, (blob) => {
        blobToArrayBuffer(blob).then((buffer) => {
          window.mammoth
            .convertToHtml({ arrayBuffer: buffer })
            .then((displayResult) => {
              console.log(displayResult)
              let newhtml = displayResult.value
                .replace(//g, '')
                .replace('<h1>', '<h1 style="text-align: center;">')
                .replace(/<table>/g, '<table style="border-collapse: collapse;">')
                .replace(/<tr>/g, '<tr style="height: 30px;">')
                .replace(/<td>/g, '<td style="border: 1px solid pink;">')
                .replace(/<p>/g, '<p style="text-indent: 2em;">')
              document.getElementById('pdftest').innerHTML = newhtml
            })
            .done()
        })
      })
    },
    openFile(fileInfo: FileInfo) {
      let name = fileInfo.name
      let { suffix } = getPuffixAndSuffix(name)
      this.unsupportflag = false
      // todo 这里要改方法
      if (suffix == 'pdf') {
        // pdf
        this.openPdf(fileInfo)
      } else if (suffix == 'txt') {
        this.openTxt(fileInfo)
      } else if (suffix == 'xlsx') {
        this.openExecl(fileInfo)
      } else if (isWord(name)) {
        this.openWord(fileInfo)
      } else {
        this.fileName = fileInfo.name
        this.unsupport()
      }
    },
    unsupport() {
      this.showCover = true
      this.unsupportflag = true
    },
    beginDown() {
        ElMessage.info(this.$t('downUpload.down_start'))
      let params = {
        name: this.fileInfo.name,
        autoSave: true
      }
      let uuid = this.fileInfo.uuid
      fileDownLoad(params, uuid)
    },
    deleteFile() {
      this.$emit('deleteFile', {
        fileInfo: this.fileInfo,
        callBack: () => {
          this.showCover = false
        }
      })
    }
  }
})
</script>
