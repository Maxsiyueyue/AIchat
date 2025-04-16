const Connection = require('../models/Connection');
const { parseUserAgent } = require('../utils/uaParser');

// 记录用户连接
exports.trackUserConnection = async (socketId, userAgent, ip, status) => {
  try {
    const deviceInfo = parseUserAgent(userAgent);
    
    const connection = new Connection({
      socketId,
      userAgent,
      ip,
      status,
      deviceInfo
    });
    
    await connection.save();
  } catch (error) {
    console.error('记录连接失败:', error);
  }
};

// 获取当前在线用户数
exports.getOnlineUsers = async (req, res) => {
  try {
    // 获取所有连接的socketId
    const connections = await Connection.find().sort({ timestamp: -1 });
    
    // 计算当前在线用户
    const socketIds = new Set();
    const onlineUsers = [];
    
    connections.forEach(conn => {
      if (!socketIds.has(conn.socketId)) {
        socketIds.add(conn.socketId);
        if (conn.status === 'connect') {
          onlineUsers.push(conn);
        }
      }
    });
    
    res.json({
      onlineCount: onlineUsers.length,
      users: onlineUsers
    });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};

// 获取设备统计信息
exports.getDeviceStats = async (req, res) => {
  try {
    const connections = await Connection.find();
    
    // 统计设备类型
    const deviceStats = {
      os: {},
      browser: {},
      device: {}
    };
    
    connections.forEach(conn => {
      // 操作系统统计
      const os = conn.deviceInfo.os;
      deviceStats.os[os] = (deviceStats.os[os] || 0) + 1;
      
      // 浏览器统计
      const browser = conn.deviceInfo.browser;
      deviceStats.browser[browser] = (deviceStats.browser[browser] || 0) + 1;
      
      // 设备类型统计
      const device = conn.deviceInfo.device;
      deviceStats.device[device] = (deviceStats.device[device] || 0) + 1;
    });
    
    res.json(deviceStats);
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
};