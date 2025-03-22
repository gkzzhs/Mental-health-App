<template>
  <div class="ticket-container" :class="ticketThemeClass">
    <!-- 车票生成动画容器 -->
    <div class="ticket-generation-container" v-if="showGenerationAnimation">
      <div class="paper-fold" :class="{ 'fold-complete': foldComplete }">
        {{ inputContent }}
      </div>
    </div>
    
    <!-- 心灵车票主体 - 整合设计 -->
    <div class="ticket unified-ticket" :class="{ 'ticket-appear': ticketAppear }" v-show="!showGenerationAnimation || ticketAppear">
      <!-- 车票左侧 - 基本信息 -->
      <div class="ticket-left">
        <div class="airline-info">
          <div class="airline-logo" :class="themeIconClass">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <use :href="`#icon-${ticket.mood}`"></use>
            </svg>
          </div>
          <div class="airline-details">
            <span class="airline-name">心灵航空</span>
            <span class="flight-type">{{ getFlightType(ticket.mood) }}</span>
          </div>
        </div>
        
        <!-- 航班信息 -->
        <div class="flight-info">
          <div class="flight-number">航班号 {{ ticket.trainNumber }}</div>
          <div class="flight-class">{{ getFlightClass(ticket.mood) }}</div>
        </div>
        
        <!-- 乘客信息 -->
        <div class="passenger-info">
          <div class="passenger">
            <div class="label">乘客</div>
            <div class="value">心灵旅行者</div>
          </div>
          <div class="seat">
            <div class="label">座位</div>
            <div class="value">{{ ticket.seatNumber }}</div>
          </div>
        </div>
        
        <!-- 票价信息 -->
        <div class="price-info">
          <div class="label">票价</div>
          <div class="value">{{ ticket.price }}</div>
        </div>
        
        <!-- 印章 -->
        <div class="ticket-stamp" :class="{ 'stamped': isStamped }">
          <div class="stamp-date">{{ ticket.date }}</div>
          <div class="stamp-id">{{ ticket.trainNumber }}</div>
        </div>
      </div>
      
      <!-- 车票中间部分 - 路线和动画 -->
      <div class="ticket-middle">
        <!-- 路线信息 -->
        <div class="route-info">
          <div class="departure-info">
            <div class="city-code">{{ getCityCode(ticket.departure) }}</div>
            <div class="city-name">{{ ticket.departure }}</div>
            <div class="time-info">
              <div class="label">出发</div>
              <div class="value">{{ ticket.departureTime }}</div>
            </div>
          </div>
          
          <div class="journey-container">
            <div class="journey-line"></div>
            <div class="plane-icon rotating-plane">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path d="M21,16V14L13,9V3.5A1.5,1.5,0,0,0,11.5,2A1.5,1.5,0,0,0,10,3.5V9L2,14V16L10,13.5V19L8,20.5V22L11.5,21L15,22V20.5L13,19V13.5Z" :fill="`var(--theme-color)`"/>
              </svg>
            </div>
          </div>
          
          <div class="arrival-info">
            <div class="city-code">{{ getCityCode(ticket.destination) }}</div>
            <div class="city-name">{{ ticket.destination }}</div>
            <div class="time-info">
              <div class="label">到达</div>
              <div class="value">{{ ticket.arrivalTime }}</div>
            </div>
          </div>
        </div>
        
        <!-- 登机口信息 -->
        <div class="gate-info">
          <div class="gate">
            <div class="label">登机口</div>
            <div class="value">{{ getGateNumber(ticket.trainNumber) }}</div>
          </div>
          <div class="boarding">
            <div class="label">登机时间</div>
            <div class="value">{{ getBoardingTime(ticket.departureTime) }}</div>
          </div>
        </div>
        
        <!-- 关键词区域 -->
        <div class="keywords-container">
          <div 
            v-for="(keyword, index) in ticket.keywords" 
            :key="index" 
            class="keyword"
            :style="{
              fontSize: getKeywordSize(index) + 'px',
              opacity: 1 - (index * 0.15)
            }"
          >
            {{ keyword }}
          </div>
        </div>
        
        <!-- 条形码 -->
        <div class="barcode"></div>
        <div class="boarding-group">
          <div class="label">登机组</div>
          <div class="value">{{ getBoardingGroup(ticket.trainNumber) }}</div>
        </div>
      </div>
      
      <!-- 票撕边 - 整合设计 -->
      <div 
        class="ticket-tear" 
        @mousedown="startTearing" 
        @mousemove="updateTearing" 
        @mouseup="completeTearing"
        @mouseleave="cancelTearing"
      >
        <div class="tear-line">
          <div v-for="i in 20" :key="i" class="tear-dot"></div>
        </div>
        <div class="tear-hint" v-if="!isTearing && !isTorn">撕开这里</div>
        <div class="tear-progress" :style="{ height: tearProgress + '%' }"></div>
      </div>
      
      <!-- 票根部分 - 整合设计 -->
      <div class="ticket-stub" :class="{ 'torn': isTorn }">
        <div class="stub-content">
          <div class="advice-title">心灵小贴士</div>
          <div class="advice-content">{{ ticket.advice }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';

export default {
  name: 'MindTicket',
  props: {
    ticket: {
      type: Object,
      required: true
    },
    inputContent: {
      type: String,
      default: ''
    }
  },
  emits: ['torn'],
  setup(props, { emit }) {
    // 动画状态
    const showGenerationAnimation = ref(true);
    const foldComplete = ref(false);
    const ticketAppear = ref(false);
    const isStamped = ref(false);
    
    // 撕票状态
    const isTearing = ref(false);
    const isTorn = ref(false);
    const tearProgress = ref(0);
    const tearStartY = ref(0);
    
    // 车票主题样式
    const ticketThemeClass = computed(() => {
      return `theme-${props.ticket.mood}`;
    });
    
    // 主题图标样式
    const themeIconClass = computed(() => {
      return `icon-${props.ticket.mood}`;
    });
    
    // 获取航班类型
    const getFlightType = (mood) => {
      const flightTypes = {
        happy: '阳光航线',
        anxious: '治愈航线',
        calm: '深海航线',
        sad: '温暖航线',
        angry: '释放航线',
        tired: '休息航线'
      };
      return flightTypes[mood] || '心灵航线';
    };
    
    // 获取航班舱位等级
    const getFlightClass = (mood) => {
      const flightClasses = {
        happy: '阳光舱',
        anxious: '治愈舱',
        calm: '平静舱',
        sad: '温暖舱',
        angry: '释放舱',
        tired: '休息舱'
      };
      return flightClasses[mood] || '心灵舱';
    };
    
    // 获取城市代码（取城市名前三个字的首字母大写）
    const getCityCode = (cityName) => {
      if (!cityName) return 'XXX';
      
      // 提取前三个字符并转为大写
      const code = cityName.substring(0, 3)
        .split('')
        .map(char => {
          const pinyin = getPinyinChar(char);
          return pinyin.charAt(0).toUpperCase();
        })
        .join('');
      
      return code.padEnd(3, 'X');
    };
    
    // 获取汉字拼音首字母（简化版）
    const getPinyinChar = (char) => {
      const pinyinMap = {
        '心': 'xin', '灵': 'ling', '快': 'kuai', '乐': 'le', '开': 'kai',
        '心': 'xin', '焦': 'jiao', '虑': 'lv', '平': 'ping', '静': 'jing',
        '悲': 'bei', '伤': 'shang', '难': 'nan', '过': 'guo', '愤': 'fen',
        '怒': 'nu', '生': 'sheng', '气': 'qi', '疲': 'pi', '惫': 'bei',
        '累': 'lei', '放': 'fang', '松': 'song', '城': 'cheng', '市': 'shi',
        '海': 'hai', '洋': 'yang', '山': 'shan', '峰': 'feng', '湖': 'hu',
        '泊': 'bo', '森': 'sen', '林': 'lin', '草': 'cao', '原': 'yuan',
        '天': 'tian', '空': 'kong', '云': 'yun', '端': 'duan', '岛': 'dao',
        '屿': 'yu', '沙': 'sha', '滩': 'tan', '冰': 'bing', '川': 'chuan',
        '河': 'he', '流': 'liu', '瀑': 'pu', '布': 'bu', '星': 'xing',
        '光': 'guang', '月': 'yue', '亮': 'liang', '太': 'tai', '阳': 'yang'
      };
      
      return pinyinMap[char] || 'x';
    };
    
    // 获取登机口号码（基于航班号生成）
    const getGateNumber = (flightNumber) => {
      if (!flightNumber) return 'A1';
      
      // 从航班号提取数字部分
      const numPart = flightNumber.replace(/[^0-9]/g, '');
      
      // 生成登机口字母（A-F）
      const gateLetters = ['A', 'B', 'C', 'D', 'E', 'F'];
      const letterIndex = (numPart.length > 0) ? (parseInt(numPart.charAt(0)) % 6) : 0;
      const letter = gateLetters[letterIndex];
      
      // 生成登机口数字（1-20）
      const number = (numPart.length > 1) ? (parseInt(numPart.substring(1, 3)) % 20 + 1) : 1;
      
      return `${letter}${number}`;
    };
    
    // 获取登机时间（出发时间前40分钟）
    const getBoardingTime = (departureTime) => {
      if (!departureTime) return '00:00';
      
      // 解析出发时间
      const [hours, minutes] = departureTime.split(':').map(Number);
      
      // 计算登机时间（出发前40分钟）
      let boardingHours = hours;
      let boardingMinutes = minutes - 40;
      
      // 处理时间进位
      if (boardingMinutes < 0) {
        boardingMinutes += 60;
        boardingHours -= 1;
        if (boardingHours < 0) {
          boardingHours += 24;
        }
      }
      
      // 格式化时间
      return `${boardingHours.toString().padStart(2, '0')}:${boardingMinutes.toString().padStart(2, '0')}`;
    };
    
    // 根据关键词索引计算字体大小
    const getKeywordSize = (index) => {
      // 字体大小从大到小：20px, 18px, 16px, 14px, 12px
      const sizes = [20, 18, 16, 14, 12];
      return sizes[index] || 12;
    };
    
    // 开始撕票
    const startTearing = (event) => {
      isTearing.value = true;
      tearStartY.value = event.clientY;
    };
    
    // 更新撕票进度
    const updateTearing = (event) => {
      if (!isTearing.value) return;
      
      const ticketHeight = event.target.parentElement.offsetHeight;
      const deltaY = event.clientY - tearStartY.value;
      const progress = Math.min(100, Math.max(0, (deltaY / ticketHeight) * 100));
      
      tearProgress.value = progress;
      
      // 创建撕裂效果
      if (progress > 0) {
        createTearEffect(event.target, progress);
      }
    };
    
    // 创建撕裂效果
    const createTearEffect = (element, progress) => {
      // 这里可以使用Canvas实现更复杂的撕裂效果
      // 简化版本：调整边缘样式
      const tearLine = element.querySelector('.tear-line');
      if (tearLine) {
        tearLine.style.filter = `url(#torn-edge) blur(${progress / 50}px)`;
      }
    };
    
    // 完成撕票
    const completeTearing = () => {
      if (!isTearing.value) return;
      
      isTearing.value = false;
      
      if (tearProgress.value > 80) {
        // 撕票完成
        isTorn.value = true;
        emit('torn', props.ticket);
      } else {
        // 撕票未完成，重置
        tearProgress.value = 0;
      }
    };
    
    // 取消撕票
    const cancelTearing = () => {
      if (isTearing.value) {
        isTearing.value = false;
        tearProgress.value = 0;
      }
    };
    
    // 获取登机组信息（基于航班号生成）
    const getBoardingGroup = (flightNumber) => {
      if (!flightNumber) return '1';
      
      // 从航班号提取数字部分
      const numPart = flightNumber.replace(/[^0-9]/g, '');
      
      // 生成登机组号码（1-5）
      const groupNumber = (numPart.length > 0) ? (parseInt(numPart.charAt(0)) % 5 + 1) : 1;
      
      return `${groupNumber}`;
    };
    
    // 执行生成动画
    onMounted(() => {
      // 纸条折叠动画
      setTimeout(() => {
        foldComplete.value = true;
        
        // 纸条折叠完成后，显示飞机票
        setTimeout(() => {
          showGenerationAnimation.value = false;
          ticketAppear.value = true;
          
          // 飞机票出现后，添加印章
          setTimeout(() => {
            isStamped.value = true;
          }, 800);
        }, 1000);
      }, 500);
    });
    
    return {
      showGenerationAnimation,
      foldComplete,
      ticketAppear,
      isStamped,
      isTearing,
      isTorn,
      tearProgress,
      ticketThemeClass,
      themeIconClass,
      getFlightType,
      getFlightClass,
      getCityCode,
      getGateNumber,
      getBoardingTime,
      getBoardingGroup,
      getKeywordSize,
      startTearing,
      updateTearing,
      completeTearing,
      cancelTearing
    };
  }
};
</script>

<style scoped>
/* 全局变量 - 苹果设计规范 */
:root {
  --ios-radius: 12px;
  --ios-radius-sm: 8px;
  --ios-radius-lg: 16px;
  --ios-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  --ios-shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.08);
  --ios-shadow-lg: 0 12px 40px rgba(0, 0, 0, 0.16);
  --ios-blur: blur(20px);
  --ios-blur-light: blur(10px);
  --ios-border: 1px solid rgba(255, 255, 255, 0.18);
  --ios-transition: all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1.0);
  --ios-font: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', 'Helvetica Neue', sans-serif;
  --ios-spacing-xs: 4px;
  --ios-spacing-sm: 8px;
  --ios-spacing-md: 16px;
  --ios-spacing-lg: 24px;
}

