<script setup lang="ts">

// // 打开文件
// window.api.openFile().then(content => {
//   console.log('文件内容:', content)
// })
//
// // 保存文件
// window.api.saveFile('要保存的内容').then(success => {
//   if (success) {
//     console.log('文件保存成功')
//   }
// })
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
</script>

<template>
  <h1>You did it!</h1>
  <p>
    Visit <a href="https://vuejs.org/" target="_blank" rel="noopener">vuejs.org</a> to read the
    documentation
  </p>
</template>

<style scoped></style>
