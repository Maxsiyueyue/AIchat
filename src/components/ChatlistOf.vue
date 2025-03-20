<template>
  <div class="chat-sidebar">
    <!-- 搜索框 -->
    <div class="search-box">
      <el-input
        v-model="search"
        placeholder="请输入关键词查询"
        class="search-input"
        :suffix-icon="Search"
      >
      </el-input>

      <!-- 新建聊天按钮 -->
      <el-button class="new-chat-btn" @click="createChat">
        <el-icon><plus /></el-icon>
      </el-button>
    </div>
    <!-- 聊天列表 -->
    <div class="chat-list">
      <el-button
        v-for="session in filteredSessions"
        :key="session.id"
        class="chat-item"
        :class="{ 'is-active': session.id === activeSessionId }"
        @click="selectChat(session.id)"
        size="large"
        link
      >
        <div class="chat-item-btn">
          <span class="chat-title">{{ getSessionTitle(session) }}</span>
          <div class="chat-actions">
            <el-icon @click.stop="editChat(session.id)"><EditPen /></el-icon>
            <el-icon @click.stop="deleteChat(session.id)"><delete /></el-icon>
          </div>
        </div>
      </el-button>
    </div>
  </div>
</template>
  
<script setup>
import { ref, onMounted, computed, inject, watch } from "vue";
import { Search, Plus, EditPen, Delete } from "@element-plus/icons-vue";
import { useChatStore } from "../stores/chat";
import { ElMessageBox } from "element-plus";

const chatStore = useChatStore();

// 搜索框
const search = ref("");

// 计算属性：会话列表和当前活动会话ID
const sessionList = computed(() => chatStore.recordedSessions.sessionList);
const activeSessionId = computed({
  get: () => chatStore.activeSessionId,
  set: (value) => chatStore.setActiveSession(value),
});

// 获取会话标题的方法
const getSessionTitle = (session) => {
  const messages = chatStore.recordedSessions.messages[session.id] || [];
  const firstUserMessage = messages.find((m) => m.role === "user");
  if (firstUserMessage?.content.length <= 5) {
    return firstUserMessage?.content || session.title;
  } else if (firstUserMessage?.content.length > 5) {
    return firstUserMessage?.content.slice(0, 5) + "..." || session.title;
  } else {
    return session.title;
  }
};

// 过滤后的会话列表（根据搜索关键词）
const filteredSessions = computed(() => {
  if (!search.value) return sessionList.value;
  return sessionList.value.filter((session) =>
    session.title.toLowerCase().includes(search.value.toLowerCase())
  );
});

// 选择聊天
const selectChat = (id) => {
  chatStore.setActiveSession(id);
};

// 创建新聊天
const createChat = () => {
  const newTitle = `新会话${sessionList.value.length + 1}`;
  chatStore.createSession(newTitle);
};

// 编辑聊天
const editChat = (id) => {
  const session = sessionList.value.find((s) => s.id === id);
  if (!session) return;

  ElMessageBox.prompt("请输入新的会话名称", "编辑会话", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    inputValue: session.title,
  })
    .then(({ value }) => {
      if (value) {
        session.title = value;
      }
    })
    .catch(() => {
      // 用户取消操作
    });
};

// 删除聊天
const deleteChat = (id) => {
  ElMessageBox.confirm("确定要删除这个会话吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      chatStore.deleteSession(id);
    })
    .catch(() => {
      // 用户取消操作
    });
};

onMounted(() => {
  // 初始化存储
  chatStore.initStore();
});
</script>
  
<style lang="scss" scoped>
.chat-sidebar {
  border-right: 1px solid var(--border-color);
  width: 300px;
  background-color: var(--bg-color);
  padding: 10px 0 10px 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.search-box {
  display: flex;
  padding: 10px;
  border-bottom: 1px solid var(--border-color);
}

// 搜索框
.search-input {
  .el-input__inner {
    padding-left: 35px;
  }
}

// 新建聊天按钮
.new-chat-btn {
  margin-left: 10px;
  width: 32px;
}

// 聊天列表
.chat-list {
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 0 10px;
  :deep(.el-button > span) {
    width: 100%;
  }

  .chat-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    text-align: left;
    width: 100%;
    padding: 10px;
    font-size: 14px;
    border-radius: 6px;
    margin: 0;
    
    &.is-active {
      background-color: #3F9EFF !important;
      color: white !important;
      
      .chat-title {
        color: white !important;
      }
      
      .el-icon {
        color: white !important;
      }
    }
    width: 100%;

    .chat-item-btn {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding: 10px;
    }

    .chat-title {
      flex: 1;
    }

    .chat-actions {
      display: flex;
      gap: 8px;

      .el-icon {
        cursor: pointer;
      }
    }
  }
}
</style>