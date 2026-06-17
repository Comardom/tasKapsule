<script setup lang="ts">
import {computed, nextTick, onMounted, onUnmounted, ref, watch} from "vue";
import {Zh曜日,Jp曜日,En曜日} from "@/data/nameOfDaysOfWeek.ts";
import Cell from "@/components/Calendar/Cell.vue";
import { timeZoneOptions } from '@/data/timezones.ts'
import {TimeManager} from '@/utils/TimeManager.ts'
import {useLocaleStore} from "@/stores/locale.ts";
import {useCapsuleStore} from "@/stores/capsule.ts";
import { useCalendarAction } from '@/composables/useCalendarAction';
import CalendarBodyTransition from "@/components/Calendar/CalendarBodyTransition.vue";





interface Props {
  displayYear: number;
  displayMonth: number;
  monthOffset: number;
  localeStore: ReturnType<typeof useLocaleStore>;
  timeManager: TimeManager;
}
const props = withDefaults(defineProps<Props>(), {
  monthOffset: 0,
});





//这里是在计算日历横向除以七的宽度，好分配给每一周，这个仅仅是数字！！！这个7是随便预设的，就当是不存在
const cellInlineSize = ref<number>(7);
//为了每分钟刷新
let timer: ReturnType<typeof setInterval>;
onMounted(() => {
  //计算宽度！
  const calendarEl = document.querySelector('.calendar') as HTMLElement
  if (calendarEl) {
    //这里是获取总宽度，然后除以七
    const styles = getComputedStyle(calendarEl);
    const fullInlineSize = parseFloat(styles.getPropertyValue('--full-inline-size').trim());
    if (!isNaN(fullInlineSize)) {
      cellInlineSize.value = fullInlineSize / 7;
      // 等待 DOM 更新后再设置高度
      nextTick(() => {
        setCalendarHeight();
      });
    }
  }
  //宽度计算完了

  //每分钟刷新一下时间
  timer = setInterval(refreshCalendar, 60_000);
});


onUnmounted(() => {
  //计时器需要卸载
  clearInterval(timer);
})


const 总行数 = computed(() => {
  const 前置天数 = 月初曜日.value; // 需要显示的上月天数
  const 后置天数 = (7 - (前置天数 + 当月天数.value) % 7) % 7; // 需要显示的下月天数
  return (前置天数 + 当月天数.value + 后置天数) / 7 + 1;
});



//这里是获取日历宽度，然后计算出高度
const setCalendarHeight = () => {
  const calendarBodyEl = document.querySelector('.calendar-body') as HTMLElement;
  if (calendarBodyEl && cellInlineSize.value) {
    const calendarHeightInDvi = cellInlineSize.value * 总行数.value;
    calendarBodyEl.style.setProperty('--this-month-height-in-dvi', `${calendarHeightInDvi}dvi`);
  }
};



const 曜日缩写 = computed(() => {
  switch (props.localeStore.locale)
  {
    case 'ja':  return Jp曜日;
    case 'zh':  return Zh曜日;
    default:    return En曜日;
  }
});




const capsuleStore = useCapsuleStore();
//setNavigateToDate是左键双击使用的日期, setPendingCreateDate是右键单击使用的日期
const { setNavigateToDate, setPendingCreateDate } = useCalendarAction();

//如果时区变了就改变timerManager的时区
watch(()=>props.localeStore.timeZone,(newTz)=>{
  props.timeManager.setTimeZone(newTz);
  refreshCalendar();
});


const wheelLocked = ref<boolean>(false);
// 记录最后一次滚轮的方向：1 = 往前（下个月/朝未来），-1 = 往后（上个月/朝过去）
// 翻月后高亮落在网格角落时要用它来决定是左上角还是右下角
const lastScrollDir = ref<1 | -1>(1);


