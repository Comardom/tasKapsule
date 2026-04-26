<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

// 存储当前时间
const currentTime = ref(new Date())
// 控制时间显示格式
const showSeconds = ref(true)
// 存储定时器ID用于清理
let timer: ReturnType<typeof setInterval> | null = null

// 格式化时间
const formatTime = (date: Date) => {
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  if (showSeconds.value) {
    return `${hours}:${minutes}:${seconds}`
  }
  return `${hours}:${minutes}`
}

// 格式化日期
const formatDate = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const weekDays = ['日', '一', '二', '三', '四', '五', '六']
  const weekDay = weekDays[date.getDay()]

  return `${year}年${month}月${day}日 星期${weekDay}`
}

// 更新时间的函数
const updateTime = () => {
  currentTime.value = new Date()
}

// 切换秒数显示
const toggleSeconds = () => {
  showSeconds.value = !showSeconds.value
}

// 组件挂载时启动定时器
onMounted(() => {
  updateTime() // 立即更新一次
  timer = setInterval(updateTime, 1000) // 每秒更新一次
})

// 组件卸载时清除定时器
onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
})
</script>

<template>
  <div class="clock-container" role="timer" :aria-label="`当前时间 ${formatTime(currentTime)}`">
    <div class="time-display" aria-live="polite" aria-atomic="true">
      <span class="time">{{ formatTime(currentTime) }}</span>
      <button
        class="toggle-btn"
        @click="toggleSeconds"
        :aria-label="showSeconds ? '隐藏秒数' : '显示秒数'"
        :title="showSeconds ? '隐藏秒数' : '显示秒数'"
      >
        {{ showSeconds ? '🔍' : '🔎' }}
      </button>
    </div>

    <div class="date-display">
      {{ formatDate(currentTime) }}
    </div>

    <!-- 可选的模拟时钟表盘 -->
    <div class="analog-clock" aria-hidden="true">
      <div class="clock-face">
        <!-- 时、分、秒指针 -->
        <div
          class="hand hour-hand"
          :style="{
            transform: `rotate(${(currentTime.getHours() % 12) * 30 + currentTime.getMinutes() * 0.5}deg)`
          }"
        ></div>
        <div
          class="hand minute-hand"
          :style="{
            transform: `rotate(${currentTime.getMinutes() * 6}deg)`
          }"
        ></div>
        <div
          class="hand second-hand"
          :style="{
            transform: `rotate(${currentTime.getSeconds() * 6}deg)`
          }"
        ></div>
        <div class="center-dot"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.clock-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.8rem;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 1rem;
  box-shadow: 0 0.5rem 2rem rgba(0, 0, 0, 0.2);
  color: white;
  font-family: 'Courier New', monospace;
  min-width: 320px;
}

.time-display {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.time {
  font-size: 3.5rem;
  font-weight: bold;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  letter-spacing: 0.1em;
  user-select: none;
}

.toggle-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 0.5rem;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  transition: background-color 0.3s;
  line-height: 1;
}

.toggle-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.toggle-btn:focus-visible {
  outline: 3px solid white;
  outline-offset: 2px;
}

.date-display {
  font-size: 1.2rem;
  opacity: 0.9;
  text-shadow: 0 1px 5px rgba(0, 0, 0, 0.2);
}

/* 模拟时钟样式 */
.analog-clock {
  margin-top: 0.5rem;
}

.clock-face {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 3px solid rgba(255, 255, 255, 0.3);
  position: relative;
  backdrop-filter: blur(10px);
}

.hand {
  position: absolute;
  bottom: 50%;
  left: 50%;
  transform-origin: bottom center;
  transition: transform 0.1s cubic-bezier(0.4, 2.08, 0.55, 0.44);
}

.hour-hand {
  width: 4px;
  height: 35%;
  background: white;
  border-radius: 2px;
  margin-left: -2px;
}

.minute-hand {
  width: 3px;
  height: 43%;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 1.5px;
  margin-left: -1.5px;
}

.second-hand {
  width: 2px;
  height: 48%;
  background: #ff6b6b;
  border-radius: 1px;
  margin-left: -1px;
  transition: transform 0.05s linear;
}

.center-dot {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: white;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
}

/* 响应式设计 */
@media (max-width: 480px) {
  .clock-container {
    padding: 1.5rem;
    min-width: 280px;
  }

  .time {
    font-size: 2.5rem;
  }

  .clock-face {
    width: 120px;
    height: 120px;
  }
}
</style>