import { useSettingsStore } from '../stores/settings'
// 修改 API 地址
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://你的render域名.onrender.com/api'
const ADMIN_API_URL = import.meta.env.VITE_ADMIN_API_URL || 'https://你的render域名.onrender.com/api'

const createHeaders = () => {
    const settingsStore = useSettingsStore()
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settingsStore.apiKey}`
    }
}

// 创建admin axios实例
const apiClient = {
    baseURL: ADMIN_API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
}

export const chatApi = {
    async sendMessage(messages, stream = false) {
        const settingsStore = useSettingsStore()
        const payload = {
            model: settingsStore.model,
            Value: settingsStore.value,
            messages,
            temperature: settingsStore.temperature,
            max_tokens: settingsStore.maxTokens,
            stream,
            top_p: 0.7,
            top_k: 50,
            frequency_penalty: 0.5,
            n: 1,
            response_format: {
                type: "text"
            },
            tools: [{
                type: "function",
                function: {
                    description: "<string>",
                    name: "<string>",
                    parameters: {},
                    strict: true
                }
            }]
        }

        const newPayload = structuredClone ? structuredClone(payload) : JSON.parse(JSON.stringify(payload));

        const lastUserMessage = [...newPayload.messages].reverse().find(msg => msg.role === 'user');

        // 关键词
        if (lastUserMessage) {
            switch (payload.Value) {
                case 'Option1':
                    lastUserMessage.content = "从现在开始你是一名中文写作改进助理，你的任务是改进所提供文本的拼写、语法、清晰、简洁和整体可读性，同时分解长句，减少重复，并提供改进建议。请只提供文本的更正版本，避免包括解释。请从编辑以下文本开始：\n\n" + lastUserMessage.content;
                    break;
                case 'Option2':
                    lastUserMessage.content = "从现在开始你是一位中国的女大学生，模仿网络上大女学生的语气，并且作为我的女朋友跟我进行对话，下面我开始跟你对话了：\n\n" + lastUserMessage.content;
                    break;
                case 'Option3':
                    lastUserMessage.content = "从现在开始你是一名 Vue3 开发人员，你的任务是使用 npm、Vite、Vue3、Pinia等工具。你的响应应该是满足以下要求的代码：使用 Vue3 的 Composition API 和 `<script setup>`语法将模板, 脚本和样式组合到一个vue文件中去，下面我开始提要求了：\n\n" + lastUserMessage.content;
                    break;
                case 'Option4':
                    lastUserMessage.content = "从现在开始你是一个正则表达式生成器，下面我开始提要求了：\n\n" + lastUserMessage.content;
                    break;
                case 'Option5':
                    lastUserMessage.content = "从现在开始你是一个将以下文字概括为 100 个字，使其易于阅读和理解。避免使用复杂的句子结构或技术术语：\n\n" + lastUserMessage.content;
                    break;
            }
        }

        const response = await fetch(`${API_BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                ...createHeaders(),
                ...(stream && { 'Accept': 'text/event-stream' })
            },
            body: JSON.stringify(newPayload)
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        if (stream) {
            return response
        }

        return await response.json()
    },

    async sendAsyncMessage(messages) {
        const settingsStore = useSettingsStore()

        const payload = {
            model: settingsStore.model,
            Value: settingsStore.value,
            messages,
            temperature: settingsStore.temperature,
            max_tokens: settingsStore.maxTokens
        }

        // 深拷贝 payload（推荐使用 structuredClone，如果环境不支持，则用 JSON 方式）
        const newPayload = structuredClone ? structuredClone(payload) : JSON.parse(JSON.stringify(payload));

        // 找到最后一个 role 为 'user' 的消息
        const lastUserMessage = [...newPayload.messages].reverse().find(msg => msg.role === 'user');

        if (lastUserMessage) {
            switch (payload.Value) {
                case 'Option1':
                    lastUserMessage.content = "从现在开始你是一名中文写作改进助理，你的任务是改进所提供文本的拼写、语法、清晰、简洁和整体可读性，同时分解长句，减少重复，并提供改进建议。请只提供文本的更正版本，避免包括解释。请从编辑以下文本开始：\n\n" + lastUserMessage.content;
                    break;
                case 'Option2':
                    lastUserMessage.content = "从现在开始你是一位中国的女大学生，模仿网络上大女学生的语气，并且作为我的女朋友跟我进行对话，下面我开始跟你对话了：\n\n" + lastUserMessage.content;
                    break;
                case 'Option3':
                    lastUserMessage.content = "从现在开始你是一名 Vue3 开发人员，你的任务是使用 npm、Vite、Vue3、Pinia等工具。你的响应应该是满足以下要求的代码：使用 Vue3 的 Composition API 和 `<script setup>`语法将模板, 脚本和样式组合到一个vue文件中去，下面我开始提要求了：\n\n" + lastUserMessage.content;
                    break;
                case 'Option4':
                    lastUserMessage.content = "从现在开始你是一个正则表达式生成器，下面我开始提要求了：\n\n" + lastUserMessage.content;
                    break;
                case 'Option5':
                    lastUserMessage.content = "从现在开始你是一个将以下文字概括为 100 个字，使其易于阅读和理解。避免使用复杂的句子结构或技术术语：\n\n" + lastUserMessage.content;
                    break;
            }
        }

        const response = await fetch(`${API_BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                ...createHeaders(),
                ...(stream && { 'Accept': 'text/event-stream' })
            },
            body: JSON.stringify(newPayload)
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        return await response.json()
    },

    async getAsyncResult(taskId) {
        const response = await fetch(`${API_BASE_URL}/async-result/${taskId}`, {
            method: 'GET',
            headers: createHeaders()
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        return await response.json()
    }
}

// 管理API
export const adminApi = {
    // 管理员登录
    async login(username, password) {
        try {
            console.log('发送登录请求:', { username, password: '***' });
            
            // 确保用户名和密码是字符串类型
            const userData = {
                username: String(username),
                password: String(password)
            };
            
            const response = await fetch(`${ADMIN_API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData),
                credentials: 'include' // 添加这一行，确保携带cookies
            });
            
            console.log('登录响应状态:', response.status);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('登录失败:', errorData);
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('登录成功');
            return data;
        } catch (error) {
            console.error('登录请求错误:', error);
            throw error;
        }
    },

    // 获取在线用户
    async getOnlineUsers(token) {
        try {
            const response = await fetch(`${ADMIN_API_URL}/stats/online`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                }
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            
            // 检查响应是否为空
            const text = await response.text();
            if (!text || text.trim() === '') {
                console.warn('服务器返回了空响应');
                return { onlineCount: 0, users: [] };
            }
            
            try {
                // 尝试解析JSON
                const data = JSON.parse(text);
                return data;
            } catch (parseError) {
                console.error('JSON解析失败:', parseError, '原始响应:', text);
                // 返回默认值而不是抛出错误
                return { onlineCount: 0, users: [] };
            }
        } catch (error) {
            console.error('获取在线用户错误:', error);
            // 返回默认值而不是重新抛出错误
            return { onlineCount: 0, users: [] };
        }
    },

    // 获取设备统计
    async getDeviceStats(token) {
        try {
            const response = await fetch(`${ADMIN_API_URL}/stats/devices`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                }
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || `HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            throw error.response ? error.response.data : new Error('获取设备统计失败');
        }
    }
};
