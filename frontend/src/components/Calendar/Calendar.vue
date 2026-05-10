<script setup lang="ts">
import {computed, nextTick, onMounted, onUnmounted, ref, watch} from "vue";
import {Zh曜日,Jp曜日,En曜日} from "@/components/Calendar/nameOfDaysOfWeek.ts";
import Cell from "@/components/Calendar/Cell.vue";




import {TimeManager} from '@/utils/TimeManager.ts'
import useLocaleStore from "@/stores/locale.ts";
const localeStore = useLocaleStore();


const timeManager = new TimeManager(localeStore.timeZone);

const 今天几号 = ref<number>(timeManager.get今天几号());

const 当月天数 = ref<number>(timeManager.get当月天数());
const 上月天数 = ref<number>(timeManager.get上月天数());

const 当天曜日 = ref<number>(timeManager.get当天曜日());
const 月初曜日 = ref<number>(timeManager.get月初曜日());
const 月末曜日 = ref<number>(timeManager.get月末曜日());

function refreshCalendar(){
  timeManager.update();
  今天几号.value = timeManager.get今天几号();
  当月天数.value = timeManager.get当月天数();
  上月天数.value = timeManager.get上月天数();
  当天曜日.value = timeManager.get当天曜日();
  月初曜日.value = timeManager.get月初曜日();
  月末曜日.value = timeManager.get月末曜日();
  if([27, 28, 29, 30, 31, 1, 2].includes(今天几号.value))
  {
    nextTick(()=>{
      setCalendarHeight();
    });
  }
}
//每分钟刷新一下时间
const timer = setInterval(refreshCalendar, 60_000);

const 总行数 = computed(() => {
  const 前置天数 = 月初曜日.value; // 需要显示的上月天数
  const 后置天数 = (7 - (前置天数 + 当月天数.value) % 7) % 7; // 需要显示的下月天数
  return (前置天数 + 当月天数.value + 后置天数) / 7 + 1;
});


const 曜日缩写 = computed(() => {
  switch (localeStore.locale)
  {
    case 'ja':  return Jp曜日;
    case 'zh':  return Zh曜日;
    default:    return En曜日;
  }
})
//如果时区变了就改变timerManager的时区
watch(()=>localeStore.timeZone,(newTz)=>{
  timeManager.setTimeZone(newTz);
  refreshCalendar();
});

const setCalendarHeight = () => {
  const calendarBodyEl = document.querySelector('.calendar-body') as HTMLElement;
  if (calendarBodyEl && cellInlineSize.value) {
    const calendarHeightInDvi = cellInlineSize.value * 总行数.value;
    calendarBodyEl.style.setProperty('--this-month-height-in-dvi', `${calendarHeightInDvi}dvi`);
  }
};

//这里是在计算日历横向除以七的宽度，好分配给每一周，这个仅仅是数字！！！这个7是随便预设的，就当是不存在
const cellInlineSize = ref<number>(7);
onMounted(() => {
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
});
//计时器需要卸载
onUnmounted(() => {
  clearInterval(timer);
})

