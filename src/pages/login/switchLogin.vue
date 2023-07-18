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

<script>
import { keyMap } from '../../utils/constant'
import { setLoginInfo } from '../../auth'
import {Cookie} from '@/utils/help'

export default {
  name: 'SwitchLogin',
  /**
   * 网络切换自动登录
   */
  mounted() {
    let { eluoxaeskey, serPubkey, language, loginInfo,client_uuid } = this.$route.query

    if (!(eluoxaeskey && serPubkey && language && loginInfo)) {
      console.log("switch error", this.$route.query)
      this.$router.push('/qrLogin')
      return
    }
    console.log("switch succee")
    localStorage.setItem(keyMap.serPubkey, serPubkey)
    localStorage.setItem(keyMap.language, language)
    localStorage.setItem(keyMap.clientUUID,client_uuid)
    Cookie.set('client_uuid',client_uuid,15,window.location.host)
    setLoginInfo(JSON.parse(loginInfo), eluoxaeskey)
    this.$router.push('/')
  }
}
</script>
