### 打包 maven 的 java 项目并发布 jar 提供下载

![](./image/配置GitHub_Action_release_jar.jpg)

![](./image/GitHub_action_release_result.jpg)

```markdown
# This workflow will build a Java project with Maven, and cache/restore any dependencies to improve the workflow execution time
# For more information see: https://help.github.com/actions/language-and-framework-guides/building-and-testing-java-with-maven

name: Java CI with Maven

on:
  push:
    branches: [ "master" ]
  pull_request:
    branches: [ "master" ]
  release:
    types: [created]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up JDK 8.0.332+9
        uses: actions/setup-java@v3
        with:
          java-version: '8.0.332+9'
          distribution: 'temurin'
          cache: maven
      - name: 编译代码
        run: mvn compile
      - name: Build with Maven
        run: mvn -B package
        # 上传文件并发布 Release
      - uses: "marvinpinto/action-automatic-releases@latest"
        with:
          repo_token: "${{ secrets.GITHUB_TOKEN }}"
          automatic_release_tag: "latest"
          prerelease: false
          title: "Development Build"
          files: | 
              target/*.jar
      - name: Upload build
        uses: actions/upload-artifact@v3
        with:
          name: release
          path: target/*.jar
```