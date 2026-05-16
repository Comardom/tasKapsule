import axios from 'axios';
// TODO 重写

export async function checkBackendHealth() {
  try {
    const response = await axios.get('http://localhost:9999/health', { timeout: 3000 });
    console.log('后端连接成功:', response.data);
    return true;
  } catch (error) {
    console.error('后端连接失败，请检查端口 9999 是否启动', error);
    return false;
  }
}