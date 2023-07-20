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
  <div class="safe" v-if="isAdmin">
    <div class="info">{{ $t('setting.security') }}</div>
    <div class="mb20 font12 wb">
      {{ $t('setting.security_desc') }}
    </div>
    <div class="y-center">
      <div class="card ml20">
        <div class="title mb30">
          <el-space :size="5">
            <img src="@/assets/passwordgray.png" />
            <span>{{ $t('setting.password') }}</span>
          </el-space>
        </div>
        <div class="y-center">
          <div>
            <span class="state">{{ $t('setting.set') }}</span>
          </div>
          <div class="ml-auto">
            <span class="link" @click="showSafe('changePassword')">{{
              $t('setting.change_password')
            }}</span>
          </div>
        </div>
      </div>
    </div>

    <el-dialog
      v-model="isOpen"
      :title="title"
      @close="closeDialog"
      @open="init"
      :close-on-click-modal="false"
    >
      <form>
        <div class="m10 dialogBody">
          <!--重置密码-->
          <div v-if="type === 1 || type == 10">
            <div class="ml30 wb">{{ $t('safe.password_desc') }}</div>
            <div class="content">
              <div style="width: 100%">
                <el-row class="el-row-title" :gutter="10">
                  <el-col :span="8"></el-col>
                  <el-col :span="16"
                    ><div class="color-red tl" v-if="passwdError">{{ passwdError }}</div></el-col
                  >
                </el-row>
                <template v-if="type == 1">
                  <el-row class="el-row-title" :gutter="10">
                    <el-col :span="8">{{ $t('safe.old_password') }}</el-col>
                    <el-col :span="16">
                      <IscasInput
                        v-model="oldPasswd"
                        :placeholder="$t('safe.password_tip')"
                        type="password"
                      />
                    </el-col>
                  </el-row>
                </template>
                <el-row class="el-row-title" :gutter="10">
                  <el-col :span="8">{{ $t('safe.new_password') }}</el-col>
                  <el-col :span="16">
                    <IscasInput
                      v-model="newPasswd"
                      :placeholder="$t('safe.password_tip')"
                      type="password"
                    />
                  </el-col>
                </el-row>
                <el-row class="el-row-title" :gutter="10">
                  <el-col :span="8">{{ $t('safe.repeat_password') }}</el-col>
                  <el-col :span="16">
                    <IscasInput
                      v-model="newDouPasswd"
                      :placeholder="$t('safe.repeat_tip')"
                      type="password"
                    />
                  </el-col>
                </el-row>
                <el-row class="el-row-title" :gutter="10">
                  <el-col :span="8"></el-col>
                  <el-col :span="16">

                  </el-col>
                </el-row>
              </div>
            </div>
          </div>
          <!--效验密码-->
          <div v-if="type === 2 || type === 11">
            <div class="ml30 font16 fw-b">{{ $t('safe.safe_password_val') }}：</div>
            <div class="content">
              <div style="width: 400px">
                <div class="mb20 color-red" v-if="passwdError">{{ passwdError }}</div>
                <codeComponent @inputCode="inputCode" ref="codeComRef" />
                <div class="mt20">
                  <el-tooltip placement="bottom" effect="customized">
                    <template #content>
                      <div class="font14" style="line-height: 22px;width:500px;">
                        {{ $t('safe.password_desc') }}<br />{{ $t('safe.app_scenarios') }}：<br />
                        <li>{{ $t('safe.unbound_device') }}</li>
                        <li>{{ $t('safe.admin_val') }}</li>
                      </div>
                    </template>
                    <div class="color-grey y-center">
                      <el-icon><WarningFilled /></el-icon>
                      <span class='ml-5'>{{ $t('safe.password_tip') }}</span>
                    </div>
                  </el-tooltip>
                </div>
              </div>
            </div>
          </div>
          <!-- 手机确认 -->
          <div v-if="type === 4">
            <div class="content">
              <div class="flex flex-column x-center">
                <div><img src="@/assets/notify-s.png" style="width: 100px; height: 100px" /></div>
                <span class="mt30 font20 fw-b">{{ $t('safe.please_confirm') }}</span>
                <span class="mt30 color-blue pointer" @click="bindPhoneDisable">{{ $t('safe.bound_phone_error') }}</span>
              </div>
            </div>
          </div>

          <!-- 手机无法确认 -->
          <div
            v-if="type == 5 || type == 6 || type == 12 || type == 13 || type == 14 || type == 15"
          >
            <div class="ml30 font16 fw-b">{{ $t('safe.safe_password_val') }}：</div>
            <div class="content">
              <div class="flex flex-column x-center">
                <div>
                  <img
                    v-if="type == 13 || type == 14"
                    src="@/assets/passwdTimes.png"
                    style="width: 100px; height: 100px"
                  />
                  <img v-else src="@/assets/notify-e.png" style="width: 100px; height: 100px" />
                </div>
                <span v-if="type == 13" class="mt30 font20 fw-b">{{ $t('safe.password_error') }}</span>
                <span v-else class="mt30 font20 fw-b">{{ $t('safe.cannot_opa') }}</span>
                <template v-if="type == 5">
                  <span class="mt20 fw-b">{{ $t('safe.admin_cannot') }}</span>
                  <span class="mt30 color-grey">{{ $t('safe.bound_new_phone') }}</span>
                </template>
                <template v-if="type == 6">
                  <span class="mt20 fw-b">{{ $t('safe.bound_reject') }}</span>
                </template>
                <template v-if="type == 12">
                  <span class="mt20 fw-b">{{ $t('safe.unbound_email') }}</span>
                  <span class="mt30 color-grey">{{ $t('safe.reset_desc') }}</span>
                </template>
                <template v-if="type == 14">
                  <span class="mt20 fw-b">{{ $t('safe.opa_timeout') }}</span>
                </template>
                <template v-if="type == 15">
                  <span class="mt20 fw-b">{{ $t('safe.request_times') }}</span>
                </template>
              </div>
            </div>
          </div>
        </div>
      </form>
      <template #footer>
        <div class="flex y-center">
          <div class="ml20 color-blue" v-if="type == 0 || type == 7 || type == 8 || type == 9">
            <el-space>
              <img src="@/assets/question.png" />
              <a class="help" href="https://ao.space/#/help/mail" target="_blank">{{ $t('buttons.help') }}</a>
            </el-space>
          </div>
          <div class="ml-auto tr flex">
            <div class="button-white ml-20" v-if="type == 7 || type == 11" @click="gotoSetp(3)">
              {{ $t('buttons.last_step') }}
            </div>
            <div class="button-white ml-20" v-if="type == 9" @click="gotoSetp(1)">{{ $t('buttons.last_step') }}</div>
            <div class="button-white ml-20" v-if="type == 3" @click="chooseType">{{ $t('buttons.next_step') }}</div>
            <div class="button-blue ml-20" v-if="type == 2 || type == 11" @click="validatePassword">
              {{ $t('buttons.verification') }}
            </div>
            <div class="button-blue ml-20" v-if="type == 1" @click="settingPassword">{{ $t('buttons.verification') }}</div>
            <div class="button-blue ml-20" v-if="type == 10" @click="settingPassword">{{ $t('buttons.common_ok') }}</div>
            <div
              class="button-white ml-20"
              v-if="type == 5 || type == 6 || type == 12 || type == 13 || type == 14 || type == 15"
              @click="close"
            >
              {{ $t('buttons.close') }}
            </div>
          </div>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
