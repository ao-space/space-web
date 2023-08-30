# space-web

[English](README.md) | 简体中文

- [简介](#简介)
- [架构设计](#架构设计)
- [开发说明](#开发说明)
- [部署说明](#部署说明)
- [贡献指南](#贡献指南)
- [联系我们](#联系我们)
- [感谢您的贡献](#感谢您的贡献)

## 简介

space-web 是 AO.space（傲空间）中的 web 部分。space-web 利用 PWA（Progressive Web App) 和 indexdb 等技术为用户提供良好的前端体验。

space-web 提供了文件的基本管理功能，打开 space-web 界面，登录完成以后，用户可以上传文件，新建文件夹，删除文件，重命令文件，复制及移动文件等功能。同时 space-web 提供了回收站功能，在回收站中可以找到在文件管理中被删除的文件，可以进行文件还原及彻底删除功能。最后用户可以进行个人设置，用户可以设置头像，个性签名等。

### 架构设计

![Alt text](image.png)

space-web 使用 javascript 开发，用到了 vue3，element-plus，axios，jsencrypt，service-worker 等技术。业务层包含登录、快速登录、我的、主页等页面，同时用到了 web 本地化技术，保证用户操作文件的流畅性

### 开发说明

1.进入到您的工作目录,运行命令 `git clone https://github.com/ao-space/space-web.git` 2.进入到 space-web 目录 `cd ./space-web` 3.安装依赖请运行 `npm install` 4.开发请运行 `npm run dev` 6.本项目是傲空间的 web 端，服务端接口用的是[space-gateway](https://github.com/ao-space/space-gateway)接口。开发时请修改根目录下的 vite-dev 文件中的 target 属性，让其指向 space-gateway 的接口地址
具体见下图
![Alt text](./img/image.png)

### 部署说明

1.确定该项目对外暴露域名及 space-gateway 接口域名 2.如果该项目对外暴露域名和 space-gateway 接口域名不一致，需 把 src/config/networkConfig.ts 中的 urlConfig 的 baseurl 改为 space-gateway 的接口域名
具体如下图
![Alt text](./img/image-1.png) 3.在项目根目录下运行 `docker build -t space-web .` 4.将打包出的 nginx 镜像运行起来 执行命令 `docker run -d --name space-web -p 80:80 space-web` (具体的 docker 命令请参照 docker 文档)

## 贡献指南 

我们非常欢迎对本项目进行贡献。以下是一些指导原则和建议，希望能够帮助您参与到项目中来。

[贡献指南](https://github.com/ao-space/ao.space/blob/dev/docs/contribution-guidelines_CN.md)

## 联系我们

- 邮箱：developer@ao.space
- [傲空间官网](https://ao.space)
- [讨论组](https://slack.ao.space)
- [Twitter](https://twitter.com/AOspaceOSC)

您也可以查看傲空间提供的[帮助中心](https://ao.space/support/help)

## 感谢您的贡献

最后，感谢您对本项目的贡献。我们欢迎各种形式的贡献，包括但不限于代码贡献、问题报告、功能请求、文档编写等。我们相信在您的帮助下，本项目会变得更加完善和强大。
