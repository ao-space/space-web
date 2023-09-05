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

var Utiljs =
  Utiljs ||
  (function () {
    function Uint8ArrayToWordArray(u8) {
      const len = u8.length
      const words = []
      for (let i = 0; i < len; i += 1) {
        words[i >>> 2] |= (u8[i] & 0xff) << (24 - (i % 4) * 8)
      }
      return CryptoJS.lib.WordArray.create(words, len)
    }

    function WordArrayToUint8Array(wordArray) {
      const { words } = wordArray
      const { sigBytes } = wordArray
      const u8 = new Uint8Array(sigBytes)
      for (let i = 0; i < sigBytes; i += 1) {
        const byte = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff
        u8[i] = byte
      }
      return u8
    }

    function concatenate(...arrays) {
      let totalLen = 0

      for (let arr of arrays) totalLen += arr.byteLength

      let res = new Uint8Array(totalLen)

      let offset = 0

      for (let arr of arrays) {
        let uint8Arr = new Uint8Array(arr)

        res.set(uint8Arr, offset)

        offset += arr.byteLength
      }

      return res
    }

    var lookup = []
    var revLookup = []
    var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

    var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
    for (var i = 0, len = code.length; i < len; ++i) {
      lookup[i] = code[i]
      revLookup[code.charCodeAt(i)] = i
    }

    // Support decoding URL-safe base64 strings, as Node.js does.
    // See: https://en.wikipedia.org/wiki/Base64#URL_applications
    revLookup['-'.charCodeAt(0)] = 62
    revLookup['_'.charCodeAt(0)] = 63

    function getLens(b64) {
      var len = b64.length

      if (len % 4 > 0) {
        throw new Error('Invalid string. Length must be a multiple of 4')
      }

      // Trim off extra bytes after placeholder bytes are found
      // See: https://github.com/beatgammit/base64-js/issues/42
      var validLen = b64.indexOf('=')
      if (validLen === -1) validLen = len

      var placeHoldersLen = validLen === len ? 0 : 4 - (validLen % 4)

      return [validLen, placeHoldersLen]
    }

    // base64 is 4/3 + up to two characters of the original data
    function byteLength(b64) {
      var lens = getLens(b64)
      var validLen = lens[0]
      var placeHoldersLen = lens[1]
      return ((validLen + placeHoldersLen) * 3) / 4 - placeHoldersLen
    }

    function _byteLength(b64, validLen, placeHoldersLen) {
      return ((validLen + placeHoldersLen) * 3) / 4 - placeHoldersLen
    }

    function toByteArray(b64) {
      var tmp
      var lens = getLens(b64)
      var validLen = lens[0]
      var placeHoldersLen = lens[1]

      var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen))

      var curByte = 0

      // if there are placeholders, only get up to the last complete 4 chars
      var len = placeHoldersLen > 0 ? validLen - 4 : validLen

      var i
      for (i = 0; i < len; i += 4) {
        tmp =
          (revLookup[b64.charCodeAt(i)] << 18) |
          (revLookup[b64.charCodeAt(i + 1)] << 12) |
          (revLookup[b64.charCodeAt(i + 2)] << 6) |
          revLookup[b64.charCodeAt(i + 3)]
        arr[curByte++] = (tmp >> 16) & 0xff
        arr[curByte++] = (tmp >> 8) & 0xff
        arr[curByte++] = tmp & 0xff
      }

      if (placeHoldersLen === 2) {
        tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4)
        arr[curByte++] = tmp & 0xff
      }

      if (placeHoldersLen === 1) {
        tmp =
          (revLookup[b64.charCodeAt(i)] << 10) |
          (revLookup[b64.charCodeAt(i + 1)] << 4) |
          (revLookup[b64.charCodeAt(i + 2)] >> 2)
        arr[curByte++] = (tmp >> 8) & 0xff
        arr[curByte++] = tmp & 0xff
      }

      return arr
    }

    function tripletToBase64(num) {
      return (
        lookup[(num >> 18) & 0x3f] +
        lookup[(num >> 12) & 0x3f] +
        lookup[(num >> 6) & 0x3f] +
        lookup[num & 0x3f]
      )
    }

    function encodeChunk(uint8, start, end) {
      var tmp
      var output = []
      for (var i = start; i < end; i += 3) {
        tmp = ((uint8[i] << 16) & 0xff0000) + ((uint8[i + 1] << 8) & 0xff00) + (uint8[i + 2] & 0xff)
        output.push(tripletToBase64(tmp))
      }
      return output.join('')
    }

    function fromByteArray(uint8) {
      var tmp
      var len = uint8.length
      var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
      var parts = []
      var maxChunkLength = 16383 // must be multiple of 3

      // go through the array every three bytes, we'll deal with trailing stuff later
      for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
        parts.push(encodeChunk(uint8, i, i + maxChunkLength > len2 ? len2 : i + maxChunkLength))
      }

      // pad the end with zeros, but make sure to not forget the extra bytes
      if (extraBytes === 1) {
        tmp = uint8[len - 1]
        parts.push(lookup[tmp >> 2] + lookup[(tmp << 4) & 0x3f] + '==')
      } else if (extraBytes === 2) {
        tmp = (uint8[len - 2] << 8) + uint8[len - 1]
        parts.push(lookup[tmp >> 10] + lookup[(tmp >> 4) & 0x3f] + lookup[(tmp << 2) & 0x3f] + '=')
      }

      return parts.join('')
    }

    function ArrayBufferToWordArray(arrayBuffer) {
      const u8 = new Uint8Array(arrayBuffer, 0, arrayBuffer.byteLength)
      const len = u8.length
      const words = []
      for (let i = 0; i < len; i += 1) {
        words[i >>> 2] |= (u8[i] & 0xff) << (24 - (i % 4) * 8)
      }
      return CryptoJS.lib.WordArray.create(words, len)
    }

    function WordArrayToArrayBuffer(wordArray) {
      const { words } = wordArray
      const { sigBytes } = wordArray
      const u8 = new Uint8Array(sigBytes)
      for (let i = 0; i < sigBytes; i += 1) {
        const byte = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff
        u8[i] = byte
      }
      return u8
    }

    return {
      toByteArray: toByteArray,
      fromByteArray: fromByteArray,
      ArrayBufferToWordArray: ArrayBufferToWordArray,
      WordArrayToArrayBuffer: WordArrayToArrayBuffer,
    }
  })()
