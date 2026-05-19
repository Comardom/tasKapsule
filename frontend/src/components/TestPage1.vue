<script setup lang="ts">
import Footer from "@/components/CopyrightFooter.vue";
import NewGlassTest from "@/components/NewGlassTest.vue";
</script>

<template>
  <div class="test-page-container">
    <section class="content-area">
      <h1>测试页面：个人页</h1>
      <p>这是一个测试界面捏</p>
      <div class="slot-container">
        <slot />
        <NewGlassTest />
      </div>
    </section>
    <Footer
      year="2026"
      owner="Comardom"
      email="Comardom@outlook.com"
      icpNumber="辽ICP备2025060502号-2"
      policeNumber="辽公网安备21021702000880号"
      policeLink="https://www.beian.gov.cn/portal/registerSystemInfo?recordcode=21021702000880"
    />
  </div>
</template>

<style scoped>
.test-page-container {
  flex: 1;            /* 撑满 App.vue 里的 main */
  display: flex;      /* 变成 flex 容器，好让内部的 main (flex: 1) 生效 */
  flex-direction: column;
  inline-size: 100%;
}
.content-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center; /* 让内容垂直居中，适合单页展示 */
  align-items: center;
  padding-block: 2dvb;
  padding-inline: 2dvi;
}
</style>