<script lang="ts">
import { ElMessage } from 'element-plus'
import codeComponent from '@/components/code6.vue'
import Space from '../../space/index.vue'
import { ElLoading } from 'element-plus'
import {
  passwdVerify,
  passwdModify,
  queryPhoneConfirm,
  sendPhoneConfirm,
  getBindEmail,
  resetModify
} from '@/api/safe'
import { isAdmin } from '@/business/login/loginUtils'
import IscasInput from '@/components/IscasInput.vue'

export default {
  name: 'SafeSetting',
  components: {
    Space,
    codeComponent,
    IscasInput
  },
  data() {
    return {
      mode: 'changePassword', //bindEmail,changeEmail,changePassword
      isOpen: false,
      type: 2,
      title: '',
      validateTypeEmail: true,
      validateTypePassword: false,
      showEmailServer: false,
      oldPasswd: '',
      newPasswd: '',
      newDouPasswd: '',
      passwdErrorTimes: 0,
      emailAccount: '',
      emailHiddenAccount: '',
      emailPasswd: '',
      passwdError: false,
      securityToken: '',
      emailToken: '',
      emailConfig: { sslEnable: true },
      emailConfigAll: {},
      clientUuidBinder: '',
      isAdmin: false,
      oldEmailAccount: ''
    }
  },
  mounted() {
    let self = this

    if (isAdmin()) {
      this.isAdmin = true
      this.getBindEmail()
    }
  },
  methods: {
    emitChangeEvent() {
      this.getBindEmail()
    },
    showSafe(mode) {
      this.mode = mode
      this.isOpen = true
    },
    getBindEmail() {
      let safe = this
      getBindEmail().then(function (result) {
        if (result.code === 'ACC-200') {
          safe.oldEmailAccount = result.results.emailAccount
        }
      })
    },
    init() {
      if (this.mode == 'changePassword') {
        this.title = this.$t('safe.change_password')
        this.type = 4
        this.sendPhoneConfirm()
      }
      this.reset()
    },
    reset() {
      if (this.$refs.codeComRef) {
        this.$refs.codeComRef.clear()
      }
      this.validateTypeEmail = true
      this.validateTypePassword = false
      this.passwdError = false
      this.passwdErrorTimes = 0
      this.showEmailServer = false
      this.securityToken = ''
      this.clientUuidBinder = ''
      this.emailToken = ''
      this.oldPasswd = ''
      this.newPasswd = ''
      this.newDouPasswd = ''
      this.emailAccount = ''
      this.emailHiddenAccount = ''
      this.emailPasswd = ''
      this.emailConfig = { sslEnable: true }
    },
    emailErrorResult(result) {
      if (result.code === 'ACC-4051') {
        this.passwdError = this.$t('safe.already_bound_error')
      } else if (result.code === 'ACC-4011') {
        this.passwdError = this.$t('safe.email_error')
      } else if (result.code === 'ACC-4052') {
        this.passwdError = this.$t('safe.email_timeout')
      } else if (result.code === 'ACC-4053') {
        //token验证失败
        this.type = 14
      } else if (result.code === 'GW-400') {
        this.passwdError = this.$t('safe.email_format')
      } else {
        this.passwdError = this.$t('safe.request_fail')
      }
    },
    bindPhoneDisable() {
      clearTimeout(this.queryPhoneConfirmTimes)
      clearTimeout(this.phoneConfirmTimes)
      this.type = 5 // 手机不确认
    },
    sendPhoneConfirm() {
      let self = this
      sendPhoneConfirm().then(function (result) {
        if (result.code === 'ACC-200') {
          self.queryPhoneConfirm()
          //超过10分钟后直接认为 无法确认了
          self.phoneConfirmTimes = setTimeout(function () {
            clearTimeout(self.queryPhoneConfirmTimes)
            self.type = 5 // 手机不确认
          }, 10 * 60 * 1000)
        } else if (result.code === 'ACC-410') {
          self.type = 15 //申请手机确认失败
        } else {
          self.type = 5 //申请手机确认失败
        }
      })
    },
    queryPhoneConfirm() {
      let self = this
      //每两秒钟查询一次确认结果
      self.queryPhoneConfirmTimes = setTimeout(function () {
        queryPhoneConfirm().then(function (result) {
          let hasConfirm = true
          if (result.code === 'ACC-200' && result.results.length > 0) {
            let resultList = result.results
            for (let poll of resultList) {
              if (poll.msgType.toLowerCase() === 'security_passwd_mod_accept') {
                //直到收到 msgType==security_passwd_mod_accept 才停止循环
                hasConfirm = false
                clearTimeout(self.phoneConfirmTimes)

                if (poll.accept) {
                  self.securityToken = poll.securityTokenRes.securityToken
                  self.clientUuidBinder = poll.clientUuid
                  self.type = 1 //手机确认
                } else {
                  self.type = 6 // 手机不确认
                }
              }
            }
          }

          if (hasConfirm && self.isOpen) {
            self.queryPhoneConfirm()
          }
        })
      }, 2000)
    },
    isNotEmail(val) {
      let emailPat = /^(.+)@(.+)$/
      let result = val.match(emailPat)
      console.log(result)
      return result == null
    },
    isIntNum(val) {
      let reg = /^\d+$/
      let pattern = new RegExp(reg)
      return pattern.test(val)
    },
    settingPassword() {
      let self = this

      //设置通过旧密码设置新密码
      if (self.newPasswd.length !== 6 || !this.isIntNum(self.newPasswd)) {
        self.passwdError = this.$t('safe.password_only_tip')
        return
      }
      //设置通过旧密码设置新密码
      if (self.newPasswd !== self.newDouPasswd) {
        self.passwdError = this.$t('safe.password_match')
        return
      }
      self.loading = ElLoading.service({
        target: '.dialogBody',
        text: this.$t('safe.val_tip')
      })

      self.passwdError = false
      //设置通过旧密码设置新密码
      if (this.type === 1) {
        passwdModify(
          self.securityToken,
          self.clientUuidBinder,
          self.oldPasswd,
          self.newPasswd
        ).then(function (result) {
          self.loading.close()
          if (result.code === 'ACC-200') {
            self.close()
            ElMessage({
              message: self.$t('safe.change_password_suc'),
              type: 'success',
              center: true
            })
          } else if (result.code === 'ACC-403') {
            self.passwdError = self.$t('safe.old_password_err')
          } else if (result.code === 'ACC-4054') {
            self.passwdError = self.$t('safe.password_re_input')
          } else if (result.code === 'ACC-4053') {
            //token验证失败,请关闭重试
            self.type = 14
          } else {
            self.passwdError = result.message
          }
        })
      }

      //新密码验证
      if (this.type === 10) {
        resetModify(
          self.securityToken,
          self.emailToken,
          self.clientUuidBinder,
          self.newPasswd
        ).then(function (result) {
          self.loading.close()
          if (result.code === 'ACC-200') {
            self.close()
            ElMessage({
              message: self.$t('safe.reset_password_suc'),
              type: 'success',
              center: true
            })
          } else if (result.code === 'ACC-4054') {
            self.passwdError = self.$t('safe.password_re_input')
          } else if (result.code === 'ACC-4053') {
            //token验证失败,请关闭重试
            self.type = 14
          } else {
            self.passwdError = result.message
          }
        })
      }
    },
    validatePassword() {
      //绑定email ，验证密码
      let self = this
      if (self.oldPasswd.length != 6) {
        self.passwdError = this.$t('safe.password_only_tip')
        return
      }
      self.loading = ElLoading.service({
        target: '.dialogBody',
        text: this.$t('safe.val_tip')
      })
      //验证passwd
      self.passwdError = false
      passwdVerify(self.oldPasswd).then(function (result) {
        self.loading.close()
        if (result.code === 'ACC-200') {
          self.securityToken = result.results.securityToken
          if (self.type === 2) {
            self.type = 0
          }
          if (self.type === 11) {
            self.type = 8
          }
        } else if (result.code === 'ACC-403') {
          self.passwdErrorTimes++
          if (self.passwdErrorTimes < 3) {
            self.passwdError = self.$t('safe.password_error_num', 3 - self.passwdErrorTimes)
          } else {
            self.type = 13
          }
        } else if (result.code === 'ACC-410') {
          self.type = 13
        } else {
          self.passwdError = result.message
        }
      })
    },
    closeDialog() {
      clearTimeout(this.phoneConfirmTimes)
      clearTimeout(this.queryPhoneConfirmTimes)
      if (this.loading) {
        this.loading.close()
      }
    },
    close() {
      this.isOpen = false
    },
    chooseEmail() {
      this.validateTypePassword = false
      this.validateTypeEmail = true
    },
    choosePassword() {
      this.validateTypePassword = true
      this.validateTypeEmail = false
    },
    resetPasswd() {
      let self = this
      self.passwdError = ''

    },

    chooseType() {
      let self = this
      if (self.validateTypePassword) {
        self.type = 11
      }
    },
    gotoSetp(type) {
      this.type = type
    },
    inputCode(codeArr) {
      this.oldPasswd = codeArr.join('')
    }
  }
}
</script>
<style lang="scss" scoped>
::v-deep(.iscasInput){
  width: 300px;
}
.info {
  font-weight: bolder;
  color: #464956;
  font-size: 20px;
  margin-bottom: 20px;
}
.safe {
  font-size: 14px;
  font-weight: 400;
  color: #85899c;
  ol {
    padding: 0px 16px;
    li {
      margin-bottom: 10px;
    }
  }
  .title {
    color: #464956;
    font-weight: bold;
  }
  .state {
    color: #464956;
  }
  .link {
    color: #337aff;
    cursor: pointer;
  }
  .card {
    min-width: 300px;
    height: 98px;
    background: #f9fafd;
    border-radius: 6px;
    padding: 20px;
  }
}
.help {
  color: #337aff;
  text-decoration: none;
}
::v-deep(.el-checkbox__label) {
  padding-top: 3px;
}
::v-deep(.el-checkbox__input.is-checked .el-checkbox__inner){
  background-color: #337aff;
  border-color: #337aff;
}
::v-deep(.el-checkbox__input.is-checked+.el-checkbox__label){
  color: #337aff;
}
.choose {
  height: 100px;
  display: flex;
  padding-left: 30px;
  border-radius: 6px;
}
.el-row-title {
  height: 50px;
  text-align: right;
  font-size: 14px;
  font-weight: 400;
  align-items: center;
}
.content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 360px;
}
.dialogBody {
  height: 380px;
}

::v-deep(.el-dialog__header) {
  text-align: left;
}

::v-deep(.el-dialog__title) {
  font-size: 14px;
  width: 56px;
  height: 20px;
  font-weight: 500;
  color: #464956;
  line-height: 20px;
}

::v-deep(.el-dialog) {
  width: 800px;
  background: #ffffff;
  border-radius: 6px;
}
</style>
