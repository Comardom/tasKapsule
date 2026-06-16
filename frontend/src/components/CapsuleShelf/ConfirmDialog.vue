<script setup lang="ts">
defineProps<{ message: string }>()
const emit = defineEmits<{ confirm: []; cancel: [] }>()
</script>

<template>
  <div class="overlay" @click.self="emit('cancel')">
    <div class="dialog">
      <p class="dialog-message">{{ message }}</p>
      <div class="dialog-actions">
        <button @click="emit('cancel')">取消</button>
        <button class="danger" @click="emit('confirm')">删除</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.4);
  display: grid; place-items: center;
  z-index: 200;
}
.dialog {
  background: var(--theme-bg-stripe-1);
  padding: 1.5rem 2rem;
  /*border-radius: 1rem;*/
  display: flex;
  flex-direction: column;
  gap: 1rem;
  inline-size: 22rem;
}
.dialog-message {
  margin: 0;
  white-space: pre-wrap;
  line-height: 1.5;
}
.dialog-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}
.dialog-actions button {
  padding: 0.4rem 1rem;
  /*border-radius: 0.5rem;*/
  /*border: 0.0625rem solid var(--theme-border-button);
  background: var(--theme-bg-button);
  color: var(--theme-color-button);*/
  cursor: pointer;
}
.dialog-actions button.danger {
  /*background: #e74c3c;
  color: #fff;
  border-color: #e74c3c;*/
}
.dialog-actions button.danger:hover {
  background: #c0392b;
}
</style>
