<script setup lang="ts">
import { onMounted } from 'vue';
import { useCapsuleStore } from '@/stores/capsule.ts';

// 初始化 Store
const capsuleStore = useCapsuleStore();

// 页面一加载，就去获取一次数据
onMounted(() => {
  capsuleStore.fetchCapsules();
});
</script>

<template>
  <div class="middle">
    <slot />
    <input
      type="date"
      :value="capsuleStore.selectedDate"
      @input="e => capsuleStore.setDate((e.target as HTMLInputElement).value)"
    />

    <div v-if="capsuleStore.isLoading">正在加载中...</div>

    <div v-else-if="capsuleStore.error" style="color: red;">
      {{ capsuleStore.error }}
    </div>

    <ul v-else>
      <li v-for="item in capsuleStore.capsules" :key="item.id">
        <h3>{{ item.title }}</h3>
        <p>{{ item.content }}</p>
        <small>状态：{{ item.status }}</small>
      </li>
    </ul>

    <p v-if="!capsuleStore.isLoading && capsuleStore.capsules.length === 0">
      这一天没有时间胶囊哦。
    </p>
  </div>
</template>

<style scoped>
.middle {
  display: grid;
  place-content: center;
  place-items: center;
  block-size: 100svb;
  inline-size: 100svi;
}
</style>