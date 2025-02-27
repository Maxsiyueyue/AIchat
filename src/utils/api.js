import { useSettingsStore } from '../stores/settings'

const API_BASE_URL = 'https://api.siliconflow.cn/v1'

const createHeaders = () => {
    const settingsStore = useSettingsStore()
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settingsStore.apiKey}`
    }
}

export const chatApi = {
    async sendMessage(messages, stream = false) {
        const settingsStore = useSettingsStore()
        const payload = {
            model: settingsStore.model,
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

        // 深拷贝 payload（推荐使用 structuredClone，如果环境不支持，则用 JSON 方式）
        const newPayload = structuredClone ? structuredClone(payload) : JSON.parse(JSON.stringify(payload));

        // 找到最后一个 role 为 'user' 的消息
        const lastUserMessage = [...newPayload.messages].reverse().find(msg => msg.role === 'user');

        if (lastUserMessage) {
            lastUserMessage.content = "现在你是一位女大学生，并且作为我的女朋友跟我进行对话，下面我开始跟你对话了：\n\n" + lastUserMessage.content;
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
            messages,
            temperature: settingsStore.temperature,
            max_tokens: settingsStore.maxTokens
        }

        // 深拷贝 payload（推荐使用 structuredClone，如果环境不支持，则用 JSON 方式）
        const newPayload = structuredClone ? structuredClone(payload) : JSON.parse(JSON.stringify(payload));

        // 找到最后一个 role 为 'user' 的消息
        const lastUserMessage = [...newPayload.messages].reverse().find(msg => msg.role === 'user');

        if (lastUserMessage) {
            lastUserMessage.content = "现在你是一个真人，并且作为我的女朋友跟我进行对话，下面我开始跟你对话了：\n\n" + lastUserMessage.content;
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