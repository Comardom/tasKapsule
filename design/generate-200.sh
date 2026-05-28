#!/bin/zsh

API_URL="http://localhost:9999/api/v1/capsules"

samples=(
  "早上跑了五公里，配速终于进六分了，下个月目标半马。"
  "跟产品经理对齐了下个迭代的需求，排期有点紧，需要评估工作量。"
  "冰箱里的鸡蛋快过期了，今晚得做一顿蛋炒饭消灭掉。"
  "看到一篇讲 Go 内存管理的文章，逃逸分析那部分讲得特别好。"
  "收到了信用卡账单，这个月花了有点多，得控制一下消费。"
  "阳台的多肉植物长出了新芽，春天果然适合生长。"
  "下午三点跟后端联调用户权限接口，token 刷新逻辑要仔细测一遍。"
  "给老妈买了一个智能血压计，周末回去教她用。"
  "验证码：782034，您在登录 tasKapsule 管理后台，如非本人操作请忽略。"
  "灵感：在日历上直接用拖拽来调整日程时间，交互会更直观。"
  "猫又吐毛球了，得买点化毛膏，顺便约一下这周末的体检。"
  "重构通知模块的时候发现消息队列有潜在的死信问题，需要加重试机制。"
  "今天下班路过花店，买了一束洋桔梗，放在书桌上心情很好。"
  "老板说下季度要启动数据迁移项目，让我先出一个技术方案。"
  "晚上做了一个很清晰的梦，梦里把一直卡着的 Bug 修好了，醒来试试真的可行。"
  "紧急通知：线上服务器 SSL 证书将在三天后到期，请立即安排续期！"
  "看了《设计数据密集型应用》第三章，关于分布式存储的讨论启发很大。"
  "周末打算去爬山，查了一下天气，周六多云，适合户外。"
  "需要给车做保养了，里程数已经超了五百公里，这周末得去 4S 店。"
  "租房合同月底到期，中介说房东要卖房，得开始找新的房子了。"
  "新来的实习生提交的 PR 代码质量不错，就是测试覆盖率偏低，让他补一下。"
  "灵感：胶囊详情页可以加一个时间线视图，把修改历史可视化出来。"
  "京东买的书到了，一共五本，够看一个月的了。"
  "牙齿有点敏感，约了周三去看牙医，希望不用根管治疗。"
  "连续加了一周的班，今天终于把性能优化搞定了，QPS 提升了三倍。"
  "端午节的火车票开售了，抢到了回老家的票，开心。"
  "代码审查时发现了一个隐藏很深的并发安全问题，幸亏发版前发现了。"
  "下午要去街道办事处办居住证续期，记得带上身份证和租房合同。"
  "这次大版本升级涉及数据库 schema 变更，需要准备回滚方案。"
  "下雨天最适合窝在家里写代码，放点轻音乐，效率极高。"
)

classifications=(note urgent favourite sms inspiration)
statuses=(pending executing completed cancelled blocked)

BASE_TS=$(date -d "2026-03-01" +%s)
total=200
count=0

echo "🚀 开始生成 $total 条测试胶囊..."

for i in {1..$total}; do
  text_idx=$(( (i - 1) % ${#samples[@]} + 1 ))
  content_text="${samples[$text_idx]} [#$i]"

  cat_idx=$(( (i - 1) % ${#classifications[@]} + 1 ))
  classification="${classifications[$cat_idx]}"

  if (( RANDOM % 10 < 4 )); then
    # ── 有日程 ──
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
    # ── 无日程 ──
    extra_fields=""
    if (( RANDOM % 10 == 0 )); then
      extra_fields=', "audioPath": "/recordings/sample-'$i'.m4a", "attachmentPaths": "[\"/files/note-'$i'.pdf\"]"'
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

echo "🎉 完成！共写入 $count 条胶囊。"
