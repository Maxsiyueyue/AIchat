// 引入 Pinia 的 defineStore 方法，用于定义一个新的 store
import { defineStore } from 'pinia'

// 定义一个名为 'settings' 的 store
export const useSettingsStore = defineStore('settings', {
    // 定义 store 的状态
    state: () => ({
        // 是否启用深色模式，默认为 false
        isDarkMode: false,
        // 温度参数，控制生成文本的随机性，默认值为 0.7
        temperature: 0.7,
        // 最大 token 数量，默认值为 1000
        maxTokens: 1000,
        // 使用的模型名称，默认为 'THUDM/glm-4-9b-chat'
        model: 'THUDM/glm-4-9b-chat',
        // API 密钥，默认为空字符串
        apiKey: '',
        // 是否启用流式响应，默认为 true
        streamResponse: true,
        // Top P 参数
        topP: 0.7,
        // Top K 参数
        topK: 50,
        // 默认提示词
        value: 'Option2',
    }),

    // 定义 store 的动作
    actions: {
        // 切换深色模式
        toggleDarkMode() {
            this.isDarkMode = !this.isDarkMode
            // 根据当前的深色模式状态设置 HTML 元素的 data-theme 属性
            document.documentElement.setAttribute('data-theme', this.isDarkMode ? 'dark' : 'light')
        },

        // 更新设置
        updateSettings(settings) {
            // 使用 Object.assign 方法将传入的设置对象合并到当前 store 的状态中
            Object.assign(this.$state, settings)
        },
    },

    // 配置持久化选项
    persist: {
        // 启用持久化功能
        enabled: true,
        // 持久化策略数组
        strategies: [
            {
                key: 'ai-chat-settings',
                storage: localStorage,
            },
        ],
    },
})

export const modelOptions = [
    { label: '甄嬛（GLM-4-9B）', value: 'THUDM/glm-4-9b-chat' },
    { label: '华妃（Qwen2.5-7B）', value: 'Qwen/Qwen2.5-7B-Instruct' },
    { label: '安陵容（Qwen2.5-Coder-7B）', value: 'Qwen/Qwen2.5-Coder-7B-Instruct' },
    { label: '沈眉庄（Meta-Llama-3.1-8B）', value: 'meta-llama/Meta-Llama-3.1-8B-Instruct' },
    { label: '乌拉那拉·宜修（DeepSeek-V2.5）', value: 'deepseek-ai/DeepSeek-V2.5' },
    { label: '敬妃（DeepSeek-V3）', value: 'deepseek-ai/DeepSeek-V3' },
]

// 初始化提示词
export const theSuggestionWord = [
    {
        value: "Option1",
        label: "写作助理",
    },
    {
        value: "Option2",
        label: "ai对象",
    },
    {
        value: "Option3",
        label: "开发：Vue3",
    },
    {
        value: "Option4",
        label: "正则生成器",
    },
    {
        value: "Option5",
        label: "内容总结",
    },
];
