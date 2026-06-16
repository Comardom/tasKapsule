<script setup lang="ts">
import { ref, watch } from 'vue'

interface CityResult {
  name: string
  lat: number
  lon: number
}

const emit = defineEmits<{
  select: [city: CityResult]
  close: []
}>()

const query = ref('')
const results = ref<CityResult[]>([])
const searching = ref(false)
const error = ref<string | null>(null)

let debounceTimer: ReturnType<typeof setTimeout> | null = null

watch(query, (val) => {
  if (debounceTimer) clearTimeout(debounceTimer)
  if (!val.trim()) {
    results.value = []
    return
  }
  debounceTimer = setTimeout(() => search(val.trim()), 300)
})

async function search(q: string) {
  searching.value = true
  error.value = null
  try {
    const params = new URLSearchParams({
      name: q,
      count: '8',
      language: 'auto',
      format: 'json',
    })
    const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${params}`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    if (!json.results?.length) {
      results.value = []
      return
    }
    results.value = json.results.map((r: any) => ({
      name: [r.name, r.admin1, r.country]
        .filter(Boolean)
        .join(', '),
      lat: r.latitude,
      lon: r.longitude,
    }))
  } catch (e: any) {
    error.value = e.message ?? 'Search failed'
    results.value = []
  } finally {
    searching.value = false
  }
}

function select(r: CityResult) {
  emit('select', r)
}
</script>

<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal">
      <h2>切换城市</h2>
      <input
        v-model="query"
        placeholder="请输入城市名称（英语）"
        autofocus
      />
      <div v-if="searching" class="hint">搜寻中...</div>
      <div v-else-if="error" class="hint error">{{ error }}</div>
      <ul v-else-if="results.length" class="city-list">
        <li
          v-for="(r, i) in results"
          :key="i"
          @click="select(r)"
        >
          {{ r.name }}
        </li>
      </ul>
      <div v-else-if="query && !searching" class="hint">无相关结果</div>
<!--      <div class="modal-actions">
        <button @click="emit('close')">取消</button>
      </div>-->
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
  max-block-size: 70dvb;
}
.modal h2 {
  margin: 0;
  color: var(--theme-color);
}
.modal input {
  padding: 0.5rem;
  font-size: 1rem;
}
.city-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  overflow-y: auto;
}
.city-list li {
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  border-radius: 0.25rem;
  color: var(--theme-color);
  background: var(--theme-bg-button);
  border: 1px solid var(--theme-border-button);
}
.city-list li:hover {
  background: var(--theme-bg-button-hover);
}
.hint {
  color: var(--theme-color);
  opacity: 0.6;
  font-size: 0.85rem;
}
.hint.error {
  color: #e74c3c;
  opacity: 1;
}
.modal-actions {
  display: flex; gap: 0.5rem; justify-content: flex-end;
}
</style>
