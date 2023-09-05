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

import { post,get } from './network.js'
import { urlConfig } from '@/config/networkConfig'
let baseUrl = urlConfig.baseUrl

class LoginUtils {
  /**
   * 验证码 验证
   */
  bKeyVerify(params) {
    return post(`${baseUrl}/space/v1/api/gateway/totp/bkey/verify`, params)
  }

  /**
   * 局域网获取pkey
   */
  genBkeyByLan() {
    return post(`${baseUrl}/space/v1/api/gateway/totp/bkey`)
  }

  /**
   * 轮训获取结果
   * @param pkey
   */
  pollBkeyByLan(bkey: any) {
    return post(`${baseUrl}/space/v1/api/gateway/totp/bkey/poll`,{bkey})
  }

  /**
   * 验证码 验证
   */
  getPublicKey(subDomain) {
    return get(`${baseUrl}/space/v1/api/gateway/totp/bkey`,{'spaceId':subDomain})
  }
}
export let loginUtils = new LoginUtils()
