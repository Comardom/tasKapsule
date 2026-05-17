# frontend
前端要越过浏览器沙箱的话需要写preload.ts！\
端口号9998不可改变，细节在[vite.config.ts](vite.config.ts)的server块中
## Project Setup
```sh
cd frontend
```

```sh
pnpm install
```

### Compile and Hot-Reload for Development

```sh
pnpm dev
```

### Type-Check, Compile and Minify for Production

```sh
pnpm build
```
## 操作文件内容(在script setup里面用)：
调用[fileHandleFunctions.ts](src/utils/fileHandleFunctions.ts)

## 鸣谢
### 本项目UI/UX设计高度参考SmartisanOS成果，甚至可以说照搬；但是让Smartisan的成果能够在桌面平台上复刻，是我很想做的一件事情。侵权相关请联系作者：Comardom@outlook.com
#### 本项目的部分 UI 组件参考或引用了 uiverse.io，感谢以下创作者：
LoadingRectangle.vue - 
参考了 [Tem Revil](https://github.com/TemRevil) 的设计。
https://uiverse.io/profile/codebykay101