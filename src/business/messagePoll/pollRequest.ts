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

import { getMessagePoll } from '@/api/index'
import { bussAseDecrypt } from '@/auth/index'
import eventBus from '@/utils/eventbus'
let timeNext
import { getMessageBean, MessageResponse } from './messagePoll'
export function beginRequestPollMessage() {
  getMessagePoll().then((data) => {
    //console.log('未解密之前的data====>', data)
    let hasMessage = true;
    if (data.status == 'ok') {
      if (data.message) {
        hasMessage = false;
        timeNext && clearTimeout(timeNext)
        bussAseDecrypt(data.message).then((rawData: Array<MessageResponse>) => {
          //console.log('推送解密之后的数据===>', rawData)
          if (Array.isArray(rawData) && rawData.length) {
            if (location.hash != '#/login' && location.hash != '#/noscanLogin') {
              let messageBean = getMessageBean(rawData[0]);
              eventBus.$emit(messageBean.eventName, messageBean)
            }
          }
        })
      }
    }
    if(hasMessage){
      timeNext = setTimeout(beginRequestPollMessage, 3000)
    }
  })

  //返回取消定时器函数
  return () => {
    if (timeNext) {
      clearTimeout(timeNext)
    }
  }
}
