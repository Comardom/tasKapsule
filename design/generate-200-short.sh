#!/bin/zsh

API_URL="http://localhost:9999/api/v1/capsules"

samples=(
  "买牛奶和鸡蛋"
  "3点开会"
  "交水电费"
  "取快递"
  "回复邮件"
  "练琴一小时"
  "洗衣服"
  "给花浇水"
  "记读书笔记"
  "跑步三公里"
  "充话费"
  "清理收件箱"
  "做午饭"
  "写周报"
  "修 Bug"
  "看牙医"
  "回老家"
  "寄文件"
  "倒垃圾"
  "抄经"
  "补日记"
  "剪头发"
  "换床单"
  "存发票"
  "整理书架"
  "洗碗"
  "量体温"
  "发版检查"
  "约教练"
  "喂猫"
)

classifications=(note urgent favourite sms inspiration)
statuses=(pending executing completed cancelled blocked)

BASE_TS=$(date -d "2026-03-01" +%s)
total=200
count=0

echo "🚀 开始生成 $total 条短文本胶囊..."

for i in {1..$total}; do
  text_idx=$(( (i - 1) % ${#samples[@]} + 1 ))
  content_text="${samples[$text_idx]} [#$i]"

  cat_idx=$(( (i - 1) % ${#classifications[@]} + 1 ))
  classification="${classifications[$cat_idx]}"

  if (( RANDOM % 10 < 4 )); then
    days_offset=$(( RANDOM % 153 ))
    hour=$(( RANDOM % 24 ))
    minute=$(( RANDOM % 60 ))
    start_ts=$(( BASE_TS + days_offset * 86400 + hour * 3600 + minute * 60 ))
    start_date=$(date -d "@$start_ts" +"%Y-%m-%d %H:%M:%S")

    if (( RANDOM % 10 < 2 )); then
      span_days=$(( RANDOM % 4 + 2 ))
      end_ts=$(( start_ts + span_days * 86400 ))
    else
      span_hours=$(( RANDOM % 48 + 1 ))
      end_ts=$(( start_ts + span_hours * 3600 ))
    fi
    end_date=$(date -d "@$end_ts" +"%Y-%m-%d %H:%M:%S")

    status_idx=$(( RANDOM % ${#statuses[@]} + 1 ))
    sched_status="${statuses[$status_idx]}"

    extra_fields=""
    if (( RANDOM % 10 == 0 )); then
      dl_ts=$(( start_ts - RANDOM % 86400 ))
      deadline=$(date -d "@$dl_ts" +"%Y-%m-%d %H:%M:%S")
      extra_fields=', "scheduleIcon": "📅", "scheduleDeadline": "'$deadline'"'
    fi

    json='{"contentText":"'$content_text'","classification":"'$classification'","isWithSchedule":1,"scheduleStartAt":"'$start_date'","scheduleEndAt":"'$end_date'","scheduleStatus":"'$sched_status'"'$extra_fields'}'
  else
    extra_fields=""
    if (( RANDOM % 10 == 0 )); then
      extra_fields=', "audioPath": "/recordings/short-'$i'.m4a", "attachmentPaths": "[\"/files/short-'$i'.pdf\"]"'
    fi
    if (( RANDOM % 20 == 0 )); then
      extra_fields=$extra_fields', "alarmClocks": "[{\"time\":\"09:00\",\"type\":\"oneShot\"}]"'
    fi

    json='{"contentText":"'$content_text'","classification":"'$classification'","isWithSchedule":0'$extra_fields'}'
  fi

  curl -s -X POST "$API_URL" \
    -H "Content-Type: application/json; charset=utf-8" \
    -d "$json" > /dev/null 2>&1

  count=$((count + 1))
  if (( count % 20 == 0 )); then
    echo "📦 $count / $total"
  fi
done

echo "🎉 完成！共写入 $count 条短文本胶囊。"
