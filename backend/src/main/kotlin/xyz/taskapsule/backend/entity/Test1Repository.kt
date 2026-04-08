package xyz.taskapsule.backend.entity

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface Test1Repository : JpaRepository<Test1, Long>{

}