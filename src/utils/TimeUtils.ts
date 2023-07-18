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

import dayjs from 'dayjs'
import i18n from '@/language/index'

class TimeUtils {
  private week: string[] = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']

  getTimelineDate(date) {
    let day = new Date(date)
    let timelineDate = i18n.global.d(day, 'album')
    let language = i18n.global.locale.value
    if (language == 'zh-CN') {
      timelineDate += ' ' + this.week[day.getDay()]
    }
    return timelineDate
  }
  getTime(date) {
    return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
  }
  getFeedbackTime(date) {
    return dayjs(date).format('YYYY-MM-DD HH:mm')
  }
  getCurrentTime() {
    return dayjs().format('YYYY-MM-DD HH:mm:ss')
  }

  getVideoTime(time) {
    if (time <= 0) {
      return '00:00'
    }

    let timeSb = ''
    let hour = Math.floor(time / (1000 * 60 * 60))
    if(hour > 0){
      if (hour > 9) {
        timeSb = +hour + ':'
      } else{
        timeSb = '0' + hour + ':'
      }
      time -= hour * (1000 * 60 * 60)
    }

    let minute = Math.floor(time / (1000 * 60))
    if (minute > 9) {
      timeSb += minute + ':'
    } else {
      timeSb += '0' + minute + ':'
    }
    time -= minute * (1000 * 60)
    let second = Math.floor(time / 1000)
    if (second > 9) {
      timeSb += second
    } else {
      timeSb += '0' + second
    }
    return timeSb
  }
}
export let timeUtils = new TimeUtils()
