# frontend
前端要越过浏览器沙箱的话需要写preload.ts！
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
```vue
import { openFile, saveFile } from '@/utils/fileApi'

async function handleOpenFile() {
  const content = await openFile()
  console.log('文件内容:', content)
}

async function handleSaveFile() {
  const success = await saveFile('要保存的内容')
  if (success) {
    console.log('文件保存成功')
  }
}
```