const 今天几号 = ref<number>(props.timeManager.get今天几号());
/*const 当月天数 = ref<number>(timeManager.get当月天数());*/
const 当月天数 = computed(() => props.timeManager.get此月天数ByYM(props.displayYear, props.displayMonth));
/*const 上月天数 = ref<number>(timeManager.get上月天数());*/
const 上月天数 = computed(() => props.timeManager.get此月天数ByYM(props.displayYear, props.displayMonth - 1));
//当天曜日、月末曜日未使用，但是暂时保留
const 当天曜日 = ref<number>(props.timeManager.get当天曜日());
/*const 月初曜日 = ref<number>(timeManager.get月初曜日());*/
const 月初曜日 = computed(() => props.timeManager.get曜日ByYMD(props.displayYear, props.displayMonth, 1));
/*const 月末曜日 = ref<number>(timeManager.get月末曜日());*/
const 月末曜日 = computed(
    () => props.timeManager.get曜日ByYMD(props.displayYear, props.displayMonth + 1, 0)
);

function refreshCalendar(){
  props.timeManager.update();
  今天几号.value = props.timeManager.get今天几号();
  /*当月天数.value = timeManager.get当月天数();
  上月天数.value = timeManager.get上月天数();*/
  当天曜日.value = props.timeManager.get当天曜日();
  /*月初曜日.value = timeManager.get月初曜日();
  月末曜日.value = timeManager.get月末曜日();*/
  if([27, 28, 29, 30, 31, 1, 2].includes(今天几号.value))
  {
    nextTick(()=>{
      setCalendarHeight();
    });
  }
}


// 格子点击事件：单击高亮、双击跳转到双栏、右键弹创建弹窗
// 使用原生 @click / @dblclick / @contextmenu 区分，无防抖延迟
const selectedMonth = ref<number>(props.displayMonth);
const selectedDay = ref<number>(今天几号.value);


// 根据点击的格子和是否为其他月，算出标准的 YYYY-MM-DD 字符串
function computeDate(whatDay: number, whatMonth: number): string {
  /*const { year, month } = timeManager.getFormatted();*/
  const year = props.displayYear;
  const month = props.displayMonth;
  const actualMonth = whatMonth;
  let targetYear = 1970, targetMonth = 0;
  if (actualMonth > 11) {
    targetYear = year + 1;
    targetMonth = 0;
  } else if (actualMonth < 0) {
    targetYear = year - 1;
    targetMonth = 11;
  } else {
    targetYear = year;
    targetMonth = actualMonth;
  }
  const day = String(whatDay).padStart(2, '0');
  const monthStr = String(targetMonth + 1).padStart(2, '0');
  return `${targetYear}-${monthStr}-${day}`;
}

// 单击 → 只更新选中日期的样式（高亮），不切换视图模式
function singleClick(whatDay: number, month: number) {
  selectedMonth.value = month;
  selectedDay.value = whatDay;
  capsuleStore.setDate(computeDate(whatDay, month));
}

// 双击 → 更新选中日期 + 通知 CapsuleShelf 切换到双栏并滚动到该日期
// 原生 dblclick 会先触发两次 singleClick，第二次 setDate 值相同时为 no-op
function doubleClick(whatDay: number, month: number) {
  selectedMonth.value = month;
  selectedDay.value = whatDay;
  const date = computeDate(whatDay, month);
  capsuleStore.setDate(date);
  setNavigateToDate(date);
}

// 右键 → 弹出创建弹窗并预填日期
function handleRightClick(whatDay: number, month: number, event: MouseEvent) {
  event.preventDefault();
  setPendingCreateDate(computeDate(whatDay,month));
}


const emit = defineEmits<{ wheel: [direction: number] }>();
function onWheel(e: WheelEvent) {
  e.preventDefault();
  if (wheelLocked.value) return;
  wheelLocked.value = true;
  // 记录本次滚动方向，给下面 watch(monthKey) 里的角落落点用
  lastScrollDir.value = e.deltaY > 0 ? 1 : -1;
  emit('wheel', lastScrollDir.value);
  setTimeout(() => { wheelLocked.value = false; }, 600);
  nextTick(() => setCalendarHeight());
}

// 当 displayYear 或 displayMonth 变化时，monthKey 的字面量会变，触发下面的 watch
const monthKey = computed(() => `${props.displayYear}-${props.displayMonth}`)

