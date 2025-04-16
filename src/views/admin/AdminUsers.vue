<template>
  <div class="admin-users">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>在线用户列表</span>
          <el-button type="primary" size="small" @click="fetchUsers">刷新</el-button>
        </div>
      </template>
      
      <el-table :data="users" style="width: 100%" v-loading="loading">
        <el-table-column prop="socketId" label="会话ID" width="220" />
        <el-table-column prop="deviceInfo.browser" label="浏览器" width="150" />
        <el-table-column prop="deviceInfo.os" label="操作系统" width="150" />
        <el-table-column prop="deviceInfo.device" label="设备类型" width="120" />
        <el-table-column prop="ip" label="IP地址" width="150" />
        <el-table-column prop="timestamp" label="连接时间">
          <template #default="scope">
            {{ new Date(scope.row.timestamp).toLocaleString() }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { adminApi } from '../../utils/api'

const router = useRouter()
const users = ref([])
const loading = ref(false)
let timer = null

const fetchUsers = async () => {
  loading.value = true
  try {
    const token = localStorage.getItem('admin-token')
    if (!token) {
      router.push('/admin/login')
      return
    }
    
    const response = await adminApi.getOnlineUsers(token)
    users.value = response.users
  } catch (error) {
    console.error('获取在线用户失败:', error)
    if (error.response?.status === 401) {
      ElMessage.error('登录已过期，请重新登录')
      router.push('/admin/login')
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchUsers()
  // 定时刷新数据
  timer = setInterval(fetchUsers, 30000)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>