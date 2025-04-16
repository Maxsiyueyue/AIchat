const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // 获取token
  const token = req.header('x-auth-token');
  
  // 检查是否有token
  if (!token) {
    return res.status(401).json({ message: '没有提供认证令牌，拒绝访问' });
  }
  
  try {
    // 验证token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'aichat_secret_key');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: '令牌无效' });
  }
};