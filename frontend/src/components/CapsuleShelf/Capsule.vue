<script setup lang="ts">
import type { Capsule } from '@/stores/capsule.ts';
import {ref} from "vue";
const expanded = ref(false);
const props = defineProps<{
  capsule: Capsule;
}>();
</script>

<template>
  <div
      :class="[
          'capsule',
          expanded ? 'big' : 'small',
          props.capsule.classification,
      ]"
      @click="expanded = !expanded"
  >
    <span>{{props.capsule.contentText}}</span>
  </div>
</template>

<style scoped>
.capsule{
  cursor: pointer;
  display: flex;
  flex-shrink: 0;
  padding-inline: 1dvi;
  flex-direction: column;
  justify-content: center;
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
  max-inline-size: 25dvi;
  border-radius: 1.5rem;/* 高度的一半，形成跑道形状 */
  inline-size: fit-content;
  align-items: flex-start;
}
.big {
  align-items: center;
  block-size: 10dvb;
  inline-size: 25dvi;
  border-radius: 1.5rem;   /* ← 和 .small 一致 */
}
.note{
  background-color: #6890ED;
}
.note :slotted(span), .note span{
  color:#fff;
  font-size: 1.125rem;
}
.urgent{
  background-color: #F86666;
}
.urgent :slotted(span), .urgent span{
  color:#fff;
  font-size: 1.125rem;
}
.favourite{
  background-color: #FFA74E;
}
.favourite :slotted(span), .favourite span{
  color:#fff;
  font-size: 1.125rem;
}
.sms{
  background-color: #60D14D;
}
.sms :slotted(span), .sms span{
  color:#fff;
  font-size: 1.125rem;
}
.inspiration{
  background-color: #A564DE;
}
.inspiration :slotted(span), .inspiration span{
  color:#fff;
  font-size: 1.125rem;
}
</style>