<template>
  <div class="admin-dashboard">
    <el-container>
      <el-aside width="200px">
        <div class="logo">AI聊天管理后台</div>
        <el-menu
          :default-active="activeMenu"
          router
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409EFF"
        >
          <el-menu-item index="/admin">
            <el-icon><DataLine /></el-icon>
            <span>仪表盘</span>
          </el-menu-item>
          <el-menu-item index="/admin/users">
            <el-icon><User /></el-icon>
            <span>在线用户</span>
          </el-menu-item>
          <el-menu-item index="/admin/stats">
            <el-icon><PieChart /></el-icon>
            <span>统计分析</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      
      <el-container>
        <el-header>
          <div class="header-right">
            <span>{{ username }}</span>
            <el-dropdown @command="handleCommand">
              <span class="el-dropdown-link">
                <el-avatar :size="32" icon="UserFilled" />
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>
        
        <el-main>
          <router-view />
          
          <!-- 默认仪表盘内容 -->
          <div v-if="$route.path === '/admin'">
            <el-row :gutter="20">
              <el-col :span="8">
                <el-card>
                  <template #header>
                    <div class="card-header">
                      <span>当前在线用户</span>
                    </div>
                  </template>
                  <div class="card-value">{{ onlineUsers }}</div>
                </el-card>
              </el-col>
              
              <el-col :span="8">
                <el-card>
                  <template #header>
                    <div class="card-header">
                      <span>今日访问量</span>
                    </div>
                  </template>
                  <div class="card-value">{{ todayVisits }}</div>
                </el-card>
              </el-col>
              
              <el-col :span="8">
                <el-card>
                  <template #header>
                    <div class="card-header">
                      <span>消息总数</span>
                    </div>
                  </template>
                  <div class="card-value">{{ totalMessages }}</div>
                </el-card>
              </el-col>
            </el-row>
            
            <el-row :gutter="20" style="margin-top: 20px">
              <el-col :span="24">
                <el-card>
                  <template #header>
                    <div class="card-header">
                      <span>系统状态</span>
                    </div>
                  </template>
                  <el-descriptions :column="3" border>
                    <el-descriptions-item label="服务器状态">
                      <el-tag type="success">运行中</el-tag>
                    </el-descriptions-item>
                    <el-descriptions-item label="数据库状态">
                      <el-tag type="success">已连接</el-tag>
                    </el-descriptions-item>
                    <el-descriptions-item label="API状态">
                      <el-tag type="success">正常</el-tag>
                    </el-descriptions-item>
                    <el-descriptions-item label="系统版本">1.0.0</el-descriptions-item>
                    <el-descriptions-item label="启动时间">{{ startTime }}</el-descriptions-item>
                    <el-descriptions-item label="运行时长">{{ uptime }}</el-descriptions-item>
                  </el-descriptions>
                </el-card>
              </el-col>
            </el-row>
          </div>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { DataLine, User, PieChart } from '@element-plus/icons-vue'
import { adminApi } from '../../utils/api'

const router = useRouter()
const activeMenu = computed(() => router.currentRoute.value.path)
const username = computed(() => {
  // 添加安全检查，确保 localStorage 中的数据有效
  try {
    const userStr = localStorage.getItem('admin-user')
    if (!userStr) return '管理员'
    const user = JSON.parse(userStr)
    return user?.username || '管理员'
  } catch (error) {
    console.error('解析用户数据失败:', error)
    return '管理员'
  }
})

// 仪表盘数据
const onlineUsers = ref(0)
const todayVisits = ref(0)
const totalMessages = ref(0)
const startTime = ref(new Date().toLocaleString())
const uptime = ref('0分钟')
let timer = null

// 获取在线用户数据
const fetchOnlineUsers = async () => {
  try {
    const token = localStorage.getItem('admin-token')
    if (!token) {
      router.push('/admin/login')
      return
    }
    
    const response = await adminApi.getOnlineUsers(token)
    console.log('获取到的在线用户数据:', response)
    
    // 确保响应数据有效
    if (response && typeof response.onlineCount !== 'undefined') {
      onlineUsers.value = response.onlineCount
    } else {
      console.error('无效的在线用户数据响应:', response)
      onlineUsers.value = 0
    }
    
    // 模拟数据
    todayVisits.value = Math.floor(Math.random() * 1000) + 100
    totalMessages.value = Math.floor(Math.random() * 10000) + 1000
    
    // 计算运行时间
    const now = new Date()
    const start = new Date(startTime.value)
    const diff = Math.floor((now - start) / 60000)
    uptime.value = `${diff}分钟`
  } catch (error) {
    console.error('获取在线用户失败:', error)
    onlineUsers.value = 0
    
    if (error.response?.status === 401) {
      ElMessage.error('登录已过期，请重新登录')
      router.push('/admin/login')
    }
  }
}

// 退出登录
const handleCommand = (command) => {
  if (command === 'logout') {
    localStorage.removeItem('admin-token')
    localStorage.removeItem('admin-user')
    router.push('/admin/login')
    ElMessage.success('已退出登录')
  }
}

onMounted(() => {
  fetchOnlineUsers()
  // 定时刷新数据
  timer = setInterval(fetchOnlineUsers, 30000)
})

onBeforeUnmount(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style scoped>
.admin-dashboard {
  height: 100vh;
}

.el-container {
  height: 100%;
}

.el-aside {
  background-color: #304156;
  color: #bfcbd9;
}

.logo {
  height: 60px;
  line-height: 60px;
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  color: #fff;
  background-color: #2b3649;
}

.el-header {
  background-color: #fff;
  color: #333;
  line-height: 60px;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.header-right {
  display: flex;
  align-items: center;
}

.header-right span {
  margin-right: 15px;
}

.el-dropdown-link {
  cursor: pointer;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-value {
  font-size: 36px;
  font-weight: bold;
  text-align: center;
  color: #409eff;
  padding: 20px 0;
}
</style>