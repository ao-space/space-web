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
  <cover class="bg" style="z-index: 100">
    <el-icon @click="close" style="font-size: 19px; z-index: 200" class="close pointer">
      <Close></Close>
    </el-icon>

    <div class="imgListBody" v-if="imgList.length">
      <div class="imgName">
        {{ imgList[currentIndex].name }}&nbsp;&nbsp; ({{ currentIndex + 1 }}/{{ imgList.length }})
      </div>
      <div class="imgListContent">
        <img src="@/assets/left.svg" class="pointer" @click="goNext(-1)" v-if="currentIndex != 0" />
        <img src="@/assets/leftgray.svg" v-else />

        <div class="imgcontainer x-center y-center" v-rect="genContainerHeight">
          <img
            v-show="!play"
            :src="imgList[currentIndex].imgsrc ? imgList[currentIndex].imgsrc : defaultImg"
            class="bigImg"
            @error="loadFail"
          />
          <img
            v-show="!play && isVideo"
            src="@/assets/start.svg"
            class="start pointer"
            @click="playVideo"
          />
          <div ref="videoContainer" v-show="play" style="width: 100%; height: 100%">
            <video
              class="video-js vjs-default-skin"
              id="videoPlayer"
              style="width: 100%; height: 100%; object-fit: contain"
              controls
              autoplay
            ></video>
          </div>
        </div>

        <img
          src="@/assets/right.svg"
          class="pointer"
          @click="goNext(1)"
          v-if="currentIndex !== imgList.length - 1"
        />
        <img v-else src="@/assets/rightgray.svg" />
      </div>
      <div class="actionList" v-if="editable">
        <img class="download pointer" src="@/assets/xiazai.svg" alt="" @click="beginDown" />
        <img class="download pointer" src="@/assets/del.svg" alt="" @click="deleteFile" />
      </div>
      <div class="imgListFooter" ref="imgListFooter">
        <img
          v-for="(item, index) in imgList"
          :src="item.imgsrc ? item.imgsrc : defaultImg"
          :key="item.uuid"
          :class="currentIndex === index ? 'smallImg-selected' : 'smallImg'"
          @click="dealClick(index)"
          @error="errorDeal"
        />
      </div>
    </div>
  </cover>
</template>
<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { getVideoM3u8, checkVideoM3u8 } from '@/api/index'
import {fileDownLoad,fileCompressed} from '@/api/file'
import cover from '@/components/cover.vue'
import defaultImg from '@/assets/loading.png'
import errorImg from '@/assets/error.png'
import heic2any from 'heic2any'
import likeIcon from '@/assets/like.svg'
import likeIconGray from '@/assets/likegray.svg'
import {
  setOriginFileCache,
  getOriginFileCache,
  setYasuoImgCache,
  getYasuoImgCache
} from '@/utils/indexdbUtil'

import { isImgBlob } from '@/utils/help'
import { ElMessage } from 'element-plus'
import localforage from 'localforage'
import { useGenHeight } from '@/utils/use'
import { getSuolueImgCache } from '../../../utils/indexdbUtil'
import shibai from '@/assets/shibai.svg'
import videojs from 'video.js'
import eventBus from '@/utils/eventbus'

