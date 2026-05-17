<template>
  <div class="container glass">
    123456
  </div>
</template>

<style scoped>


.container {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 玻璃卡片核心样式 */
.glass {
  width: 200px;
  height: 200px;

  /* === 玻璃效果三大核心 === */
  background: linear-gradient(#fff2, transparent);
  /* 1. 半透明渐变 */
  backdrop-filter: blur(10px);
  /* 2. 背景模糊 */
  border: 1px solid rgba(255, 255, 255, 0.1);
  /* 3. 边缘高光 */

  /* 立体感增强 */
  box-shadow: 0 25px 25px rgba(0, 0, 0, 0.25);

  /* 布局 */
  display: flex;
  justify-content: center;
  align-items: center;

  /* 文字颜色 */
  color: #fff;
  font-size: 2em;
}

/* 底部标签 */
/*.glass::before {
  content: attr(data-text);
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 40px;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
  font-size: 0.5em;
}*/
</style>