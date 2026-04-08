package xyz.taskapsule.backend.controller

import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import xyz.taskapsule.backend.entity.Test1
import xyz.taskapsule.backend.entity.Test1Repository

@RestController
@RequestMapping("/api/tasks")
class TaskController(private val repo: Test1Repository) {
    @GetMapping
    fun getAll() = repo.findAll()

    @PostMapping
    fun create(@RequestBody test1: Test1) = repo.save(test1)
}