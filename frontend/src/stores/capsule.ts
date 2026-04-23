import { defineStore } from 'pinia';
import { capsuleApi } from '@/utils/apiService.ts';

// 定义实体接口，提高开发效率,让 IDE 知道一个胶囊对象里有哪些字段
export interface Capsule {
  id: number;           // 对应数据库自增 ID
  title: string;
  content?: string;     // 使用 ? 因为它是 nullable
  audioPath?: string;
  attachmentPaths?: string; // 如果后端直接丢出 JSON 字符串，这里就是 string
  targetDate: string;   // 对应 LocalDate
  startTime?: string;   // 对应 LocalTime
  durationMinutes: number;
  status: 'PENDING' | 'COMPLETED'; // 建议限定范围，比 string 更好用
  createdAt: string;    // 对应 LocalDateTime
}

//管理应用中所有关于“日程胶囊”的状态和行为
export const useCapsuleStore = defineStore('capsule', {
  //State: 存储数据的地方（相当于 Vue 组件的 data）
  state: () => ({
    // 当前日历选中的日期，默认为今天（取 ISO 字符串的前 10 位）
    //ISO时间是2026-04-23T15:12:16Z的格式，在T处分割，生成一个数组，第一个就是日期
    selectedDate: new Date().toISOString().split('T')[0],
    // 存放从后端获取到的胶囊数组
    capsules: [] as Capsule[],
    // 全局加载状态。True 时，界面可以显示转圈圈动画
    isLoading: false,
    // 错误信息。如果后端报错，把错误存到这里展示给用户
    error: null as string | null
  }),

  //修改数据的方法（相当于 Vue 组件的 methods）
  //支持异步操作，是与后端通讯的最佳场所
  actions: {
    //fetchCapsules: 从服务器拉取当前选中日期的所有数据
    async fetchCapsules() {
      //安全检查：如果没有日期，直接不干活
      if (!this.selectedDate) return; // 如果没有日期，直接返回
      //开始工作：设置加载状态，清空之前的错误
      this.isLoading = true;
      this.error = null;
      try {
        //通讯：调用之前封装好的 API 接口
        const res = await capsuleApi.getByDate(this.selectedDate);
        console.log("后端原始返回:", res);
        // 假设 res.data 是数组
        // 赋值：将后端返回的数组存入 state
        // 使用 || [] 是为了防止后端返回 null 导致前端崩溃
        this.capsules = res.data || [];
      } catch (err: any) {
        //异常处理：如果网络断了或后端挂了，记录错误原因
        this.error = err.message || '获取数据失败';
        console.error('Fetch Capsules Error:', err);
      } finally {
        //无论成功还是失败，都关闭加载动画
        this.isLoading = false;
      }
    },

    // setDate: 修改选中的日期
    setDate(date: string) {
      // 只有当日期的确发生变化时才执行，避免重复请求
      if (this.selectedDate !== date) {
        this.selectedDate = date;
        // 日期一变，立刻去重新拉取该日期下的数据
        this.fetchCapsules().then(r => {});
      }
    }
  }
});