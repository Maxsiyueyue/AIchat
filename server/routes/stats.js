const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { connectedUsers } = require('../utils/userStore');

// 获取在线用户
router.get('/online', auth, (req, res) => {
  try {
    // 确保 connectedUsers 存在且是一个 Map
    if (!connectedUsers || typeof connectedUsers.values !== 'function') {
      console.error('connectedUsers 不是有效的 Map:', connectedUsers);
      return res.json({
        onlineCount: 0,
        users: []
      });
    }
    
    const users = Array.from(connectedUsers.values());
    res.json({
      onlineCount: users.length,
      users
    });
  } catch (err) {
    console.error('获取在线用户错误:', err);
    res.status(500).json({ 
      message: '服务器错误',
      error: err.message 
    });
  }
});

// 获取设备统计
router.get('/devices', auth, (req, res) => {
  try {
    // 确保 connectedUsers 存在且是一个 Map
    if (!connectedUsers || typeof connectedUsers.values !== 'function') {
      console.error('connectedUsers 不是有效的 Map:', connectedUsers);
      return res.json({
        os: {},
        browser: {},
        device: {}
      });
    }
    
    const users = Array.from(connectedUsers.values());
    
    // 统计操作系统
    const osStats = {};
    // 统计浏览器
    const browserStats = {};
    // 统计设备类型
    const deviceStats = {};
    
    users.forEach(user => {
      // 操作系统统计
      const os = user.deviceInfo.os || 'Unknown';
      osStats[os] = (osStats[os] || 0) + 1;
      
      // 浏览器统计
      let browser = 'Unknown';
      if (user.deviceInfo.browser) {
        const ua = user.deviceInfo.browser;
        if (ua.includes('Chrome')) browser = 'Chrome';
        else if (ua.includes('Firefox')) browser = 'Firefox';
        else if (ua.includes('Safari')) browser = 'Safari';
        else if (ua.includes('Edge')) browser = 'Edge';
        else if (ua.includes('MSIE') || ua.includes('Trident')) browser = 'IE';
        else browser = 'Other';
      }
      browserStats[browser] = (browserStats[browser] || 0) + 1;
      
      // 设备类型统计
      const device = user.deviceInfo.device || 'Desktop';
      deviceStats[device] = (deviceStats[device] || 0) + 1;
    });
    
    res.json({
      os: osStats,
      browser: browserStats,
      device: deviceStats
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;