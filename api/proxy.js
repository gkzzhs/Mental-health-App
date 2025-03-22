// Vercel API代理 - 用于解决跨域请求问题
const axios = require('axios');

module.exports = async (req, res) => {
  // 设置CORS头，允许跨域请求
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // 处理OPTIONS请求（预检请求）
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 只处理POST请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '方法不允许' });
  }

  try {
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
    
    // 返回API响应
    res.status(200).json(response.data);
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
};