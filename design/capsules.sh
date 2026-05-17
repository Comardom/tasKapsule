$ cat << 'SCRIPT'
#!/bin/bash
API="http://localhost:9999/api/v1/capsules"
echo "正在插入胶囊数据..."
# ─── 无日程的笔记 ───
curl -s -X POST "$API" -H 'Content-Type: application/json' \
  -d '{"contentText":"去超市买牛奶和面包","classification":"note","isWithSchedule":0}' > /dev/null
curl -s -X POST "$API" -H 'Content-Type: application/json' \
  -d '{"contentText":"今天天气真好，适合出去走走","classification":"note","isWithSchedule":0}' > /dev/null
curl -s -X POST "$API" -H 'Content-Type: application/json' \
  -d '{"contentText":"刷到了一个新的 Go 视频","classification":"note","isWithSchedule":0}' > /dev/null
curl -s -X POST "$API" -H 'Content-Type: application/json' \
  -d '{"contentText":"房东说下个月要涨房租了","classification":"urgent","isWithSchedule":0}' > /dev/null
curl -s -X POST "$API" -H 'Content-Type: application/json' \
  -d '{"contentText":"一首很好听的歌，歌名叫海阔天空","classification":"sms","isWithSchedule":0}' > /dev/null
curl -s -X POST "$API" -H 'Content-Type: application/json' \
  -d '{"contentText":"用 Go 写一个 CLI 工具来管理日常任务","classification":"inspiration","isWithSchedule":0}' > /dev/null
# ─── 有日程的单日胶囊 ───
curl -s -X POST "$API" -H 'Content-Type: application/json' \
  -d '{"contentText":"去看牙医","classification":"urgent","isWithSchedule":1,"scheduleStartAt":"2026-05-19 09:30","scheduleEndAt":"2026-05-19 11:00","scheduleStatus":"pending"}' > /dev/null
curl -s -X POST "$API" -H 'Content-Type: application/json' \
  -d '{"contentText":"跟朋友吃午饭","classification":"note","isWithSchedule":1,"scheduleStartAt":"2026-05-19 12:00","scheduleEndAt":"2026-05-19 13:30","scheduleStatus":"pending"}' > /dev/null
curl -s -X POST "$API" -H 'Content-Type: application/json' \
  -d '{"contentText":"写周报","classification":"note","isWithSchedule":1,"scheduleStartAt":"2026-05-19 16:00","scheduleEndAt":"2026-05-19 17:00","scheduleStatus":"pending"}' > /dev/null
curl -s -X POST "$API" -H 'Content-Type: application/json' \
  -d '{"contentText":"开组会","classification":"note","isWithSchedule":1,"scheduleStartAt":"2026-05-20 10:00","scheduleEndAt":"2026-05-20 11:30","scheduleStatus":"pending"}' > /dev/null
curl -s -X POST "$API" -H 'Content-Type: application/json' \
  -d '{"contentText":"下午去健身","classification":"note","isWithSchedule":1,"scheduleStartAt":"2026-05-20 15:00","scheduleEndAt":"2026-05-20 16:30","scheduleStatus":"pending"}' > /dev/null
# ─── 已完成和已取消 ───
curl -s -X POST "$API" -H 'Content-Type: application/json' \
  -d '{"contentText":"完成数据库设计文档","classification":"note","isWithSchedule":1,"scheduleStartAt":"2026-05-14 09:00","scheduleEndAt":"2026-05-14 12:00","scheduleStatus":"completed"}' > /dev/null
curl -s -X POST "$API" -H 'Content-Type: application/json' \
  -d '{"contentText":"买生日礼物","classification":"favourite","isWithSchedule":1,"scheduleStartAt":"2026-05-14 14:00","scheduleEndAt":"2026-05-14 15:00","scheduleStatus":"cancelled"}' > /dev/null
