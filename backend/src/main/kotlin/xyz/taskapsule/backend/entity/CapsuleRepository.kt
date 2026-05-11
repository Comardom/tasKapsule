package xyz.taskapsule.backend.entity

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import java.time.LocalDate

// 仓库只负责数据的增删改查逻辑
//这个接口是Spring负责实现函数的，没有自己写的实际函数实现
interface CapsuleRepository : JpaRepository<Capsule, Long> {
    //    CASE WHEN ... IS NULL THEN 1 ELSE 0 END 把 null 值的排序权重设为 1（非 null 为 0）
    //    ASC 排序时 0 排在 1 前面 → null 值被挤到最后
    @Query("""
    SELECT c FROM Capsule c
    WHERE c.targetDate = :date
    ORDER BY CASE WHEN c.startTime IS NULL THEN 1 ELSE 0 END, c.startTime ASC
""")
    fun findByTargetDateOrderByStartTimeAsc(date: LocalDate): List<Capsule>
}