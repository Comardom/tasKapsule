[更新内容](#更新) \
[环境配置](#开发环境安装与验证指南)


---


# 更新















## [2026-06-04] - 0.1.27
* 修改了测试工具栏的位置

---
## [2026-06-04] - 0.1.26
* 更新了文档，加入了PKGBUILD取消pacman生成

---
## [2026-06-02] - 0.1.25
* 提取出了CalendarBody作为独立组件

---
## [2026-05-31] - 0.1.24
* 加入了日期时钟指示
* Calendar的header、body、tail都在各自范围内居中

---
## [2026-05-30] - 0.1.23
* 加入了日历的上下翻页功能
* 稍微放慢了胶囊单双列切换的速度

---
## [2026-05-30] - 0.1.22
* 修复了胶囊展开时的长文本闪现问题

---
## [2026-05-30] - 0.1.21
* 修复了双列模式下的动画闪现问题

---
## [2026-05-29] - 0.1.20
* 修复了宽度不够的时候导致胶囊被裁剪的问题

---
## [2026-05-28] - 0.1.19
* 修复了单双列切换卡帧的问题
* 加入了所有的数据库字段进入新建和展示页面

---
## [2026-05-28] - 0.1.18
* 修复了Cell鼠标事件错乱的问题

---
## [2026-05-28] - 0.1.17
* 修复了无法创建新胶囊的问题

---
## [2026-05-27] - 0.1.16
* 修复了点击他月当天样式失效的问题

---
## [2026-05-26] - 0.1.15
* 加入了日历的单击、双击、右键逻辑

---
## [2026-05-26] - 0.1.14
* 加入了单双列切换动画

---
## [2026-05-26] - 0.1.13
* 两列胶囊的模式外观改成了向中间靠拢而不是两端对齐

---
## [2026-05-26] - 0.1.12
* 加入了点击Cell查询日程对应胶囊的功能

---
## [2026-05-25] - 0.1.11
* 重新更新了图标

---
## [2026-05-23] - 0.1.10
* 更新了图标

---
## [2026-05-22] - 0.1.9
* 修复了Calendar没有设置点击传出月份的问题
* 修复了locale.ts的导出与其他文件不同的问题
* 修复了Cell中错误的阴影裁切
* 修复了electron/main.ts的多余监听器未回收的问题

---
## [2026-05-22] - 0.1.8
* 修复CapsuleShelf的宽度错误问题

---
## [2026-05-21] - 0.1.7
* 修复胶囊的文本**横向**抖动问题

---
## [2026-05-21] - 0.1.6
* 修复长胶囊的文本**纵向**抖动问题

---
## [2026-05-21] - 0.1.5
* 修复胶囊文本未正常截断的问题

---
## [2026-05-21] - 0.1.4
* 修复了Windows下CapsuleShelf位置错乱的问题

---
## [2026-05-21] - 0.1.3
* 尝试修复Windows下组件位置错乱的问题

---
## [2026-05-20] - 0.1.2
* 修复Windows下打包的命令错误

---
## [2026-05-20] - 0.1.1
* 加入了多平台打包
  * AppImage
  * deb
  * rpm
  * pacman
  * snap
  * Windows(nsis)

---
## [2026-05-20] - 0.1.0
* 加入胶囊新建功能
* 功能骨架基本成型，进入0.1.0版本
* 鼓掌！呱唧呱唧呱唧

---
## [2026-05-20] - 0.0.36
* 加入了胶囊列表的形态切换动画
* 加入了胶囊本身的展开动画

---
## [2026-05-19] - 0.0.35
* 胶囊列表基本成型
* 外观大幅度改动
* 修复了capsule.ts的首尾日期重复的问题

---
## [2026-05-17] - 0.0.34
* 引入GSAP动画库
* 日历部分外观重做
* 大幅度修改CSS颜色变量

---
## [2026-05-17] - 0.0.33
* CapsuleShelf投入使用，前后端连接成功

---
## [2026-05-16] - 0.0.32
* 重写pinia相关内容以适配新字段

---
## [2026-05-16] - 0.0.31
* 删除原kotlin后端，新建go后端

---
## [2026-05-14] - 0.0.30
* 优化UI
* 优化Calendar.vue的script内容顺序
### 重大告知
* 项目的后端将从Spring Boot Kotlin切换成Go
* kotlin项目开发无限期停滞，转移到[tasKapsule-kotlin](https://github.com/Comardom/tasKapsule-kotlin.git)
* 此仓库不设置主、次分支，master将会逐步转向go，清除kotlin内容

---
## [2026-05-13] - 0.0.29
* 日历增加切换格子的动效
* 动效可以自主关闭或打开

---
## [2026-05-13] - 0.0.28
* 优化UI
* 日历增加了格子的点按效果

---
## [2026-05-12] - 0.0.27
* 优化了TestPinia.vue的显示逻辑
* 优化了CapsuleController.kt 
  * 保存胶囊时禁止伪造时间
  * 添加附加文件时多文件路径的处理为合法JSON
* 在electron/main.ts的两种后端启动失败处加了app.quit();
* 把Centro.vue的方向改成了flex-start，让日历靠左
* 修复了Calendar.vue中当天格子颜色错误切换的问题
* 增大了日历内部字体，给了左右边框
* CapsuleShelf.vue与新建的Capsule.vue合并进文件夹

---
## [2026-05-12] - 0.0.26
* 删除了favicon.ico
* electron/main.ts加入了启动java子进程后的error监听
* electron/killPort.ts修复了Windows下会杀掉无关进程的问题
* stores/capsule.ts把ISO时间换成了本地时区的时间
* 修改Calendar.vue中v-for的key为字符串+数字，防止Vue DOM操作出错
* capsuleController.kt进行修改
  * 创建胶囊函数中为了保证id自增，先将id写为null
  * 为了保证可以制作无字的胶囊，区分了content的未传数据和null
  * update函数进行了大的修改，具体请看函数内部注释

---
## [2026-05-12] - 0.0.25
* 修复了TimeManager.ts的后备值逻辑错误
* 修复了electron/main.ts的权限进制错误
* 更改了electron/main.ts的正则表达式(单行->多行)
* 将electron/main.ts中creatWindow()提到了前面方便扫描STAGE消息
* CapsuleController.kt中update改为只覆盖前端明确传了的字段
* Capsule.kt中对createAt字段加入了不可写入，防止假冒
* 修复了Calendar.vue中timer泄漏的问题
* loadingPageController.ts中删掉了不可到达的catch块
* 修复了capsule.ts中“如果setDate失败,就会显示旧数据”的问题
* 修复了electron/preload.ts的监听器堆积问题
* 补充了DatabaseConfig.kt的数据库目录缺失报错

---
## [2026-05-11] - 0.0.24
* CSS全局变量删掉了来自旧项目的--camera-*
* 删掉了frontend/src/main.ts中的IIFE，因为异步内容已经被移除，而挂载是同步的
* DatabaseConfig.kt中删掉了创建目录的部分，因为BackendApplication.kt已经建立了

---
## [2026-05-11] - 0.0.23
* Capsule.kt加入了表级索引
* CapsuleController.kt加入了update
* BackendApplicationTests.kt加了一个断言验证Spring上下文真的加载了

---
## [2026-05-11] - 0.0.22
* 修改了TimeManager.ts中||为??
* apiServices.ts的any换成了capsule.ts相关定义
* backendHealthCheck.ts加入了超时
* 修改了index.html
  * 补全了标题和logo
  * 删掉无用脚本
* theme.ts删掉无用classList.toggle('dark'）
* router加入了其它页面重定向到主页的功能
* 修复了CapsuleRepository.kt没设startTime的胶囊排在最上面的问题

---
## [2026-05-11] - 0.0.21
* loadingPageController.ts中加入失败重试次数上限
* 修复了日历界面注入CSS变量不生效时的塌陷问题
* 修复了electron/main.ts中的拼写错误和catch块的逻辑错误
* 后端胶囊状态改成了枚举而不是字符串
* 修复了electron/main.ts的pnpm dev逻辑错误

---
## [2026-05-10] - 0.0.20
* 前后端版本号更新
* AGENTS.md以及issues.md更新

---

## [2026-05-10] - 0.0.19
* 修复了electron/main.ts中的java/jar丢失的错误处理
* 修复了HomeController.kt的虚假Connected

---


## [2026-05-10] - 0.0.18
* 对日历部分的配色进行了更新和完善
* 在root中加入了color-scheme:light/dark;的chromium配置

---
## [2026-05-10] - 0.0.17
* 引入了AGENTS.md便于扫描项目
* 修复了index.html的localStorage加载key错误
* 修复了router中createWebHistory的错误
* pinia加入了locale.ts管理地区，用于i18n
* 更新了前端日历界面
  * 可以切换时区和语言
  * 晚上过十二点自动刷新
  * 月初月末检查并刷新月历
  * 修复了日历各层级高度问题
  * 刷新日历、计算高度、定时刷新都做成了函数方便使用
* 修复了loadingScreen多余的全局变量引用
* 对前端util/TimeManager.ts进行了修复

---
## [2026-04-26] - 0.0.16
* App.vue的nav改成absolute，防止影响主要内容
* 删掉了pinia的示例文件stores/counter.ts
* 对时间读取操作提取成utils/TimeManager.ts
* 初步构建了Calendar的外观和功能
  * 内部使用Cell.vue
  * 增添了一个前端可用的timeManager.ts
  * 对日历星期标注进行不同语言的分离，放在nameOfDaysOfWeek.ts
* 修复了electron/main.ts的错误

---
## [2026-04-25] - 0.0.15
* frontend/main.ts进行改动
  * 加入三个全局css文件，内部所有Vue页面都会导入这些css
  * 重新启用了路由
* 所有Vue文件的三个全局css导入都删掉了
* App.vue的页面切换从v-if改成路由切换，旧的封存
* 前端router/index.ts加入了子页面
* UI确立
  * Centro作为主页，内部加入Calendar和CapsuleShelf等组件
  * EgoMe作为个人页面
* 标注了LoadingScreen的文字来源
* 修改baseNiceStyle.css使button文字纵向居中
* 修正了TestPinia页面的部分错误

---
## [2026-04-23] - 0.0.14
* 后端加入了Capsule表
* 前端加入了utils/apiServices.ts统一接收业务api
* 前端加入了pinia的stores/capsule.ts用来连接了 UI 界面和后端 API
* 后端删掉了之前的测试文件（Test1）
* 后端加入了Capsule(Repository/Controller).kt作为胶囊的DB.Table
* 加入TestPinia.vue监测数据库状态
* App.vue照例对功能进行修改测试
* 前后端数据库打通！好耶

---
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
  * frontend/env.aDate.ts增加前后端连接（日志传递）的内容
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

## Go
- 自己查一下吧，挺简单的

---


## Node 包管理器
我们统一使用 **npm + pnpm**：
- npm 一般随 Node.js 一起安装，如果没有则运行：
  nvm install-latest-npm
- 安装 pnpm：
  npm install -g pnpm
  pnpm setup
- 安装 Vue CLI：
  pnpm install -g @vue/cli


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
- Pinia
- Router

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
go run .
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