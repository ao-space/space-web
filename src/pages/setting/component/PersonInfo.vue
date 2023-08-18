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
    <div v-if="flag === true">
      <div class="info">{{ $t('setting.person_info') }}</div>
      <div class="y-center">
        <span class="infoname">{{ $t('setting.person_icon') }}</span>
        <img class="imgtoux ml-20" :src="iconimg" />
      </div>
      <div class="y-center mt-20">
        <span class="infoname">{{ $t('setting.nick_name') }}</span>
        <div class="ml-20 y-center pl10 inputInfo">{{ personalName }}</div>
      </div>
      <div class="y-center mt-20">
        <span class="infoname">{{ $t('setting.signature') }}</span>
        <div class="ml-20 y-center pl10 inputInfo">{{ personalSign }}</div>
      </div>
      <div class="y-center mt-30">
       <span class="infoname">{{ $t('setting.space_channel') }}</span>
       <div class="ml-20 flex">
         <div class='tag1'>{{ $t('setting.lan') }}</div>
         <div class='tag3' v-if="domainName">{{ $t('setting.wlan') }}</div>
       </div>
     </div>
      <div class="y-center mt-40" v-if="domainName">
        <span class="infoname">{{ $t('setting.domain_name') }}1</span>
        <div class="ml-20 color-grey">{{ domainName }}</div>
      </div>
      <div class="y-center mt-40">
        <span class="infoname"></span>
        <span class="ml-20 button-blue" @click="chflag()">{{ $t('buttons.common_edit') }}</span>
      </div>
    </div>
    <div v-else>
      <div class="info">{{ $t('setting.person_info') }}</div>
      <div class="y-center">
        <span class="infoname">{{ $t('setting.person_icon') }}</span>
        <img
          class="imgtoux ml-20"
          :src="iconimg"
          alt=""
          style="cursor: pointer"
          @click="changeimg = true"
        />
      </div>
      <div class="y-center mt20">
        <span class="infoname">{{ $t('setting.nick_name') }}</span>
        <div class="ml-20">
          <el-input
            class="inputInfo"
            maxlength="24"
            :placeholder="$t('setting.name_tips')"
            show-word-limit
            v-model.trim="personalName_"
            @keyup="keyup"
            @keydown="keydown"
          ></el-input>
        </div>
      </div>
      <div class="y-center mt20">
        <span class="infoname">{{ $t('setting.signature') }}</span>
        <div class="ml-20">
          <el-input
            class="inputInfo"
            resize="none"
            maxlength="120"
            :placeholder="$t('setting.signature_tips')"
            show-word-limit
            v-model="personalSign_"
          ></el-input>
        </div>
      </div>
      <div class="y-center mt-30">
       <span class="infoname">{{ $t('setting.space_channel') }}</span>
       <div class="ml-20 flex">
         <div class='tag1'>{{ $t('setting.lan') }}</div>
         <div class='tag3'>{{ $t('setting.wlan') }}</div>
       </div>
     </div>
      <div class="y-center mt-30">
        <span class="infoname">{{ $t('setting.domain_name') }}</span>
        <div class="ml-20 color-grey">{{ domainName }}</div>
      </div>
      <div class="y-center mt10">
        <div style="margin-left: 120px" class="color-blue">{{ $t('setting.domain_name_tips') }}</div>
      </div>
      <div class="y-center mt-40">
        <span class="infoname"></span>
        <div class="ml-20 flex">
          <div class="button-blue mr-20" @click="savePerson">
            {{ $t('buttons.common_save') }}
          </div>
          <div class="button-white" @click="cancelPerson">
            {{ $t('buttons.common_cancel') }}
          </div>
        </div>
      </div>
    </div>
    <el-dialog v-model="changeimg" :title="$t('setting.change_avatar')">
      <div class="flex cropper-container">
        <div class="x-center" style="background-color: #f5f6fa; width: 470px; height: 300px">
          <div style="width: 300px; height: 300px">
            <vueCropper
              ref="cropper"
              :img="option.img"
              :output-size="option.size"
              :output-type="option.outputType"
              :info="true"
              :full="option.full"
              :fixed="option.fixed"
              :fixed-number="option.fixedNumber"
              :canMove="true"
              :canMoveBox="false"
              :fixed-box="option.fixedBox"
              :original="option.original"
              :auto-crop="option.autoCrop"
              :auto-crop-width="option.autoCropWidth"
              :auto-crop-height="option.autoCropHeight"
              :center-box="option.centerBox"
              @real-time="realTime"
              :high="option.high"
              mode="cover"
            >
            </vueCropper>
            <div class="mt-7">
              <el-upload
                auto-upload:flase
                :file-list="fileList"
                :show-file-list="false"
                :auto-upload="false"
                :multiple="false"
                :on-change="handelOnChange"
              >
                <span class="color-blue">{{ $t('setting.select_picture') }}</span>
              </el-upload>
            </div>
          </div>
        </div>
        <div class="ml-auto">
          <div class="mb-14 fw-b">{{ $t('setting.avatar_preview') }}</div>
          <div style="width: 100px; height: 100px; background-color: #d7d7d7">
            <div :style="previewStylea">
              <div :style="previews.div">
                <img :src="previews.url" :style="previews.img" style="max-width: max-content" />
              </div>
            </div>
          </div>
          <div class="mt-13 mb-14 font-12">100x100</div>
          <div style="margin-left: 27px; width: 50px; height: 50px; background-color: #d7d7d7">
            <div :style="previewStyleb">
              <div :style="previews.div">
                <img :src="previews.url" :style="previews.img" style="max-width: max-content" />
              </div>
            </div>
          </div>
          <div class="mt-13 mb-14 font-12">50x50</div>
          <div style="margin-left: 37px; width: 30px; height: 30px; background-color: #d7d7d7">
            <div :style="previewStylec">
              <div :style="previews.div">
                <img :src="previews.url" :style="previews.img" style="max-width: max-content" />
              </div>
            </div>
          </div>
          <div class="mt-13 mb-14 font-12">30x30</div>
        </div>
      </div>
      <template #footer>
        <div class="y-center">
          <div class="ml-auto button-blue" @click="ref(), (changeimg = false)">
            {{ $t('buttons.common_ok') }}
          </div>
          <div class="ml-20 button-white" @click="changeimg = false">
            {{ $t('buttons.common_cancel') }}
          </div>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { getPersonal, postPersonal, getImage, postImg } from '@/api/index'
