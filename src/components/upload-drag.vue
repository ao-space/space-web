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
  <div @drop.prevent="onDrop" @dragover.prevent="onDragover" @dragleave.prevent="dragover = false">
    <slot />
  </div>
</template>
<script lang="ts" setup>
import { inject, ref, defineProps, defineEmits } from 'vue'

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['upFileFn'])

const dragover = ref(false)

const onDrop = (e: DragEvent) => {
  if (props.disabled) return
  dragover.value = false

  readFile(e.dataTransfer.items).then(files=>{
    console.log("files",files)
    emit('upFileFn', files)
  })
}

function readFile(items){
  return new Promise((resolve)=>{
    for(let i = 0; i<items.length;i++){
      let item = items[i]
      let entry = item.webkitGetAsEntry()
      everyDir(entry).then(files=>{
        resolve(files)
      })
    }
  })
}

function everyDir(entry){
  return new Promise( (resolve)=> {
    if (entry.isFile) {
      entry.file((fileInfo)=>{
        Object.defineProperty(fileInfo, 'webkitRelativePath', {
          value: entry.fullPath.substring(1),
        })
        resolve([fileInfo])
      })
    } else {
      let reader = entry.createReader()
      reader.readEntries(async (results) => {
        let files = []
        for(let file of results){
          let resultFiles =  await everyDir(file)
          files.push(...resultFiles)
        }
        resolve(files)
      })
    }
  })
}

const onDragover = () => {
  if (!props.disabled) dragover.value = true
}
</script>
