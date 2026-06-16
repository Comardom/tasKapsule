import { defineStore } from 'pinia'
import { ref, watchEffect } from 'vue'

const FONT_OPTIONS = [
  { value: "'App Sans', system-ui, sans-serif", label: '思源黑体' },
  { value: "system-ui, sans-serif", label: '系统无衬线' },
  { value: "serif", label: '衬线体' },
] as const

export const useFontStore = defineStore('font', () => {
  const fontBody = ref(localStorage.getItem('font-body') || FONT_OPTIONS[0].value)

  watchEffect(() => {
    document.documentElement.style.setProperty('--font-body', fontBody.value)
    localStorage.setItem('font-body', fontBody.value)
  })

  function setFontBody(value: string) {
    fontBody.value = value
  }

  return { fontBody, setFontBody, FONT_OPTIONS }
})