curl -s -X POST "$API" -H 'Content-Type: application/json' \
  -d '{"contentText":"去交房租","classification":"urgent","isWithSchedule":1,"scheduleStartAt":"2026-05-15 10:00","scheduleEndAt":"2026-05-15 10:30","scheduleStatus":"completed"}' > /dev/null
# ─── 跨多天的日程（测试四种 displayMode） ───
curl -s -X POST "$API" -H 'Content-Type: application/json' \
  -d '{"contentText":"上海出差","classification":"note","isWithSchedule":1,"scheduleStartAt":"2026-05-18 08:00","scheduleEndAt":"2026-05-21 18:00","scheduleStatus":"pending"}' > /dev/null
curl -s -X POST "$API" -H 'Content-Type: application/json' \
  -d '{"contentText":"全家旅游","classification":"favourite","isWithSchedule":1,"scheduleStartAt":"2026-05-22 06:00","scheduleEndAt":"2026-05-25 22:00","scheduleStatus":"pending"}' > /dev/null
curl -s -X POST "$API" -H 'Content-Type: application/json' \
  -d '{"contentText":"搬家","classification":"urgent","isWithSchedule":1,"scheduleStartAt":"2026-05-28 08:00","scheduleEndAt":"2026-05-30 20:00","scheduleStatus":"pending"}' > /dev/null
# ─── 老数据（测试 createdAt 时间线定位） ───
curl -s -X POST "$API" -H 'Content-Type: application/json' \
  -d '{"contentText":"4 月底买的新书到了","classification":"note","isWithSchedule":0}' > /dev/null
curl -s -X POST "$API" -H 'Content-Type: application/json' \
  -d '{"contentText":"五一去哪玩呢","classification":"note","isWithSchedule":0}' > /dev/null
curl -s -X POST "$API" -H 'Content-Type: application/json' \
  -d '{"contentText":"记得还图书馆的书","classification":"note","isWithSchedule":1,"scheduleStartAt":"2026-05-05 10:00","scheduleEndAt":"2026-05-05 10:15","scheduleStatus":"completed"}' > /dev/null
echo "✅ 插入完成！共 20 条。"
SCRIPT
#!/bin/bash
API="http://localhost:9999/api/v1/capsules"
echo "正在插入胶囊数据..."
# ─── 无日程的笔记 ───
curl -s -X POST "$API" -H 'Content-Type: application/json' \
  -d '{"contentText":"去超市买牛奶和面包","classification":"note","isWithSchedule":0}' > /dev/null
curl -s -X POST "$API" -H 'Content-Type: application/json' \
  -d '{"contentText":"今天天气真好，适合出去走走","classification":"note","isWithSchedule":0}' > /dev/null
curl -s -X POST "$API" -H 'Content-Type: application/json' \
  -d '{"contentText":"刷到了一个新的 Go 视频","classification":"note","isWithSchedule":0}' > /dev/null
curl -s -X POST "$API" -H 'Content-Type: application/json' \
  -d '{"contentText":"房东说下个月要涨房租了","classification":"urgent","isWithSchedule":0}' > /dev/null
curl -s -X POST "$API" -H 'Content-Type: application/json' \
  -d '{"contentText":"一首很好听的歌，歌名叫海阔天空","classification":"sms","isWithSchedule":0}' > /dev/null
curl -s -X POST "$API" -H 'Content-Type: application/json' \
  -d '{"contentText":"用 Go 写一个 CLI 工具来管理日常任务","classification":"inspiration","isWithSchedule":0}' > /dev/null
# ─── 有日程的单日胶囊 ───
curl -s -X POST "$API" -H 'Content-Type: application/json' \
  -d '{"contentText":"去看牙医","classification":"urgent","isWithSchedule":1,"scheduleStartAt":"2026-05-19 09:30","scheduleEndAt":"2026-05-19 11:00","scheduleStatus":"pending"}' > /dev/null
