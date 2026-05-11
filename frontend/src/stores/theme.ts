import { defineStore } from 'pinia';
import { ref, watchEffect } from 'vue';

export const useThemeStore
    = defineStore('theme', () => {
  // 初始化状态：优先读取存储，没有存储则默认暗色 (符合 Electron 审美)
  const theme = ref(localStorage.getItem('app-theme') || 'dark');

  // 使用 watchEffect 自动监听 theme 的变化
  // 只要 theme.value 变了，这里面的代码就会执行
  watchEffect(() => {
    const root = document.documentElement;

    // 同步到 HTML 属性：<HTML data-theme="dark">
    root.setAttribute('data-theme', theme.value);

    // 持久化存储
    localStorage.setItem('app-theme', theme.value);
  });

  // 切换方法
  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light';
  };

  return { theme, toggleTheme };
});