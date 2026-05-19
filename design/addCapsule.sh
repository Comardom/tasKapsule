#!/bin/bash

# 配置后端 API 地址
API_URL="http://localhost:9999/api/v1/capsules"

# 基础测试文本库
sample_texts=(
    "去超市买纯牛奶、全麦面包，顺便看看有没有新鲜的三文鱼切片。"
    "下午三点和架构师对齐下一阶段大屏组件的核心重构方案，重点讨论流式自适应排版遗留的 GSAP 动画闪烁 Bug。"
    "今天天气真好，适合把所有的胶囊代码重新 review 一遍。"
    "【动态验证码】您的登录验证码为：892311，请在 5 分钟内填写。如非本人操作请忽略。技术支持：研发中心。"
    "灵感：既然单列模式下大屏宽度足够，为什么不做一个基于视口宽度的流式卡片飞入动画？用户体验绝对拉满！"
    "不要忘记给阳台的猫砂盆清理一下，顺便加满自动喂食机。"
    "核心警告：生产环境数据库字段今晚重构，必须在凌晨 2 点前完成全量备份！"
    "最近听到的一句话特别好：源码面前，了无秘密。"
    "收到短信：由于近期天气回暖，您订购的冷链鲜奶将提前至早上 6 点配送，请注意查收。"
    "极其漫长的长文本测试：这是一段用来压力测试排版系统极限的超长灵感笔记，我们需要确认在双列布局锁死 25dvi 宽度的情况下，CSS 的 line-clamp 属性是否能够完美地在第二行末尾截断并显示优雅的省略号，而不会导致整个网格容器被无情撑爆。测试开始：春眠不觉晓，处处闻啼鸟。夜来风雨声，花落知多少。"
)

categories=("note" "urgent" "favourite" "sms" "inspiration")
statuses=("pending" "executing" "completed")

echo "🚀 开始向后端批量写入 40 个各种类别的测试胶囊..."

for i in {1..40}
do
    # 模拟循环取模
    text_idx=$((i % 10))
    cat_idx=$((i % 5))
    stat_idx=$((i % 3))

    category=${categories[$cat_idx]}
    content_text="[$i] ${sample_texts[$text_idx]}"

    # 每 3 个里有 1 个带日程
    if [ $((i % 3)) -eq 0 ]; then
        is_with_schedule=1
        start_time=$(date +"%Y-%m-%d %H:%M:%S")
        end_time=$(date -d "+2 hours" +"%Y-%m-%d %H:%M:%S" 2>/dev/null || date -v+2H +"%Y-%m-%d %H:%M:%S") # 兼顾 linux 和 mac 的 date 命令
        status=${statuses[$stat_idx]}

        # 组装带日程的 JSON
        json_payload=$(cat <<EOF
{
  "contentText": "$content_text",
  "classification": "$category",
  "isWithSchedule": 1,
  "scheduleIcon": "📅",
  "scheduleContentText": "处理第 $i 号胶囊关联的日程任务",
  "scheduleStartAt": "$start_time",
  "scheduleEndAt": "$end_time",
  "scheduleStatus": "$status",
  "scheduleDeadline": "$start_time"
}
EOF
)
    else
        is_with_schedule=0
        # 组装普通 JSON
        json_payload=$(cat <<EOF
{
  "contentText": "$content_text",
  "classification": "$category",
  "isWithSchedule": 0
}
EOF
)
    fi

    # 发送 curl 请求
    response=$(curl -s -X POST "$API_URL" \
        -H "Content-Type: application/json; charset=utf-8" \
        -d "$json_payload")

    echo "✅ 成功写入第 $i 个胶囊 | 分类: $category | 日程: $is_with_schedule"
done

echo "🎉 40 个测试数据灌注完毕！"
