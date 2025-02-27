// server/server.js
const express = require('express');
const app = express();
const port = 3000;

// 配置CORS（允许Vue前端与Node后端交互）
const cors = require('cors');
app.use(cors());

// 中间件：处理JSON请求
app.use(express.json());

// 示例API路由
app.get('/api', (req, res) => {
  res.json({ message: 'Hello from the backend!' });
});

// 启动服务器
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});