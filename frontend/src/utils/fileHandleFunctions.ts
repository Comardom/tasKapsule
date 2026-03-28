import { openFile, saveFile } from '@/utils/fileApi'

async function handleOpenFile() {
  const content = await openFile()
  console.log('文件内容:', content)
}
async function handleSaveFile() {
  const success = await saveFile('要保存的内容')
  if (success) {
    console.log('文件保存成功')
  }
}
