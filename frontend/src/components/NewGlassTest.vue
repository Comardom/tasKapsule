<style scoped>
  /* ============================================
     按钮容器 - CSS 自定义属性集中管理
     方便统一调整按钮的视觉风格
  ============================================ */
  .btn-wrapper {
    /* ---- 颜色系统 ---- */
    --color: #b5faff31;           /* 背景色（含透明度） */
    --txt-color: #283a3b;         /* 文字主色 */
    --txt-color-2: #283a3b;       /* 文字备用色 */
    --line-color: #00000015;      /* 边框颜色（含透明度） */

    /* ---- 边框样式 ---- */
    --line-style: solid;          /* 边框类型 */
    --line-weight: 1px;           /* 边框粗细 */

    /* ---- 布局 ---- */
    position: relative;
    display: grid;
    place-items: center;          /* 快捷居中方式 */
    padding: 1.5rem 5rem;
    min-width: 160px;
    min-height: 48px;
    user-select: none;            /* 防止文字被选中 */
  }

  /* ============================================
     按钮主体 - 多层阴影营造立体悬浮感
  ============================================ */
  .btn {
    /* 四层 drop-shadow 叠加：从近到远，从实到虚 */
    filter: drop-shadow(0 6px 2px #00000055)    /* 近距离实影 */
            drop-shadow(0 14px 4px #00000055)   /* 中距离过渡 */
            drop-shadow(0 32px 8px #00000055)   /* 较远模糊影 */
            drop-shadow(0 64px 16px #00000055); /* 最远淡影 */

    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border: none;
    background: none;
    inset: 0;                    /* 等同于 top/right/bottom/left: 0 */
  }

  /* ============================================
     文字容器 - 裁剪溢出 + 纹理叠加
  ============================================ */
  .txt-box {
    position: absolute;
    display: grid;
    place-items: center;
    white-space: nowrap;          /* 防止文字换行 */
    inset: 0;
    overflow: clip;               /* 裁剪溢出内容（比 hidden 更严格） */
  }

  /* 渐变纹理层 - 增加材质感 */
  .txt-box::after {
    content: "";
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
      45deg,
      #3f87a6,
      #ebf8e1 15%,
      #fff 20%
    );
    mix-blend-mode: hard-light;   /* 强光混合模式 */
    background-size: 440%;        /* 放大纹理以柔化效果 */
    filter: blur(1px);
    z-index: 3;
    opacity: 0.1;                 /* 低透明度，若隐若现 */
  }

  /* ============================================
     文字样式 - 多层文字阴影营造立体感
  ============================================ */
  .txt {
    position: absolute;
    padding: 1rem 2rem;
    z-index: 2;
    font: 500 1.3em "Inter", sans-serif;  /* 简写：字重 字号 字体 */
    color: var(--txt-color, #15104c);     /* 带后备色 */

    /* 上高光 + 下阴影，增强浮雕感 */
    text-shadow:
      0 -1px 1px #ffffff60,       /* 顶部高光 */
      0 2px 1px #00000015,        /* 近距离投影 */
      0 4px 2px #00000015,        /* 中距离投影 */
      0 8px 4px #00000015,        /* 较远投影 */
      0 16px 8px #00000015;       /* 最远投影 */
  }

  /* ============================================
     边框/背景框架 - 带有内阴影高光
  ============================================ */
  .frame {
    position: absolute;
    inset: 0;
    z-index: 1;
    border: var(--line-style) var(--line-weight) var(--line-color);
    background-color: var(--color, #f9d323);  /* 后备色：金黄色 */
    box-shadow: inset 0 1px 4px 1px #fff5;    /* 顶部内高光 */
    border-radius: 0;                          /* 尖角（可改为圆角） */
  }
</style>

<template>
  <!-- 按钮外层容器，负责整体的尺寸和间距 -->
  <div class="btn-wrapper">
    <!-- 按钮主体，承载点击交互和阴影效果 -->
    <button class="btn">
      <!-- 背景框架：提供背景色、边框和内阴影高光 -->
      <span class="frame"></span>

      <!-- 文字容器：承载文字和纹理叠加层 -->
      <span class="txt-box">
        <!-- 按钮文字，具有立体文字阴影效果 -->
        <span class="txt">QWERTY123</span>
      </span>
    </button>
  </div>
</template>