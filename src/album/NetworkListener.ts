/*
 * Copyright (c) 2022 Institute of Software Chinese Academy of Sciences (ISCAS)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import axios from 'axios'
import { getBoxInfo } from '@/business/login/loginUtils'
import eventBus from '@/utils/eventbus'

class NetworkListener {
  readonly NetworkChangeEvent: string = 'NetworkChangeEvent'

  boxLanInfo: any
  //1 互联网 2 局域网 3 离线
  netWorkType: number = 2

  init() {
    // 1 代表关闭
    if(sessionStorage.getItem('wangluo_openJuyuwang') == '1'){
            return 
    }
    this.boxLanInfo = getBoxInfo()
    this.netWorkType = this.isLocation() ? 2 : 1
    //监控当前网络状态
    setInterval(() => {
      if (this.isLan() && this.boxLanInfo) {
        //console.log('定时 lan ')
        this.pingLan()
          .then(() => {
            this.setNetworkLan()
          })
          .catch(() => {
            this.setNetworkTypeOffline()
          })
      }

      if (this.isIp() && this.boxLanInfo) {
        //console.log('定时 ip ')
        this.pingIp()
          .then(() => {
            this.setNetworkLan()
          })
          .catch(() => {
            this.setNetworkTypeOffline()
          })
      }

      if (this.isWan() && this.boxLanInfo) {
        //console.log('定时 wan ')
        this.pingWan()
          .then(() => {
            this.setNetworkWan()
          })
          .catch(() => {
            this.setNetworkTypeOffline()
          })
      }
    }, 10000)
  }

  /**
   * 设置网络局域网连接
   */
  setNetworkLan() {
    this.setNetworkType(2)
  }

  /**
   * 设置网络互联网连接
   */
  setNetworkWan() {
    this.setNetworkType(1)
  }

  setNetworkTypeOffline() {
    this.setNetworkType(3)
  }

  setNetworkType(type) {
    //不要重复触发
    if (this.netWorkType === type) {
      return
    }
    this.netWorkType = type
    eventBus.$emit(this.NetworkChangeEvent, this.netWorkType)
  }

  pingIp() {
    return this.ping(this.boxLanInfo.lanIp, this.boxLanInfo.port, this.boxLanInfo.tlsPort)
  }

  pingLan() {
    return this.ping(this.boxLanInfo.lanDomain, this.boxLanInfo.port, this.boxLanInfo.tlsPort)
  }

  pingWan() {
    return this.ping(this.boxLanInfo.userDomain, 80, 443)
  }

  /**
   * 测试主机是否联通
   * @param ip ip地址或者域名
   * @returns {Promise<unknown>}
   */
  ping(ip: string, port: number, sslPort: number) {
    return new Promise((resolve, reject) => {
      let data = new Date()

      let url
      if (this.isIp() && this.isValidIp(ip)) {
        url = 'http://' + ip + ':' + port + '/space/status?not307=yes&t=' + data.getTime()
      } else {
        url = 'https://' + ip + ':' + sslPort + '/space/status?not307=yes&t=' + data.getTime()
      }
      axios
        .get(url, {
          headers: {
            'Request-Id': new Date().getTime()
          },
          timeout: 1000
        })
        .then((result) => {
          if (result.status === 200) {
            //console.log('ping success')
            resolve(true)
          } else {
            reject(false)
          }
        })
        .catch((e) => {
          reject(false)
        })
    })
  }

  isLocation() {
    return this.isLan() || this.isIp()
  }

  isWan() {
    return !(this.isLan() || this.isIp())
  }

  isLan() {
    let localhost = window.location.hostname
    return localhost.indexOf('.lan.') > -1
  }

  isIp() {
    let localhost = window.location.hostname
    return this.isValidIp(localhost)
  }

  isValidIp(e) {
    if (e === 'localhost') {
      return true
    }
    return /^((2[0-4]\d|25[0-5]|[01]?\d\d?)\.){3}(2[0-4]\d|25[0-5]|[01]?\d\d?)$/.test(e)
  }
}
let networkListener = new NetworkListener()
export default networkListener