const timeZoneOptions = ref([
  // 亚洲 (Asia)
  { label: '上海 (Shanghai)', value: 'Asia/Shanghai' },
  { label: '北京 (Beijing)', value: 'Asia/Shanghai' },
  { label: '重庆 (Chongqing)', value: 'Asia/Chongqing' },
  { label: '哈尔滨 (Harbin)', value: 'Asia/Harbin' },
  { label: '香港 (Hong Kong)', value: 'Asia/Hong_Kong' },
  { label: '台北 (Taipei)', value: 'Asia/Taipei' },
  { label: '澳门 (Macau)', value: 'Asia/Macau' },
  { label: '东京 (Tokyo)', value: 'Asia/Tokyo' },
  { label: '首尔 (Seoul)', value: 'Asia/Seoul' },
  { label: '新加坡 (Singapore)', value: 'Asia/Singapore' },
  { label: '曼谷 (Bangkok)', value: 'Asia/Bangkok' },
  { label: '雅加达 (Jakarta)', value: 'Asia/Jakarta' },
  { label: '德里 (Delhi)', value: 'Asia/Kolkata' },
  { label: '孟买 (Mumbai)', value: 'Asia/Kolkata' },
  { label: '迪拜 (Dubai)', value: 'Asia/Dubai' },
  { label: '利雅得 (Riyadh)', value: 'Asia/Riyadh' },
  { label: '多哈 (Doha)', value: 'Asia/Qatar' },
  { label: '巴格达 (Baghdad)', value: 'Asia/Baghdad' },
  { label: '德黑兰 (Tehran)', value: 'Asia/Tehran' },
  { label: '喀布尔 (Kabul)', value: 'Asia/Kabul' },
  { label: '卡拉奇 (Karachi)', value: 'Asia/Karachi' },
  { label: '达卡 (Dhaka)', value: 'Asia/Dhaka' },
  { label: '仰光 (Yangon)', value: 'Asia/Yangon' },
  { label: '阿拉木图 (Almaty)', value: 'Asia/Almaty' },
  { label: '乌鲁木齐 (Urumqi)', value: 'Asia/Urumqi' },
  { label: '耶路撒冷 (Jerusalem)', value: 'Asia/Jerusalem' },

  // 欧洲 (Europe)
  { label: '伦敦 (London)', value: 'Europe/London' },
  { label: '巴黎 (Paris)', value: 'Europe/Paris' },
  { label: '柏林 (Berlin)', value: 'Europe/Berlin' },
  { label: '罗马 (Rome)', value: 'Europe/Rome' },
  { label: '马德里 (Madrid)', value: 'Europe/Madrid' },
  { label: '阿姆斯特丹 (Amsterdam)', value: 'Europe/Amsterdam' },
  { label: '布鲁塞尔 (Brussels)', value: 'Europe/Brussels' },
  { label: '苏黎世 (Zurich)', value: 'Europe/Zurich' },
  { label: '维也纳 (Vienna)', value: 'Europe/Vienna' },
  { label: '布拉格 (Prague)', value: 'Europe/Prague' },
  { label: '华沙 (Warsaw)', value: 'Europe/Warsaw' },
  { label: '布达佩斯 (Budapest)', value: 'Europe/Budapest' },
  { label: '莫斯科 (Moscow)', value: 'Europe/Moscow' },
  { label: '圣彼得堡 (St Petersburg)', value: 'Europe/Moscow' },
  { label: '伊斯坦布尔 (Istanbul)', value: 'Europe/Istanbul' },
  { label: '基辅 (Kyiv)', value: 'Europe/Kyiv' },
  { label: '赫尔辛基 (Helsinki)', value: 'Europe/Helsinki' },
  { label: '斯德哥尔摩 (Stockholm)', value: 'Europe/Stockholm' },
  { label: '哥本哈根 (Copenhagen)', value: 'Europe/Copenhagen' },
  { label: '奥斯陆 (Oslo)', value: 'Europe/Oslo' },
  { label: '雷克雅未克 (Reykjavik)', value: 'Atlantic/Reykjavik' },

  // 北美洲 (North America)
  { label: '纽约 (New York)', value: 'America/New_York' },
  { label: '洛杉矶 (Los Angeles)', value: 'America/Los_Angeles' },
  { label: '芝加哥 (Chicago)', value: 'America/Chicago' },
  { label: '丹佛 (Denver)', value: 'America/Denver' },
  { label: '凤凰城 (Phoenix)', value: 'America/Phoenix' },
  { label: '安克雷奇 (Anchorage)', value: 'America/Anchorage' },
  { label: '火奴鲁鲁 (Honolulu)', value: 'Pacific/Honolulu' },
  { label: '多伦多 (Toronto)', value: 'America/Toronto' },
  { label: '温哥华 (Vancouver)', value: 'America/Vancouver' },
  { label: '蒙特利尔 (Montreal)', value: 'America/Montreal' },
  { label: '墨西哥城 (Mexico City)', value: 'America/Mexico_City' },
  { label: '哈瓦那 (Havana)', value: 'America/Havana' },

  // 南美洲 (South America)
  { label: '圣保罗 (Sao Paulo)', value: 'America/Sao_Paulo' },
  { label: '里约热内卢 (Rio de Janeiro)', value: 'America/Sao_Paulo' },
  { label: '布宜诺斯艾利斯 (Buenos Aires)', value: 'America/Argentina/Buenos_Aires' },
  { label: '圣地亚哥 (Santiago)', value: 'America/Santiago' },
  { label: '利马 (Lima)', value: 'America/Lima' },
  { label: '波哥大 (Bogota)', value: 'America/Bogota' },
  { label: '加拉加斯 (Caracas)', value: 'America/Caracas' },

  // 非洲 (Africa)
  { label: '开罗 (Cairo)', value: 'Africa/Cairo' },
  { label: '开普敦 (Cape Town)', value: 'Africa/Johannesburg' },
  { label: '约翰内斯堡 (Johannesburg)', value: 'Africa/Johannesburg' },
  { label: '拉各斯 (Lagos)', value: 'Africa/Lagos' },
  { label: '内罗毕 (Nairobi)', value: 'Africa/Nairobi' },
  { label: '卡萨布兰卡 (Casablanca)', value: 'Africa/Casablanca' },
  { label: '阿尔及尔 (Algiers)', value: 'Africa/Algiers' },

  // 澳洲 (Australia & Pacific)
  { label: '悉尼 (Sydney)', value: 'Australia/Sydney' },
  { label: '墨尔本 (Melbourne)', value: 'Australia/Melbourne' },
  { label: '布里斯班 (Brisbane)', value: 'Australia/Brisbane' },
  { label: '珀斯 (Perth)', value: 'Australia/Perth' },
  { label: '阿德莱德 (Adelaide)', value: 'Australia/Adelaide' },
  { label: '霍巴特 (Hobart)', value: 'Australia/Hobart' },
  { label: '奥克兰 (Auckland)', value: 'Pacific/Auckland' },
  { label: '惠灵顿 (Wellington)', value: 'Pacific/Auckland' },
  { label: '斐济 (Fiji)', value: 'Pacific/Fiji' },

  // UTC 标准时区
  { label: 'UTC (协调世界时)', value: 'UTC' },
  { label: 'GMT (格林威治时间)', value: 'GMT' },

  // 特殊常用时区偏移
  { label: 'UTC-12:00 (国际日期变更线西)', value: 'Etc/GMT+12' },
  { label: 'UTC-11:00 (中途岛)', value: 'Pacific/Midway' },
  { label: 'UTC-10:00 (夏威夷)', value: 'Pacific/Honolulu' },
  { label: 'UTC-09:00 (阿拉斯加)', value: 'America/Anchorage' },
  { label: 'UTC-08:00 (太平洋时间)', value: 'America/Los_Angeles' },
  { label: 'UTC-07:00 (山地时间)', value: 'America/Denver' },
  { label: 'UTC-06:00 (中部时间)', value: 'America/Chicago' },
  { label: 'UTC-05:00 (东部时间)', value: 'America/New_York' },
  { label: 'UTC-04:00 (大西洋时间)', value: 'America/Halifax' },
  { label: 'UTC-03:00 (巴西利亚)', value: 'America/Sao_Paulo' },
  { label: 'UTC-02:00 (中大西洋)', value: 'Atlantic/South_Georgia' },
  { label: 'UTC-01:00 (亚速尔群岛)', value: 'Atlantic/Azores' },
  { label: 'UTC+00:00 (伦敦)', value: 'Europe/London' },
  { label: 'UTC+01:00 (巴黎/柏林)', value: 'Europe/Paris' },
  { label: 'UTC+02:00 (雅典/开罗)', value: 'Europe/Athens' },
  { label: 'UTC+03:00 (莫斯科)', value: 'Europe/Moscow' },
  { label: 'UTC+04:00 (迪拜)', value: 'Asia/Dubai' },
  { label: 'UTC+05:00 (卡拉奇)', value: 'Asia/Karachi' },
  { label: 'UTC+05:30 (孟买)', value: 'Asia/Kolkata' },
  { label: 'UTC+06:00 (达卡)', value: 'Asia/Dhaka' },
  { label: 'UTC+07:00 (曼谷)', value: 'Asia/Bangkok' },
  { label: 'UTC+08:00 (北京/上海)', value: 'Asia/Shanghai' },
  { label: 'UTC+09:00 (东京)', value: 'Asia/Tokyo' },
  { label: 'UTC+10:00 (悉尼)', value: 'Australia/Sydney' },
  { label: 'UTC+11:00 (所罗门群岛)', value: 'Pacific/Guadalcanal' },
  { label: 'UTC+12:00 (奥克兰)', value: 'Pacific/Auckland' }
]);
</script>

