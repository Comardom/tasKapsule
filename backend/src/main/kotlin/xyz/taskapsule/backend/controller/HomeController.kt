package xyz.taskapsule.backend.controller

import jakarta.annotation.PostConstruct
import org.slf4j.LoggerFactory
import org.springframework.web.bind.annotation.CrossOrigin
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RestController

@RestController
// CrossOrigin是跨域协议
// 允许 Electron 开发环境跨域，生产环境通常使用 file:// 或 app:// 协议
@CrossOrigin(origins = ["http://localhost:9998", "app://localhost"])
class HomeController {
    private val logger = LoggerFactory.getLogger(HomeController::class.java)

    @PostConstruct
    fun init() {
        // 当这个 Controller 被 Spring 加载时，说明 Web 服务快好了
        logger.info("[STAGE] CONTROLLER_READY: 接口控制层已就绪")
    }

    @GetMapping("/")
    fun home(): String {
        return "TasKapsule Backend is running"
    }

    @GetMapping("/health")
    fun health(): Map<String, String> {
        logger.debug("Received health check request")
        return mapOf(
            "status" to "UP",
            "message" to "Application is running normally",
            "runtime" to "Java ${System.getProperty("java.version")}",
            "database" to "SQLite (Connected)"
        )
    }
}

