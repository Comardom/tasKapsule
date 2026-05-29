<script setup lang="ts">
import type { Capsule } from '@/stores/capsule.ts';
// 🌟引入 store 从而获取全局的 viewMode 状态
import { useCapsuleStore } from '@/stores/capsule.ts';
import { nextTick, onMounted, ref, watch } from "vue";
import Placeholder from "@/components/Placeholder.vue";
import gsap from "gsap";

const store = useCapsuleStore();
const expanded = ref(false);
const props = defineProps<{
  capsule: Capsule;
}>();

const capsuleRef = ref<HTMLElement | null>(null);
const contentRef = ref<HTMLElement | null>(null);
let animCtx: gsap.core.Timeline | null = null;

watch(expanded, async (newVal) => {
  const prevWidth = capsuleRef.value?.offsetWidth || 0;
  const prevHeight = capsuleRef.value?.offsetHeight || 0;

  const topPlaceholder = capsuleRef.value?.firstElementChild as HTMLElement;
  const prevTopHeight = topPlaceholder?.offsetHeight || 0;
  const prevContentHeight = contentRef.value?.offsetHeight || 0;

  await nextTick();

  if (!capsuleRef.value) return;

  const mainText = capsuleRef.value.querySelector('.main-text');

  if (animCtx) {
    animCtx.kill();
    animCtx = null;
  }

  gsap.set(capsuleRef.value, { clearProps: "width,height,alignItems,overflow" });
  if (mainText) gsap.set(mainText, { clearProps: "all" });
  if (topPlaceholder) gsap.set(topPlaceholder, { clearProps: "height,opacity" });
  if (contentRef.value) gsap.set(contentRef.value, { clearProps: "height,opacity" });

  if (newVal) {
    // ==================== 展开动画 ====================
    const targetTopHeight = topPlaceholder?.offsetHeight || 0;
    const targetContentHeight = contentRef.value?.offsetHeight || 0;
    const targetHeight = capsuleRef.value.offsetHeight;

    // 🌟【优化点】不再硬编码 "100%"！
    // 双列依然走固定 25dvi，单列直接读取 nextTick 后浏览器根据 fit-content 动态算出的真实像素宽度
    const targetWidth = store.viewMode === 'double'
        ? "25dvi"
        : `${capsuleRef.value.offsetWidth}px`;

    gsap.set(capsuleRef.value, { alignItems: "flex-start", overflow: "hidden" });
    if (mainText) gsap.set(mainText, { whiteSpace: "nowrap", overflow: "hidden" });
    if (topPlaceholder) gsap.set(topPlaceholder, { opacity: 0, height: 0, overflow: "hidden" });
    if (contentRef.value) gsap.set(contentRef.value, { opacity: 0, y: -8, height: 0, overflow: "hidden" });

    animCtx = gsap.timeline({
      onComplete: () => {
        gsap.set(capsuleRef.value, { clearProps: "width,height,alignItems,overflow" });
        if (mainText) gsap.set(mainText, { clearProps: "whiteSpace,overflow" });
        if (topPlaceholder) gsap.set(topPlaceholder, { clearProps: "height,opacity,overflow" });
        if (contentRef.value) gsap.set(contentRef.value, { clearProps: "height,opacity,overflow" });
      }
    });

    animCtx.fromTo(capsuleRef.value,
        {
          width: prevWidth,
          height: prevHeight,
          alignItems: "flex-start"
        },
        {
          width: targetWidth,
          height: targetHeight,
          alignItems: "center",
          borderRadius: "1.5rem",
          duration: 0.4,
          ease: "backOut(0.3)",
        },
        0
    );

    if (topPlaceholder) {
      animCtx.to(topPlaceholder, { height: targetTopHeight, opacity: 1, duration: 0.4, ease: "backOut(0.3)" }, 0);
    }

    if (contentRef.value) {
      animCtx.to(contentRef.value, { height: targetContentHeight, opacity: 1, y: 0, duration: 0.4, ease: "backOut(0.3)" }, 0);
    }
  } else {
    // ==================== 收缩动画 ====================
    animCtx = gsap.timeline({
      onComplete: () => {
        if (topPlaceholder) gsap.set(topPlaceholder, { display: "none", clearProps: "height,opacity" });
        if (contentRef.value) gsap.set(contentRef.value, { display: "none", clearProps: "height,opacity" });
        gsap.set(capsuleRef.value, { clearProps: "width,height,alignItems,overflow" });
      }
    });

    const targetWidth = capsuleRef.value.offsetWidth;

    gsap.set(capsuleRef.value, { overflow: "hidden" });

    if (topPlaceholder) {
      gsap.set(topPlaceholder, { display: "block", opacity: 1, height: prevTopHeight });
      animCtx.to(topPlaceholder, { opacity: 0, duration: 0.15 }, 0);
      animCtx.to(topPlaceholder, { height: 0, duration: 0.35, ease: "power2.inOut" }, 0);
    }

    if (contentRef.value) {
      gsap.set(contentRef.value, { display: "block", opacity: 1, height: prevContentHeight });
      animCtx.to(contentRef.value, { opacity: 0, y: -8, duration: 0.15 }, 0);
      animCtx.to(contentRef.value, { height: 0, duration: 0.35, ease: "power2.inOut" }, 0);
    }

    animCtx.fromTo(capsuleRef.value,
        {
          width: prevWidth,
          height: prevHeight,
          alignItems: "center"
        },
        {
          width: targetWidth,
          height: "3rem",
          alignItems: "flex-start",
          borderRadius: "1.5rem",
          duration: 0.35,
          ease: "power2.inOut",
        },
        0
    );
  }
});
</script>

