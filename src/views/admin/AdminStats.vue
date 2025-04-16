<template>
  <div class="admin-stats">
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>操作系统分布</span>
              <el-button type="primary" size="small" @click="fetchStats">刷新</el-button>
            </div>
          </template>
          <div style="height: 400px">
            <div ref="osChartRef" style="width: 100%; height: 100%"></div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>浏览器分布</span>
            </div>
          </template>
          <div style="height: 400px">
            <div ref="browserChartRef" style="width: 100%; height: 100%"></div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>设备类型分布</span>
            </div>
          </template>
          <div style="height: 400px">
            <div ref="deviceChartRef" style="width: 100%; height: 100%"></div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>访问统计数据</span>
            </div>
          </template>
          <el-table :data="visitStats" style="width: 100%" v-loading="loading">
            <el-table-column prop="date" label="日期" width="180" />
            <el-table-column prop="visits" label="访问量" width="120" />
            <el-table-column prop="uniqueUsers" label="独立用户" width="120" />
            <el-table-column prop="avgDuration" label="平均停留时间(分钟)" />
            <el-table-column prop="messageCount" label="消息数量" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import * as echarts from 'echarts/core'
import { PieChart, BarChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

// 注册必要的组件
echarts.use([
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  PieChart,
  BarChart,
  CanvasRenderer
])

const router = useRouter()
const loading = ref(false)
const visitStats = ref([])
const osChartRef = ref(null)
const browserChartRef = ref(null)
const deviceChartRef = ref(null)
let osChart = null
let browserChart = null
let deviceChart = null
let timer = null

// 获取统计数据
const fetchStats = async () => {
  loading.value = true
  try {
    const token = localStorage.getItem('admin-token')
    if (!token) {
      router.push('/admin/login')
      return
    }
    
    const response = await axios.get('http://localhost:5000/api/stats/devices', {
      headers: { 'x-auth-token': token }
    })
    
    // 初始化图表
    initOSChart(response.data.os)
    initBrowserChart(response.data.browser)
    initDeviceChart(response.data.device)
    
    // 模拟访问统计数据
    const today = new Date()
    visitStats.value = Array.from({ length: 7 }).map((_, index) => {
      const date = new Date(today)
      date.setDate(date.getDate() - index)
      return {
        date: date.toLocaleDateString(),
        visits: Math.floor(Math.random() * 500) + 100,
        uniqueUsers: Math.floor(Math.random() * 300) + 50,
        avgDuration: (Math.random() * 10 + 2).toFixed(1),
        messageCount: Math.floor(Math.random() * 2000) + 500
      }
    }).reverse()
  } catch (error) {
    console.error('获取统计数据失败:', error)
    if (error.response?.status === 401) {
      ElMessage.error('登录已过期，请重新登录')
      router.push('/admin/login')
    } else {
      ElMessage.error('获取统计数据失败')
    }
  } finally {
    loading.value = false
  }
}

// 初始化操作系统图表
const initOSChart = (data) => {
  if (!osChartRef.value) return
  
  if (!osChart) {
    osChart = echarts.init(osChartRef.value)
  }
  
  const options = {
    title: {
      text: '操作系统分布',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      data: Object.keys(data)
    },
    series: [
      {
        name: '操作系统',
        type: 'pie',
        radius: '60%',
        center: ['50%', '50%'],
        data: Object.keys(data).map(key => ({
          name: key || 'Unknown',
          value: data[key]
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
  
  osChart.setOption(options)
}

// 初始化浏览器图表
const initBrowserChart = (data) => {
  if (!browserChartRef.value) return
  
  if (!browserChart) {
    browserChart = echarts.init(browserChartRef.value)
  }
  
  const options = {
    title: {
      text: '浏览器分布',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: Object.keys(data)
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '使用量',
        type: 'bar',
        data: Object.values(data),
        itemStyle: {
          color: '#409EFF'
        }
      }
    ]
  }
  
  browserChart.setOption(options)
}

// 初始化设备类型图表
const initDeviceChart = (data) => {
  if (!deviceChartRef.value) return
  
  if (!deviceChart) {
    deviceChart = echarts.init(deviceChartRef.value)
  }
  
  const options = {
    title: {
      text: '设备类型分布',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'horizontal',
      bottom: 'bottom',
      data: Object.keys(data)
    },
    series: [
      {
        name: '设备类型',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '18',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: Object.keys(data).map(key => ({
          name: key || '桌面设备',
          value: data[key]
        }))
      }
    ]
  }
  
  deviceChart.setOption(options)
}

// 窗口大小变化时重新调整图表大小
const handleResize = () => {
  osChart && osChart.resize()
  browserChart && browserChart.resize()
  deviceChart && deviceChart.resize()
}

onMounted(() => {
  fetchStats()
  // 定时刷新数据
  timer = setInterval(fetchStats, 60000)
  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
  // 移除事件监听
  window.removeEventListener('resize', handleResize)
  // 销毁图表实例
  osChart && osChart.dispose()
  browserChart && browserChart.dispose()
  deviceChart && deviceChart.dispose()
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>