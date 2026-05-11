package xyz.taskapsule.backend

import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import xyz.taskapsule.backend.entity.CapsuleRepository
import kotlin.test.assertNotNull

@SpringBootTest
class BackendApplicationTests {
	@Autowired
	private lateinit var capsuleRepository: CapsuleRepository
	@Test
	fun contextLoads() {
		// 至少验证 Repository 被注入了
		assertNotNull(capsuleRepository)
	}
}
