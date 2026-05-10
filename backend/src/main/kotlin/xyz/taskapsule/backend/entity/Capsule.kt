package xyz.taskapsule.backend.entity

import jakarta.persistence.*
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.LocalTime


enum class CapsuleStatus {
    PENDING, COMPLETED
}


@Entity
@Table(name = "capsules")
class Capsule(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @Column(nullable = false)
    var title: String = "",

    @Column(columnDefinition = "TEXT")
    var content: String? = null,

    var audioPath: String? = null,

    @Column(columnDefinition = "TEXT")
    var attachmentPaths: String? = null, // 建议存储 JSON 字符串

    @Column(nullable = false)
    var targetDate: LocalDate = LocalDate.now(),

    var startTime: LocalTime? = null,

    var durationMinutes: Int = 0,

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    var status: CapsuleStatus = CapsuleStatus.PENDING,

    @Column(nullable = false, updatable = false)
    val createdAt: LocalDateTime = LocalDateTime.now()
)