.ticket-container {
  position: relative;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  perspective: 1000px;
  font-family: var(--ios-font);
}

/* 车票生成动画 */
.ticket-generation-container {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
}

.paper-fold {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: var(--ios-blur);
  -webkit-backdrop-filter: var(--ios-blur);
  padding: var(--ios-spacing-md);
  width: 80%;
  border-radius: var(--ios-radius-lg);
  box-shadow: var(--ios-shadow);
  border: var(--ios-border);
  transform-origin: center center;
  transition: all 0.8s cubic-bezier(0.68, -0.55, 0.27, 1.55);
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: #333;
  font-weight: 400;
}

.fold-complete {
  transform: scale(0.1) rotate(720deg);
  opacity: 0;
}

/* 飞机票样式 */
.ticket {
  position: relative;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: var(--ios-blur);
  -webkit-backdrop-filter: var(--ios-blur);
  border-radius: var(--ios-radius-lg);
  box-shadow: var(--ios-shadow-lg);
  border: var(--ios-border);
  overflow: hidden;
  transform: translateY(20px);
  opacity: 0;
  transition: var(--ios-transition);
  display: flex;
  flex-direction: column;
  margin-bottom: var(--ios-spacing-lg);
}

/* 统一车票样式 */
.unified-ticket {
  flex-direction: row;
  height: 320px;
  max-width: 100%;
  transform-style: preserve-3d;
  transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.horizontal-ticket:hover {
  transform: translateY(-5px) rotateX(2deg);
  box-shadow: var(--ios-shadow-lg), 0 20px 60px rgba(var(--theme-color-rgb), 0.2);
}

.ticket-appear {
  transform: translateY(0);
  opacity: 1;
  animation: iosAppear 0.8s cubic-bezier(0.23, 1, 0.32, 1) forwards;
}

/* 横向飞机票左侧部分 */
.ticket-left {
  width: 35%;
  padding: var(--ios-spacing-md);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-right: 1px dashed rgba(0, 0, 0, 0.1);
  position: relative;
  background: var(--theme-gradient);
  border-radius: var(--ios-radius-lg) 0 0 var(--ios-radius-lg);
}

.airline-info {
  display: flex;
  align-items: center;
  margin-bottom: var(--ios-spacing-md);
}

.airline-logo {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  margin-right: var(--ios-spacing-md);
  background-color: rgba(255, 255, 255, 0.2);
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  backdrop-filter: var(--ios-blur-light);
  -webkit-backdrop-filter: var(--ios-blur-light);
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: transform 0.3s ease;
}

.airline-logo:hover {
  transform: scale(1.05);
}

.airline-details {
  display: flex;
  flex-direction: column;
}

.airline-name {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  letter-spacing: -0.5px;
}

.flight-type {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  margin-top: var(--ios-spacing-xs);
}

.ticket-stamp {
  width: 60px;
  height: 60px;
  border: 2px dashed rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 10px;
  color: transparent;
  transform: rotate(-15deg);
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  opacity: 0;
  background-color: rgba(255, 255, 255, 0.9);
  align-self: center;
  margin-top: auto;
  box-shadow: var(--ios-shadow-sm);
}

.stamped {
  border-style: solid;
  border-width: 2px;
  border-color: #d32f2f;
  color: #d32f2f;
  opacity: 1;
  animation: iosPulse 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* 横向飞机票中间部分 */
.ticket-middle {
  flex: 1;
  padding: var(--ios-spacing-md);
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.95);
  position: relative;
}

/* 飞机票内容 */
.ticket-content {
  padding: var(--ios-spacing-md);
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--ios-spacing-md);
}

