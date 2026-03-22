package xyz.taskapsule.backend.config

import org.springframework.context.annotation.Configuration
import java.io.File
import jakarta.annotation.PostConstruct

@Configuration
class DatabaseConfig {

    @PostConstruct
    fun initDatabaseDirectory(){
        // 获取用户目录下的 .taskapsule/data 路径
        val dbPath = System.getProperty("user.home") + "/.taskapsule/data"
        val dbDir = File(dbPath)

        // 如果目录不存在，则创建它
        if (!dbDir.exists()) {
            val created = dbDir.mkdirs()
            if (created) {
                println("✓ Created database directory: $dbPath")
            } else {
                println("✗ Failed to create database directory: $dbPath")
            }
        } else {
            println("✓ Database directory already exists: $dbPath")
        }
    }

}