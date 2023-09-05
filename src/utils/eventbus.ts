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

export class Bus {
  list: { [key: string]: Array<Function> }
  constructor() {
    // 收集订阅信息,调度中心
    this.list = {}
  }

  // 订阅
  $on(name: string, fn: Function) {
    this.list[name] = this.list[name] || []
    this.list[name].push(fn)
  }

  // 发布
  $emit(name: string, ...data) {
    if (this.list[name]) {
      this.list[name].forEach((fn: Function) => {
        fn(...data)
      })
    }
  }

  // 取消订阅
  $off(name: string) {
    if (this.list[name]) {
      delete this.list[name]
    }
  }
}
let eventBus = new Bus()
export default eventBus
