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


---

## SQLite
- 非 Windows：用包管理器安装
- Windows：在 PowerShell 中运行：
```shell
choco install sqlite
```
 

---

---



## 前端测试
```shell
cd frontend
pnpm install
pnpm dev
```

---

---



## 打包
根目录：
```shell
pnpm build:backend     # 编译 Go 后端
pnpm dist:linux        # Linux: AppImage + deb + rpm
pnpm dist:win          # Windows: NSIS 安装包
```