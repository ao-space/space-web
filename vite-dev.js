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

const envFlag = 'xiedejun-three' // xiedejun-aoSecond  xiedejun-three  盒子一代  盒子二代

const targetMap = {
  'xiedejun-aoFirst': {
    port: 3000,
    target: 'https://chuang2023.dev-space.eulix.xyz',
    userUrlIdentify: 'cdoettk6'
  },
  'xiedejun-aoSecond': {
    port: 3002,
    target: 'https://dn6xd320.sit-space.eulix.xyz',
    userUrlIdentify: 'bybw6n0v'
  },
  'xiedejun-three': {
    port: 3000,
    target: 'https://bybw6n0v.dev-space.eulix.xyz/',
    userUrlIdentify: 'chuang2023'
  },
  'xiedejun-four': {
    port: 3003,
    target: 'https://dn6xd320.sit2-space.eulix.xyz',
    userUrlIdentify: 'p5pirtst'
  },
  'disheng': {
    port: 3000,
    target: 'https://otfmnng2.dev-space.eulix.xyz',
    userUrlIdentify: 'otfmnng2'
  },
  'luhao': {
    port: 3000,
    target: 'https://abs86ysy.sit-space.eulix.xyz',
    userUrlIdentify: 'abs86ysy'
  },
  'liang': {
    port: 3000,
    target: 'https://om9gac9a.sit-space.eulix.xyz',
    userUrlIdentify: 'om9gac9a'
  },
}




export function getDevConfig() {
  return targetMap[envFlag]
}
