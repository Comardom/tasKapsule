<script setup lang="ts">
import { ref } from 'vue'
import { capsuleApi } from '@/utils/apiService.ts'
import { useCapsuleStore } from '@/stores/capsule.ts'

const store = useCapsuleStore()
const emit = defineEmits<{ close: [] }>()

type Tab = 'import' | 'export'
const activeTab = ref<Tab>('import')

const fileContent = ref<any[] | null>(null)
const importProgress = ref(0)
const importTotal = ref(0)
const isImporting = ref(false)
const importErrors = ref<string[]>([])
const importResult = ref('')
const fileInputRef = ref<HTMLInputElement>()

const isExporting = ref(false)

function handleFileSelected(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result as string)
      if (!Array.isArray(data)) {
        importErrors.value = ['JSON 格式错误：根节点必须是数组']
        fileContent.value = null
        return
      }
      for (let i = 0; i < data.length; i++) {
        const item = data[i]
        if (!item.contentText || !item.classification || item.isWithSchedule === undefined) {
          importErrors.value = [`第 ${i + 1} 条缺少必填字段 (contentText / classification / isWithSchedule)`]
          fileContent.value = null
          return
        }
      }
      importErrors.value = []
      fileContent.value = data
    } catch {
      importErrors.value = ['JSON 解析失败，请检查文件格式']
      fileContent.value = null
    }
  }
  reader.readAsText(file)
}

async function startImport() {
  if (!fileContent.value || fileContent.value.length === 0) return
  isImporting.value = true
  importProgress.value = 0
  importTotal.value = fileContent.value.length
  importResult.value = ''
  importErrors.value = []
  let success = 0
  let failed = 0

  for (const item of fileContent.value) {
    try {
      const { scheduleIcon: _, ...data } = item
      if (data.isWithSchedule === 1 && !data.scheduleStartAt) {
        data.scheduleStartAt = undefined
      }
      await capsuleApi.create(data)
      success++
    } catch (err: any) {
      failed++
      importErrors.value.push(`第 ${importProgress.value + 1} 条失败: ${err.message || '未知错误'}`)
    }
    importProgress.value++
  }

  await store.loadInitialPage()
  importResult.value = `导入完成：成功 ${success} 条，失败 ${failed} 条`
  isImporting.value = false
}

