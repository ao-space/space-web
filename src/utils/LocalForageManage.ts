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

import localforage from 'localforage'

class LocalForageManage {

  private localForageMap = new Map;

  getInstance(localforageName){
    if(this.localForageMap.has(localforageName)){
      return this.localForageMap.get(localforageName);
    }else{
      let localforageInstance = localforage.createInstance({name:localforageName});
      let localForage = new LocalForage(localforageInstance);
      this.localForageMap.set(localforageName,localForage);
      return localForage;
    }
  }
}

class LocalForage{

  private localForageInstance;

  constructor(localforageInstance){
    this.localForageInstance = localforageInstance;
  }
  /**
   * 设置缓存
   */
  setCacheInfo(key, data) {
    return this.localForageInstance.setItem(key, data)
  }

  getCacheInfo(key) {
    return this.localForageInstance.getItem(key)
  }

  removeCacheInfo(key){
    return this.localForageInstance.removeItem(key);
  }
}

export let localForageManage = new LocalForageManage();