<template>
  <div class="calendar">
    <div class="calendar-header">
      <div class="clock">

      </div>
      <select
          v-model="localeStore.timeZone"
      >
        <option
            v-for="item in timeZoneOptions"
            :key="item.value"
            :value="item.value"
        >
          {{ item.label }}
        </option>
      </select>
      <select v-model="localeStore.locale">
        <option value="zh">中文</option>
        <option value="ja">日本語</option>
        <option value="en">English</option>
      </select>
    </div>

    <div class="calendar-body">
      <Cell
          v-for="曜日 in 曜日缩写"
          :key="曜日"
          :blockSize="cellInlineSize + 'dvi'"
          :inlineSize=cellInlineSize
          class="曜日"
      >
        <span>{{ 曜日 }}</span>
      </Cell>
      <Cell
          v-for="day上月 in 月初曜日"
          :key="day上月"
          :blockSize="cellInlineSize + 'dvi'"
          :inlineSize=cellInlineSize
          class="lastMonthTail"
      >
        <span>{{ 上月天数 - 月初曜日 + day上月 }}</span>
      </Cell>
      <Cell
          v-for="day此月 in 当月天数"
          :key="day此月"
          :blockSize="cellInlineSize + 'dvi'"
          :inlineSize=cellInlineSize
          class="thisMonth"
          :class="{today: day此月 === 今天几号}"
      >
        <span>{{ day此月 }}</span>
      </Cell>
      <Cell
          v-for="day下月 in ((7 - (月初曜日 + 当月天数) % 7) % 7)"
          :key="day下月"
          :blockSize="cellInlineSize + 'dvi'"
          :inlineSize="cellInlineSize"
          class="nextMonthHead"
      >
        <span>{{ day下月 }}</span>
      </Cell>
    </div>

    <div class="calendar-tail">

    </div>
  </div>
