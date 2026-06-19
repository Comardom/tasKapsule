<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { capsuleApi } from '@/utils/apiService.ts';
import { useCapsuleStore } from '@/stores/capsule.ts';
import type { Capsule, Classification, ScheduleStatus } from '@/stores/capsule.ts';
const store = useCapsuleStore();
const emit = defineEmits<{ close: [] }>();
const props = defineProps<{ preselectedDate?: string; editCapsule?: Capsule }>();
const contentText = ref('');
const classification = ref<Classification>('note');
const isWithSchedule = ref(false);
const scheduleIcon = ref('');
const scheduleContentText = ref('');
const scheduleStartAt = ref('');
const scheduleEndAt = ref('');
const scheduleStatus = ref<ScheduleStatus>('pending');
const scheduleDeadline = ref('');
const audioPath = ref('');
const attachmentPaths = ref('');
const alarmClocks = ref('');

const startRef = ref<HTMLInputElement>();
const endRef = ref<HTMLInputElement>();
const deadlineRef = ref<HTMLInputElement>();

function openPicker(el: HTMLInputElement | undefined) {
  el?.showPicker();
}

onMounted(() => {
  if (props.editCapsule) {
    contentText.value = props.editCapsule.contentText;
    classification.value = props.editCapsule.classification as Classification;
    isWithSchedule.value = props.editCapsule.isWithSchedule === 1;
    scheduleIcon.value = props.editCapsule.scheduleIcon ?? '';
    scheduleContentText.value = props.editCapsule.scheduleContentText ?? '';
    scheduleStartAt.value = props.editCapsule.scheduleStartAt ?? '';
    scheduleEndAt.value = props.editCapsule.scheduleEndAt ?? '';
    scheduleStatus.value = (props.editCapsule.scheduleStatus ?? 'pending') as ScheduleStatus;
    scheduleDeadline.value = props.editCapsule.scheduleDeadline ?? '';
    audioPath.value = props.editCapsule.audioPath ?? '';
    attachmentPaths.value = props.editCapsule.attachmentPaths ?? '';
    alarmClocks.value = props.editCapsule.alarmClocks ?? '';
  } else if (props.preselectedDate) {
    isWithSchedule.value = true;
    scheduleStartAt.value = `${props.preselectedDate}T00:00`;
    scheduleEndAt.value = `${props.preselectedDate}T23:59`;
  }
});
async function submit() {
  if (!contentText.value.trim()) return;
  const data = {
    contentText: contentText.value,
    classification: classification.value,
    isWithSchedule: isWithSchedule.value ? 1 : 0,
    scheduleIcon: isWithSchedule.value ? scheduleIcon.value || undefined : undefined,
    scheduleContentText: isWithSchedule.value ? scheduleContentText.value || undefined : undefined,
    scheduleStartAt: isWithSchedule.value ? scheduleStartAt.value || undefined : undefined,
    scheduleEndAt: isWithSchedule.value ? scheduleEndAt.value || undefined : undefined,
    scheduleStatus: isWithSchedule.value ? scheduleStatus.value || undefined : undefined,
    scheduleDeadline: isWithSchedule.value ? scheduleDeadline.value || undefined : undefined,
    audioPath: audioPath.value || null,
    attachmentPaths: attachmentPaths.value || undefined,
    alarmClocks: alarmClocks.value || undefined,
  };
  if (props.editCapsule) {
    await capsuleApi.update(props.editCapsule.id, data);
  } else {
    await capsuleApi.create(data);
  }
  await store.loadInitialPage()
  emit('close');
}
</script>
<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal">
      <h2>{{ props.editCapsule ? '编辑胶囊' : '新建胶囊' }}</h2>
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
        <input v-model="scheduleIcon" placeholder="日程图标" />
        <input v-model="scheduleContentText" placeholder="日程内容" />
        <span class="date-trigger" @click="openPicker(startRef)"><input ref="startRef" v-model="scheduleStartAt" type="datetime-local" /></span>
        <span class="date-trigger" @click="openPicker(endRef)"><input ref="endRef" v-model="scheduleEndAt" type="datetime-local" /></span>
        <select v-model="scheduleStatus">
          <option value="pending">待完成</option>
          <option value="executing">进行中</option>
          <option value="completed">已完成</option>
          <option value="cancelled">已取消</option>
          <option value="blocked">被阻塞</option>
        </select>
        <span class="date-trigger" @click="openPicker(deadlineRef)"><input ref="deadlineRef" v-model="scheduleDeadline" type="datetime-local" placeholder="截止时间" /></span>
      </template>
      <input v-model="audioPath" placeholder="音频路径" />
      <input v-model="attachmentPaths" placeholder="附件路径" />
      <input v-model="alarmClocks" placeholder="闹钟 (JSON)" />
      <div class="modal-actions">
        <button @click="emit('close')">取消</button>
        <button @click="submit">{{ props.editCapsule ? '更新' : '保存' }}</button>
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
select, label, button { cursor: pointer; }
.date-trigger {
  display: block;
  cursor: pointer;
}
.date-trigger input[type="datetime-local"] {
  pointer-events: none;
  inline-size: 100%;
}
</style>