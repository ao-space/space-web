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
  <el-container>
    <el-aside class="leftMenu">
      <div>
        <img class="logo pointer" :src="getLogoImg" @click="goAoMain()" />
        <div v-for="(item, index) in leftMenu">
          <div class="item y-center" :class="isSelected(item, $route.path) ? 'is-active' : ''">
            <div class="action y-center" @click="gotoView(item)">
              <img
                :src="isSelected(item, $route.path) ? item.imgPath : item.imggrayPath"
                class="lifang"
                v-if="item.imgPath"
              />
              <div :class="{ 'color-337aff': isSelected(item, $route.path) }">
                {{ $t(item.name) }}
              </div>
            </div>
            <img
              :src="getArrow(item, $route.path)"
              class="arrow"
              v-if="item.child"
              @click="childAction(item)"
            />
          </div>
          <div
            v-if="!item.showChild"
            v-for="ele in item.child"
            class="item y-center"
            :class="isSelected(ele, $route.path) ? 'is-active' : ''"
          >
            <div class="action y-center" @click="gotoView(ele)">
              <div class="ml37" :class="{ 'color-337aff': isSelected(ele, $route.path) }">
                {{ $t(ele.name) }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="boxInfo">
        <div class="flex y-center personInfo">
          <loginOut></loginOut><span class="ml10 nickName">{{ personalName }}</span>
        </div>
        <el-progress
          :percentage="spacePercentage"
          :stroke-width="7"
          :show-text="false"
          color="#337AFF"
        ></el-progress>
        <div style="padding-top: 13px; color: #85899c; margin-bottom: 37px">
          {{ spaceSizeUsed }}/{{ spaceSizeTotal }}
        </div>
      </div>
    </el-aside>
    <el-main>
      <router-view :key="$route.fullPath"></router-view>
      <!-- 下载列表和上传列表 -->
      <div class="download">
        <downOrUploadDetail />
        <jobActionList />
      </div>
      <NetworkModeSwitch />
    </el-main>
  </el-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import arrow from '@/assets/arrow.svg'
import arrowgray from '@/assets/arrowgray.svg'
import arrowRight from '@/assets/arrow-right.svg'
import arrowgrayRight from '@/assets/arrowgray-right.svg'
import file from '@/assets/file.svg'
import filegray from '@/assets/filegray.svg'
import person from '../assets/person.svg'
import persongray from '../assets/persongray.svg'
import downOrUploadDetail from './downOrUploadDetail.vue'
import jobActionList from './jobActionList.vue'
import { getMemberUsedStorage, getBoxStatus, getPersonal, getStorage } from '@/api/index'
import { localCacheManageInstance } from '@/auth/local'
import { sendAesKeyAndIvToServiceWorker } from '@/utils/serviceworkerUtil'
import { beginRequestPollMessage } from '@/business/messagePoll/pollRequest'
import loginOut from '@/components/loginOut.vue'
import logo from '@/assets/logo.png'
import logo_en from '@/assets/logo_en.png'
import { setPlatformUrl } from '@/config/networkConfig'
import { getDeviceAbilityWithCache } from '@/api/disk'
import { keyMap } from '@/utils/constant'
import { isChinese } from '@/language/index'
import NetworkModeSwitch from './NetworkModeSwitch.vue'
import { dealSpace } from '../pages/setting/component/diskCommon'

export default defineComponent({
  name: 'home',
  components: {
    downOrUploadDetail,
    jobActionList,
    loginOut,
    NetworkModeSwitch
  },
  setup() {
    // 拉取全部列表信息 setup 最先执行
    localCacheManageInstance.getAllDirStruct({})
  },
  computed: {
    getLogoImg() {
      return isChinese() ? logo : logo_en
    }
  },
  beforeMount() {
    this.persapi()
  },
  data() {
    let leftMenu = [
      {
        name: `router.home_file`,
        routeName: ['/home/space', '/home/file'],
        routeUrl: '/home/space',
        imgPath: file,
        imggrayPath: filegray,
        child: [
          {
            name: 'router.me_recycle_bin',
            routeUrl: '/home/recycle',
            imgPath: ''
          }
        ]
      },
      {
        name: 'router.my_setting',
        routeUrl: '/home/setting',
        imgPath: person,
        imggrayPath: persongray
      }
    ]
    return {
      personalName: '',
      isCollapse: false,
      leftMenu,
      showLoginOut: false,
      spaceSizeTotal: 0,
      spaceSizeUsed: 0,
      spacePercentage: 0,
      flag: 0
    }
  },
  beforeUnmount() {
    this.cancelPollFunction && this.cancelPollFunction()
  },
  mounted() {
    // 发送aesKey和iv到serviceWorkerp
    sendAesKeyAndIvToServiceWorker()
    // 开始拉取消息
    this.cancelPollFunction = beginRequestPollMessage()
    getDeviceAbilityWithCache().then((res) => {
      if (res.code === 'AG-200') {
        localStorage.setItem(keyMap.deviceModelNumber, res.results.deviceModelNumber)
      }
    })
    getBoxStatus().then((res) => {
      setPlatformUrl(res.platformInfo.platformUrl)
    })
  },
  methods: {
    goAoMain() {
      this.$router.push('/home/index')
    },
    childAction(item) {
      item.showChild = !item.showChild
    },
    gotoView(item) {
      this.$router.push(item.routeUrl)
    },
    getArrow(item, path) {
      if (this.isSelected(item, path)) {
        return item.showChild ? arrowRight : arrow
      } else {
        return item.showChild ? arrowgrayRight : arrowgray
      }
    },
    isSelected(item, path) {
      if (item.routeName) {
        for (let ele of item.routeName) {
          if (path.indexOf(ele) > -1) {
            return true
          }
        }
      }
      return item.routeUrl.indexOf(path) > -1
    },
    persapi() {
      getPersonal().then((data) => {
        if (data.code === 'ACC-200') {
          this.personalName = data.results[0].personalName
          getDeviceAbilityWithCache().then((res) => {
            if (res.code === 'AG-200') {
              if (res.results.deviceModelNumber >= -299 && res.results.deviceModelNumber <= -200) {
                this.storapiTrial(data.results[0].aoId)
              } else {
                this.storapi()
              }
            }
          })
        }
      })
    },
    storapi() {
      getStorage().then((data) => {
        this.spaceSizeTotal = dealSpace(data.spaceSizeTotal)
        this.spaceSizeUsed = dealSpace(data.spaceSizeUsed)
        this.spacePercentage = (this.spaceSizeUsed / this.spaceSizeTotal) * 100
        if (isNaN(this.spacePercentage)) {
          this.spacePercentage = 0
        }
      })
    },
    storapiTrial(aoId) {
      getMemberUsedStorage(aoId).then((storage) => {
        console.log('home storage', storage)
        if (storage.code === '200') {
          this.spaceSizeTotal = dealSpace(storage.results.totalStorage)
          this.spaceSizeUsed = dealSpace(storage.results.userStorage)
          this.spacePercentage = (this.spaceSizeUsed / this.spaceSizeTotal) * 100
          if (isNaN(this.spacePercentage)) {
            this.spacePercentage = 0
          }
        }
      })
    }
  }
})
</script>

<style scoped lang="scss">
.arrow {
  margin-left: auto;
  margin-right: 10px;
  cursor: pointer;
}
.personInfo {
  margin-bottom: 10px;
  font-weight: bold;
  color: #464956;
}
.boxInfo {
  padding: 0 10px;
  .nickName {
    width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    word-break: break-all;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }
}
.el-container {
  height: 100vh;
}
::v-deep(.el-menu) {
  border: none !important;
  //box-shadow: none !important;
  background: none;
}

.item {
  border-radius: 7px;
  margin: 5px 0px;
  &:hover {
    background-color: #ecf5ff;
    cursor: auto;
  }
  .action {
    padding-left: 20px;
    width: 150px;
    height: 46px;
    color: #464956;
    font-weight: bold;
    cursor: pointer;
  }
}

.is-active {
  color: #337aff;
  font-weight: bold;
  background-color: #ffffff;
}

.touxiang {
  width: 34px;
  height: 34px;
}

.leftMenu {
  font-size: 14px;
  width: 200px;
  padding: 10px;
  background-color: #f5f6fa;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.leftMenu::-webkit-scrollbar {
  display: none;
}

.textSeleted {
  color: #337aff;
  font-weight: 500;
}
.lifang {
  width: 16px;
  height: 16px;
  margin-right: 20px;
}
.logo {
  margin: 10px 0px 10px 16px;
  height: 46px;
}
.content {
  height: 100vh;
  overflow: hidden;
}

.download {
  position: absolute;
  bottom: 0;
  left: 2px;
  width: 100%;
  box-shadow: 2px 0px 10px 0px rgba(103, 125, 168, 0.12);
}
</style>
