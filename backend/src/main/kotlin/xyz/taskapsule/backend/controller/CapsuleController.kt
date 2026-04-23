package xyz.taskapsule.backend.controller

import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.CrossOrigin
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import xyz.taskapsule.backend.entity.Capsule
import xyz.taskapsule.backend.entity.CapsuleRepository
import java.time.LocalDate

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

    // 获取特定日期的胶囊列表
    // 访问路径示例: GET /api/v1/capsules?date=2025-05-20
    @GetMapping
    fun getAllByDate(@RequestParam date: String): List<Capsule> {
        return try {
            val targetDate = LocalDate.parse(date)
            repository.findByTargetDateOrderByStartTimeAsc(targetDate)
        } catch (e: Exception) {
            // 如果日期格式不对，返回空列表或者报错
            emptyList()
        }
    }

    // 创建一个新的胶囊
    // 访问路径示例: POST /api/v1/capsules
    @PostMapping
    fun create(@RequestBody capsule: Capsule): Capsule {
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
}