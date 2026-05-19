# 配置后端 API 地址（根据实际情况修改端口）
$ApiUrl = "http://localhost:9999/api/v1/capsules"

# 基础测试文本库，用于混合生成长短不一的正文
$sampleTexts = @(
    "去超市买纯牛奶、全麦面包，顺便看看有没有新鲜的三文鱼切片。",
    "下午三点和架构师对齐下一阶段大屏组件的核心重构方案，重点讨论流式自适应排版遗留的 GSAP 动画闪烁 Bug。",
    "今天天气真好，适合把所有的胶囊代码重新 review 一遍。",
    "【动态验证码】您的登录验证码为：892311，请在 5 分钟内填写。如非本人操作请忽略。技术支持：研发中心。",
    "灵感：既然单列模式下大屏宽度足够，为什么不做一个基于视口宽度的流式卡片飞入动画？用户体验绝对拉满！",
    "不要忘记给阳台的猫砂盆清理一下，顺便加满自动喂食机。",
    "核心警告：生产环境数据库字段今晚重构，必须在凌晨 2 点前完成全量备份！",
    "最近听到的一句话特别好：源码面前，了无秘密。",
    "收到短信：由于近期天气回暖，您订购的冷链鲜奶将提前至早上 6 点配送，请注意查收。",
    "极其漫长的长文本测试：这是一段用来压力测试排版系统极限的超长灵感笔记，我们需要确认在双列布局锁死 25dvi 宽度的情况下，CSS 的 line-clamp 属性是否能够完美地在第二行末尾截断并显示优雅的省略号，而不会导致整个网格容器被无情撑爆，或者让高度塌陷。测试开始：春眠不觉晓，处处闻啼鸟。夜来风雨声，花落知多少。架构重构任重道远！"
)

$categories = @("note", "urgent", "favourite", "sms", "inspiration")
$statuses = @("pending", "executing", "completed")

Write-Host "🚀 开始向后端批量写入 40 个各种类别的测试胶囊..." -ForegroundColor Cyan

for ($i = 1; $i -le 40; $i++) {
    # 随机选择分类、文本和日程状态
    $category = $categories[($i % $categories.Length)]
    $baseText = $sampleTexts[($i % $sampleTexts.Length)]
    $contentText = "[$i] $baseText"

    # 规律交替是否带日程：每 3 个里有 1 个带日程
    $isWithSchedule = if ($i % 3 -eq 0) { 1 } else { 0 }

    # 构建请求体对象
    $bodyObj = @{
        contentText = $contentText
        classification = $category
        isWithSchedule = $isWithSchedule
    }

    # 如果带日程，补全日程字段
    if ($isWithSchedule -eq 1) {
        $bodyObj["scheduleIcon"] = "📅"
        $bodyObj["scheduleContentText"] = "处理第 $i 号胶囊关联的日程任务"
        $bodyObj["scheduleStartAt"] = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
        $bodyObj["scheduleEndAt"] = (Get-Date).AddHours(2).ToString("yyyy-MM-dd HH:mm:ss")
        $bodyObj["scheduleStatus"] = $statuses[($i % $statuses.Length)]
        $bodyObj["scheduleDeadline"] = (Get-Date).AddDays(1).ToString("yyyy-MM-dd HH:mm:ss")
    }

    # 转换为 JSON 字符串
    $jsonBody = $bodyObj | ConvertTo-Json -Depth 5 -Compress

    try {
        # 发送 POST 请求
        $response = Invoke-RestMethod -Uri $ApiUrl -Method Post -Body $jsonBody -ContentType "application/json; charset=utf-8"
        Write-Host "✅ 成功写入第 $i 个胶囊 | ID: $($response.id) | 分类: $category | 日程: $isWithSchedule" -ForegroundColor Green
    } catch {
        Write-Host "❌ 写入第 $i 个失败: $_" -ForegroundColor Red
    }
}

Write-Host "🎉 40 个测试数据灌注完毕！快去前端刷新大屏看看排版效果吧！" -ForegroundColor Cyan
