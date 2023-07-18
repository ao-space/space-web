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

let xhr = new XMLHttpRequest()
xhr.open('GET', './config.json', true) // 也可以使用POST方式，根据接口
xhr.onload = function () {
  // 请求完成
  if (this.status === 200) {
    //成功下载了
    console.log(this.responseText)
    let config = ''
    try {
      config = JSON.parse(this.responseText)
    } catch (error) {
      config = ''
    }
    localStorage.setItem('webUrl', config.webUrl || 'https://ao.space')
  }
}

xhr.send()
