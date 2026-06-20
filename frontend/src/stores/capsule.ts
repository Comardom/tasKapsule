import { defineStore } from 'pinia';
import { capsuleApi } from '@/utils/apiService.ts';

export type Classification = 'note' | 'urgent' | 'favourite' | 'sms' | 'inspiration';
export type ScheduleStatus = 'pending' | 'executing' | 'completed' | 'cancelled' | 'blocked';
export type DisplayMode = 'all' | 'first-last' | 'first' | 'last';
export type ViewMode = 'single' | 'double';

// 定义实体接口，提高开发效率,让 IDE 知道一个胶囊对象里有哪些字段
export interface Capsule {
  id: number;
  createdAt: string;
  contentText: string;
  audioPath?: string;
  attachmentPaths?: string;
  classification: Classification;
  isWithSchedule: number;  // 0 | 1
  scheduleIcon?: string;
  scheduleContentText?: string;
  scheduleStartAt?: string;  // "YYYY-MM-DD HH:mm:ss"
  scheduleEndAt?: string;    // "YYYY-MM-DD HH:mm:ss"
  scheduleStatus?: ScheduleStatus;
  scheduleDeadline?: string;
  alarmClocks?: string;
}

//管理应用中所有关于"日程胶囊"的状态和行为
export const useCapsuleStore = defineStore('capsule', {
  //State: 存储数据的地方（相当于 Vue 组件的 data）
  state: () => ({
    // 当前日历选中的日期，默认为今天
    // 此处的sv-SE是本地时区，返回一个yyyy-MM-dd
    //原本这里用的是ISO 字符串的前 10 位
    //ISO时间是2026-04-23T15:12:16Z的格式，在T处分割，生成一个数组，第一个就是日期
    //selectedDate: new Date().toISOString().split('T')[0],
    selectedDate: new Date().toLocaleDateString('sv-SE'),
    allCapsules: [] as Capsule[],
    isLoading: false as boolean,
    error: null,
    displayMode: 'all' as DisplayMode,
    viewMode: 'single' as ViewMode,
    totalCount: 0,
    initialPageLoaded: false,
    fullyLoaded: false,
    _resolveFullyLoaded: [] as (() => void)[],
  }),

  //修改数据的方法（相当于 Vue 组件的 methods）
  //支持异步操作，是与后端通讯的最佳场所
  actions: {
    async loadInitialPage(perPage = 50) {
      this.isLoading = true;
      this.initialPageLoaded = false;
      try {
        const res = await capsuleApi.getAllPaginated(1, perPage);
        this.allCapsules = res.data.data;
        this.totalCount = res.data.total;
        this.initialPageLoaded = true;
      } catch (err: any) {
        this.error = err.message || '获取数据失败';
        console.error('Load initial page Error:', err);
      } finally {
        this.isLoading = false;
      }
    },
    async loadRemainingInBackground(perPage = 50) {
      if (this.fullyLoaded) return;
      const totalPages = Math.ceil(this.totalCount / perPage);
      if (totalPages <= 1) {
        this.fullyLoaded = true;
        for (const resolve of this._resolveFullyLoaded) resolve();
        this._resolveFullyLoaded = [];
        return;
      }
      for (let page = 2; page <= totalPages; page++) {
        await new Promise(r => setTimeout(r, 0));
        try {
          const res = await capsuleApi.getAllPaginated(page, perPage);
          this.allCapsules.push(...res.data.data);
        } catch (err) {
          console.error('Background page load error:', err);
        }
      }
      this.fullyLoaded = true;
      for (const resolve of this._resolveFullyLoaded) resolve();
      this._resolveFullyLoaded = [];
    },
    async waitFullyLoaded(): Promise<void> {
      if (this.fullyLoaded) return;
      return new Promise(resolve => {
        this._resolveFullyLoaded.push(resolve);
      });
    },
    async fetchCapsules() {
      this.isLoading = true;
      this.error = null;
      try {
        const res = await capsuleApi.getAll();
        this.allCapsules = res.data || [];
        this.totalCount = this.allCapsules.length;
        this.fullyLoaded = true;
      } catch (err: any) {
        this.error = err.message || '获取数据失败';
        console.error('Fetch Capsules Error:', err);
      } finally {
        this.isLoading = false;
      }
    },
    setDate(date: string) {
      if (this.selectedDate !== date) {
        this.selectedDate = date;
      }
    },
    setDisplayMode(mode: DisplayMode) {
      this.displayMode = mode;
    },
    setViewMode(mode: ViewMode) {
      this.viewMode = mode;
    }
  },
  getters: {
    // A 模式用：全量按 createdAt 降序
    byCreatedAt(state): Capsule[] {
      return [...state.allCapsules].sort((a, b) =>
          b.createdAt.localeCompare(a.createdAt)
      );
    },
    // B 模式列1：有日程的胶囊按 displayMode 展开
    scheduleTimeline(state): { capsule: Capsule; date: string }[] {
      const result: { capsule: Capsule; date: string }[] = [];
      const scheduled =
          state.allCapsules.filter(item =>
              item.isWithSchedule === 1 && item.scheduleStartAt);
      for (const item of scheduled) {
        const start = item.scheduleStartAt!.substring(0, 10);
        const end = item.scheduleEndAt
            ? item.scheduleEndAt.substring(0, 10)
            : start;
        const dates = getDateRange(start, end);
        let displayDates: string[];
        switch (state.displayMode) {
          case 'first':
            displayDates = [dates[0]!]; break;
          case 'last':
            displayDates = [dates[dates.length - 1]!]; break;
          case 'first-last':
            displayDates = dates.length > 1
                ? [dates[0]!, dates[dates.length - 1]!]
                : [dates[0]!];
            break;
          default:
            displayDates = dates; // 'all'
        }
        for (const aDate of displayDates) {
          result.push({ capsule: item, date: aDate });
        }
      }
      result.sort((a, b) =>
          a.date.localeCompare(b.date) ||
          (a.capsule.scheduleStartAt || '').localeCompare(b.capsule.scheduleStartAt || '')
      );
      return result;
    },
    // B 模式列2：无日程胶囊按 createdAt 降序
    withoutSchedule(state): Capsule[] {
      return state.allCapsules
          .filter(c => c.isWithSchedule === 0)
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
  }
});


// 日期展开辅助
function getDateRange(start: string, end: string): string[] {
  const dates: string[] = [];
  const current = new Date(start);
  const last = new Date(end);
  while (current <= last) {
    dates.push(current.toISOString().substring(0, 10));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}