interface imgDetail {
  downing?: number
  name: string
  imgsrc: string
  uuid: string
  category: string
}
export default defineComponent({
  components: { cover },
  emits: ['close', 'deleteImg'],
  props: {
    fileList: {
      type: Array as PropType<imgDetail[]>,
      default: []
    },
    currentFile: Object, // 用户当前点击的是哪个图片
    editable: {
      type: Boolean,
      default: true
    },
    album: {
      type: Boolean,
      default: false
    }
  },
  beforeUnmount() {
    if (this.player) {
      this.player.dispose()
    }
  },
  computed: {
    likeIcon() {
      return this.imgList[this.currentIndex].like ? likeIcon : likeIconGray
    },
    isVideo() {
      return this.imgList[this.currentIndex].category == 'video'
    }
  },
  data() {
    return {
      imgList: [],
      currentIndex: 0,
      play: false,
      player: null,
      errorMessage: true,
      defaultImg: defaultImg
    }
  },
  mounted() {
    this.imgList = this.fileList.filter((item) => {
      return item.category == 'picture' || item.category == 'video'
    })

    let currentIndex = this.imgList.findIndex((item) => {
      return item.uuid == this.currentFile.uuid
    })
    this.currentIndex = currentIndex != -1 ? currentIndex : 0

    /**
     * 开始展示图片
     * */
    this.imgList.forEach((imgInfo) => {
      setTimeout(() => {
        this.getBlob(imgInfo)
      }, 50)
    })

    this.dealClick(this.currentIndex)
  },
  methods: {
    playVideo() {
      let item = this.imgList[this.currentIndex]
      if (item.category !== 'video') {
        return
      }

      checkVideoM3u8(item.uuid).then((result) => {
        if (result.code !== 'VOD-200') {
          ElMessage.error(this.$t('share.video_preview'))
          return
        }

        this.play = true
        getVideoM3u8(item.uuid).then((m3u8File) => {
          let blob = new Blob([m3u8File])
          let videoUrl = window.URL.createObjectURL(blob)
          let options = {
            autoplay: true,
            controls: true,
            muted: false,
            sources: [
              {
                src: videoUrl,
                type: 'application/x-mpegURL' // 告诉videojs,这是一个hls流
              }
            ]
          }
          let videoPlayer = document.getElementById('videoPlayer')
          const { xhr: videojsXHR } = videojs
          videojs.Vhs.xhr.original = false
          videojs.Vhs.xhr = (options,callback)=>{
            return videojsXHR(options,callback)
          }
          this.player = videojs(videoPlayer, options)
        })
      })
    },
    close() {
      this.$emit('close')
    },
    closePlayer() {
      this.play = false
      if (this.player) {
        this.player.dispose()
        this.$refs.videoContainer.innerHTML =
          ' <video class="video-js vjs-default-skin"\n' +
          '              id="videoPlayer"\n' +
          '              style="width: 100%; height: 100%; object-fit: contain"\n' +
          '              controls\n' +
          '              autoplay\n' +
          '            ></video>'
        this.player = null
      }
    },
    // step.1
    async getBlob(imgInfo) {
      // 取文件压缩图缓存
      let blob = await getYasuoImgCache(imgInfo.uuid)
      if (!blob) {
        // 取原图缓存
        blob = await getOriginFileCache(imgInfo.uuid)
      }
      if (!blob) {
        blob = await getSuolueImgCache(imgInfo.uuid)
      }
      if (!blob && imgInfo.category == 'video') {
        let uuid = imgInfo.oldServerUUid ? imgInfo.oldServerUUid : imgInfo.uuid
        blob = await localforage.getItem(uuid + 'thumb')
      }

      // 存在就展示图片
      if (blob) {
        this.showImg(imgInfo, blob)
      } else {
        // step.2 下载压缩图
        this.getYasuoImg(imgInfo)
      }
    },

    // 展示图片
    showImg(imgInfo, blob) {
      let name = imgInfo.name.toUpperCase()
      if (name.lastIndexOf('HEIC') != -1) {
        heic2any({ blob })
          .then((conversionResult) => {
            imgInfo.imgsrc = window.URL.createObjectURL(conversionResult)
          })
          .catch((e) => {
            imgInfo.imgsrc = window.URL.createObjectURL(blob)
          })
      } else {
        imgInfo.imgsrc = window.URL.createObjectURL(blob)
      }
    },

    // step.2
    getYasuoImg(imgInfo) {
      if (imgInfo.downing == 1) {
        console.log('该文件正在下载,请稍等')
        return
      }
      let uuid = imgInfo.uuid
      let params = {
        name: imgInfo.name,
        success: (error, blob) => {
          imgInfo.downing = 2
          // 这里有可能返回json 格式的流代表压缩图未生成
          if (blob instanceof Blob) {
            isImgBlob(blob).then(
              () => {
                // 压缩图生成
                setYasuoImgCache(uuid, blob) // 设置压缩图缓存
                this.showImg(imgInfo, blob)
              },
              () => {
                // 压缩图未 就下载原图
                this.downOriginImg(imgInfo, uuid)
              }
            )
          } else {
            this.downOriginImg(imgInfo, uuid)
          }
        },
        fail: () => {
          this.downOriginImg(imgInfo, uuid)
        },
        autoSave: false,
        begin: () => {
          imgInfo.downing = 1
        }
      }
      fileCompressed(params, uuid)
    },

    // 下载原图
    downOriginImg(imgInfo, uuid) {
      let params = {
        name: imgInfo.name,
        success: (error, blob) => {
          // 展示图片
          this.showImg(imgInfo, blob)
          // 设置原图缓存
          setOriginFileCache(uuid, blob)
        },
        autoSave: false
      }
      fileDownLoad(params, uuid)
    },

    beginDown() {
      let imgInfo = this.imgList[this.currentIndex]
      
      eventBus.$emit('startDownFile', [imgInfo],(error)=>{
        if(!error){
            ElMessage.info(this.$t('downUpload.down_start'))
        }
      })
    },
    deleteFile() {
      let imgInfo = this.imgList[this.currentIndex]
      let callBack = (error) => {
        if (!error) {
          this.imgList.splice(this.currentIndex, 1)
          if (this.currentIndex == this.imgList.length) {
            this.currentIndex = this.imgList.length - 1
          }
        }
        if (this.imgList.length == 0) {
          this.$emit('close')
        }
      }
      this.$emit('deleteImg', {
        fileInfo: imgInfo,
        callBack
      })
    },
    goNext(index) {
      this.closePlayer()
      this.currentIndex = this.currentIndex + index
      this.dealClick(this.currentIndex)
    },
    errorDeal(e) {
      e.target.src = errorImg
    },
    loadFail(e) {
      e.target.src = shibai
    },
    dealClick(index) {
      this.currentIndex = index
      let containerWidth = 720
      let smallImgWidth = 70
      let marginRight = 10
      let selectedWidth = 70

      this.$nextTick(() => {
        this.$refs.imgListFooter.scrollTo({
          left: index * (smallImgWidth + marginRight) - containerWidth / 2 + selectedWidth / 2,
          top: 0,
          behavior: 'smooth'
        })
      })

      if (this.play) {
        this.closePlayer()
      }
    }
  },
  setup() {
    const { genContainerHeight } = useGenHeight((el) => {
      const height = window.innerHeight
      const width = window.innerWidth
      el.style.height = height - 182 + 'px'
      el.style.width = width - 340 + 'px'
    })
    return {
      genContainerHeight
    }
  }
})
</script>

