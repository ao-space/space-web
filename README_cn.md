# space-web

[English](README.md) | 简体中文

- [space-web](#space-web)
  - [简介](#简介)
    - [架构设计](#架构设计)
    - [开发说明](#开发说明)
    - [部署说明](#部署说明)
  - [贡献指南](#贡献指南)
  - [联系我们](#联系我们)
  - [感谢您的贡献](#感谢您的贡献)

## 简介

客户端是整个系统的前端，负责用户在不同的个人设备上与空间的交互，使用户能够随时随地访问空间的所有功能。目前提供 Web、iOS 和 Android 客户端，提供以下关键模块：

- 端到端加密通道
- 空间绑定
- 文件
- 设备
- 空间应用
- 安全

### 架构设计

![Alt text](image.png)

space-web 使用 javascript 开发，用到了 vue3，element-plus，axios，jsencrypt，service-worker 等技术。业务层包含登录、快速登录、我的、主页等页面，同时用到了 web 本地化技术，保证用户操作文件的流畅性

### 开发说明

1.进入到您的工作目录,运行命令 `git clone https://github.com/ao-space/space-web.git`
2.进入到 space-web 目录 `cd ./space-web`
3.安装依赖请运行 `npm install`
4.开发请运行 `npm run dev`
5.本项目是傲空间的 web 端，服务端接口用的是[space-gateway](https://github.com/ao-space/space-gateway)接口。开发时请修改根目录下的 vite-dev 文件中的 target 属性，让其指向 space-gateway 的接口地址
具体见下图
![Alt text](./img/image.png)

### 部署说明

1.确定该项目对外暴露域名及 space-gateway 接口域名
2.如果该项目对外暴露域名和 space-gateway 接口域名不一致，需 把 src/config/networkConfig.ts 中的 urlConfig 的 baseurl 改为 space-gateway 的接口域名
具体如下图
![Alt text](./img/image-1.png)

3.在项目根目录下运行 `docker build -t space-web .`
4.将打包出的 nginx 镜像运行起来 执行命令 `docker run -d --name space-web -p 80:80 space-web` (具体的 docker 命令请参照 docker 文档)

## 贡献指南

我们非常欢迎对本项目进行贡献。以下是一些指导原则和建议，希望能够帮助您参与到项目中来。

[贡献指南](https://github.com/ao-space/ao.space/blob/dev/docs/cn/contribution-guidelines.md)

## 联系我们

- 邮箱：<developer@ao.space>
- [官方网站](https://ao.space)
- [讨论组](https://slack.ao.space)

## 感谢您的贡献

最后，感谢您对本项目的贡献。我们欢迎各种形式的贡献，包括但不限于代码贡献、问题报告、功能请求、文档编写等。我们相信在您的帮助下，本项目会变得更加完善和强大。
