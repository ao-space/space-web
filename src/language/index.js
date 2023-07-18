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

import { createI18n } from 'vue-i18n'
import zh_CN from './local_zh'
import en from './local_en'
import { getParamsFromUrl } from '@/utils/help'

const messages = {
  'zh-CN': { ...zh_CN },
  'en-US': { ...en }
}

const getLanguageFromUrl = () => {
  const language = getParamsFromUrl('language')
  language && localStorage.setItem('language', language)
  return language
}

// 获取浏览器当前语言
const getCurrentLanguage = () => {
  const language = navigator.language
  const currentLanguage = language.indexOf('zh') !== -1 ? 'zh-CN' : 'en-US'
  localStorage.setItem('language', currentLanguage)
  return currentLanguage
}

const datetimeFormats = {
  'en-US': {
    dynamic: {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false
    },
    album: {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    },
    memory: {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }
  },
  'zh-CN': {
    dynamic: {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false
    },
    album: {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    },
    memory: {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }
  }
}

// 创建i18n实例
const i18n = createI18n({
  datetimeFormats,
  legacy: false,
  globalInjection: true,
  locale: getLanguageFromUrl() || localStorage.getItem('language') || getCurrentLanguage() || 'zh-CN',
  messages: messages
})
export function setLanguage(lang){
  localStorage.setItem('language', lang)
  i18n.global.locale.value = lang
}

export function getLanguage(){
  return i18n.global.locale.value
}

export function setChinese(){
   setLanguage("zh-CN")
}
export function setEnglish(){
   setLanguage("en-US")
}

export function isChinese() {
  return i18n.global.locale.value === 'zh-CN'
}

export function t(key, obj, count) {
  return i18n.global.t(key, obj, count)
}
export function d(key, name) {
  return i18n.global.d(key, name)
}

export default i18n