/* 航班信息 */
.flight-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--ios-spacing-sm);
  background-color: rgba(var(--theme-color-rgb), 0.03);
  padding: var(--ios-spacing-sm) var(--ios-spacing-md);
  border-radius: var(--ios-radius);
  backdrop-filter: var(--ios-blur-light);
  -webkit-backdrop-filter: var(--ios-blur-light);
}

.flight-number {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  letter-spacing: -0.3px;
}

.flight-class {
  font-size: 13px;
  color: var(--theme-color);
  background-color: rgba(var(--theme-color-rgb), 0.1);
  padding: 4px 10px;
  border-radius: var(--ios-radius);
  font-weight: 500;
}

/* 路线信息 */
.boarding-group {
  margin-top: var(--ios-spacing-sm);
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: rgba(var(--theme-color-rgb), 0.05);
  padding: var(--ios-spacing-sm);
  border-radius: var(--ios-radius);
}

.boarding-group .label {
  font-size: 12px;
  color: #666;
}

.boarding-group .value {
  font-size: 24px;
  font-weight: 700;
  color: var(--theme-color);
}
.route-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: var(--ios-spacing-md) 0;
  background-color: rgba(250, 250, 252, 0.8);
  padding: var(--ios-spacing-md);
  border-radius: var(--ios-radius-lg);
  box-shadow: var(--ios-shadow-sm);
}