import iconimg from '@/assets/touxiang.png'
import { dealOffLine } from '@/utils/offlineHelp'
import { VueCropper } from 'vue-cropper'
import 'vue-cropper/dist/index.css'
import { ElMessage } from 'element-plus'
import { getPersonalCache } from '@/business/login/loginUtils'

export default {
  name: 'PersonInfo',
  components: {
    VueCropper
  },
  emits: ['personIconChange'],
  data() {
    return {
      flag: true,
      domainName: '',
      personalName: '',
      personalSign: '',
      personalName_: '',
      personalSign_: '',
      iconimg: iconimg,
      prewimg: iconimg,
      changeimg: false, //更换头像
      option: {
        img: iconimg,
        size: 1,
        full: false,
        outputType: 'png',
        canMove: false,
        fixed: true,
        fixedNumber: [1, 1],
        fixedBox: true,
        original: false,
        canMoveBox: true,
        autoCrop: true,
        // 只有自动截图开启 宽度高度才生效
        autoCropWidth: 300,
        autoCropHeight: 300,
        centerBox: false,
        high: true
      },
      previewStylea: {},
      previewStyleb: {},
      previewStylec: {},
      previews: {},
      fileList: []
    }
  },
  beforeMount() {
    this.persapi()
    this.gimgapi()
  },
  methods: {
    savePerson() {
      this.pimgapi()
      postPersonal(this.personalName_, this.personalSign_).then((result) => {
        if (result.code === 'ACC-201') {
          this.personalName = this.personalName_
          this.personalSign = this.personalSign_
          this.flag = true
          this.$emit('personIconChange')
        } else if (result.code === 'ACC-400') {
          ElMessage.error(this.$t('setting.space_id_error'))
        } else {
          ElMessage.error(this.$t('notify.opera_fail'))
        }
      })
    },
    cancelPerson() {
      this.gimgapi()
      this.personalName_ = this.personalName
      this.personalSign_ = this.personalSign
      this.flag = true
    },
    keyup() {
      this.personalName_ = this.personalName_.replace(
        /[`~!@#$%^&*()\-+=<>?:"{}|,.\/;'\\[\]·~！@#￥%……&*（）——\-+={}|《》？：“”【】、；‘’，。、]/g,
        ''
      )
    },
    keydown() {
      this.personalName_ = this.personalName_.replace(
        /[`~!@#$%^&*()\-+=<>?:"{}|,.\/;'\\[\]·~！@#￥%……&*（）——\-+={}|《》？：“”【】、；‘’，。、]/g,
        ''
      )
    },
    pimgapi() {
      if (typeof this.prewimg === 'string') {
        return
      }
      postImg(this.prewimg).then((result) => {
        if (result.code === 200) {
          this.$emit('personIconChange')
        }
      })
    },
    chflag() {
      dealOffLine(() => {
        this.flag = false
      })
    },
    ref() {
      this.iconimg = window.URL.createObjectURL(this.prewimg)
    },
    persapi() {
      let data = getPersonalCache()
      if (data && data.code === 'ACC-200') {
        this.personalName = data.results[0].personalName
        this.personalSign = data.results[0].personalSign
        this.personalName_ = this.personalName
        this.personalSign_ = this.personalSign
        this.domainName = data.results[0].userDomain ? 'https://' + data.results[0].userDomain:''
      } else {
        getPersonal().then((data) => {
          if (data.code === 'ACC-200') {
            this.personalName = data.results[0].personalName
            this.personalSign = data.results[0].personalSign
            this.personalName_ = this.personalName
            this.personalSign_ = this.personalSign
            this.domainName = 'https://' + data.results[0].userDomain
          }
        })
      }
    },
    gimgapi() {
      getImage().then((blob) => {
        let URL = window.URL.createObjectURL(blob)
        this.iconimg = URL
        this.option.img = URL
      })
    },
    getcrop() {
      this.$refs.cropper.getCropBlob((data) => {
        this.prewimg = data
      })
    },
    realTime(data) {
      let previews = data
      this.getcrop()

      this.previewStylea = {
        width: previews.w + 'px',
        height: previews.h + 'px',
        overflow: 'hidden',
        margin: '0',
        'border-radius': '50%',
        zoom: 100 / previews.w
      }

      this.previewStyleb = {
        width: previews.w + 'px',
        height: previews.h + 'px',
        overflow: 'hidden',
        margin: '0',
        zoom: 50 / previews.w,
        'border-radius': '50%'
      }
      this.previewStylec = {
        width: previews.w + 'px',
        height: previews.h + 'px',
        overflow: 'hidden',
        margin: '0',
        zoom: 30 / previews.w,
        'border-radius': '50%'
      }
      this.previews = data
    },
    handelOnChange(file, fileList) {
      if (fileList.length > 0) {
        this.fileList = [fileList[fileList.length - 1]]
      }
      let files = this.fileList[0].raw
      let reader = new FileReader()
      reader.readAsArrayBuffer(files)

      reader.onload = async (e) => {
        let blob = new Blob([e.target.result], { type: ' image/png' })
        let URL = window.URL.createObjectURL(blob)
        //this.refreshCrop();
        this.option.img = URL
      }
    }
  }
}
</script>

<style scoped lang="scss">
.tag1{
  padding: 0 10px;
  height: 22px;
  line-height: 22px;
  background: #DCFEF4;
  border-radius: 11px;
  color: #43D9AF;
  font-size: 12px;
  margin-right: 6px;
  text-align: center;
}
.tag2{
  background: #FFEFCE;
  color: #EAAE39;
  @extend .tag1
}
.tag3{
  background: #DFEAFF;
  color: #337AFF;
  @extend .tag1
}
.cropper-container {
  height: 340px;
  padding: 20px 30px;
}
.info {
  font-weight: bolder;
  color: #464956;
  font-size: 20px;
  margin-bottom: 20px;
}
.infoname {
  width: 100px;
  text-align: right;
}
.el-input {
  --el-input-background-color: #f9fafd;
  --el-input-bg-color: #f9fafd;
  width: 670px;
  height: 42px;
}
.inputInfo {
  width: 670px;
  height: 42px;
  border-radius: 6px;
  background-color: #f9fafd;
}
.imgtoux {
  height: 70px;
  width: 70px;
  border-radius: 50%;
}
::v-deep(.el-dialog) {
  width: 700px;
}
</style>
