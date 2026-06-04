<script setup lang="ts">
import { computed } from 'vue'
import { useCapsuleStore } from '@/stores/capsule'
import type { CurrentWeather, DailyWeather } from '@/composables/useWeather'

interface Props {
  current: CurrentWeather | null
  daily: Record<string, DailyWeather>
  locationName: string
  loading: boolean
}
const props = defineProps<Props>()

const emit = defineEmits<{
  setLocationByCity: [city: string]
}>()

const capsuleStore = useCapsuleStore()

const selectedDate = computed(() => capsuleStore.selectedDate)

const today = computed(() => new Date().toLocaleDateString('sv-SE'))

const isToday = computed(() => selectedDate.value === today.value)

const dayWeather = computed(() => props.daily[selectedDate.value] ?? null)

function weatherEmoji(code: number): string {
  if (code <= 1) return '☀️'
  if (code <= 3) return ['🌤️', '⛅', '☁️'][code - 1] ?? '☁️'
  if (code <= 48) return '🌫️'
  if (code <= 57) return '🌦️'
  if (code <= 67) return '🌧️'
  if (code <= 77) return '🌨️'
  if (code <= 86) return '🌦️'
  if (code <= 99) return '⛈️'
  return '❓'
}

const displayTemp = computed(() => {
  const d = dayWeather.value
  const c = props.current
  if (isToday.value && c) return c.temperature
  return d ? Math.round((d.max + d.min) / 2) : null
})

const displayCode = computed(() => {
  if (isToday.value && props.current) return props.current.code
  return dayWeather.value?.code ?? null
})

function handleLocationClick() {
  const input = window.prompt('Enter city name (e.g. Shanghai, Tokyo):')
  if (input?.trim()) {
    emit('setLocationByCity', input.trim())
  }
}
</script>

<template>
  <div class="weather-widget" :class="{ loading }">
    <span v-if="displayCode !== null" class="weather-emoji">{{ weatherEmoji(displayCode) }}</span>
    <span v-if="displayTemp !== null" class="weather-temp">{{ displayTemp }}°</span>
    <span v-if="dayWeather" class="weather-highlow">
      H:{{ dayWeather.max }}° L:{{ dayWeather.min }}°
    </span>
    <span
      v-if="!dayWeather && displayCode === null && !loading"
      class="weather-na"
    >--°</span>
    <span class="weather-location" title="Click to change city" @click="handleLocationClick">
      {{ locationName }}
    </span>
  </div>
</template>

<style scoped>
.weather-widget {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  user-select: none;
  block-size: 4dvi;
  gap: 0.3rem;
  /*block-size: 2.2rem;*/
  inline-size: 35dvi;
  /*font-size: 0.85rem;*/
  backdrop-filter: var(--cell-backdrop-filter);
  border: var(--cell-border);
  background: var(--cell-bg);
  box-shadow: var(--cell-box-shadow);
  padding-inline: 0.5rem;
}
.weather-widget.loading {
  opacity: 0.6;
}
.weather-emoji {
  font-size: 1.1rem;
  line-height: 1;
}
.weather-temp {
  font-weight: 600;
}
.weather-highlow {
  opacity: 0.7;
  font-size: 0.75rem;
}
.weather-na {
  opacity: 0.4;
}
.weather-location {
  margin-inline-start: auto;
  font-size: 0.7rem;
  opacity: 0.5;
  cursor: pointer;
  text-decoration: underline dotted;
  padding-inline-end: 0.3rem;
}
.weather-location:hover {
  opacity: 0.8;
}
</style>
