<script setup lang="ts">
import type { Capsule } from '@/stores/capsule.ts';
import {ref} from "vue";
import Placeholder from "@/components/Placeholder.vue";
const expanded = ref(false);
const props = defineProps<{
  capsule: Capsule;
}>();
</script>

<template>
  <div v-if="!expanded"
       class="small"
       @click="expanded = true"
       :class="[
            props.capsule.classification,
            'capsule',
            ]"
  >
    <span class="txt-box">{{ props.capsule.contentText }}</span>
  </div>

  <!-- 展开状态 -->
  <div v-else
       class="big"
       @click="expanded = false"
       :class="[
            props.capsule.classification,
            'capsule',
            ]"
  >
    <Placeholder
        height='2svb'
        width="25dvi"
    />
    <span class="txt-box">{{ props.capsule.contentText }}</span>
    <!-- 可以添加更多展开后的内容 -->
    <div class="details">
      <p class="txt-box">创建时间: {{ props.capsule.createdAt }}</p>
      <p class="txt-box">分类: {{ props.capsule.classification }}</p>
    </div>
    <Placeholder
        height='1svb'
        width="25dvi"
    />
  </div>
</template>

<style scoped>
.txt-box {
  display: grid;
  place-items: center;
  overflow: clip;
  color: var(--theme-color);
}
.capsule{
  cursor: pointer;
  display: flex;
  flex-shrink: 0;
  padding-inline: 1dvi;
  flex-direction: column;
  justify-content: center;


  box-shadow:
      inset 0 0.0625rem 0 rgba(255, 255, 255, 0.5),    /* 顶部高光 */
      inset 0 -0.0625rem 0 rgba(0, 0, 0, 0.1),         /* 底部边缘 */
      inset 0 0 1.2rem rgba(255, 255, 255, 0.3);   /* 内部泛光 */
  border: 0.0625rem solid rgba(255, 255, 255, 0.4);
  border-bottom: 0.0625rem solid rgba(255, 255, 255, 0.2);
}

.capsule:hover::before {
  background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.8) 0%,
      rgba(255, 255, 255, 0.4) 30%,
      rgba(255, 255, 255, 0) 70%
  );
}
.capsule span {
  display: inline-block;
  inline-size: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}


.small{
  block-size: 3rem;
  /*min-inline-size: 8dvi;*/
  max-inline-size: inherit;
  border-radius: 1.5rem;/* 高度的一半，形成跑道形状 */
  inline-size: fit-content;
  align-items: flex-start;
}
.big {
  align-items: center;
  block-size: fit-content;
  /*gap: 1dvb;*/
  inline-size: 25dvi;
  border-radius: 1.5rem;   /* ← 和 .small 一致 */
}
.big span{
  display: flex;
  justify-content: center;
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