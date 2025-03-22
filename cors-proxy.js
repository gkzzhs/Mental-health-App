// CORS代理服务器 - 用于解决跨域请求问题
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 启用CORS
app.use(cors());

// 解析JSON请求体
app.use(express.json());

// 健康检查端点
app.get('/', (req, res) => {
  res.send('CORS代理服务器正常运行');
});

// 代理火山引擎API请求
app.post('/api/chat', async (req, res) => {
  try {
    console.log('收到代理请求');
    
    // 获取API密钥
    const apiKey = process.env.VITE_VOLCENGINE_API_KEY;
    if (!apiKey) {
      console.error('未找到API密钥');
      return res.status(500).json({ error: '服务器配置错误：未找到API密钥' });
    }
    
    // 转发请求到火山引擎API
    const response = await axios.post(
      'https://api.volcengine.com/v1/services/maas/chat/completions',
      req.body,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json'
        },
        timeout: 60000
      }
    );
    
    console.log('API响应状态:', response.status);
    
    // 返回API响应
    res.json(response.data);
  } catch (error) {
    console.error('代理请求失败:', error.message);
    
    // 提供详细错误信息
    if (error.response) {
      // 服务器响应了错误状态码
      console.error('API错误详情:', {
        status: error.response.status,
        data: error.response.data
      });
      res.status(error.response.status).json({
        error: '火山引擎API错误',
        details: error.response.data,
        status: error.response.status
      });
    } else if (error.request) {
      // 请求已发送但没有收到响应
      console.error('无响应错误');
      res.status(504).json({
        error: '火山引擎API无响应',
        message: '请求已发送但未收到响应'
      });
    } else {
      // 请求设置时出错
      console.error('请求错误');
      res.status(500).json({
        error: '代理服务器错误',
        message: error.message
      });
    }
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`CORS代理服务器运行在 http://localhost:${PORT}`);
});