function startExport() {
  isExporting.value = true
  const capsules = store.allCapsules
  const json = JSON.stringify(capsules, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `capsules-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
  isExporting.value = false
}

function resetImport() {
  fileContent.value = null
  importProgress.value = 0
  importTotal.value = 0
  importErrors.value = []
  importResult.value = ''
  if (fileInputRef.value) fileInputRef.value.value = ''
}
</script>

<template>
  <div class="overlay" @click.self="emit('close')">
    <div class="dialog">
      <div class="tab-bar">
        <button :class="{ active: activeTab === 'import' }" @click="activeTab = 'import'">导入</button>
        <button :class="{ active: activeTab === 'export' }" @click="activeTab = 'export'">导出</button>
      </div>

      <template v-if="activeTab === 'import'">
        <div class="file-row">
          <input ref="fileInputRef" type="file" accept=".json" hidden @change="handleFileSelected" />
          <button class="file-btn" @click="fileInputRef?.click()">选择 JSON 文件</button>
          <span v-if="fileContent" class="file-info">已选择：{{ fileContent.length }} 条胶囊</span>
        </div>

        <div v-if="fileContent && fileContent.length > 0" class="preview">
          <p class="preview-title">预览（前 3 条）</p>
          <div v-for="(item, i) in fileContent.slice(0, 3)" :key="i" class="preview-item">
            <span class="preview-text">{{ (item.contentText || '').substring(0, 24) }}{{ (item.contentText || '').length > 24 ? '…' : '' }}</span>
            <span class="preview-tag">{{ item.classification }}</span>
          </div>
          <p v-if="fileContent.length > 3" class="preview-more">……还有 {{ fileContent.length - 3 }} 条</p>
        </div>

        <div v-if="isImporting" class="progress-bar">
          <div class="progress-fill" :style="{ width: (importTotal > 0 ? (importProgress / importTotal) * 100 : 0) + '%' }"></div>
          <span class="progress-text">{{ importProgress }} / {{ importTotal }}</span>
        </div>

        <div v-if="importResult && !isImporting" class="result" :class="{ error: importResult.includes('失败') && importErrors.length > 0 }">
          {{ importResult }}
        </div>

        <div v-if="importErrors.length > 0 && !isImporting" class="errors">
          <p v-for="(err, i) in importErrors.slice(0, 3)" :key="i" class="error-item">{{ err }}</p>
          <p v-if="importErrors.length > 3" class="error-more">……还有 {{ importErrors.length - 3 }} 条错误</p>
        </div>

        <div class="actions">
          <button @click="emit('close')">取消</button>
          <button v-if="fileContent && !isImporting" class="primary" @click="startImport">
            开始导入 ({{ fileContent.length }} 条)
          </button>
          <button v-if="importResult && !isImporting" @click="resetImport">重新选择</button>
        </div>
      </template>

      <template v-if="activeTab === 'export'">
        <p class="export-info">将导出全部 <strong>{{ store.allCapsules.length }}</strong> 条胶囊为 JSON 文件。</p>
        <p class="export-hint">导出的文件包含 id、createdAt 等全部字段，可直接用于导入。</p>

        <div class="actions">
          <button @click="emit('close')">取消</button>
          <button class="primary" :disabled="isExporting || store.allCapsules.length === 0" @click="startExport">
            {{ isExporting ? '导出中…' : `全部导出 (${store.allCapsules.length} 条)` }}
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.4);
  display: grid; place-items: center;
  z-index: 150;
}
.dialog {
  background: var(--theme-bg-stripe-1);
  padding: 1.5rem 2rem;
  /*border-radius: 1rem;*/
  display: flex;
  flex-direction: column;
  gap: 1rem;
  inline-size: 30rem;
}
.tab-bar {
  display: flex;
  gap: 0.5rem;
  border-bottom: 0.0625rem solid var(--calendar-grid-line);
  padding-block-end: 0.75rem;
}
.tab-bar button {
  padding: 0.4rem 1rem;
  border: none;
  /*border-radius: 0.5rem;*/
  /*background: transparent;
  color: var(--theme-color);*/
  cursor: pointer;
  /*font-size: 0.9rem;*/
}
.tab-bar button.active {
  /*background: var(--theme-link);
  color: #fff;*/
}
.file-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.file-btn {
  padding: 0.4rem 1rem;
  /*border: 0.0625rem solid var(--calendar-grid-line);*/
  /*border-radius: 0.5rem;*/
  /*background: rgba(255,255,255,0.1);*/
  /*color: var(--theme-color);*/
  cursor: pointer;
}
.file-info {
  font-size: 0.85rem;
  color: var(--calendar-cell-text);
}
.preview {
  background: rgba(0,0,0,0.06);
  /*border-radius: 0.5rem;*/
  padding: 0.75rem 1rem;
}
.preview-title {
  margin: 0 0 0.5rem;
  font-size: 0.8rem;
  color: var(--calendar-cell-text-small);
}
.preview-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.2rem 0;
  font-size: 0.85rem;
}
.preview-text {
  color: var(--theme-color);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.preview-tag {
  font-size: 0.7rem;
  padding: 0.1rem 0.4rem;
  /*border-radius: 0.25rem;*/
  background: var(--calendar-today-bg-start, rgba(100,140,230,0.3));
  color: var(--calendar-today-text, #fff);
  flex-shrink: 0;
}
.preview-more {
  margin: 0.3rem 0 0;
  font-size: 0.8rem;
  color: var(--calendar-cell-text-small);
}
.progress-bar {
  position: relative;
  block-size: 1.5rem;
  background: rgba(0,0,0,0.1);
  /*border-radius: 0.75rem;*/
  overflow: hidden;
}
.progress-fill {
  block-size: 100%;
  background: var(--theme-link);
  /*border-radius: 0.75rem;*/
  transition: width 0.2s;
}
.progress-text {
  position: absolute; inset: 0;
  display: grid; place-items: center;
  font-size: 0.8rem;
  color: #fff;
  text-shadow: 0 0.0625rem 0.125rem rgba(0,0,0,0.5);
}
.result {
  margin: 0;
  font-size: 0.9rem;
  color: var(--theme-color);
  text-align: center;
}
.result.error {
  color: #e74c3c;
}
.errors {
  max-block-size: 6rem;
  overflow-y: auto;
}
.error-item {
  margin: 0;
  font-size: 0.8rem;
  color: #e74c3c;
  padding: 0.15rem 0;
}
.error-more {
  margin: 0.2rem 0 0;
  font-size: 0.75rem;
  color: var(--calendar-cell-text-small);
}
.actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}
.actions button {
  padding: 0.4rem 1rem;
  /*border: 0.0625rem solid rgba(255,255,255,0.3);
  border-radius: 0.5rem;
  background: rgba(255,255,255,0.15);
  color: var(--theme-color);*/
  cursor: pointer;
}
.actions button.primary {
  background: var(--theme-link);
  color: #fff;
  border-color: var(--theme-link);
}
.actions button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.export-info {
  margin: 0;
  line-height: 1.5;
}
.export-hint {
  margin: -0.25rem 0 0;
  font-size: 0.85rem;
  color: var(--calendar-cell-text);
}
</style>
