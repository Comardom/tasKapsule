端口号9999\
有问题看这几个文件，依赖配置等的全写好了：\
[application.yaml](src/main/resources/application.yaml)\
[build.gradle.kts](build.gradle.kts)\
\
另外数据库采用的是SQLite，创建数据库文件目录的逻辑在
[DatabaseConfig.kt](src/main/kotlin/xyz/taskapsule/backend/config/DatabaseConfig.kt)
这里\
启动/打包后端用的是 
```shell
./gradlew bootRun
./gradlew bootJar
```
\
浏览器打开http://localhost:9999/查看或者curl http://localhost:9999/