// 导入Pinia的defineStore方法
import { defineStore } from 'pinia'

// 顶部新增 IndexedDB 封装
import { openDB } from 'idb';

const chatDB = openDB('chat-db', 1, {
  upgrade(db) {
    db.createObjectStore('chat-store');
  }
});

const indexedDbStorage = {
  async getItem(key) {
    return (await chatDB).get('chat-store', key);
  },
  async setItem(key, value) {
    return (await chatDB).put('chat-store', value, key);
  },
  async removeItem(key) {
    return (await chatDB).delete('chat-store', key);
  }
};

// 定义一个名为'chat'的Pinia存储
export const useChatStore = defineStore('chat', {
    // 存储的初始状态
    state: () => ({
        recordedSessions: {
            // 会话列表
            sessionList: [],
            // 会话消息内容，以会话ID为键
            messages: {}
        },
        activeSessionId: null, // 当前活动会话ID
        isLoading: false,     // 加载状态标识
        tokenCount: {         // Token使用统计
            total: 0,         // 总Token数
            prompt: 0,        // 提示部分使用的Token
            completion: 0     // 补全部分使用的Token
        }
    }),

    // 定义操作状态的方法
    actions: {
        // 创建新会话
        createSession(title = '新会话') {
            const sessionId = 'session_' + Date.now();
            // 添加到会话列表
            this.recordedSessions.sessionList.push({
                id: sessionId,
                title: title,
                createdAt: new Date().toISOString()
            });
            // 初始化该会话的消息数组
            this.recordedSessions.messages[sessionId] = [];
            // 设置为当前活动会话
            this.activeSessionId = sessionId;
            return sessionId;
        },

        // 切换当前会话
        setActiveSession(sessionId) {
            this.activeSessionId = sessionId;
        },

        // 删除会话
        deleteSession(sessionId) {
            // 从会话列表中移除
            this.recordedSessions.sessionList = this.recordedSessions.sessionList.filter(
                session => session.id !== sessionId
            );
            // 删除对应的消息记录
            delete this.recordedSessions.messages[sessionId];
            
            // 如果删除的是当前活动会话，则切换到第一个会话或设为null
            if (this.activeSessionId === sessionId) {
                this.activeSessionId = this.recordedSessions.sessionList.length > 0 
                    ? this.recordedSessions.sessionList[0].id 
                    : null;
            }
        },

        // 添加新消息到当前会话
        addMessage(message) {
            // 确保有活动会话
            if (!this.activeSessionId) {
                this.createSession();
            }
            
            // 添加消息到当前会话
            this.recordedSessions.messages[this.activeSessionId].push({
                id: Date.now(),                // 生成唯一ID
                timestamp: new Date().toISOString(),  // 记录时间戳
                ...message                     // 展开传入的消息内容（包含role和content）
            });
        },

        // 更新最后一条消息的内容（用于流式响应）
        updateLastMessage(content) {
            if (!this.activeSessionId) return;
            
            const messages = this.recordedSessions.messages[this.activeSessionId];
            if (messages && messages.length > 0) {
                const lastMessage = messages[messages.length - 1];
                lastMessage.content = content;  // 直接修改最后一条消息内容
            }
        },

        // 更新Token统计（通常用于AI响应后）
        updateTokenCount(usage) {
            this.tokenCount.prompt += usage.prompt_tokens      // 累加提示Token
            this.tokenCount.completion += usage.completion_tokens // 累加补全Token
            this.tokenCount.total += usage.total_tokens        // 累加总Token
        },

        // 清空当前会话的消息
        clearMessages() {
            if (this.activeSessionId) {
                this.recordedSessions.messages[this.activeSessionId] = [];
            }
        },
        
        // 初始化存储（如果没有会话则创建一个）
        initStore() {
            if (this.recordedSessions.sessionList.length === 0) {
                this.createSession('默认会话');
            } else if (!this.activeSessionId && this.recordedSessions.sessionList.length > 0) {
                this.activeSessionId = this.recordedSessions.sessionList[0].id;
            }
        }
    },

    // 计算属性
    getters: {
        // 获取当前会话的消息
        currentMessages: (state) => {
            if (!state.activeSessionId) return [];
            return state.recordedSessions.messages[state.activeSessionId] || [];
        }
    },

    // 修改持久化配置部分
    persist: {
        enabled: true,
        strategies: [
            {
                key: 'ai-chat-history-v2',  // 更新key版本避免冲突
                storage: indexedDbStorage,  // 使用IndexedDB存储
            },
        ],
    },
})
