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
const { log, info, warn, error } = console
const levelMap = {'debug':1,'info':2,'warn':3,'error':4}
class LogUtils {


  constructor() {
    const url = new URL(window.location.href)
    if(url.searchParams.get('debug') == 'true'){
        this.appendVconsole()
    }else{
        const showLogStr = localStorage.getItem('showLog') || '1'
        console.log = showLogStr == '1' ? this.emptyLog : showLogStr == '2' ? this.printLog  : log
        console.error = showLogStr == '1' ? this.emptyLog : showLogStr == '2' ?this.printError :error
        console.warn = showLogStr == '1' ? this.emptyLog : showLogStr == '2' ?this.printWarn: warn
    }
  }
  emptyLog() {}
  printLog() {
    log(...arguments)
  }
  printInfo() {
    info(...arguments)
  }
  printError() {
    error(...arguments)
  }
  printWarn() {
    warn(...arguments)
  }
  appendVconsole(){
    let script = document.createElement("script");
    script.type = "text/javascript";
    script.async = true;
    script.src =
      "https://cdn.bootcdn.net/ajax/libs/vConsole/3.15.0/vconsole.min.js";
    script.onload = function () {
      // @ts-ignore
      new VConsole();
    };
    document.body.appendChild(script);
  }
}
const logUtils = new LogUtils()
export default logUtils