.departure-info, .arrival-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 30%;
}

.city-code {
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.5px;
  color: #333;
  font-family: 'SF Pro Display', var(--ios-font);
}

.city-name {
  font-size: 13px;
  color: #666;
  margin-top: var(--ios-spacing-xs);
  font-weight: 500;
}

.journey-container {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60px;
  padding: 0 var(--ios-spacing-md);
}

.journey-line {
  width: 100%;
  height: 2px;
  background: linear-gradient(to right, rgba(var(--theme-color-rgb), 0.3), rgba(var(--theme-color-rgb), 0.7), rgba(var(--theme-color-rgb), 0.3));
  position: relative;
  border-radius: 2px;
}

.journey-line::before, .journey-line::after {
  content: '';
  position: absolute;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: var(--theme-color);
  top: 50%;
  transform: translateY(-50%);
}

.journey-line::before {
  left: 0;
}

.journey-line::after {
  right: 0;
}

.plane-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 36px;
  height: 36px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: white;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 2;
}

/* 飞机旋转动画 */
.rotating-plane {
  animation: planeRotate 12s infinite cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes planeRotate {
  0% { transform: translate(-50%, -50%) rotate(0deg) scale(1); }
  25% { transform: translate(-50%, -50%) rotate(90deg) scale(1.05); }
  50% { transform: translate(-50%, -50%) rotate(180deg) scale(1); }
  75% { transform: translate(-50%, -50%) rotate(270deg) scale(1.05); }
  100% { transform: translate(-50%, -50%) rotate(360deg) scale(1); }
}

/* 时间和登机口信息 */
.time-info {
  margin-top: var(--ios-spacing-sm);
  background-color: rgba(var(--theme-color-rgb), 0.05);
  padding: var(--ios-spacing-sm) var(--ios-spacing-md);
  border-radius: var(--ios-radius);
  backdrop-filter: var(--ios-blur-light);
  -webkit-backdrop-filter: var(--ios-blur-light);
  border: 1px solid rgba(var(--theme-color-rgb), 0.1);
}

.gate-info {
  display: flex;
  justify-content: space-between;
  gap: var(--ios-spacing-md);
  margin: var(--ios-spacing-md) 0;
}

.gate, .boarding {
  flex: 1;
  background-color: rgba(var(--theme-color-rgb), 0.05);
  padding: var(--ios-spacing-sm) var(--ios-spacing-md);
  border-radius: var(--ios-radius);
  backdrop-filter: var(--ios-blur-light);
  -webkit-backdrop-filter: var(--ios-blur-light);
  border: 1px solid rgba(var(--theme-color-rgb), 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.gate:hover, .boarding:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(var(--theme-color-rgb), 0.15);
}

/* 乘客信息 */
.passenger-info {
  display: flex;
  justify-content: space-between;
  gap: var(--ios-spacing-md);
  margin-bottom: var(--ios-spacing-md);
}

.passenger, .seat {
  flex: 1;
  background-color: rgba(250, 250, 252, 0.8);
  padding: var(--ios-spacing-sm) var(--ios-spacing-md);
  border-radius: var(--ios-radius);
  backdrop-filter: var(--ios-blur-light);
  -webkit-backdrop-filter: var(--ios-blur-light);
  border: 1px solid rgba(var(--theme-color-rgb), 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.passenger:hover, .seat:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(var(--theme-color-rgb), 0.15);
}

/* 票价信息 */
.price-info {
  margin-top: var(--ios-spacing-md);
  background-color: rgba(250, 250, 252, 0.8);
  padding: var(--ios-spacing-sm) var(--ios-spacing-md);
  border-radius: var(--ios-radius);
  backdrop-filter: var(--ios-blur-light);
  -webkit-backdrop-filter: var(--ios-blur-light);
  border: 1px solid rgba(var(--theme-color-rgb), 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.price-info:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(var(--theme-color-rgb), 0.15);
}

.label {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
  font-weight: 500;
  letter-spacing: -0.2px;
}

.value {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  letter-spacing: -0.3px;
}

/* 关键词容器 */
.keywords-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--ios-spacing-sm);
  margin: var(--ios-spacing-md) 0;
  min-height: 40px;
}

.keyword {
  padding: 6px 12px;
  border-radius: 16px;
  background: rgba(var(--theme-color-rgb), 0.1);
  color: var(--theme-color);
  font-weight: 500;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  backdrop-filter: var(--ios-blur-light);
  -webkit-backdrop-filter: var(--ios-blur-light);
  border: 1px solid rgba(var(--theme-color-rgb), 0.1);
}

.keyword:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 6px 12px rgba(var(--theme-color-rgb), 0.2);
}

/* 条形码 */
.barcode {
  height: 50px;
  width: 100%;
  margin-top: auto;
  background-image: linear-gradient(90deg, #333 2px, transparent 2px), linear-gradient(90deg, #333 1px, transparent 1px);
  background-size: 6px 100%, 3px 100%;
  background-repeat: space;
  border-radius: var(--ios-radius-sm);
  opacity: 0.7;
  position: relative;
  overflow: hidden;
}

.barcode::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%);
  animation: barcodeShine 3s infinite linear;
}

