# 字体自定义功能设计

## 默认字体搭配

| 角色 | 字体 | 理由 |
|---|---|---|
| 正文 | Source Han Sans CN（思源黑体） | 清晰易读，屏幕渲染好，开源可商用 |
| 标题 / 装饰文字 | （待实现） | 尚未选择 |

### 字体文件

放在 `frontend/public/`：

```
frontend/public/
├── SourceHanSansCN-Normal.woff2
├── SourceHanSansCN-Normal.otf
```

CSS `@font-face` 声明 → CSS 变量 `--font-body` → 各组件引用。

> 当前仅实现了 `fontBody`。`font-title`、`font-deco` 字段在 store 中不存在，待添加。

---

## 用户上传字体

### 裁剪问题

**不做裁剪。** 全量字体，原因：

| 方案 | 安装包体积 | 运行时磁盘 | 实现复杂度 |
|---|---|---|---|
| 裁剪子集（`fonttools`） | 小（2-3MB） | 小 | 高——需后处理、用户上传时重新裁剪、新内容可能缺字 |
| 全量字体 | ~15MB（3 个字重） | ~15MB | 低——直接放 `.woff2` |

桌面应用 15MB 可忽略，全量。

### 流程（待实现）

```
Electron 文件对话框 → 用户选择 .ttf/.otf/.woff2
  → 复制到 app.getPath('userData')/fonts/
  → IPC 返回 {name, path}
  → 前端注入 @font-face（font-family = 'User-xxx'）
  → 字体选择下拉菜单更新选项（默认字体 + 所有 User-xxx）
  → 用户选择 → 写入 localStorage + CSS 变量
```

### IPC 接口（待实现）

| Channel | Direction | 说明 |
|---|---|---|
| `install-font` | renderer → main | 打开文件对话框，复制字体到 userData，返回 `{name, path}` |
| `list-fonts` | renderer → main | 列出 `userData/fonts/` 下所有已安装字体 |
| `remove-font` | renderer → main | 删除指定字体文件 |

### 持久化

Pinia `font` store，Composition API，`watchEffect` 同步到 `localStorage` + `document.documentElement.style.setProperty`。

### 配置 Store 字段

实际 store (`stores/font.ts`)：

| 字段 | 默认值 | 说明 |
|---|---|---|
| `fontBody` | `'App Sans'` | 正文字体 |

> `font-title`、`font-deco` 待实现。`fontBody` 默认值通过 CSS 变量 `--font-body` 应用，初始为系统无衬线字体。

### UI

设置在侧边栏或独立设置页（待定）：
- 一个下拉选择器（正文），选项 = 默认字体（当前仅内置 Source Han Sans CN）
- 「上传字体」按钮（待实现）
- 已安装字体列表 + 删除按钮（待实现）
