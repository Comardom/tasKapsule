export async function openFile() {
    return await window.api.openFile()
}

export async function saveFile(content: string) {
    return await window.api.saveFile(content)
}
