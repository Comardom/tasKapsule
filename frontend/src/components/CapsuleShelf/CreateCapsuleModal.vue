<script setup lang="ts">
import { ref } from 'vue';
import { capsuleApi } from '@/utils/apiService.ts';
import { useCapsuleStore } from '@/stores/capsule.ts';
import type { Classification, ScheduleStatus } from '@/stores/capsule.ts';
const store = useCapsuleStore();
const emit = defineEmits<{ close: [] }>();
const contentText = ref('');
const classification = ref<Classification>('note');
const isWithSchedule = ref(false);
const scheduleContentText = ref('');
const scheduleStartAt = ref('');
const scheduleEndAt = ref('');
const scheduleStatus = ref<ScheduleStatus>('pending');
async function submit() {
  if (!contentText.value.trim()) return;
  await capsuleApi.create({
    contentText: contentText.value,
    classification: classification.value,
    isWithSchedule: isWithSchedule.value ? 1 : 0,
    scheduleContentText: isWithSchedule.value ? scheduleContentText.value : undefined,
    scheduleStartAt: isWithSchedule.value ? scheduleStartAt.value : undefined,
    scheduleEndAt: isWithSchedule.value ? scheduleEndAt.value : undefined,
    scheduleStatus: isWithSchedule.value ? scheduleStatus.value : undefined,
  });
  await store.fetchCapsules();
  emit('close');
}
</script>
<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal">
      <h2>新建胶囊</h2>
      <textarea v-model="contentText" placeholder="内容" />
      <select v-model="classification">
        <option value="note">笔记</option>
        <option value="urgent">紧急</option>
        <option value="favourite">收藏</option>
        <option value="sms">短信</option>
        <option value="inspiration">灵感</option>
      </select>
      <label><input type="checkbox" v-model="isWithSchedule" /> 有日程</label>
      <template v-if="isWithSchedule">
        <input v-model="scheduleContentText" placeholder="日程内容" />
        <input v-model="scheduleStartAt" type="datetime-local" />
        <input v-model="scheduleEndAt" type="datetime-local" />
        <select v-model="scheduleStatus">
          <option value="pending">待完成</option>
          <option value="executing">进行中</option>
          <option value="completed">已完成</option>
          <option value="cancelled">已取消</option>
          <option value="blocked">被阻塞</option>
        </select>
      </template>
      <div class="modal-actions">
        <button @click="emit('close')">取消</button>
        <button @click="submit">保存</button>
      </div>
    </div>
  </div>
</template>
<style scoped>
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.4);
  display: grid; place-items: center;
  z-index: 100;
}
.modal {
  background: var(--theme-bg-stripe-1);
  padding: 2rem;
  display: flex; flex-direction: column; gap: 0.75rem;
  inline-size: 28rem;
}
textarea { min-block-size: 6rem; resize: vertical; }
.modal-actions { display: flex; gap: 0.5rem; justify-content: flex-end; }
</style>