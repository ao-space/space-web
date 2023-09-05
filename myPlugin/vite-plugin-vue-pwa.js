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

import fs from 'fs'
import path from 'path'
let config = {
  template: path.resolve(__dirname, './service-worker-tmplate.js'),
  output: path.resolve(__dirname, '../dist/sw.js'),
  replaceStrArr: ['__FILELIST__'],
}
export default function myPlugin() {
  return {
    name: 'my-plugin', // 必须的，将会在 warning 和 error 中显示
    outputOptions(outputOptions) {
      console.log('outputOptions', outputOptions)
    },
    generateBundle(options, bundle) {
      let tmp = ['./lib/mammoth@1.4.8.min.js']
      for (var key in bundle) {
        tmp.push('./' + key)
      }
      let replaceMap = {
        __FILELIST__: tmp.join("','"),
      }
      let template = fs.readFileSync(config.template, 'utf-8')
      for (let key in replaceMap) {
        template = template.replace(new RegExp(key, 'g'), replaceMap[key])
      }
      fs.writeFileSync(config.output, template, { encoding: 'utf-8', flag: 'w' })
    },
  }
}