</template>

<style scoped>
.calendar{
  --full-block-size : 85dvb;
  --full-inline-size : 35dvi;
  display: flex;
  flex-direction: column;
  /*justify-content: center;*/
  align-items: center;
  /*这个是高度*/
  block-size: var(--full-block-size);
  /*这个是宽度*/
  inline-size: var(--full-inline-size);
  background-color: var(--theme-color);
  box-shadow: 0 0.125rem 0.5rem rgba(0, 0, 0, 0.08);
}
.calendar-header{
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  /*这个是高度*/
  block-size: 7dvb;
  /*这个是宽度，和父容器一致*/
  inline-size: var(--full-inline-size);
}
.calendar-body{
  display: grid;
  place-content: center;
  place-items: center;
  grid-template-columns: repeat(7, 1fr);
  background-color: var(--selection-bg);
  /*这个是高度，由TS控制*/
  /*noinspection CssUnresolvedCustomProperty*/
  block-size: var(--this-month-height-in-dvi);
  /*这个是宽度，和父容器一致*/
  inline-size: var(--full-inline-size);
}
.calendar-tail{
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  /*这个是高度*/
  /*min-block-size: 15dvb;*/
  /*这个是宽度，和父容器一致*/
  inline-size: var(--full-inline-size);
}
.today{
  background-color: var(--theme-link);
  color: var(--theme-color);
}
</style>