@keyframes barcodeShine {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

/* 撕票线 - 整合设计 */
.ticket-tear {
  position: absolute;
  top: 0;
  right: 140px;
  width: 30px;
  height: 100%;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgba(var(--theme-color-rgb), 0.05);
  z-index: 5;
  transition: all 0.3s ease;
  border-left: 2px dashed rgba(var(--theme-color-rgb), 0.3);
  border-right: 2px dashed rgba(var(--theme-color-rgb), 0.3);
  box-shadow: 0 0 15px rgba(var(--theme-color-rgb), 0.1);
}

.ticket-tear:hover {
  background-color: rgba(var(--theme-color-rgb), 0.05);
}

.tear-line {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
}

.tear-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: rgba(var(--theme-color-rgb), 0.3);
  margin: 4px 0;
  transition: transform 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.ticket-tear:hover .tear-dot {
  background-color: rgba(var(--theme-color-rgb), 0.6);
  transform: scale(1.3);
  box-shadow: 0 2px 6px rgba(var(--theme-color-rgb), 0.3);
}

.tear-hint {
  position: absolute;
  transform: rotate(90deg);
  font-size: 12px;
  font-weight: 500;
  color: var(--theme-color);
  white-space: nowrap;
  background-color: rgba(255, 255, 255, 0.95);
  padding: 6px 10px;
  border-radius: var(--ios-radius);
  box-shadow: var(--ios-shadow-sm), 0 4px 12px rgba(var(--theme-color-rgb), 0.15);
  backdrop-filter: var(--ios-blur);
  -webkit-backdrop-filter: var(--ios-blur);
  opacity: 0;
  transition: all 0.3s ease;
  border: 1px solid rgba(var(--theme-color-rgb), 0.2);
  animation: pulse 2s infinite;
}

.ticket-tear:hover .tear-hint {
  opacity: 1;
  transform: rotate(90deg) scale(1.05);
}

.tear-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: rgba(var(--theme-color-rgb), 0.3);
  transition: height 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  border-radius: 0 0 var(--ios-radius-sm) var(--ios-radius-sm);
}

