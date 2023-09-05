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

import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import myPlugin from './myPlugin/vite-plugin-vue-pwa'
// import createImportPlugin from 'vite-plugin-import'
import path from 'path'
import {getDevConfig} from './vite-dev'

let server = getDevConfig()
// import babelPluginImport from 'babel-plugin-import'
// https://vitejs.dev/config/
/**
 * @type {import('vite').UserConfig}
 */
let preHost = 'lk4nxr9n'
const config = {
  base: './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      'vue-i18n': 'vue-i18n/dist/vue-i18n.cjs.js'
    },
  },
  build:{
    rollupOptions:{
        output:{
            manualChunks:{
                'lodash': ['lodash'],
                'vue':['vue'],
                'spark-md5':['spark-md5'],
                'crypto-js':['crypto-js'],
                'element-plus':['element-plus'],
                'heic2any':['heic2any'],
                'xlsx':['xlsx']
            }
        }
    }
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port:server.port,
    proxy: {
      // 选项写法
      '/space': {
        target:server.target,
        changeOrigin: true,
      }
    },
  },

  optimizeDeps: {
    include: ['file-saver', 'crypto-js', 'spark-md5'],
  },
  plugins: [vue(), vueJsx(), myPlugin()],

}
export default config
