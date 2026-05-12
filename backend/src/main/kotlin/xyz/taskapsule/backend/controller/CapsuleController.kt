package xyz.taskapsule.backend.controller

import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import xyz.taskapsule.backend.entity.Capsule
import xyz.taskapsule.backend.entity.CapsuleRepository
import xyz.taskapsule.backend.entity.CapsuleStatus
import java.time.LocalDate
import java.time.LocalTime

//它标记这个类为一个控制器，并且告诉 Spring：
//这个类中所有方法的返回值（如 List、Object）都会被自动转换成 JSON 格式，
//并放入 HTTP 响应体（Response Body）中发送回前端。
@RestController
//设置基础 URL 路径。
//"/api": 明确这是一个 API 接口，而不是访问 HTML 页面,"/v1": 版本控制
//"/capsules": 代表操作的资源对象是“胶囊”。
@RequestMapping("/api/v1/capsules")
@CrossOrigin(origins = ["http://localhost:9998", "app://localhost"])

class CapsuleController(private val repository: CapsuleRepository) {

    private val logger = LoggerFactory.getLogger(CapsuleController::class.java)


    // 获取特定日期的胶囊列表
    // 访问路径示例: GET /api/v1/capsules?date=2025-05-20
    @GetMapping
    fun getAllByDate(@RequestParam date: String): List<Capsule> {
        return try {
            val targetDate = LocalDate.parse(date)
            repository.findByTargetDateOrderByStartTimeAsc(targetDate)
        } catch (e: Exception) {
            // 如果日期格式不对，返回空列表或者报错
            logger.error("获取胶囊失败，日期参数: $date", e)
            emptyList()
        }
    }

    // 创建一个新的胶囊
    // 访问路径示例: POST /api/v1/capsules
    @PostMapping
    fun create(@RequestBody capsule: Capsule): Capsule {
        capsule.id = null
        return repository.save(capsule)
    }

    // 删除胶囊
    // 访问路径示例: DELETE /api/v1/capsules/1
    @DeleteMapping("/{id}")
    fun delete(@PathVariable id: Long): ResponseEntity<Unit> {
        return if (repository.existsById(id)) {
            repository.deleteById(id)
            ResponseEntity.noContent().build() // 返回 204 No Content，表示成功且无返回内容
        } else {
            ResponseEntity.notFound().build()   // 返回 404 Not Found，表示 ID 不存在
        }
    }

    // 更新胶囊
    // 访问路径示例: PUT /api/v1/capsules/1
    @PutMapping("/{id}")
    fun update(@PathVariable id: Long, @RequestBody body: Map<String, Any?>): ResponseEntity<*> {
        val existing = repository.findById(id)
        // 胶囊不存在 → 直接返回 404
        if (existing.isEmpty) return ResponseEntity<Unit>(HttpStatus.NOT_FOUND)

        val capsule = existing.get()
        return try {
            // 非空字段：?.let 即可（不能设为 null，所以不用 containsKey）
            body["title"]?.let { capsule.title = it.toString() }
            body["targetDate"]?.let { capsule.targetDate = LocalDate.parse(it.toString()) }
            body["durationMinutes"]?.let { capsule.durationMinutes = it.toString().toInt() }
            body["status"]?.let { capsule.status = CapsuleStatus.valueOf(it.toString()) }

            // 可为空字段：用 containsKey 区分"没传"和"传了 null"
            if (body.containsKey("content")) capsule.content = body["content"]?.toString()
            if (body.containsKey("audioPath")) capsule.audioPath = body["audioPath"]?.toString()
            if (body.containsKey("attachmentPaths")) capsule.attachmentPaths = body["attachmentPaths"]?.toString()
            if (body.containsKey("startTime")) {
                val v = body["startTime"]
                capsule.startTime = if (v != null) LocalTime.parse(v.toString()) else null
            }

            ResponseEntity.ok(repository.save(capsule))
        } catch (e: Exception) {
            // 日期格式错误、数字格式错误、枚举名拼写错误等统一返回 400
            ResponseEntity.badRequest().body(mapOf("error" to "请求参数格式错误: ${e.message}"))
        }
    }
}