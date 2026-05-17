<script setup lang="ts">

import CapsuleComponent from "@/components/CapsuleShelf/Capsule.vue"
import type { Capsule } from '@/stores/capsule.ts';
import { useCapsuleStore } from '@/stores/capsule.ts';
import {onMounted} from "vue";


const store = useCapsuleStore();
onMounted(() => {
  store.fetchCapsules();
});

const props = defineProps<{
  selectedCapsule?: Capsule | null;
}>();
</script>

<template>
  <div class="capsule-container shelf">
    <CapsuleComponent
        v-for="item in store.byCreatedAt"
        :capsule="item"
    />
  </div>
</template>

<style scoped>
.shelf {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1dvb;
  block-size: 100svb;
  overflow-y: scroll;          /* 允许纵向滚动 */
  scrollbar-width: none;       /* Firefox 隐藏滚动条 */
  -ms-overflow-style: none;    /* IE 隐藏滚动条 */
}
.shelf::-webkit-scrollbar {
  display: none;               /* Chrome/Safari/Electron 隐藏滚动条 */
}
</style>