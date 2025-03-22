<template>
  <div class="onboarding-container" v-if="showGuide">
    <!-- 背景遮罩 -->
    <div class="onboarding-overlay" @click="skipGuide"></div>
    
    <!-- 引导弹窗 -->
    <div class="onboarding-modal" :class="`step-${currentStep}`">
      <!-- 关闭按钮 -->
      <button class="close-button" @click="skipGuide">×</button>
      
      <!-- 步骤内容 -->
      <div class="modal-content">
        <div class="step-indicator">
          <span 
            v-for="step in 3" 
            :key="step" 
            :class="{ active: currentStep === step }"
            class="step-dot"
          ></span>
        </div>
        
        <div class="step-content">
          <!-- 步骤1 -->
          <div v-if="currentStep === 1" class="step">
            <div class="step-icon">✨</div>
            <h3>欢迎体验心灵之旅！</h3>
            <p>这是一个关注心理健康的旅程，让我们一起开始吧。</p>
          </div>
          
          <!-- 步骤2 -->
          <div v-if="currentStep === 2" class="step">
            <div class="step-icon">✏️</div>
            <h3>点击输入框输入你今天的感悟。</h3>
            <p>分享你的心情和感受，AI将为你提供个性化的心理健康建议。</p>
          </div>
          
          <!-- 步骤3 -->
          <div v-if="currentStep === 3" class="step">
            <div class="step-icon">🎫</div>
            <h3>查看专属于你的心灵车票。</h3>
            <p>每次分享都会生成一张独特的心灵车票，记录你的情感旅程。</p>
          </div>
        </div>
        
        <!-- 按钮区域 -->
        <div class="modal-buttons">
          <button 
            v-if="currentStep < 3" 
            class="next-button" 
            @click="nextStep"
          >
            下一步
          </button>
          <button 
            v-else 
            class="finish-button" 
            @click="finishGuide"
          >
            开始体验
          </button>
        </div>
      </div>
    </div>
    
    <!-- 高亮区域 -->
    <div 
      v-if="currentStep === 2" 
      class="highlight-area input-highlight"
      :style="inputHighlightStyle"
    ></div>
    <div 
      v-if="currentStep === 3" 
      class="highlight-area ticket-highlight"
      :style="ticketHighlightStyle"
    ></div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';

export default {
  name: 'OnboardingGuide',
  setup() {
    const showGuide = ref(false);
    const currentStep = ref(1);
    const inputHighlightStyle = ref({});
    const ticketHighlightStyle = ref({});
    
    // 检查是否是首次访问
    const checkFirstVisit = () => {
      const hasVisited = localStorage.getItem('hasVisitedMindJourney');
      return !hasVisited;
    };
    
    // 记录已访问状态
    const markAsVisited = () => {
      localStorage.setItem('hasVisitedMindJourney', 'true');
    };
    
    // 下一步
    const nextStep = () => {
      if (currentStep.value < 3) {
        currentStep.value++;
        updateHighlightPosition();
      }
    };
    
    // 跳过引导
    const skipGuide = () => {
      showGuide.value = false;
      markAsVisited();
    };
    
    // 完成引导
    const finishGuide = () => {
      showGuide.value = false;
      markAsVisited();
    };
    
    // 更新高亮区域位置
    const updateHighlightPosition = () => {
      setTimeout(() => {
        if (currentStep.value === 2) {
          const inputElement = document.querySelector('.input-container');
          if (inputElement) {
            const rect = inputElement.getBoundingClientRect();
            inputHighlightStyle.value = {
              top: `${rect.top - 10}px`,
              left: `${rect.left - 10}px`,
              width: `${rect.width + 20}px`,
              height: `${rect.height + 20}px`
            };
          }
        } else if (currentStep.value === 3) {
          const ticketElement = document.querySelector('.ticket-section');
          if (ticketElement) {
            const rect = ticketElement.getBoundingClientRect();
            ticketHighlightStyle.value = {
              top: `${rect.top - 10}px`,
              left: `${rect.left - 10}px`,
              width: `${rect.width + 20}px`,
              height: `${rect.height + 20}px`
            };
          } else {
            // 如果车票区域不存在，高亮文件夹区域
            const folderElement = document.querySelector('.ticket-folder');
            if (folderElement) {
              const rect = folderElement.getBoundingClientRect();
              ticketHighlightStyle.value = {
                top: `${rect.top - 10}px`,
                left: `${rect.left - 10}px`,
                width: `${rect.width + 20}px`,
                height: `${rect.height + 20}px`
              };
            }
          }
        }
      }, 100);
    };
    
    onMounted(() => {
      // 延迟显示引导，确保DOM已完全加载
      setTimeout(() => {
        if (checkFirstVisit()) {
          showGuide.value = true;
          updateHighlightPosition();
        }
      }, 1000);
      
      // 监听窗口大小变化，更新高亮区域位置
      window.addEventListener('resize', updateHighlightPosition);
    });
    
    return {
      showGuide,
      currentStep,
      nextStep,
      skipGuide,
      finishGuide,
      inputHighlightStyle,
      ticketHighlightStyle
    };
  }
};
</script>

