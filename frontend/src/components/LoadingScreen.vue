<!--完全是暂时的！！！不是生产投入使用的！！！-->
<template>
  <div class="loading-wrapper">
    <div class="spinner"></div>
    <p>正在拉起后端配置服务，请稍候...</p>
  </div>
</template>

<style scoped>
.loading-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh; /* 撑满屏幕高度 */
  background-color: #f9f9f9;
  color: #555;
  font-family: sans-serif;
}

/* 4. Loading 转圈 CSS 核心代码 */
.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3; /* 灰色底圈 */
  border-top: 5px solid #42b883; /* Vue 绿色转动部分 */
  border-radius: 50%; /* 圆形 */

  /* 定义动画：名为 spin，耗时 1秒，线性速度，无限循环 */
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

/* 定义 spin 动画的帧 */
@keyframes spin {
  0% { transform: rotate(0deg); }   /* 开始位置 */
  100% { transform: rotate(360deg); } /* 结束位置（转一圈） */
}
</style>