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
