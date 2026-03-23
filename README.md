[更新内容](#更新) \
[环境配置](#开发环境安装与验证指南)


---

# 更新

---

## [2026-03-23] - 0.0.2
###  更新内容
* 把三个平台的jre打包进electron包里了
* 删除了backend的SNAPSHOT版本字样
* 在App.vue中加入了开启和保存文件的函数
* 修复了electron/main.ts中的backendProcess报错

---

# 开发环境安装与验证指南

安装好环境以后记得验证！！不懂的问 AI。

---

## Node.js
- 使用 **nvm** 管理 Node 版本
- 安装方法请自行查阅
- 安装并使用 **lts/krypton** 版本（v24.14.0）

---

## JDK
- 非 Windows：安装 **sdkman**
- Windows：配置系统环境变量 `JAVA_HOME` 指向需要的版本，并更新 `PATH`
- 要用 **21.0.10-oracle**，如果无法下载到 oracle 版本，其他的 **21.0.10** 也可以

---


## Node 包管理器
我们统一使用 **npm + pnpm**：
- npm 一般随 Node.js 一起安装，如果没有则运行：
  nvm install-latest-npm
- 安装 pnpm：
  npm install -g pnpm
  pnpm setup
- 安装 Vue CLI：
  pnpm install -g @vue/cli"


---

## SQLite
- 非 Windows：用包管理器安装
- Windows：在 PowerShell 中运行：
```shell
choco install sqlite
```
 

---

## Vue 使用的功能
- TypeScript (TS)
- Router（单页面应用开发）
- Pinia（状态管理）

---

## 前端测试
```shell
cd frontend
pnpm install
pnpm dev
```

---

## Vue 的 TS 配置
```shell
cd frontend
pnpm add -D vue-tsc typescript
```

---

## 打包
根目录
```shell
pnpm add -D electron-builder
```
```shell
cd frontend
pnpm build
```
```shell
cd ../backend
./gradlew build 
```
cd ../之后就要在根目录执行了！！检查路径！！！
```shell
cd ../
pnpm add -D typescript @types/node
pnpm add -D npm-run-all cross-env

pnpm exec tsc -p electron/tsconfig.json
pnpm exec tsc -p electron
pnpm dist

```
---

原文：
安装好环境以后记得验证！！不懂的问AI

node.js：
安装nvm管理node版本
怎么安装自己上网查
安装并使用lts/krypton版本（v24.14.0）


jdk：
安装sdkman（非Windows）
配置系统环境变量JAVA_HOME 指向需要的版本，并更新 PATH（Windows）
应当使用21.0.10-oracle，如果无法下载到oracle版本，其他的21.0.10也是一样的


node包管理器：
我们统一使用npm+pnpm
npm一般会跟随node.js一并安装，如果发现没有安装再单独下载（nvm install-latest-npm）
npm install -g pnpm（此处如果提示要求升级，复制提示的命令粘贴运行即可）
然后运行pnpm setup
pnpm install -g @vue/cli


SQLite：
用包管理器装（非Windows）
powershell运行choco install sqlite（Windows）


vue使用的功能：TS、Router（单页面应用开发）、 Pinia（状态管理）


前端测试：
cd frontend
pnpm install
pnpm dev

vue的ts配置：
cd frontend
pnpm add -D vue-tsc typescript
