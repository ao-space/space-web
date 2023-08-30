# space-web

English | [简体中文](./README_zh.md)

- [Introduction](#introduction)
- [Architecture Design](#architecture-design)
- [Development Instructions](#development-instructions)
- [Deployment Instructions](#deployment-instructions)
- [Contribution Guidelines](#contribution-guidelines)
- [Contact us](#contact-us)
- [Thanks for your contribution](#thanks-for-your-contribution)

## Introduction

space-web is the web component of AO.space. It utilizes technologies like PWA (Progressive Web App) and IndexedDB to provide users with a good frontend experience.

space-web offers basic file management functionalities. After opening the space-web interface and logging in, users can upload files, create folders, delete files, rename files, copy and move files, and more. Additionally, space-web includes a recycle bin feature where users can find deleted files from the file management system and restore or permanently delete them. Finally, users can personalize their settings by setting avatars, signatures, and more.

### Architecture Design

![Alt text](image.png)

space-web is developed using JavaScript and utilizes technologies such as Vue3, Element-plus, Axios, Jsencrypt, and service-worker. The business layer includes pages such as login, quick login, mine, and homepage, and uses web localization technology to ensure smooth file operations.

### Development Instructions

1. Enter your working directory and run the command `git clone https://github.com/ao-space/space-web.git`.
2. Enter the space-web directory `cd ./space-web`.
3. Install dependencies by running `npm install`.
4. Run `npm run dev` for development.
6. This project is the web component of AO.space, and the server-side interface uses the [space-gateway](https://github.com/ao-space/space-gateway) interface. When developing, please modify the target property in the vite-dev file in the root directory to point to the space-gateway interface address.
See the following image for details.
![Alt text](./img/image.png)

### Deployment Instructions

1. Determine the domain name exposed to the outside world for this project and the space-gateway interface domain name.
2. If the domain name exposed to the outside world for this project and the space-gateway interface domain name are inconsistent, modify the baseurl of urlConfig in src/config/networkConfig.ts to the space-gateway interface domain name.
See the following image for details.
![Alt text](./img/image-1.png)
3. Run `docker build -t space-web .` in the project root directory.
4. Run the packaged nginx image by executing the command `docker run -d --name space-web -p 80:80 space-web` (Refer to the Docker documentation for specific Docker commands).

## Contribution Guidelines

Contributions to this project are very welcome. Here are some guidelines and suggestions to help you get involved in the project.

[Contribution Guidelines](https://github.com/ao-space/ao.space/blob/dev/docs/contribution-guidelines.md)

## Contact us

- Email: developer@ao.space
- [Website](https://ao.space)
- [Discussion group](https://slack.ao.space)
- [Twitter](https://twitter.com/AOspaceOSC)

You can also [get support for AO.spcae!](https://ao.space/en/support/help)

## Thanks for your contribution

Finally, thank you for your contribution to this project. We welcome contributions in all forms, including but not limited to code contributions, issue reports, feature requests, documentation writing, etc. We believe that with your help, this project will become more perfect and stronger.
