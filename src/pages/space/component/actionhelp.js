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

import copyaction from '@/assets/copy-action.png'
import delaction from '@/assets/del-action.png'
import detailaction from '@/assets/detail-action.png'
import downaction from '@/assets/down-action.png'
import moveaction from '@/assets/move-action.png'
import renameaction from '@/assets/rename-action.png'
import cancleaction from '@/assets/cancel.png'

export let actions = [
  {
    name: 'buttons.common_open',
    action: 'open',
  },
  {
    name: 'buttons.common_download',
    img: downaction,
    action: 'download',
  },
  {
    name: 'buttons.common_delete',
    img: delaction,
    action: 'remove',
  },
  {
    name: 'buttons.common_copy',
    img: copyaction,
    action: 'copy',
  },
  {
    name: 'buttons.common_move',
    img: moveaction,
    action: 'move',
  },
  {
    name: 'buttons.common_rename',
    img: renameaction,
    action: 'rename',
  },
  {
    name: 'buttons.common_detail',
    img: detailaction,
    action: 'detail',
  },
  {
    name: 'buttons.common_cancel_check',
    img: cancleaction,
    action: 'cancelChecked',
  },
]

