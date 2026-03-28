package xyz.taskapsule.backend.config

import org.springframework.context.annotation.Configuration
import java.io.File
import jakarta.annotation.PostConstruct
import org.slf4j.LoggerFactory

@Configuration
class DatabaseConfig {

    // 统一使用slf4j的logger保存日志，而不是采用println
    // 这样的话调试信息带时间戳，方便在 application.yaml 中通过 logging.level 控制输出
    private val logger = LoggerFactory.getLogger(DatabaseConfig::class.java)

    @PostConstruct
    fun initDatabaseDirectory(){
        // 统一路径获取
        val userHome = System.getProperty("user.home")
        val dbDirPath = "$userHome/.taskapsule/data"
        val dbDir = File(dbDirPath)

        // 确保目录存在
        if (!dbDir.exists()) {
            if (dbDir.mkdirs()) {
                logger.info("Successfully created database directory at: {}", dbDirPath)
            } else {
                logger.error("Failed to create database directory at: {}", dbDirPath)
            }
        } else {
            logger.debug("Database directory already exists: {}", dbDirPath)
        }
    }
}