curl -s -X POST "$API" -H 'Content-Type: application/json' \
  -d '{"contentText":"跟朋友吃午饭","classification":"note","isWithSchedule":1,"scheduleStartAt":"2026-05-19 12:00","scheduleEndAt":"2026-05-19 13:30","scheduleStatus":"pending"}' > /dev/null
curl -s -X POST "$API" -H 'Content-Type: application/json' \
  -d '{"contentText":"写周报","classification":"note","isWithSchedule":1,"scheduleStartAt":"2026-05-19 16:00","scheduleEndAt":"2026-05-19 17:00","scheduleStatus":"pending"}' > /dev/null
curl -s -X POST "$API" -H 'Content-Type: application/json' \
  -d '{"contentText":"开组会","classification":"note","isWithSchedule":1,"scheduleStartAt":"2026-05-20 10:00","scheduleEndAt":"2026-05-20 11:30","scheduleStatus":"pending"}' > /dev/null
curl -s -X POST "$API" -H 'Content-Type: application/json' \
  -d '{"contentText":"下午去健身","classification":"note","isWithSchedule":1,"scheduleStartAt":"2026-05-20 15:00","scheduleEndAt":"2026-05-20 16:30","scheduleStatus":"pending"}' > /dev/null
# ─── 已完成和已取消 ───
curl -s -X POST "$API" -H 'Content-Type: application/json' \
  -d '{"contentText":"完成数据库设计文档","classification":"note","isWithSchedule":1,"scheduleStartAt":"2026-05-14 09:00","scheduleEndAt":"2026-05-14 12:00","scheduleStatus":"completed"}' > /dev/null
curl -s -X POST "$API" -H 'Content-Type: application/json' \
  -d '{"contentText":"买生日礼物","classification":"favourite","isWithSchedule":1,"scheduleStartAt":"2026-05-14 14:00","scheduleEndAt":"2026-05-14 15:00","scheduleStatus":"cancelled"}' > /dev/null
curl -s -X POST "$API" -H 'Content-Type: application/json' \
  -d '{"contentText":"去交房租","classification":"urgent","isWithSchedule":1,"scheduleStartAt":"2026-05-15 10:00","scheduleEndAt":"2026-05-15 10:30","scheduleStatus":"completed"}' > /dev/null
# ─── 跨多天的日程（测试四种 displayMode） ───
curl -s -X POST "$API" -H 'Content-Type: application/json' \
  -d '{"contentText":"上海出差","classification":"note","isWithSchedule":1,"scheduleStartAt":"2026-05-18 08:00","scheduleEndAt":"2026-05-21 18:00","scheduleStatus":"pending"}' > /dev/null
curl -s -X POST "$API" -H 'Content-Type: application/json' \
  -d '{"contentText":"全家旅游","classification":"favourite","isWithSchedule":1,"scheduleStartAt":"2026-05-22 06:00","scheduleEndAt":"2026-05-25 22:00","scheduleStatus":"pending"}' > /dev/null
curl -s -X POST "$API" -H 'Content-Type: application/json' \
  -d '{"contentText":"搬家","classification":"urgent","isWithSchedule":1,"scheduleStartAt":"2026-05-28 08:00","scheduleEndAt":"2026-05-30 20:00","scheduleStatus":"pending"}' > /dev/null
# ─── 老数据（测试 createdAt 时间线定位） ───
curl -s -X POST "$API" -H 'Content-Type: application/json' \
  -d '{"contentText":"4 月底买的新书到了","classification":"note","isWithSchedule":0}' > /dev/null
curl -s -X POST "$API" -H 'Content-Type: application/json' \
  -d '{"contentText":"五一去哪玩呢","classification":"note","isWithSchedule":0}' > /dev/null
curl -s -X POST "$API" -H 'Content-Type: application/json' \
  -d '{"contentText":"记得还图书馆的书","classification":"note","isWithSchedule":1,"scheduleStartAt":"2026-05-05 10:00","scheduleEndAt":"2026-05-05 10:15","scheduleStatus":"completed"}' > /dev/null
echo "✅ 插入完成！共 20 条。"
