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
  <div>
    <el-table
      :data="tableData"
      ref="elTable"
      v-request="loading"
      v-bind="{ ...tableAttr, ...$attrs }"
      row-key="$$__uuid"
      :stripe='stripe'
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
    >
      <template v-for="(item, index) in column">
        <el-table-column
          v-if="
            item.type === 'slot' ||
            typeof item.convertFn === 'function' ||
            typeof convertFns[item.key] === 'function'
          "
          :key="item.key || index"
          :label="item.label"
          :prop="item.key"
          v-bind="item.attr"

        >
          <template v-slot="scope">
            <slot
              v-bind="{ row: scope.row, $index: scope.$index, $key: item.key, $label: item.label }"
              v-if="item.type === 'slot'"
            ></slot>
            <span v-else>{{ _text(scope, item, item.key) }}</span>
          </template>
        </el-table-column>
        <el-table-column
          v-else-if="item.type === 'index'"
          type="index"
          :index="_indexMethod"
          :key="index + '9528'"
          :label="item.label"
          :prop="item.key"
          v-bind="item.attr"
        ></el-table-column>
        <el-table-column
          v-else
          :key="index + '9527'"
          :label="item.label"
          :prop="item.key"
          v-bind="item.attr"
        ></el-table-column>
      </template>
    </el-table>
    <div class="pagination">
      <el-pagination
        v-show="!unNeedPagination"
        style="margin-top: 10px"
        :total="pageData.total"
        v-model:current-page="pageData.currentPage"
        :page-size="pageData.pageSize"
        @size-change="handleSizeChange"
        prev-text="上一页"
        next-text="下一页"
        layout="total,prev, pager, sizes,next, jumper"
        @current-change="_onQuery"
      />
    </div>
  </div>
</template>
<script>
// 特性,内部自动给数据生成$$__uuid 防止重复
export default {
  props: {
    dataModal: {
      // 定义表格头,表格列的对应后台的字段名称,及列的转换,列的属性等
      type: Object,
      required: true,
    },
    fetchFunction: {
      // 从后台拉取数据函数
      type: Function,
      required: false,
    },
    mock: {
      // 开启mock数据
      type: Boolean,
      required: false,
    },
    unNeedPagination: {
      // 不需要分页
      type: Boolean,
      required: false,
    },

    pageSize: {
      // 每页显示条数
      type: Number,
      required: false,
      default: 10,
    },
    stripe:{
      type:Boolean,
      default:false,
    },
  },
  data() {
    // // console.log(this.$attrs)
    const { attr, column, tableAttr } = this.dataModal
    tableAttr.border = false
    const mergeAttr = this._margeAttr(attr, column)
    // console.log(this.$props.pageSize)
    return {
      attr: mergeAttr.attr || {},
      tableAttr: tableAttr || {},
      column: mergeAttr.column,
      tableData: [],
      pageData: {
        pageNum: 1,
        pageSize: this.$props.pageSize || 10,
        pageCount: 0,
        total: 0,
        currentPage: 1,
      },
      params: {},
      // eslint-disable-next-line vue/no-reserved-keys
      convertFns: {},
      loading: false,
    }
  },
  created() {
    this._initMock()
  },
  mounted() {
    this.queryData()
  },
  methods: {
    handleSizeChange(pageSize) {
      this.pageData.pageSize = pageSize
      this.pageData.pageNum = 1
      this.queryData()
    },
    checkSelectable(row) {
      return false
    },
    _indexMethod(index) {
      const { pageSize, currentPage } = this.pageData
      return (currentPage - 1) * pageSize + index + 1
    },
    /**
     *  attr合并到具体的单元格上面去
     */
    _margeAttr(attr, column) {
      column.forEach((item) => {
        const tmpattr = item.attr
        item.attr = { ...attr, ...tmpattr }
      })
      return { attr, column }
    },
    /**
     *  mock数据,需开启mock
     */
    _initMock() {
      if (this.mock) {
        // 开启mock数据 默认10条
        let tmp = []
        for (let i = 0; i < 10; i++) {
          const obj = {}
          this.column.forEach((element) => {
            if (element.type !== 'slot') {
              obj[element.key] = element.type === 'index' ? i : element.mock
            }
          })
          tmp.push(obj)
        }

        tmp = this._genUUID(tmp)
        this.tableData = tmp
      }
    },
    /**
     *  转换单元格显示内容,有convertFn就调用其转换,其他情况直接显示原值
     */
    _text(scope, item, key) {
      let convertFn = item.convertFn
      if (typeof convertFn === 'function') {
        return convertFn(scope.row, item.key, item)
      }
      convertFn = this.convertFns[key]

      if (typeof convertFn === 'function') {
        return convertFn(scope.row, item.key, item)
      }
      return scope.row[item.key]
    },
    queryData() {
      // 对外暴露的函数
      let params = { pageNum: 1, pageSize: this.pageData.pageSize }
      // this.pageData.currentPage = 1
      this._queryDataWrap(params)
    },

    // 从外部设置转换函数
    setColumnConvertFn(key, convertFn) {
      this.convertFns[key] = convertFn
    },

    _queryDataWrap(params) {
      // this.loading = true
      this.params = params
      if (this.pageData.currentPage != params.pageNum) {
        // 修复bug
        this.pageData.currentPage = params.pageNum
      }
      this.fetchFunction(params).then((res) => {
        this.loading = false
        let response

        // 兼容没有responseParse
        if (!Array.isArray(res.dataList)) {
          throw new Error(
            'fetchfunction 返回的promise 的 res的数据格式为{dataList: [], total: number}',
          )
        }
        this.tableData = [].concat(res.dataList)
        this._genUUID(this.tableData)
        this.pageData = {
          ...this.pageData,
          total: parseInt(res.total),
        }
      })
    },
    _genUUID(array) {
      array.map((item, index) => {
        if (!item.$$__uuid) {
          const uuid = Math.random() + '' + Math.random() + '' + index
          item.$$__uuid = uuid
          if (item.children && item.children.length > 0) {
            this._genUUID(item.children)
          }
        }
        return item
      })
      return array
    },
    _onQuery(currentPage) {
      this.pageData.currentPage = currentPage
      const params = { ...this.params, pageNum: currentPage }

      this._queryDataWrap(params)
    },
    /**
     * 调用表格的方法
     */
    callTableMethods(methodName, ...args) {
      if (this.$refs.elTable && this.$refs.elTable[methodName]) {
        this.$refs.elTable[methodName].apply(this.$refs.elTable, args)
      }
    },
  },
}
</script>
<style scoped>
.pagination {
  display: flex;
  flex-direction: row-reverse;
}
</style>
