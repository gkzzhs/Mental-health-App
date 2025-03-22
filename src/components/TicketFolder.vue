<template>
  <div class="ticket-folder">
    <div class="folder-header" @click="toggleFolder">
      <span class="folder-icon">📁</span>
      <span class="folder-title">我的心灵车票</span>
      <span class="ticket-count">({{ tickets.length }})</span>
      <span class="folder-toggle">{{ isOpen ? '▼' : '▶' }}</span>
    </div>
    
    <div class="folder-content" v-if="isOpen">
      <div v-if="tickets.length === 0" class="empty-folder">
        <p>暂无保存的车票</p>
      </div>
      <div v-else class="ticket-list">
        <div 
          v-for="(ticket, index) in tickets" 
          :key="index" 
          class="ticket-item"
          :class="`theme-${ticket.mood}`"
          @click="selectTicket(ticket)"
        >
          <div class="ticket-item-header">
            <span class="train-number">{{ ticket.trainNumber }}</span>
            <span class="train-date">{{ formatDate(ticket.date) }}</span>
          </div>
          <div class="ticket-item-route">
            <span class="departure">{{ ticket.departure }}</span>
            <span class="route-arrow">→</span>
            <span class="destination">{{ ticket.destination }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  name: 'TicketFolder',
  props: {
    tickets: {
      type: Array,
      default: () => []
    }
  },
  emits: ['select-ticket'],
  setup(props, { emit }) {
    const isOpen = ref(false);
    
    const toggleFolder = () => {
      isOpen.value = !isOpen.value;
    };
    
    const selectTicket = (ticket) => {
      emit('select-ticket', ticket);
    };
    
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return `${date.getMonth() + 1}月${date.getDate()}日`;
    };
    
    return {
      isOpen,
      toggleFolder,
      selectTicket,
      formatDate
    };
  }
};
</script>

<style scoped>
.ticket-folder {
  width: 100%;
  max-width: 400px;
  margin: 20px auto;
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.18);
}

.folder-header {
  display: flex;
  align-items: center;
  padding: 14px 18px;
  background: linear-gradient(45deg, rgba(90, 200, 250, 0.8), rgba(90, 200, 250, 0.4));
  color: white;
  cursor: pointer;
  transition: background 0.3s ease;
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
}

.folder-header:hover {
  background: linear-gradient(45deg, #4AB8EA, rgba(80, 190, 240, 0.3));
}

.folder-icon {
  margin-right: 10px;
  font-size: 18px;
}

.folder-title {
  font-weight: 500;
  flex: 1;
}

.ticket-count {
  margin-right: 10px;
  opacity: 0.8;
  font-size: 14px;
}

.folder-toggle {
  font-size: 12px;
}

.folder-content {
  background: rgba(255, 255, 255, 0.7);
  max-height: 300px;
  overflow-y: auto;
  transition: max-height 0.3s ease;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.empty-folder {
  padding: 20px;
  text-align: center;
  color: #999;
}

.ticket-list {
  padding: 10px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  gap: 10px;
}

.ticket-item {
  background: rgba(255, 255, 255, 0.7);
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.ticket-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.ticket-item-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 12px;
  color: #666;
}

.ticket-item-route {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
}

.route-arrow {
  color: #999;
  margin: 0 5px;
}

/* 主题样式 */
.theme-happy {
  border-left: 3px solid #FF9500;
}

.theme-anxious {
  border-left: 3px solid #AF52DE;
}

.theme-calm {
  border-left: 3px solid #5AC8FA;
}

.theme-sad {
  border-left: 3px solid #007AFF;
}

.theme-angry {
  border-left: 3px solid #FF3B30;
}

.theme-tired {
  border-left: 3px solid #8E8E93;
}
</style>