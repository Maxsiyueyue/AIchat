import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import 'element-plus/dist/index.css'
import './assets/styles/main.scss'
import router from './router'
import App from './App.vue'
import { io } from 'socket.io-client'

// 使用深色代码主题
import 'highlight.js/styles/github-dark.css'

const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(pinia)
app.use(router)
app.use(ElementPlus)
app.mount('#app')

// 连接Socket.io服务器（仅在非管理页面）
if (!window.location.pathname.startsWith('/admin')) {
  // 修改连接配置，尝试解决连接错误
  const socket = io('http://localhost:5001', {
    withCredentials: false,
    transports: ['polling'],
    reconnectionAttempts: 10, // 增加重连次数
    reconnectionDelay: 2000, // 增加重连延迟
    timeout: 30000, // 增加超时时间
    autoConnect: true, // 自动连接
    forceNew: true, // 强制创建新连接
    path: '/socket.io' // 明确指定路径
  })
  
  // 连接成功
  socket.on('connect', () => {
    console.log('已连接到服务器')
    
    // 发送设备信息
    const deviceInfo = {
      os: getOS(),
      browser: getBrowser(),
      device: getDeviceType()
    }
    
    socket.emit('device-info', deviceInfo)
  })
  
  // 连接错误
  socket.on('connect_error', (error) => {
    console.error('连接服务器失败:', error)
  })
  
  // 将socket实例添加到window对象，以便在其他组件中使用
  window.socket = socket
}

// 获取操作系统信息
function getOS() {
  const userAgent = window.navigator.userAgent
  
  if (userAgent.indexOf('Windows') !== -1) return 'Windows'
  if (userAgent.indexOf('Mac') !== -1) return 'MacOS'
  if (userAgent.indexOf('Linux') !== -1) return 'Linux'
  if (userAgent.indexOf('Android') !== -1) return 'Android'
  if (userAgent.indexOf('iOS') !== -1 || userAgent.indexOf('iPhone') !== -1 || userAgent.indexOf('iPad') !== -1) return 'iOS'
  
  return 'Unknown'
}

// 获取浏览器信息
function getBrowser() {
  const userAgent = window.navigator.userAgent
  
  if (userAgent.indexOf('Edge') !== -1) return 'Edge'
  if (userAgent.indexOf('Chrome') !== -1) return 'Chrome'
  if (userAgent.indexOf('Firefox') !== -1) return 'Firefox'
  if (userAgent.indexOf('Safari') !== -1) return 'Safari'
  if (userAgent.indexOf('MSIE') !== -1 || userAgent.indexOf('Trident') !== -1) return 'IE'
  
  return 'Unknown'
}

// 获取设备类型
function getDeviceType() {
  const userAgent = window.navigator.userAgent
  
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
    return 'Mobile'
  }
  
  if (/iPad|Tablet|PlayBook/i.test(userAgent)) {
    return 'Tablet'
  }
  
  return 'Desktop'
}
