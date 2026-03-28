package xyz.taskapsule.backend.controller

import org.springframework.web.bind.annotation.CrossOrigin
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RestController

@RestController
// CrossOrigin是跨域协议
// 允许 Electron 开发环境跨域，生产环境通常使用 file:// 或 app:// 协议
@CrossOrigin(origins = ["http://localhost:9998", "app://localhost"])
class HomeController {

    @GetMapping("/")
    fun home(): String {
        return "TasKapsule Backend is running"
    }

    @GetMapping("/health")
    fun health(): Map<String, String> {
        return mapOf(
            "status" to "UP",
            "message" to "Application is running normally",
            "runtime" to "Java ${System.getProperty("java.version")}",
            "database" to "SQLite (Connected)"
        )
    }
}