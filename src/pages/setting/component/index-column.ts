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

export const tableStruct = {
  tableAttr: {},
  attr: {
    width: 90,
  },
  column: [
    {
      label: '终端名称',
      key: 'terminalModel',
      type: 'slot',
      attr: {
        width: 'auto',
      },
    },
    {
      label: '登录端类型',
      key: 'terminalType',
      // type: 'slot',
      attr: {
        width: 'auto',
        'show-overflow-tooltip': true,
      },
    },
    {
      label: '登录地点',
      key: 'address',
      type: 'slot',
      attr: {
        width: 'auto',
        'show-overflow-tooltip': true,
      },
    },
    {
      label: '最后登录时间',
      key: 'loginTime',
      type: 'slot',
      attr: {
        width: 'auto',
        'show-overflow-tooltip': true,
      },
    },

    {
      label: '操作',
      key: 'action',
      type: 'slot',
      attr: {
        width: 'auto',
      },
    },
  ],
}
