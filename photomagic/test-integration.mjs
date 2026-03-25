#!/usr/bin/env node

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置
const API_BASE = 'http://localhost:3002/api/v1';
const FRONTEND_URL = 'http://localhost:3000';

// 创建测试图片
const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
const testImageBuffer = Buffer.from(testImageBase64, 'base64');
const testImagePath = path.join(__dirname, 'test-integration.png');
fs.writeFileSync(testImagePath, testImageBuffer);

async function testIntegration() {
  console.log('🚀 开始测试前后端集成...\n');
  
  try {
    // 1. 测试后端健康检查
    console.log('1. 测试后端健康检查...');
    const healthResponse = await axios.get(`${API_BASE}/health`);
    console.log(`   ✅ 后端健康状态: ${healthResponse.data.status}`);
    console.log(`   📊 环境: ${healthResponse.data.environment}`);
    
    // 2. 测试文件上传
    console.log('\n2. 测试文件上传...');
    const FormData = (await import('form-data')).default;
    const form = new FormData();
    const fileData = fs.readFileSync(testImagePath);
    form.append('file', fileData, { filename: 'test.png' });
    form.append('type', 'image');
    form.append('purpose', 'background_removal');
    
    const uploadResponse = await axios.post(`${API_BASE}/upload`, form, {
      headers: {
        ...form.getHeaders(),
      },
    });
    
    const fileId = uploadResponse.data.data.file_id;
    console.log(`   ✅ 文件上传成功: ${fileId}`);
    
    // 3. 测试背景移除
    console.log('\n3. 测试背景移除...');
    const bgRemovalResponse = await axios.post(`${API_BASE}/background-removal`, {
      file_id: fileId,
      parameters: {
        format: 'png',
        bg_color: 'transparent'
      }
    });
    
    console.log(`   ✅ 背景移除成功: ${bgRemovalResponse.data.data.result_id}`);
    console.log(`   ⏱️  处理时间: ${bgRemovalResponse.data.data.processing_time}秒`);
    
    // 4. 测试前端访问
    console.log('\n4. 测试前端访问...');
    try {
      const frontendResponse = await axios.get(FRONTEND_URL, {
        timeout: 5000
      });
      console.log(`   ✅ 前端服务正常: HTTP ${frontendResponse.status}`);
      console.log(`   🔗 前端地址: ${FRONTEND_URL}`);
    } catch (frontendError) {
      console.log(`   ⚠️  前端服务访问异常: ${frontendError.message}`);
      console.log(`   🔗 请手动访问: ${FRONTEND_URL}`);
    }
    
    // 5. 测试所有API接口
    console.log('\n5. 测试所有API接口...');
    const endpoints = [
      { name: '证件照制作', path: '/id-photo', method: 'POST' },
      { name: '背景替换', path: '/background-replacement', method: 'POST' },
      { name: '老照片修复', path: '/photo-restoration', method: 'POST' }
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await axios({
          method: endpoint.method,
          url: `${API_BASE}${endpoint.path}`,
          data: endpoint.method === 'POST' ? {
            file_id: fileId,
            parameters: {}
          } : undefined
        });
        
        if (response.data.success) {
          console.log(`   ✅ ${endpoint.name}: 正常`);
        } else {
          console.log(`   ⚠️  ${endpoint.name}: ${response.data.error?.message || '未知错误'}`);
        }
      } catch (error) {
        console.log(`   ❌ ${endpoint.name}: ${error.response?.data?.error?.message || error.message}`);
      }
    }
    
    // 6. 清理测试文件
    console.log('\n6. 清理测试文件...');
    fs.unlinkSync(testImagePath);
    console.log('   ✅ 测试文件已清理');
    
    // 总结
    console.log('\n🎉 集成测试完成！');
    console.log('\n📋 服务状态:');
    console.log(`   🔗 后端API: ${API_BASE}`);
    console.log(`   🎨 前端界面: ${FRONTEND_URL}`);
    console.log(`   📊 后端端口: 3002`);
    console.log(`   🎨 前端端口: 3000`);
    console.log('\n🚀 现在你可以:');
    console.log('   1. 打开浏览器访问前端界面');
    console.log('   2. 上传图片测试四大核心功能');
    console.log('   3. 查看处理结果和下载文件');
    
  } catch (error) {
    console.error('\n❌ 集成测试失败:');
    console.error(`   错误: ${error.message}`);
    
    if (error.response) {
      console.error(`   状态码: ${error.response.status}`);
      console.error(`   响应数据: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    
    // 清理文件
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
    }
    
    process.exit(1);
  }
}

// 运行测试
testIntegration();