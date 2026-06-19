<script setup lang="ts">
import {computed, ref} from "vue";
import { timeZoneOptions } from '@/data/timezones.ts'
import {TimeManager} from '@/utils/TimeManager.ts'
import {useLocaleStore} from "@/stores/locale.ts";
import {useFontStore} from "@/stores/font.ts";
import Clock from "@/components/Calendar/Clock.vue";
import CalendarBody from "@/components/Calendar/CalendarBody.vue";
import WeatherWidget from "@/components/Calendar/WeatherWidget.vue";
import {useWeather} from "@/composables/useWeather";


//pinia
const localeStore = useLocaleStore();
const fontStore = useFontStore();


//timeManager
const timeManager = new TimeManager(localeStore.timeZone);


const monthOffset = ref<number>(0);


const {
  dailyMap, loading,
  location, setLocation,
} = useWeather();

//准备给其他的年份
const displayYear = computed(() => {
  const { year, month } = timeManager.getFormatted();
  const total = month + monthOffset.value;
  return year + Math.floor(total / 12);
});
const displayMonth = computed(() => {
  const { month } = timeManager.getFormatted();
  return ((month + monthOffset.value) % 12 + 12) % 12;
});
</script>

<template>
  <div class="calendar">
    <div class="calendar-header">
      <Clock
          :display-year="displayYear"
          :display-month="displayMonth"
      />

    </div>

    <CalendarBody
        @wheel="monthOffset += $event"
        :display-year="displayYear"
        :display-month="displayMonth"
        :monthOffset="monthOffset"
        :localeStore="localeStore"
        :timeManager="timeManager"
    />

    <div class="calendar-tail">
      <WeatherWidget
        :daily="dailyMap"
        :location-name="location.name"
        :loading="loading"
        @set-location="(lat, lon, name) => setLocation(lat, lon, name)"
      />
      <select
          v-model="localeStore.timeZone"
          v-show="false"
      >
        <option
            v-for="(item, index) in timeZoneOptions"
            :key="`tz-${index}`"
            :value="item.value"
        >
          {{ item.label }}
        </option>
      </select>
      <select
          v-model="localeStore.locale"
          v-show="false"
      >
        <option value="zh">中文</option>
        <option value="ja">日本語</option>
        <option value="en">English</option>
      </select>
      <select
          v-model="fontStore.fontBody"
          v-show="false"
      >
        <option
            v-for="opt in fontStore.FONT_OPTIONS"
            :key="opt.value"
            :value="opt.value"
        >
          {{ opt.label }}
        </option>
      </select>
    </div>
  </div>
</template>

<style scoped>
.calendar{
  transform: translateZ(0);
  --cell-transition-duration: 0.25s;
  --full-block-size : 100dvb;
  --full-inline-size : 35dvi;
  display: flex;
  flex-direction: column;
  /*justify-content: center;*/
  align-items: center;
  /*这个是高度*/
  block-size: var(--full-block-size);
  /*这个是宽度*/
  inline-size: calc(var(--full-inline-size) + 3dvi);
  background-color: var(--calendar-bg);
  box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.15);
  /*backdrop-filter: blur(0.2rem);*/
}
.calendar-header{
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  /*这个是高度*/
  flex: 1;
  /*这个是宽度，和父容器一致*/
  inline-size: var(--full-inline-size);
}

.calendar-tail{
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  /*这个是高度*/
  flex: 1;
  /*这个是宽度，和父容器一致*/
  inline-size: var(--full-inline-size);
}

</style>