<style lang="scss" scoped>
.start {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  margin: auto;
  z-index: 1000;
}
.imgcontainer {
  position: relative;
}
.bg {
  background: rgba(0, 0, 0, 0.9);
  flex-direction: column;
}
.close {
  position: absolute;
  top: 34px;
  right: 34px;
  color: #fff;
}
.imgListBody {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  margin: 0px;
  padding: 0px;
}
.imgListContent {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0px 50px;
  width: 100%;
}
.imgListFooter {
  width: 720px;
  height: 96px;
  overflow: hidden;
  white-space: nowrap;
  padding-bottom: 20px;
}
.imgName {
  position: absolute;
  top: 0;
  color: white;
  font-size: 14px;
  width: 100%;
  height: 70px;
  line-height: 70px;
  text-align: center;
  background: linear-gradient(#000, transparent);
  z-index: 100;
}
.smallImg {
  width: 70px;
  height: 70px;
  margin-right: 10px;
  object-fit: cover;
}
.smallImg-selected {
  //   transition: all;
  width: 70px;
  height: 70px;
  border: 3px solid #337aff;
  //   transition-duration: 0.1s;
  margin-right: 10px;
  object-fit: cover;
}
.bigImg {
  max-height: 100%;
  max-width: 100%;
  object-fit: contain;
}
.actionList {
  height: 86px;
  padding: 30px;
  > img {
    width: 26px;
    height: 26px;
  }
  > .download {
    margin-right: 100px;
  }
}
</style>