<template>
  <div
      ref="capsuleRef"
      class="capsule"
      :class="[
        props.capsule.classification,
        store.viewMode,
        { big: expanded, small: !expanded }
      ]"
      @click="expanded = !expanded"
  >
    <Placeholder v-show="expanded" height='2svb' width="25dvi" />
    <span class="txt-box main-text">{{ props.capsule.contentText }}</span>

    <div ref="contentRef" class="expanded-content" v-show="expanded">
      <Placeholder height='2svb' width="25dvi" />
      <div class="details">
        <p class="txt-box">创建时间: {{ props.capsule.createdAt }}</p>
        <p class="txt-box">分类: {{ props.capsule.classification }}</p>
        <p class="txt-box">有日程: {{ props.capsule.isWithSchedule === 1 ? '是' : '否' }}</p>
        <p class="txt-box" v-if="props.capsule.scheduleIcon">日程图标: {{ props.capsule.scheduleIcon }}</p>
        <p class="txt-box" v-if="props.capsule.scheduleContentText">日程内容: {{ props.capsule.scheduleContentText }}</p>
        <p class="txt-box" v-if="props.capsule.scheduleStartAt">开始: {{ props.capsule.scheduleStartAt }}</p>
        <p class="txt-box" v-if="props.capsule.scheduleEndAt">结束: {{ props.capsule.scheduleEndAt }}</p>
        <p class="txt-box" v-if="props.capsule.scheduleStatus">状态: {{ props.capsule.scheduleStatus }}</p>
        <p class="txt-box" v-if="props.capsule.scheduleDeadline">截止: {{ props.capsule.scheduleDeadline }}</p>
        <p class="txt-box" v-if="props.capsule.audioPath">音频: {{ props.capsule.audioPath }}</p>
        <p class="txt-box" v-if="props.capsule.attachmentPaths">附件: {{ props.capsule.attachmentPaths }}</p>
        <p class="txt-box" v-if="props.capsule.alarmClocks">闹钟: {{ props.capsule.alarmClocks }}</p>
      </div>
      <Placeholder height='1svb' width="25dvi" />
    </div>
  </div>
</template>

<style scoped>
.expanded-content {
  overflow: hidden;
  width: 100%;
}

.small, .big {
  will-change: opacity;
  transition: none;
}
.txt-box {
  display: grid;
  place-items: center;
  overflow: clip;
  color: var(--theme-color);
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}
.capsule{
  overflow-anchor: none;
  cursor: pointer;
  display: flex;
  flex-shrink: 0;
  padding-inline: 1.25rem; /* 微调内边距，让流式宽度两端呼吸感更好 */
  flex-direction: column;
  justify-content: center;
  box-sizing: border-box;

  box-shadow:
      inset 0 0.0625rem 0 rgba(255, 255, 255, 0.5),
      inset 0 -0.0625rem 0 rgba(0, 0, 0, 0.1),
      inset 0 0 1.2rem rgba(255, 255, 255, 0.3);
  border: 0.0625rem solid rgba(255, 255, 255, 0.4);
  border-bottom: 0.0625rem solid rgba(255, 255, 255, 0.2);
}

/* 双列布局防线 */
.capsule.double {
  max-inline-size: 100%;
}

/* 🌟【修改点 1】重塑单列布局流式策略 */
.capsule.single {
  inline-size: fit-content;      /* 核心：宽度天然包裹文本长度 */
  max-inline-size: 100%;        /* 边界：不超出父级 CapsuleShelf 容器宽度 */
}

.capsule:hover::before {
  background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.8) 0%,
      rgba(255, 255, 255, 0.4) 30%,
      rgba(255, 255, 255, 0) 70%
  );
}

/* 开启物理折行 */
.capsule span {
  display: block;
  inline-size: 100%;
  white-space: normal;
  word-break: break-word;
  overflow-wrap: anywhere;
}

/* 折叠时限制行数 */
.small{
  block-size: 3rem;
  border-radius: 1.5rem;
  inline-size: fit-content;
  align-items: flex-start;
}
.small .main-text {
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
}

.big.double {
  align-items: center;
  block-size: fit-content;
  inline-size: 100%;
  border-radius: 1.5rem;
}

/* 🌟【修改点 2】单列展开时继承流式设置 */
.big.single {
  align-items: center;
  block-size: fit-content;
  /* 移除硬编码的 inline-size: 100%，使其完美顺延 .capsule.single 的 fit-content 与 max-inline-size */
  border-radius: 1.5rem;
}

.big .main-text {
  display: block;
  text-align: center;
  -webkit-line-clamp: unset;
  overflow: visible;
  white-space: normal;
  word-break: normal;
  overflow-wrap: normal;
}

.note{
  background-color: rgb(104 144 237 / 0.3);
}
.note :slotted(span), .note span{
  font-size: 1.125rem;
}
.urgent{
  background-color: rgb(248 102 102 / 0.3);
}
.urgent :slotted(span), .urgent span{
  font-size: 1.125rem;
}
.favourite{
  background-color: rgb(255 167 78 / 0.3);
}
.favourite :slotted(span), .favourite span{
  font-size: 1.125rem;
}
.sms{
  background-color: rgb(96 209 77 / 0.3);
}
.sms :slotted(span), .sms span{
  font-size: 1.125rem;
}
.inspiration{
  background-color: rgb(165 100 222 / 0.3);
}
.inspiration :slotted(span), .inspiration span{
  font-size: 1.125rem;
}
</style>