<style scoped>
.onboarding-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.onboarding-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
}

.onboarding-modal {
  position: relative;
  width: 90%;
  max-width: 400px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  z-index: 1001;
  animation: modalAppear 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  transform-origin: center;
}

.close-button {
  position: absolute;
  top: 15px;
  right: 15px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.1);
  border: none;
  color: #333;
  font-size: 18px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: background 0.3s;
  z-index: 1002;
}

.close-button:hover {
  background: rgba(0, 0, 0, 0.2);
}

.modal-content {
  padding: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.step-indicator {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.step-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.1);
  margin: 0 5px;
  transition: background-color 0.3s, transform 0.3s;
}

.step-dot.active {
  background-color: var(--primary-color, #007AFF);
  transform: scale(1.2);
}

.step-content {
  text-align: center;
  margin-bottom: 30px;
}

.step {
  animation: stepFadeIn 0.5s ease-out;
}

.step-icon {
  font-size: 48px;
  margin-bottom: 15px;
  animation: iconPulse 2s infinite;
}

.step h3 {
  font-size: 22px;
  margin-bottom: 10px;
  color: #333;
}

.step p {
  font-size: 16px;
  color: #666;
  line-height: 1.5;
}

.modal-buttons {
  width: 100%;
  display: flex;
  justify-content: center;
}

.next-button, .finish-button {
  padding: 12px 24px;
  border-radius: 30px;
  background: linear-gradient(45deg, var(--primary-color, #007AFF), rgba(0, 122, 255, 0.8));
  color: white;
  border: none;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
}

.next-button:hover, .finish-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 122, 255, 0.4);
}

.highlight-area {
  position: absolute;
  border-radius: 12px;
  box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.5), 0 0 0 8px rgba(0, 122, 255, 0.2);
  pointer-events: none;
  z-index: 999;
  animation: highlightPulse 2s infinite;
}

/* 动画效果 */
@keyframes modalAppear {
  0% {
    opacity: 0;
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes stepFadeIn {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes iconPulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes highlightPulse {
  0% {
    box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.5), 0 0 0 8px rgba(0, 122, 255, 0.2);
  }
  50% {
    box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.7), 0 0 0 10px rgba(0, 122, 255, 0.3);
  }
  100% {
    box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.5), 0 0 0 8px rgba(0, 122, 255, 0.2);
  }
}

/* 响应式调整 */
@media (max-width: 480px) {
  .onboarding-modal {
    width: 95%;
    max-width: 350px;
  }
  
  .modal-content {
    padding: 20px;
  }
  
  .step h3 {
    font-size: 18px;
  }
  
  .step p {
    font-size: 14px;
  }
  
  .next-button, .finish-button {
    padding: 10px 20px;
    font-size: 14px;
  }
}
</style>