const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectedUsers } = require('./utils/userStore'); // 导入 connectedUsers

// 加载环境变量
dotenv.config();

// 创建Express应用
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "x-auth-token"]
  },
  transports: ['polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
  path: '/socket.io'
});

// 中间件
app.use(cors({
  origin: process.env.CORS_ORIGIN || ["http://localhost:5173", "https://capable-youtiao-59e6cc.netlify.app"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "x-auth-token"]
}));
app.use(express.json());

// 连接数据库
let dbConnected = false;
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/aichat')
.then(() => {
  console.log('MongoDB连接成功');
  dbConnected = true;
})
.catch(err => {
  console.error('MongoDB连接失败:', err);
  console.log('没有连接上数据库，将使用内存存储');
});

// 删除这一行: const connectedUsers = new Map();

// Socket.io连接处理
io.on('connection', (socket) => {
  console.log('新用户连接:', socket.id);
  
  // 存储用户信息
  const userInfo = {
    socketId: socket.id,
    ip: socket.handshake.address,
    timestamp: new Date(),
    deviceInfo: {
      browser: socket.handshake.headers['user-agent'] || 'Unknown',
      os: 'Unknown',
      device: 'Unknown'
    }
  };
  
  // 接收客户端发送的设备信息
  socket.on('device-info', (deviceInfo) => {
    if (deviceInfo) {
      userInfo.deviceInfo = {
        ...userInfo.deviceInfo,
        ...deviceInfo
      };
      connectedUsers.set(socket.id, userInfo);
    }
  });
  
  // 初始存储
  connectedUsers.set(socket.id, userInfo);
  
  // 断开连接
  socket.on('disconnect', () => {
    console.log('用户断开连接:', socket.id);
    connectedUsers.delete(socket.id);
  });
});

// 路由
app.use('/api/auth', require('./routes/auth'));
app.use('/api/stats', (req, res, next) => {
  if (!dbConnected) {
    return res.status(503).json({ 
      message: '数据库服务不可用，请稍后再试',
      dbStatus: 'disconnected'
    });
  }
  next();
}, require('./routes/stats'));

// 添加数据库状态检查路由
app.get('/api/status', (req, res) => {
  res.json({
    server: 'running',
    database: dbConnected ? 'connected' : 'disconnected'
  });
});

// 启动服务器
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});

// 不再需要导出 connectedUsers
module.exports = { app, server, io };

// 修改API路由前缀
app.use('/api', require('./routes/api'));

// 添加根路由响应
app.get('/', (req, res) => {
  res.send('AI聊天后端服务运行中');
});