# AOSpace-Web

页面调试开关路由
/home/webrtc_config 

chrome://bluetooth-internals

蓝牙 https://webbluetoothcg.github.io/web-bluetooth/

蓝牙规范文档
https://webbluetoothcg.github.io/web-bluetooth/#dom-requestdeviceoptions-optionalservices

蓝牙文档
https://webbluetoothcg.github.io/web-bluetooth/#dom-requestdeviceoptions-optionalservices

前端生成秘钥
cnblogs.com/pinkpolk/articles/13600696.html
载 crypto-js.js 引入使用 网址是点击下载

var aseKey = "12345678" //秘钥必须为：8/16/32 位
var message = "80018000142";
//加密
var encrypt = CryptoJS.AES.encrypt(message, CryptoJS.enc.Utf8.parse(aseKey), {
mode: CryptoJS.mode.ECB,
padding: CryptoJS.pad.Pkcs7
}).toString();
console.log(encrypt); //VKrZlqykem73x8/T2oCfCQ==

//解密
var decrypt = CryptoJS.AES.decrypt(encrypt, CryptoJS.enc.Utf8.parse(aseKey), {
mode: CryptoJS.mode.ECB,
padding: CryptoJS.pad.Pkcs7
}).toString(CryptoJS.enc.Utf8);
console.log(decrypt); //80018000142

https://cryptojs.gitbook.io/docs/

eos-ecc 文档 ecc sign 和 verify
http://cw.hubwiz.com/card/c/eosjs-ecc-manual/

function copyLoginInfo(url){
    let keysArr = [
        '__getPersonal__',
        'clientUUID',
        'eluoxaeskey',
        'eluoxaccessToken',
        'loginInfo',
        '__getPersonal__'
      ]
      let queryStr = ''
      keysArr.forEach((item) => {
        if (localStorage.getItem(item)) {
          if (!queryStr) {
            queryStr = `${item}=${localStorage.getItem(item)}`
          } else {
            queryStr += `&${item}=${localStorage.getItem(item)}`
          }
        }
      })
      window.open(`${url}/webrtc/loginInfo.html?`+queryStr)
}

copyLoginInfo('http://192.168.124.18:3002/')

https://www.npmjs.com/package/@toruslabs/eccrypto

写一个 pwa 的例子
把前端加密解密套件写好
前端获得对称秘钥
集成 vuex

video-js 可以播放 aes 加密的 ts 文件
https://zhuanlan.zhihu.com/p/341001951

ts 高级指南
https://www.yuque.com/wobushihaoren/gugu3c/yr0ost

待办事项
1.aseUtil.js 改为 ts 书写
把 ase 对字符串的加解密 及 对文件的加解密 统一起来
写一个核心的方法 其他方法都是调用这个方法 其他方法都是处理下参数，处理下返回 给外界
核心方法中先判断原生的 ase 加解密方法是否可用,可用就用原生的,不可用就用第三方库的 2.业务中对 aseUtil.js 的调用，写一个 ts 文件， 参数可用传 字符串 file 等。 返回可用是个字符串 或者 arrayBuffer

要写一个业务 ase 加解密字符串 加解密文件 调用 aseUtil.js 里面的方法

把业务中拼装请求参数并加密的方法 提取出来， 把业务中解密 ase 响应的方法提取出来

代码格式化
https://www.cnblogs.com/lvonve/p/10785682.html

prettier

格式化代码:
vs-code 插件
prettier-code

vscode settting 配置
·
{
// vscode 默认启用了根据文件类型自动设置 tabsize 的选项
"editor.detectIndentation": false,
// 重新设定 tabsize
"editor.tabSize": 2,
// #值设置为 true 时，每次保存的时候自动格式化；值设置为 false 时，代码格式化请按 shift+alt+F
"editor.formatOnSave": true,
// #每次保存的时候将代码按 eslint 格式进行修复
"eslint.autoFixOnSave": true,
// 添加 vue 支持
"eslint.validate": [
"javascript",
"javascriptreact",
{
"language": "vue",
"autoFix": true
"comma-dangle":["never"]
}
],
// #让函数(名)和后面的括号之间加个空格
"javascript.format.insertSpaceBeforeFunctionParenthesis": true,
// #这个按用户自身习惯选择
"vetur.format.defaultFormatter.html": "js-beautify-html",
// #让 vue 中的 js 按"prettier"格式进行格式化
// "vetur.format.defaultFormatter.js": "prettier",
"vetur.format.defaultFormatterOptions": {
"js-beautify-html": {
// #vue 组件中 html 代码格式化样式
"wrap_attributes": "force-aligned", //也可以设置为“auto”，效果会不一样
"wrap_line_length": 200,
"max-preserve-newlines": 300, // 一次可保留的最大换行数
// "wrap_line_length": 300,
"end_with_newline": false,
"semi": false,
"singleQuote": true
}
},
"editor.defaultFormatter": "esbenp.prettier-vscode",
"[jsonc]": {
// "editor.defaultFormatter": "esbenp.prettier-vscode"
},
"prettier.useTabs": true,
"files.autoSave": "off",
"explorer.confirmDelete": false, // 不懂
"[javascript]": {
"editor.defaultFormatter": "esbenp.prettier-vscode"
},
"[json]": {
"editor.defaultFormatter": "esbenp.prettier-vscode"
},
"diffEditor.ignoreTrimWhitespace": false, // 不懂
"editor.codeActionsOnSave": {
"source.fixAll.eslint": true
},
}
·

多域名支持
res upload download push

webrtc 问题 1.连接建立不了,直接走 http

webrtc 需要调优
需要重新计算下上传进度事件 (要成功了才算进度)


待办事项:
写一个通用的原子 css 文件
包含常用字体大小  font-12
    字体加粗     weight-500
    常用padding  pt-1 => padding-top:1px; pl-1 =>padding-left:1px  pr-1=>padding-right:1px  pb-1=>padding-bottom:1px  p-1 => padding:1px
    常用margin   mt-1 => marging-top:1px; ml-1 =>marging-left:1px  mr-1=>marging-right:1px  mb-1=>marging-bottom:1px  m-1 => margin:1px
    常用字体颜色  color-333333 => color:#333    这个可以单独提取到一个文件中,在项目开始的时候和ui 说好,把常用的列举出来
    flex布局:  flex => display:flex   
    主轴对齐    flex-x-center => {display:flex;justify-content:center}
    纵轴对齐    flex-y-center => {display:flex;align-center:center}
    文字单行最大宽度显示多余显示...  .overflow-ellipsis {
                                    white-space: nowrap;
                                    overflow: hidden;
                                    text-overflow: ellipsis;
                                 }
    行内块  inline-block => display:inline-block



一个项目需要有一个统一的弹框,样式固定  能自定义头部 内容  及 footer

vue 裁剪插件
https://www.jianshu.com/p/5f5aafe9e895
https://blog.csdn.net/weixin_38023551/article/details/78792400
https://www.cnblogs.com/qwguo/p/13144377.html

把 常用的 css 提取出来 然后打印一下
例如  flex  flex-x-center  flex-y-center
pointer

开始写一个项目的时候，把主色系提取出来 颜色写成 color-333333 等方便后面原子写法


把loading 封装一个带定时功能的函数
超过多长时间 开始展示  超过多长时间开始消失等

typescript 的代码提示怎么弄等


搜索排序规则
按照文件类型排序 先文件夹在文件

文件列表排序规则
先名称或时间  之后在按照文件类型排序