/* 票根部分 - 整合设计 */
.ticket-stub {
  position: absolute;
  top: 0;
  right: 0;
  width: 0;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.92);
  backdrop-filter: var(--ios-blur);
  -webkit-backdrop-filter: var(--ios-blur);
  box-shadow: -8px 0 30px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  transition: width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  border-radius: 0 var(--ios-radius-lg) var(--ios-radius-lg) 0;
  z-index: 10;
  border-left: 2px solid rgba(var(--theme-color-rgb), 0.3);
  background-image: linear-gradient(
    to right,
    rgba(var(--theme-color-rgb), 0.1),
    rgba(var(--theme-color-rgb), 0.05)
  );
}

.ticket-stub.torn {
  width: 160px;
  animation: stubAppear 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes stubAppear {
  0% { width: 0; opacity: 0.5; }
  50% { width: 150px; }
  100% { width: 140px; opacity: 1; }
}

.stub-content {
  padding: var(--ios-spacing-md);
  opacity: 0;
  transition: opacity 0.5s ease 0.3s, transform 0.5s ease 0.3s;
  transform: translateX(20px);
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
}

.ticket-stub.torn .stub-content {
  opacity: 1;
  transform: translateX(0);
  animation: iosPulse 0.5s ease 0.8s;
}

.advice-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: var(--ios-spacing-md);
  color: var(--theme-color);
  letter-spacing: -0.3px;
  position: relative;
  padding-bottom: var(--ios-spacing-sm);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.advice-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 50px;
  height: 3px;
  background-color: var(--theme-color);
  border-radius: 1.5px;
  box-shadow: 0 1px 3px rgba(var(--theme-color-rgb), 0.3);
}

