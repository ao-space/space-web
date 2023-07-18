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

class FloatMath {
  add(arg1, arg2) {
    let r1, r2, m, n
    try {
      r1 = arg1.toString().split('.')[1].length
    } catch (e) {
      r1 = 0
    }
    try {
      r2 = arg2.toString().split('.')[1].length
    } catch (e) {
      r2 = 0
    }
    m = Math.pow(10, Math.max(r1, r2))
    n = r1 >= r2 ? r1 : r2
    return ((arg1 * m + arg2 * m) / m).toFixed(n)
  }

  sub(arg1, arg2) {
    let re1, re2, m, n
    try {
      re1 = arg1.toString().split('.')[1].length
    } catch (e) {
      re1 = 0
    }
    try {
      re2 = arg2.toString().split('.')[1].length
    } catch (e) {
      re2 = 0
    }
    m = Math.pow(10, Math.max(re1, re2))
    n = re1 >= re2 ? re1 : re2
    return ((arg1 * m - arg2 * m) / m).toFixed(n)
  }

  mul(arg1, arg2) {
    let m = 0
    let s1 = arg1.toString()
    let s2 = arg2.toString()
    try {
      m += s1.split('.')[1].length
    } catch (e) {}
    try {
      m += s2.split('.')[1].length
    } catch (e) {}

    return (Number(s1.replace('.', '')) * Number(s2.replace('.', ''))) / Math.pow(10, m)
  }

  div(arg1, arg2, digit) {
    let t1 = 0,
      t2 = 0,
      r1,
      r2
    try {
      t1 = arg1.toString().split('.')[1].length
    } catch (e) {}
    try {
      t2 = arg2.toString().split('.')[1].length
    } catch (e) {}
    r1 = Number(arg1.toString().replace('.', ''))
    r2 = Number(arg2.toString().replace('.', ''))
    //获取小数点后的计算值
    let result = ((r1 / r2) * Math.pow(10, t2 - t1)).toString()
    let result2 = result.split('.')[1]
    result2 = result2.substring(0, digit > result2.length ? result2.length : digit)

    return Number(result.split('.')[0] + '.' + result2)
  }
}
export let floatMath = new FloatMath()