// ── 翻月后高亮自适应 ──
// 每次月份切换后检查 (selectedDay, selectedMonth) 是否落在新网格的可见区域内。
//   - 可见 → 保持原高亮不动
//   - 不可见 → 按滚动方向落在网格的最角落
watch(monthKey, () => {
  // 等 DOM 完成过渡，这样 月初曜日/当月天数 等 computed 已经指向新月份
  nextTick(() => {
    // ① 新网格的布局参数
    const 上月尾天数 = 月初曜日.value
    //    ↑ 本月1号是周几（0=周日…6=周六），也等于上月尾巴要显示几天
    const 下月头天数 = 6 - 月末曜日.value
    //    ↑ 下月头要显示几天。当月最后一天是周X，用 6 - X 就是需要补的下月天数
    const 上月总天数 = props.timeManager.get此月天数ByYM(props.displayYear, props.displayMonth - 1)
    //    ↑ 用来判断 selectedDay 是否落在上月尾的范围内

    // ② 检查当前高亮在三个区域中是否可见
    // 条件A：选的是上月、且网格有上月尾巴、且 day 在尾巴范围内
    const is选中上月尾某天 = selectedMonth.value === props.displayMonth - 1
      && 上月尾天数 > 0
      && selectedDay.value >= 上月总天数 - 上月尾天数 + 1
      && selectedDay.value <= 上月总天数

    // 条件B：选的就是本月（不管 day 是多少，只要 month 对上即可）
    const is选中当月某天 = selectedMonth.value === props.displayMonth

    // 条件C：选的是下月、且网格有下月头、且 day 在头部范围内
    const is下月头某天 = selectedMonth.value === props.displayMonth + 1
      && 下月头天数 > 0
      && selectedDay.value >= 1
      && selectedDay.value <= 下月头天数

    // 三种情况任一成立 → 高亮在网格里，不动它
    if (is选中上月尾某天 || is选中当月某天 || is下月头某天) return

    // ③ 不可见 → 按滚动方向把高亮落在网格最角落
    if (lastScrollDir.value > 0) {
      // 往前翻（未来）→ 左上角
      //   如果网格有上月尾巴，左上角就是尾巴的第一个格子（上月的某天）
      //   如果网格直接是本月1号开头，左上角就是本月1号
      selectedDay.value = 上月尾天数 === 0 ? 1 : 上月总天数 - 上月尾天数 + 1
      selectedMonth.value = 上月尾天数 === 0 ? props.displayMonth : props.displayMonth - 1
    } else {
      // 往后翻（过去）→ 右下角
      //   如果网格有下月头，右下角就是头部的最后一个格子（下月的某天）
      //   如果网格没有下月头，右下角就是本月的最后一天
      selectedDay.value = 下月头天数 === 0 ? 当月天数.value : 下月头天数
      selectedMonth.value = 下月头天数 === 0 ? props.displayMonth : props.displayMonth + 1
    }
    // 同步更新 store，让其他组件（CapsuleShelf 等）知道日期变了
    capsuleStore.setDate(computeDate(selectedDay.value, selectedMonth.value))
  })
})

const transitionDirection = ref<1 | -1>(1)
watch(() => props.monthOffset, (n, o) => {
  if (n !== o) transitionDirection.value = n > o ? 1 : -1
})
</script>

