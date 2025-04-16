const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// 创建管理员账户对象
const adminUser = {
  username: 'admin',
  password: '' // 初始为空，将在下面同步生成哈希值
};

// 同步生成密码哈希值
const salt = bcrypt.genSaltSync(10);
adminUser.password = bcrypt.hashSync('admin123', salt);
console.log('生成的哈希值:', adminUser.password);

// 登录路由
router.post('/login', async (req, res) => {
  console.log('收到登录请求, 请求体类型:', typeof req.body, '内容:', req.body);
  
  // 检查请求体是否为空
  if (!req.body || Object.keys(req.body).length === 0) {
    console.error('请求体为空');
    return res.status(400).json({ message: '请求体不能为空' });
  }
  
  const { username, password } = req.body;
  
  // 检查用户名和密码是否提供
  if (!username || !password) {
    console.error('缺少用户名或密码:', { username: !!username, password: !!password });
    return res.status(400).json({ message: '用户名和密码不能为空' });
  }
  
  try {
    console.log('验证用户:', username);
    
    // 验证用户名
    if (username !== adminUser.username) {
      console.log('用户名不匹配');
      return res.status(400).json({ message: '用户名或密码错误' });
    }
    
    // 验证密码
    const isMatch = await bcrypt.compare(password, adminUser.password);
    console.log('密码验证结果:', isMatch);
    
    if (!isMatch) {
      return res.status(400).json({ message: '用户名或密码错误' });
    }
    
    // 生成JWT
    const token = jwt.sign(
      { username },
      process.env.JWT_SECRET || 'aichat_secret_key',
      { expiresIn: '1h' }
    );
    
    console.log('登录成功，生成token');
    res.json({ token });
  } catch (err) {
    console.error('登录错误:', err);
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;