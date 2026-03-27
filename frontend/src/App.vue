<script setup lang="ts">
import Footer from "@/mainPage/Footer.vue";
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
  <div id="app-all">
    
    <main>
      <h1>You did it!</h1>
      <p>
        Visit <a href="https://vuejs.org/" target="_blank" rel="noopener">vuejs.org</a> to read the
        documentation
      </p>
    </main>

    <Footer
        year="2026"
        owner="Comardom"
        email="Comardom@outlook.com"
        icpNumber="辽ICP备2025060502号-1"
        policeNumber="辽公网安备21021702000756号"
        policeLink="https://www.beian.gov.cn/portal/registerSystemInfo?recordcode=21021702000756"
    />
  </div>

</template>
<style>

</style>
<style scoped>
#app-all {
  background: repeating-linear-gradient(
      to right,
      #f0f0f0,
      #f0f0f0 2px,
      #ffffff 2px,
      #ffffff 4px
  );
  margin: 0;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  /*仅单屏应用可用此选项！也就是说只有主页面的最外层div采用*/
  overflow: hidden;
}

main {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center; /* 让内容垂直居中，适合单页展示 */
  align-items: center;
  padding: 20px;
}

</style>
