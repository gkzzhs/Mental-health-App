# 心灵之旅 - 部署指南

本文档提供了将「心灵之旅」应用部署到不同平台的详细步骤，以便在其他设备上访问。

## 前提条件

- Node.js 14.0 或更高版本
- npm 或 yarn 包管理器
- Git（如果使用 GitHub Pages 或 Netlify 等基于 Git 的部署平台）

## 本地构建

1. 克隆或下载项目代码
2. 安装依赖：
   ```bash
   npm install
   ```
3. 构建生产版本：
   ```bash
   npm run build
   ```
4. 构建完成后，`dist` 目录包含了可部署的静态文件

## 部署选项

### 选项1：使用 GitHub Pages 部署

1. 在 GitHub 上创建一个新的仓库
2. 将项目推送到该仓库：
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/你的用户名/心灵之旅.git
   git push -u origin main
   ```
3. 在仓库设置中启用 GitHub Pages，选择 `main` 分支的 `/docs` 文件夹或创建一个 `gh-pages` 分支
4. 如果使用 `gh-pages` 分支，可以安装 `gh-pages` 包并添加部署脚本：
   ```bash
   npm install --save-dev gh-pages
   ```
5. 在 `package.json` 中添加部署脚本：
   ```json
   "scripts": {
     "deploy": "npm run build && gh-pages -d dist"
   }
   ```
6. 运行部署命令：
   ```bash
   npm run deploy
   ```

### 选项2：使用 Netlify 部署

1. 注册 [Netlify](https://www.netlify.com/) 账号
2. 点击 "New site from Git"
3. 选择你的 Git 提供商（GitHub、GitLab 等）并授权
4. 选择你的项目仓库
5. 配置构建设置：
   - 构建命令：`npm run build`
   - 发布目录：`dist`
6. 点击 "Deploy site"

### 选项3：使用 Vercel 部署

1. 注册 [Vercel](https://vercel.com/) 账号
2. 点击 "New Project"
3. 导入你的 Git 仓库
4. 配置项目：
   - 框架预设：Vue.js
   - 构建命令：`npm run build`
   - 输出目录：`dist`
5. 点击 "Deploy"

### 选项4：使用 Firebase Hosting 部署

1. 注册 [Firebase](https://firebase.google.com/) 账号
2. 安装 Firebase CLI：
   ```bash
   npm install -g firebase-tools
   ```
3. 登录 Firebase：
   ```bash
   firebase login
   ```
4. 初始化项目：
   ```bash
   firebase init
   ```
   - 选择 Hosting 功能
   - 选择或创建 Firebase 项目
   - 指定公共目录为 `dist`
   - 配置为单页应用
5. 部署到 Firebase：
   ```bash
   firebase deploy
   ```

### 选项5：手动部署到任何静态文件服务器

1. 将 `dist` 目录中的所有文件上传到你的 Web 服务器
2. 确保服务器配置正确处理单页应用路由（通常需要将所有请求重定向到 index.html）

## 注意事项

- 确保 `vite.config.js` 中的 `base` 配置正确设置为 `'./'`，这样资源路径才能正确加载
- 如果你的应用使用了环境变量，确保在部署环境中正确配置
- 对于需要后端 API 的功能，确保在部署后更新 API 端点地址

## 在其他设备上访问

部署完成后，你可以通过以下方式在其他设备上访问：

1. 使用部署平台提供的 URL（如 `https://你的项目名.netlify.app`）
2. 如果使用自定义域名，可以通过你的域名访问
3. 对于本地网络部署，使用服务器的 IP 地址和端口访问

## 故障排除

如果在其他设备上访问时遇到问题：

1. 检查网络连接是否正常
2. 确认部署 URL 是否正确
3. 清除浏览器缓存并刷新页面
4. 检查浏览器控制台是否有错误信息
5. 确保资源路径正确（检查 vite.config.js 中的 base 配置）