package xyz.taskapsule.backend

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import java.io.File

@SpringBootApplication
class BackendApplication

fun main(args: Array<String>) {
	// 抢在 Spring 启动前创建目录
    val userHome = System.getProperty("user.home")
    val dbDir = File("$userHome/.taskapsule/data")
    if (!dbDir.exists()) {
        dbDir.mkdirs()
    }
	runApplication<BackendApplication>(*args)
}