<template>
  <CalendarBodyTransition
    :direction="transitionDirection"
    @wheel="onWheel"
  >
    <div class="calendar-body" :key="monthKey">
      <Cell
          v-for="曜日 in 曜日缩写"
          :key="曜日"
          :blockSize="cellInlineSize + 'dvi'"
          :inlineSize=cellInlineSize
          class="曜日"
          :interactive=false
      >
        <span>{{ 曜日 }}</span>
      </Cell>
      <Cell
          v-for="day上月 in 月初曜日"
          :key="'prev-' + day上月"
          :blockSize="cellInlineSize + 'dvi'"
          :inlineSize=cellInlineSize
          class="lastMonthTail"
          :class="{
            'cell-blue':上月天数 - 月初曜日 + day上月 === selectedDay && selectedMonth === props.displayMonth - 1,
            'cell-gray':!(上月天数 - 月初曜日 + day上月 === selectedDay && selectedMonth === props.displayMonth - 1)
          }"
          @click="singleClick(上月天数 - 月初曜日 + day上月, props.displayMonth - 1)"
          @dblclick="doubleClick(上月天数 - 月初曜日 + day上月,props.displayMonth - 1)"
          @contextmenu="handleRightClick(上月天数 - 月初曜日 + day上月,props.displayMonth - 1, $event)"
      >
        <span>{{ 上月天数 - 月初曜日 + day上月 }}</span>
      </Cell>
      <Cell
          v-for="day此月 in 当月天数"
          :key="'curr-' + day此月"
          :blockSize="cellInlineSize + 'dvi'"
          :inlineSize=cellInlineSize
          class="thisMonth"
          :class="{
            'cell-blue': day此月 === selectedDay && selectedMonth === props.displayMonth,
            'cell-gray-with-shadow':
              (monthOffset === 0)
              &&
              (day此月 === 今天几号 && (selectedDay != 今天几号 || selectedMonth != props.displayMonth)),
          }"
          @click="singleClick(day此月,props.displayMonth)"
          @dblclick="doubleClick(day此月,props.displayMonth)"
          @contextmenu="handleRightClick(day此月,props.displayMonth, $event)"
      >
        <span>{{ day此月 }}</span>
      </Cell>
      <Cell
          v-for="day下月 in ((7 - (月初曜日 + 当月天数) % 7) % 7)"
          :key="'next-' + day下月"
          :blockSize="cellInlineSize + 'dvi'"
          :inlineSize="cellInlineSize"
          class="nextMonthHead"
          :class="{
            'cell-blue':day下月 === selectedDay && selectedMonth === props.displayMonth + 1,
            'cell-gray':!(day下月 === selectedDay && selectedMonth === props.displayMonth + 1)
          }"
          @click="singleClick(day下月,props.displayMonth + 1)"
          @dblclick="doubleClick(day下月,props.displayMonth + 1)"
          @contextmenu="handleRightClick(day下月,props.displayMonth + 1, $event)"
      >
        <span>{{ day下月 }}</span>
      </Cell>
    </div>
  </CalendarBodyTransition>
</template>

<style scoped>
.calendar-body{
  font-size: 1.25rem;
  /*margin-block: auto;*/
  flex: none;
  display: grid;
  place-content: center;
  /*place-items: center;*/
  grid-template-columns: repeat(7, 1fr);
  /*background-color: var(--calendar-cell-bg);*/
  /*这个是高度，由TS控制*/
  /*noinspection CssUnresolvedCustomProperty*/
  block-size: var(--this-month-height-in-dvi, auto);
  /*这个是宽度，和父容器一致*/
  inline-size: var(--full-inline-size);
  background: linear-gradient(155deg, rgba(255,255,255,0.01), transparent);

}
.cell-blue {
  background: linear-gradient(to bottom,
  color-mix(in srgb, var(--calendar-today-bg-start) 75%, transparent),
  color-mix(in srgb, var(--calendar-today-bg-mid) 75%, transparent),
  color-mix(in srgb, var(--calendar-today-bg-end) 75%, transparent));
  color: var(--calendar-today-text);
}
.cell-blue span {
  color: var(--calendar-today-text);
}
.cell-gray-with-shadow {
  background-color: var(--calendar-today-unselected-bg);
  /*box-shadow: inset 0 0 0.4rem 0.3rem var(--calendar-today-unselected-shadow);*/
  box-shadow:
      inset 0 0.1875rem 0.4rem 0.15rem rgba(0, 0, 0, 0.3),      /* 底部深阴影（重） */
      inset 0 -0.0625rem 0.15rem 0.05rem rgba(255, 255, 255, 0.05)!important;  /* 顶部微弱亮光（轻） */

  color: var(--calendar-today-unselected-text);
}
.cell-gray-with-shadow span {
  color: var(--calendar-today-unselected-text);
}
.cell-gray {
  background-color: var(--calendar-other-month-bg);
  color: var(--calendar-other-month-text);
}
.cell-gray span {
  color: var(--calendar-other-month-text);
}
</style>