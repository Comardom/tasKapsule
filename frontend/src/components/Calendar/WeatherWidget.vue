<script setup lang="ts">
import { computed, ref } from 'vue'
import { useCapsuleStore } from '@/stores/capsule'
import type { DailyWeather } from '@/composables/useWeather'
import CitySelector from '@/components/Calendar/CitySelector.vue'

interface Props {
  daily: Record<string, DailyWeather>
  locationName: string
  loading: boolean
}
const props = defineProps<Props>()

const emit = defineEmits<{
  setLocation: [lat: number, lon: number, name: string]
}>()

const showSelector = ref(false)

const capsuleStore = useCapsuleStore()

const selectedDate = computed(() => capsuleStore.selectedDate)

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
  return d ? Math.round((d.max + d.min) / 2) : null
})

const displayCode = computed(() => dayWeather.value?.code ?? null)

function handleLocationClick() {
  showSelector.value = true
}

function onCitySelect(city: { lat: number; lon: number; name: string }) {
  showSelector.value = false
  emit('setLocation', city.lat, city.lon, city.name)
}

import { watch } from 'vue'

watch([selectedDate, () => props.daily, displayCode, displayTemp], () => {
  console.log('WeatherWidget:', {
    selectedDate: selectedDate.value,
    dailyHas: selectedDate.value in props.daily,
    displayCode: displayCode.value,
    displayTemp: displayTemp.value,
    dailyKeys: Object.keys(props.daily),
  })
})
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
    <Teleport to="body">
      <CitySelector
        v-if="showSelector"
        @select="onCitySelect"
        @close="showSelector = false"
      />
    </Teleport>
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
