package xyz.taskapsule.backend.entity

import org.springframework.data.jpa.repository.JpaRepository
import java.time.LocalDate

// 仓库只负责数据的增删改查逻辑
//这个接口是Spring负责实现函数的，没有自己写的实际函数实现
interface CapsuleRepository : JpaRepository<Capsule, Long> {
    fun findByTargetDateOrderByStartTimeAsc(date: LocalDate): List<Capsule>
}