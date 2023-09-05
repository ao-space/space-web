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

// 引入spark-md5

self.importScripts('spark-md5.min.js')

self.onmessage = (e) => {
  const { file } = e.data
  let blobSlice =
      File.prototype.slice ||
      File.prototype.mozSlice ||
      File.prototype.webkitSlice,
    chunkSize = 2097152 * 5, // Read in chunks of 2MB
    chunks = Math.ceil(file.size / chunkSize),
    currentChunk = 0,
    spark = new SparkMD5.ArrayBuffer(),
    fileReader = new FileReader()

  fileReader.onload = function (event) {
    // console.log('read chunk nr', currentChunk + 1, 'of', chunks)
    spark.append(event.target.result) // Append array buffer
    currentChunk++

    if (currentChunk < chunks) {
      loadNext()
    } else {
      fileReader = null
      self.postMessage({
        progress: 100,
        hash: spark.end(),
      })
    }
  }

  fileReader.onerror = function () {
    console.warn('oops, something went wrong.')
  }

  function loadNext() {
    let start = currentChunk * chunkSize,
      end = start + chunkSize >= file.size ? file.size : start + chunkSize

    fileReader.readAsArrayBuffer(blobSlice.call(file, start, end))
  }

  loadNext()
}
