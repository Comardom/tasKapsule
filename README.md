[更新内容](#更新) \
[环境配置](#开发环境安装与验证指南)


---

# 更新

## [2026-04-22] - 0.0.13
* 更新了几个无关紧要的文件，以便消除GitHub仓库主页上的Init Commit字样

---
## [2026-04-22] - 0.0.12
* 自动隐藏菜单（按 Alt 键显示）
* axios因CVE更新至1.15.0
* 对所有css进行了修整，尽量使用逻辑属性
* baseReset.css加入了盒模型
* 加入了themeVariables.css，以便于控制亮色、暗色模式
* baseNiceStyle.css根据themeVariables.css进行适配
* 亮色、暗色模式的存储设定为localStorage，使用theme.ts控制，其中使用了pinia状态管理
* CopyrightFooter.vue对暗色模式进行了适配
* frontend/index.html在head中加入了读取localStorage的js，防止闪光弹
* LoadingScreen.vue从flexbox改成了grid，去除旧的字体限制
* App.vue照例对功能进行修改测试
* DESIGN.md按流程删除已经达成的目标

---
## [2026-04-10] - 0.0.11
* 增加了对于Windows的支持
* 修正了Electron应用的包名

---
## [2026-04-10] - 0.0.10
* 消除electron/main.ts的修改权限报错（只是显示上的逻辑错误）
* electron/main.ts使用loadFile替代loadURL

---
## [2026-04-10] - 0.0.9
* 规定了release和jre文件夹的位置
* 加入了jre的下载方式

---
## [2026-04-10] - 0.0.8
* Electron因CVE更新了版本

---
## [2026-04-10] - 0.0.7
* App.vue中加入了主界面的切换功能
* 修改了baseNiceStyle.css保证撑满高度
* 微调了TestPage.vue以保证适配App.vue的切换
* 加入了TestPage1.vue帮助测试
* vite因CVE更新了版本
* 前后端版本号进行统一

---
## [2026-04-08] - 0.0.6
* 前端改进了Loading页面，采用了第三方开源控件
* 在前端README加入了鸣谢
* 改进了前后端的Loading连接
  * 在后端的各类中加入了用于前端显示的日志
    * HomeController.kt中加入logger
    * 其他的是加入报错文本
  * electron/main.ts进行大的修改以适配日志
    * 改造stdout的读取，加入了对输出头的正则表达式的日志读取
    * 把原本负责权限管理的块中加入了对于EROFS的检测
    * createWindow()中的win改成了全局mainWindow
  * electron/preload.ts增加了对于监听主进程
  * frontend/env.d.ts增加前后端连接（日志传递）的内容
  * frontend中loadingPageController.ts加入了监听与移除监听
  * 各vue稍作改造加入Loading信息的传入
* 修复了package.json中旧的后端版本号不符的问题
* BackendApplication.kt中加入了创建数据库所在文件夹的创建逻辑
  * 防止Spring加载中途报错
  * 因为Spring的@PostConstruct不一定会最先执行，而是会先报错
* electron/main.ts的killPort功能分离了出去
* 加入了一些ORM测试的kt文件

---

## [2026-03-28] - 0.0.5
* 加入了Apache 2.0开源许可证，版权归贡献者所有

---


## [2026-03-28] - 0.0.4
###  更新内容
#### 整体性调整（electron和前后端对接）
* 修改前端端口为9998,后端为9999<br /><br />
* 对electron/main.ts进行了重整，并且加入了大量的注释
  * 并且加入了杀掉9999端口进程的功能，保证程序始终使用9999端口<br /><br />
* 针对日志捕捉做出了改进：
  * electron/main.ts中whenReady()的backendProcess中stdio参数修改为pipe
  * backend/src/resources/application.yaml的logging块补充了配置
  * 后端controller包的DatabaseConfig类使用slf4j的logger保存日志<br /><br />
* 后端加入了RESTful API和前端跨域联动（CORS跨域资源共享）
  * 后端controller包的HomeController类加入了检测后端加载的/health API
  * 前端在backendHealthCheck.ts中调用此API<br /><br />
* frontend/vite.config.ts的defineConfig中加入了server块
  * 前端端口号定为9998
  * 确定为不可自动切换，防止CORS出问题<br /><br />
* 前端loadingPageController.ts通过调用前端backendHealthCheck.ts检查后端
  * 如果后端没有加载完成，通过v-if渲染loading页面
  * 加载好了以后通过异步的检测告知前端渲染应该渲染的界面<br /><br />
#### 前端调整
* 前端通过pnpm安装了axios<br /><br />
* 因为前端是Vue-SPA架构，不需要router，所以frontend/src/router/被弃用
  * 相对应地，frontend/src/main.ts中app.use(router)也被弃用<br /><br />
* frontend/src/main.ts进行了重整和注释加入
  * 改变了“等待后端加载完成再挂载前端”的逻辑为IIFE异步执行前端挂载
  * 被立即挂载的App.vue调用loadingPageController.ts探测后端<br /><br />
* App.vue的文件读写逻辑被封装进fileHandleFunctions.ts中
  * fileHandleFunctions.ts通过调用fileApi.ts接触底层磁盘读写
  * 底层磁盘读写权限通过electron/preload.ts开放<br /><br />
* App.vue的CSS封装进frontend/src/globalCSS/中
  * 针对html和body的底层大修改放在baseReset.css
  * 针对主页的外观定制放在baseNiceStyle.css<br /><br />
* App.vue经过改进后仅保留import、简单的ts语句、template中的vue组件调用<br /><br />
* App.vue调用的vue组件放在frontend/src/components中<br /><br />
* 修正了frontend/README.md<br /><br />
#### 后端调整
* 后端controller包的DatabaseConfig类SQLite的文件创建逻辑进行微调<br /><br />
* backend/build.gradle.kts中删除了lombok依赖和exposed中间件<br /><br />
---

## [2026-03-27] - 0.0.3
###  更新内容
* 前端提取了一个baseReset的CSS防止视图超出边框
* 前端完成了footer版权页的编写
* 重新解决了electron打包未加入jvm的错误（重写electron/main.ts）

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