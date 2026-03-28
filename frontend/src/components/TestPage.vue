<script setup lang="ts">

import Footer from "@/components/CopyrightFooter.vue";
</script>

<template>
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
</template>

<style scoped>
main {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center; /* 让内容垂直居中，适合单页展示 */
  align-items: center;
  padding: 20px;
}
</style>