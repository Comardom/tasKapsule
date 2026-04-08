<script setup lang="ts">
const blocks = Array.from({ length: 11 }, (_, i) => {
  const hexSuffix = (i + 1).toString(16).toUpperCase();

  return {
    id: i,
    area: `l${hexSuffix}`, // 生成 l1, l2 ... l9, lA, lB
    duration: (Math.random() * 2 + 2).toFixed(2) + 's', // 2s - 4s 之间
    delay: (Math.random() * -5).toFixed(2) + 's'        // 随机初始进度
  };
});
</script>

<template>
  <div class="loading">
    <div class="loading-box">
      <div class="grid">
        <div
          v-for="item in blocks"
          :key="item.id"
          :class="['color', item.area]"
          :style="{
            animationDuration: item.duration,
            animationDelay: item.delay
          }"
        ></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  /* 基础结构保持你原来的不变 */
  .loading {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .loading-box {
    width: 35rem;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.8rem;
  }

  .grid {
    width: 100%;
    display: grid;
    grid-template-rows: repeat(4, 6rem);
    grid-template-columns: repeat(4, 1fr);
    grid-template-areas:
      "l1 l1 l7 l8"
      "l1 l1 l6 l9"
      "l2 l3 l5 lA"
      "l4 l4 l5 lB";
    gap: 0.8rem;
  }

  .color {
    background-color: #eee;
    border-radius: 5px;
    /* 这里统一绑定动画，具体的 duration 和 delay 由 v-for 注入 */
    animation: Loading infinite linear;
  }

  /* 布局的核心 */
  .l1 { grid-area: l1; }
  .l2 { grid-area: l2; }
  .l3 { grid-area: l3; }
  .l4 { grid-area: l4; }
  .l5 { grid-area: l5; }
  .l6 { grid-area: l6; }
  .l7 { grid-area: l7; }
  .l8 { grid-area: l8; }
  .l9 { grid-area: l9; }
  .lA { grid-area: lA; }
  .lB { grid-area: lB; }

  @keyframes Loading {
    0%, 100% { background-color: #eee; }
    50% { background-color: #333; }
  }

  @media (max-width: 37rem) {
    .loading-box { width: 90%; }
  }
</style>