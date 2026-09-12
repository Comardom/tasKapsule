<script setup lang="ts">
import type { Capsule, Classification } from '@/stores/capsule.ts';
import { useCapsuleStore } from '@/stores/capsule.ts';
import { capsuleApi } from '@/utils/apiService.ts';
import { nextTick, onMounted, ref, watch } from "vue";
import Placeholder from "@/components/Placeholder.vue";
import gsap from "gsap";

const store = useCapsuleStore();
const emit = defineEmits<{ edit: [capsule: Capsule]; delete: [capsule: Capsule] }>();
const expanded = ref(false);
const props = defineProps<{
  capsule: Capsule;
}>();

async function changeClassification(classification: Classification) {
  if (classification === props.capsule.classification) return;

  const { id, createdAt, ...data } = props.capsule;
  await capsuleApi.update(id, { ...data, classification });
  await store.fetchCapsules();
}

const capsuleRef = ref<HTMLElement | null>(null);
const topSpacerRef = ref<HTMLElement | null>(null);
const bottomSpacerRef = ref<HTMLElement | null>(null);
const contentRef = ref<HTMLElement | null>(null);
let animCtx: gsap.core.Timeline | null = null;

watch(expanded, async (newVal) => {
  const prevWidth = capsuleRef.value?.offsetWidth || 0;
  const prevHeight = capsuleRef.value?.offsetHeight || 0;

  const topSpacer = topSpacerRef.value;
  const bottomSpacer = bottomSpacerRef.value;
  const prevTopHeight = topSpacer?.offsetHeight || 0;
  const prevBottomHeight = bottomSpacer?.offsetHeight || 0;
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
  if (topSpacer) gsap.set(topSpacer, { clearProps: "height,opacity" });
  if (bottomSpacer) gsap.set(bottomSpacer, { clearProps: "height,opacity" });
  if (contentRef.value) gsap.set(contentRef.value, { clearProps: "height,opacity" });

  if (newVal) {
    // ==================== 展开动画 ====================
    const targetTopHeight = topSpacer?.offsetHeight || 0;
    const targetBottomHeight = bottomSpacer?.offsetHeight || 0;
    const targetContentHeight = contentRef.value?.offsetHeight || 0;
    const targetHeight = capsuleRef.value.offsetHeight;

    // 🌟【优化点】不再硬编码 "100%"！
    // 双列依然走固定 25dvi，单列直接读取 nextTick 后浏览器根据 fit-content 动态算出的真实像素宽度
    const targetWidth = store.viewMode === 'double'
        ? "100%"
        : `${capsuleRef.value.offsetWidth}px`;

    gsap.set(capsuleRef.value, { alignItems: "flex-start", overflow: "hidden" });
    if (topSpacer) gsap.set(topSpacer, { opacity: 0, height: 0, overflow: "hidden" });
    if (bottomSpacer) gsap.set(bottomSpacer, { opacity: 0, height: 0, overflow: "hidden" });
    if (contentRef.value) gsap.set(contentRef.value, { opacity: 0, height: 0, overflow: "hidden" });

    animCtx = gsap.timeline({
      onComplete: () => {
        gsap.set(capsuleRef.value, { clearProps: "width,height,alignItems,overflow" });
        if (topSpacer) gsap.set(topSpacer, { clearProps: "height,opacity,overflow" });
        if (bottomSpacer) gsap.set(bottomSpacer, { clearProps: "height,opacity,overflow" });
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

    if (topSpacer) {
      animCtx.to(topSpacer, { height: targetTopHeight, opacity: 1, duration: 0.4, ease: "backOut(0.3)" }, 0);
    }

    if (bottomSpacer) {
      animCtx.to(bottomSpacer, { height: targetBottomHeight, opacity: 1, duration: 0.4, ease: "backOut(0.3)" }, 0);
    }

    if (contentRef.value) {
      animCtx.to(contentRef.value, { height: targetContentHeight, opacity: 1, duration: 0.4, ease: "backOut(0.3)" }, 0);
    }
  } else {
    // ==================== 收缩动画 ====================
    animCtx = gsap.timeline({
      onComplete: () => {
        if (topSpacer) gsap.set(topSpacer, { display: "none", clearProps: "height,opacity" });
        if (bottomSpacer) gsap.set(bottomSpacer, { display: "none", clearProps: "height,opacity" });
        if (contentRef.value) gsap.set(contentRef.value, { display: "none", clearProps: "height,opacity" });
        gsap.set(capsuleRef.value, { clearProps: "width,height,alignItems,overflow" });
      }
    });

    const targetWidth = capsuleRef.value.offsetWidth;

    gsap.set(capsuleRef.value, { overflow: "hidden" });

    if (topSpacer) {
      gsap.set(topSpacer, { display: "block", opacity: 1, height: prevTopHeight });
      animCtx.to(topSpacer, { opacity: 0, duration: 0.15 }, 0.15);
      animCtx.to(topSpacer, { height: 0, duration: 0.2, ease: "power2.inOut" }, 0.15);
    }

    if (bottomSpacer) {
      gsap.set(bottomSpacer, { display: "block", opacity: 1, height: prevBottomHeight });
      animCtx.to(bottomSpacer, { opacity: 0, duration: 0.15 }, 0.15);
      animCtx.to(bottomSpacer, { height: 0, duration: 0.2, ease: "power2.inOut" }, 0.15);
    }

    if (contentRef.value) {
      gsap.set(contentRef.value, { display: "block", opacity: 1, height: prevContentHeight });
      animCtx.to(contentRef.value, { opacity: 0, duration: 0.15 }, 0);
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
    <div ref="topSpacerRef" v-show="expanded" class="capsule-spacer"></div>
    <span class="txt-box main-text">{{ props.capsule.contentText }}</span>
    <div ref="bottomSpacerRef" v-show="expanded" class="capsule-spacer"></div>


    <div ref="contentRef" class="expanded-content" v-show="expanded">
      <!--
      <div class="classification-dots">
        <span class="classification-dot"></span>
        <span class="classification-dot"></span>
        <span class="classification-dot"></span>
        <span class="classification-dot"></span>
        <span class="classification-dot"></span>
      </div>
      -->
      <div class="classification-stripe-area">
        <div class="classification-stripes">
          <button
              title="切换为笔记"
              @click.stop="changeClassification('note')"
          ><span></span></button>
          <button
              title="切换为紧急"
              @click.stop="changeClassification('urgent')"
          ><span></span></button>
          <button
              title="切换为收藏"
              @click.stop="changeClassification('favourite')"
          ><span></span></button>
          <button
              title="切换为短信"
              @click.stop="changeClassification('sms')"
          ><span></span></button>
          <button
              title="切换为灵感"
              @click.stop="changeClassification('inspiration')"
          ><span></span></button>
        </div>
      </div>
      <div class="details">
        <p class="txt-box">创建时间: {{ props.capsule.createdAt }}</p>
<!--        <p class="txt-box">分类: {{ props.capsule.classification }}</p>-->
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
      <div class="capsule-actions">
        <button class="action-btn" @click.stop="emit('edit', props.capsule)">编辑</button>
        <button class="action-btn" @click.stop="emit('delete', props.capsule)">删除</button>
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
.big .expanded-content {
  overflow: visible;
}
.capsule-spacer {
  inline-size: 25dvi;
  block-size: 2svb;
}
/*
.classification-dots {
  inline-size: 20dvi;
  margin-inline: auto;
  display: grid;
  grid-template-columns: 2fr repeat(4, 2fr 5fr) 2fr 2fr;
  align-items: center;
}
.classification-dot {
  grid-column: span 1;
  aspect-ratio: 1;
  border-radius: 50%;
  background: #000;
}
.classification-dot:nth-child(1) { grid-column: 2; }
.classification-dot:nth-child(2) { grid-column: 4; }
.classification-dot:nth-child(3) { grid-column: 6; }
.classification-dot:nth-child(4) { grid-column: 8; }
.classification-dot:nth-child(5) { grid-column: 10; }
.classification-dot:nth-child(1) { background: rgb(104 144 237); }
.classification-dot:nth-child(2) { background: rgb(248 102 102); }
.classification-dot:nth-child(3) { background: rgb(255 167 78); }
.classification-dot:nth-child(4) { background: rgb(96 209 77); }
.classification-dot:nth-child(5) { background: rgb(165 100 222); }
*/
.classification-stripe-area {
  position: relative;
  block-size: 0.35svb;
}
.classification-stripes {
  inline-size: 100%;
  block-size: 4svb;
  display: flex;
  position: absolute;
  inset-block-start: 50%;
  transform: translateY(-50%);
  z-index: 1;
}
.classification-stripes button {
  flex: 1;
  padding: 0;
  border: 0;
  cursor: pointer;
  background: transparent;
  display: flex;
  align-items: center;
}
.classification-stripes button span {
  inline-size: 100%;
  block-size: 0.35svb;
  opacity: 0.55;
  transition: opacity 0.15s ease;
}
.classification-stripes button:nth-child(1) span { background: rgb(104 144 237); }
.classification-stripes button:nth-child(2) span { background: rgb(248 102 102); }
.classification-stripes button:nth-child(3) span { background: rgb(255 167 78); }
.classification-stripes button:nth-child(4) span { background: rgb(96 209 77); }
.classification-stripes button:nth-child(5) span { background: rgb(165 100 222); }
.classification-stripes button:hover span {
  opacity: 1;
  filter: brightness(1.15);
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
.capsule-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  margin-block-start: 0.5rem;
}
.action-btn {
  padding: 0.25rem 0.75rem;
  border: 0.0625rem solid rgba(255,255,255,0.3);
  border-radius: 0.75rem;
  background: rgba(255,255,255,0.15);
  color: var(--theme-color);
  cursor: pointer;
  font-size: 0.8125rem;
}
.action-btn:hover {
  background: var(--theme-bg-button-hover);
  color: var(--theme-color-button);
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
