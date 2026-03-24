#!/usr/bin/env node
/**
 * Cloudflare Pages 构建脚本
 * 使用 Node.js 执行，避免 shell 脚本问题
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Cloudflare Pages 构建脚本启动');
console.log('当前目录:', process.cwd());
console.log('Node版本:', process.version);

// 设置环境变量
process.env.NODE_VERSION = '18';
process.env.NODE_ENV = 'production';

try {
  // 检查目录结构
  console.log('\n📁 检查目录结构...');
  const frontendPath = path.join(process.cwd(), 'photomagic', 'frontend');
  
  if (!fs.existsSync(frontendPath)) {
    console.error('❌ 找不到前端目录:', frontendPath);
    process.exit(1);
  }
  
  console.log('✅ 前端目录存在:', frontendPath);
  
  // 进入前端目录
  process.chdir(frontendPath);
  console.log('📁 切换到目录:', process.cwd());
  
  // 检查 package.json
  if (!fs.existsSync('package.json')) {
    console.error('❌ 找不到 package.json');
    process.exit(1);
  }
  
  // 安装依赖
  console.log('\n📦 安装依赖...');
  execSync('npm install --no-audit --no-fund --loglevel=error', {
    stdio: 'inherit',
    timeout: 300000 // 5分钟超时
  });
  
  // 构建项目
  console.log('\n🔨 构建项目...');
  execSync('npm run build', {
    stdio: 'inherit',
    timeout: 300000 // 5分钟超时
  });
  
  // 检查构建结果
  console.log('\n✅ 检查构建结果...');
  if (fs.existsSync('dist')) {
    const files = fs.readdirSync('dist');
    console.log(`✅ 构建成功！生成 ${files.length} 个文件`);
    console.log('主要文件:', files.slice(0, 10).join(', '));
  } else {
    console.error('❌ 构建失败，dist 目录不存在');
    process.exit(1);
  }
  
  console.log('\n🎉 构建完成！');
  
} catch (error) {
  console.error('\n❌ 构建失败:', error.message);
  if (error.stderr) {
    console.error('错误输出:', error.stderr.toString());
  }
  process.exit(1);
}