.advice-content {
  font-size: 14px;
  line-height: 1.6;
  color: #333;
  letter-spacing: -0.2px;
  background-color: rgba(255, 255, 255, 0.6);
  padding: 12px;
  border-radius: var(--ios-radius);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(var(--theme-color-rgb), 0.1);
}

/* 主题样式 - 苹果设计系统颜色 */
.theme-happy {
  --theme-color: #FF9500;
  --theme-color-rgb: 255, 149, 0;
  --theme-gradient: linear-gradient(135deg, #FF9500, #FFCC00);
}

.theme-anxious {
  --theme-color: #AF52DE;
  --theme-color-rgb: 175, 82, 222;
  --theme-gradient: linear-gradient(135deg, #AF52DE, #5E5CE6);
}

.theme-calm {
  --theme-color: #5AC8FA;
  --theme-color-rgb: 90, 200, 250;
  --theme-gradient: linear-gradient(135deg, #5AC8FA, #64D2FF);
}

.theme-sad {
  --theme-color: #007AFF;
  --theme-color-rgb: 0, 122, 255;
  --theme-gradient: linear-gradient(135deg, #007AFF, #5AC8FA);
}

.theme-angry {
  --theme-color: #FF3B30;
  --theme-color-rgb: 255, 59, 48;
  --theme-gradient: linear-gradient(135deg, #FF3B30, #FF9500);
}

.theme-tired {
  --theme-color: #8E8E93;
  --theme-color-rgb: 142, 142, 147;
  --theme-gradient: linear-gradient(135deg, #8E8E93, #AEAEB2);
}

/* 主题应用 */
.theme-happy .ticket-header,
.theme-happy .ticket-footer {
  background: var(--theme-gradient);
}

.theme-anxious .ticket-header,
.theme-anxious .ticket-footer {
  background: var(--theme-gradient);
}

.theme-calm .ticket-header,
.theme-calm .ticket-footer {
  background: var(--theme-gradient);
}

.theme-sad .ticket-header,
.theme-sad .ticket-footer {
  background: var(--theme-gradient);
}

.theme-angry .ticket-header,
.theme-angry .ticket-footer {
  background: var(--theme-gradient);
}

.theme-tired .ticket-header,
.theme-tired .ticket-footer {
  background: var(--theme-gradient);
}

/* 主题图标 */
.icon-happy {
  background-color: var(--theme-color);
  box-shadow: 0 0 10px var(--theme-color);
  animation: pulse 2s infinite;
}

.icon-anxious {
  background-color: var(--theme-color);
  box-shadow: 0 0 10px var(--theme-color);
  animation: wave 3s infinite;
}

.icon-calm {
  background-color: var(--theme-color);
  box-shadow: 0 0 10px var(--theme-color);
  animation: float 4s infinite;
}

.icon-sad {
  background-color: var(--theme-color);
  box-shadow: 0 0 10px var(--theme-color);
  animation: pulse 3s infinite;
}

.icon-angry {
  background-color: var(--theme-color);
  box-shadow: 0 0 10px var(--theme-color);
  animation: shake 0.5s infinite;
}

.icon-tired {
  background-color: var(--theme-color);
  box-shadow: 0 0 10px var(--theme-color);
  animation: pulse 4s infinite;
}

/* 主题动画 */
@keyframes pulse {
  0% { transform: translate(-50%, -50%) scale(1); }
  50% { transform: translate(-50%, -50%) scale(1.2); }
  100% { transform: translate(-50%, -50%) scale(1); }
}

@keyframes wave {
  0% { transform: translate(-50%, -50%) scale(1); }
  25% { transform: translate(-50%, -50%) scale(1.1) rotate(5deg); }
  50% { transform: translate(-50%, -50%) scale(1); }
  75% { transform: translate(-50%, -50%) scale(1.1) rotate(-5deg); }
  100% { transform: translate(-50%, -50%) scale(1); }
}

@keyframes float {
  0% { transform: translate(-50%, -50%); }
  50% { transform: translate(-50%, -60%); }
  100% { transform: translate(-50%, -50%); }
}

@keyframes shake {
  0% { transform: translate(-50%, -50%); }
  25% { transform: translate(-52%, -50%); }
  50% { transform: translate(-50%, -52%); }
  75% { transform: translate(-48%, -50%); }
  100% { transform: translate(-50%, -50%); }
}

/* 苹果风格动画 */
@keyframes iosAppear {
  0% { transform: translateY(20px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}

@keyframes iosPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

@keyframes iosFade {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

/* 性能降级策略 */
@media (prefers-reduced-motion: reduce) {
  .ticket, .paper-fold, .ticket-stamp, .plane-icon, .keyword {
    animation: none !important;
    transition: none !important;
  }
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .ticket, .paper-fold, .ticket-stub {
    background: rgba(30, 30, 30, 0.8);
    color: #f5f5f7;
  }
  
  .label {
    color: #999;
  }
  
  .value {
    color: #f5f5f7;
  }
  
  .tear-dot {
    background-color: rgba(255, 255, 255, 0.2);
  }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .ticket-container {
    max-width: 100%;
    padding: 0 10px;
  }
  
  .horizontal-ticket {
    flex-direction: column;
    height: auto;
  }
  
  .ticket-left {
    width: 100%;
    border-right: none;
    border-bottom: 1px dashed rgba(0, 0, 0, 0.1);
  }
  
  .route-info {
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }
  
  .journey-line {
    width: 80%;
    height: 40px;
    margin: 0;
  }
  
  .plane-icon {
    animation: planeMoveMobile 3s infinite ease-in-out;
  }
  
  @keyframes planeMoveMobile {
    0% { transform: translate(-50%, -50%) translateY(-10px); }
    50% { transform: translate(-50%, -50%) translateY(10px); }
    100% { transform: translate(-50%, -50%) translateY(-10px); }
  }
}

/* 无障碍支持 */
@media (prefers-contrast: more) {
  .ticket {
    border: 2px solid #000;
  }
  
  .label {
    font-weight: 700;
  }
  
  .tear-line {
    background-color: rgba(0, 0, 0, 0.5);
  }
}
</style>