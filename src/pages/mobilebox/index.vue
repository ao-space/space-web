<!--
  ~ Copyright (c) 2022 Institute of Software Chinese Academy of Sciences (ISCAS)
  ~
  ~ Licensed under the Apache License, Version 2.0 (the "License");
  ~ you may not use this file except in compliance with the License.
  ~ You may obtain a copy of the License at
  ~
  ~     http://www.apache.org/licenses/LICENSE-2.0
  ~
  ~ Unless required by applicable law or agreed to in writing, software
  ~ distributed under the License is distributed on an "AS IS" BASIS,
  ~ WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  ~ See the License for the specific language governing permissions and
  ~ limitations under the License.
-->

<template>
  <div class="content">
    <button class="send" type="button" @click="aonclick">发送文件</button>
    <button class="send" type="button" @click="bonclick">发送消息</button>
    <div id="modal" v-show="showType != ''">
      <div id="adialog" v-show="showType == 'file'">
        <div class="title">发送文件</div>
        <div id="hidder" @click="hidder">x</div>
        <div class="project">
          Token ID <br /><input type="text" name="idname" /><br /><br /><br />
          图像<br /><input
            type="file"
            id="file-image"
          /><br /><br /><br /><br />
          <button class="asub" type="button">提交</button>
        </div>
      </div>

      <div id="bdialog" v-show="showType == 'message'">
        <div class="title">发送消息</div>
        <div id="hidder" @click="hidder">x</div>
        <div class="project">
          Token ID <br /><input type="text" name="idname" /><br /><br /><br />
          消息<br /><textarea
            rows="13"
            cols="113"
            style="width: 100%"
          ></textarea
          ><br /><br /><br /><br />
          <button class="bsub" type="button">提交</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, ref, toRefs } from 'vue'
export default {
  setup() {
    const state = reactive({ showType: '' })

    const aonclick = () => {
      state.showType = 'file'
    }

    const bonclick = () => {
      state.showType = 'message'
    }

    const hidder = () => {
      state.showType = ''
    }
    return {
      ...toRefs(state),
      aonclick,
      bonclick,
      hidder,
    }
  },
}
</script>

<style scoped>
.content {
  padding-top: 3.7px;
}

.left {
  background-color: #f0f0f0;
  height: 93vh;
  width: 13vw;
  display: inline-block;
}
.list {
  color: #666;
  text-align: center;
}
.type {
  padding-top: 7vh;
  cursor: pointer;
  text-align: center;
  padding-bottom: 50px;
}

.type:hover {
  background-color: #d3d3d3;
}

.send {
  text-align: center;
  width: 333px;
  padding: 17px;
  background-color: #1c86ee;
  border-color: #357ebd;
  color: #fff;
  -moz-border-radius: 10px;
  -webkit-border-radius: 10px;
  border-radius: 10px;
  vertical-align: middle;
  border: 1px solid transparent;
  font-weight: 1333;
  font-size: 137%;
  cursor: pointer;
  display: block;

  margin: 0 auto;
  margin-top: 20px;
}

#modal {
  position: fixed;
  left: 0px;
  top: 0px;
  width: 100%;
  height: 100%;
  background-color: rgba(223, 223, 223, 0.7);
}

#adialog {
  position: relative;
  background: #ffff;
  opacity: 1;
  width: 50%;
  height: 77%;
  border-radius: 7px;
  margin: 7% auto;
}

#bdialog {
  position: relative;
  background: #ffff;
  opacity: 1;
  width: 50%;
  height: 77%;
  border-radius: 7px;
  margin: 7% auto;
}

.title {
  text-align: center;
  padding: 7px;
  font-size: 113%;
  color: #1c86ee;
  border-bottom: 1.3px solid #1c86ee;
  font-weight: bold;
}

.project {
  text-align: center;
  padding: 17px;
  font-size: 113%;
  color: #1c86ee;
  font-weight: bold;
}

.asub {
  margin-top: 37vh;
  margin-left: 17vw;
  text-align: center;
  width: 333px;
  background-color: #1c86ee;
  border-color: #357ebd;
  color: #fff;
  -moz-border-radius: 10px;
  -webkit-border-radius: 10px;
  border-radius: 10px;
  vertical-align: middle;
  border: 1px solid transparent;
  font-weight: 1333;
  font-size: 137%;
  cursor: pointer;
  display: block;
}

.bsub {
  text-align: center;
  margin: 0 auto;
  width: 333px;
  background-color: #1c86ee;
  border-color: #357ebd;
  color: #fff;
  -moz-border-radius: 10px;
  -webkit-border-radius: 10px;
  border-radius: 10px;
  border: 1px solid transparent;
  font-weight: 1333;
  font-size: 137%;
  cursor: pointer;
  display: block;
}

#hidder {
  position: absolute;
  width: 25px;
  height: 25px;
  border-radius: 5px;
  background: #1c86ee;
  color: #fff;
  right: 5px;
  top: 5px;
  text-align: center;
  cursor: pointer;
}

input[type='file'] {
  margin-left: 4.3vw;
}
</style>
