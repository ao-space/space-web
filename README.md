# Introduction to Space-web

- [Introduction](#introduction)
- [Technology Stack](#technology-stack)
- [Development Guidelines](#development-guidelines)
- [Roadmap](#roadmap)
- [Contribution Guidelines](#contribution-guidelines)
- [中文文档](/README_zh.md)

## Introduction

Space-web is the web component of AO.space. It leverages technologies such as PWA (Progressive Web App) and IndexedDB to provide users with a great frontend experience.

Space-web offers basic file management functionalities. After logging in to the space-web interface, users can upload files, create folders, delete files, rename files, copy and move files, and more. Additionally, space-web provides a recycle bin feature where users can find deleted files from the file management section and perform file restoration or permanent deletion. Lastly, users can customize their profiles by setting avatars, personal signatures, and more.

### Technology Stack

Space-web utilizes the following main frameworks for development:

1. Vue 3
2. Element Plus
3. Axios
4. JsEncrypt

### Development Guidelines

1. This project is the web frontend of AO.space, and it uses the APIs provided by [space-gateway](https://github.com/ao-space/space-gateway).
2. Most of the APIs in this project are doubly encrypted.
3. To install dependencies, run `npm install`.
4. To start development, run `npm run dev`.
5. To build the project, run `npm run build`.

## Contribution Guidelines

We welcome contributions to this project. Here are some guidelines and suggestions to help you get involved.

### Contributing Code

If you want to contribute to the project, the best way is to submit code changes. Before submitting your code, make sure you have downloaded and familiarized yourself with the project codebase, and ensure that your code follows the following guidelines:

- Code should be concise, clear, and easy to maintain and extend.
- Code should follow the project's naming conventions to ensure consistency.
- Code should adhere to the project's code style guidelines, which can be found in the project's code repository.

To submit your code changes, follow these steps:

- Fork the project on GitHub.
- Clone your forked project to your local machine.
- Make your modifications and improvements locally.
- Run tests to ensure that any changes have no adverse effects.
- Submit your changes and create a pull request.

### Code Quality

We value code quality, so the code you submit should meet the following requirements:

- Code should be thoroughly tested to ensure correctness and stability.
- Code should follow good design principles and best practices.
- Code should meet the relevant requirements for code contributions.

### Commit Messages

Before submitting your code, make sure to provide meaningful and detailed commit messages. This helps us better understand your code contribution and merge it more quickly.

A commit message should include the following:

- Describe the purpose or reason for the code contribution.
- Describe the content or changes made in the code contribution.
- (Optional) Describe the testing methods or results for the code contribution.

Commit messages should be clear and follow the conventions of the project's code repository.

### Issue Reporting

If you encounter any issues or discover any errors in the project, feel free to submit an issue report. Before submitting an issue report, make sure you have thoroughly investigated and tested the issue, and provide as much information as possible, including:

- Describe the symptoms and manifestations of the issue.
- Describe the scenarios and conditions in which the issue occurs.
- Provide contextual information or any relevant background information.
- Describe the expected behavior.
- (Optional) Provide relevant screenshots or error messages.

Issue reports should be clear and follow the conventions of the project's code repository for issue reporting.

### Feature Requests

If you want to add new features or enhancements to the project, you are welcome to submit feature requests. Before submitting a feature request, make sure you understand the project's history and current state, and provide as much information as possible, including:

- Describe the desired feature or enhancement.
- Describe the purpose and objectives of the feature or enhancement.
- (Optional) Provide relevant implementation ideas or suggestions.

Feature requests should be clear and follow the conventions of the project's code repository for feature requests.

### Thank You for Your Contribution

Finally, thank you for your contribution to this project. We welcome various forms of contributions, including but not limited to code contributions, issue reports, feature requests, and documentation writing. With your help, we believe this project will become more complete and powerful.