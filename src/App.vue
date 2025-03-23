<template>
  <div class="app-container" :class="currentMoodClass">
    <!-- 引导动画组件 -->
    <OnboardingGuide />
    
    <div class="dynamic-background">
      <div v-for="(bubble, index) in bubbles" 
           :key="index" 
           class="bubble"
           :style="{
             left: `${bubble.x}%`,
             top: `${bubble.y}%`,
             width: `${bubble.size}px`,
             height: `${bubble.size}px`,
             animationDuration: `${bubble.duration}s`,
             animationDelay: `${bubble.delay}s`,
             opacity: bubble.opacity,
             background: currentMood ? moodColors[currentMood].gradient : 'linear-gradient(45deg, var(--primary-color), rgba(0, 113, 227, 0.3))'
           }">
      </div>
    </div>
    
    <div class="content">
      <div class="logo-container">
        <img src="./assets/logo.svg" alt="心灵之旅" class="logo">
        <h1>心灵之旅</h1>
      </div>
      
      <div class="card">
        <h2>今天，你的心情如何？</h2>
        <p class="subtitle">分享你的感受，AI将为你提供个性化的心理健康建议</p>
        
        <div class="mood-selector">
          <div class="mood-buttons">
            <button 
              v-for="(mood, key) in moods" 
              :key="key"
              @click="selectMood(key)"
              class="mood-button"
              :class="{ active: currentMood === key }"
              :style="{ background: moodColors[key].light }"
            >
              <span class="mood-emoji">{{ mood.emoji }}</span>
              <span class="mood-label">{{ mood.label }}</span>
            </button>
          </div>
        </div>
        
        <div class="input-container">
          <textarea 
            v-model="userInput" 
            :placeholder="currentMood ? `${moods[currentMood].placeholder}` : '今天发生了什么？告诉我你的感受...'"
            @keyup.enter="submitFeelings"
            :disabled="isLoading"
          ></textarea>
          <button 
            @click="submitFeelings" 
            :disabled="isLoading || !userInput.trim()"
            class="submit-button"
          >
            <span v-if="!isLoading">发送</span>
            <span v-else class="loading-spinner"></span>
          </button>
        </div>
        
        <div v-if="response" class="response-container">
          <h3>
            <span class="response-icon" :style="{ color: currentMood ? moodColors[currentMood].main : 'var(--primary-color)' }">
              {{ currentMood ? moods[currentMood].emoji : '🧠' }}
            </span>
            AI 分析
          </h3>
          <div class="response-content" :class="{ 'positive': sentimentResult === '积极', 'negative': sentimentResult === '消极', 'neutral': sentimentResult === '中性' }">
            <p v-html="formattedResponse"></p>
          </div>
        </div>
        
        <!-- 心灵车票区域 -->
        <div v-if="currentTicket" class="ticket-section">
          <p class="ticket-intro">根据您的心情，我们为您生成了一张心灵车票：</p>
          <MindTicket 
            :ticket="currentTicket" 
            :inputContent="userInput"
            @torn="handleTicketTorn"
          />
        </div>
      </div>
      
      <!-- 车票收纳夹 -->
      <TicketFolder 
        :tickets="tickets" 
        @select-ticket="viewHistoryTicket"
      />
      
      <footer>
        <p>© {{ new Date().getFullYear() }} 心灵之旅 - 关爱心理健康</p>
      </footer>
    </div>

  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import axios from 'axios';
import MindTicket from './components/MindTicket.vue';
import TicketFolder from './components/TicketFolder.vue';
import OnboardingGuide from './components/OnboardingGuide.vue';

export default {
  name: 'App',
  components: {
    MindTicket,
    TicketFolder,
    OnboardingGuide
  },
  setup() {
    const userInput = ref('');
    const response = ref('');
    const isLoading = ref(false);
    const bubbles = ref([]);
    const currentMood = ref('');
    const sentimentResult = ref('');
    const currentTicket = ref(null);
    const tickets = ref([]);

    
    // 情绪选项
    const moods = {
      happy: { label: '开心', emoji: '😊', placeholder: '什么让你感到开心？分享你的快乐...' },
      anxious: { label: '焦虑', emoji: '😰', placeholder: '是什么让你感到焦虑？' },
      calm: { label: '平静', emoji: '😌', placeholder: '你是如何保持平静的？' },
      sad: { label: '难过', emoji: '😢', placeholder: '愿意分享让你难过的事情吗？' },
      angry: { label: '生气', emoji: '😠', placeholder: '什么事情让你感到生气？' },
      tired: { label: '疲惫', emoji: '😩', placeholder: '今天感到疲惫吗？说说看...' }
    };
    
    // 情绪对应的颜色
    const moodColors = {
      happy: { main: '#FF9500', light: 'rgba(255, 149, 0, 0.1)', gradient: 'linear-gradient(45deg, #FF9500, rgba(255, 149, 0, 0.3))' },
      anxious: { main: '#AF52DE', light: 'rgba(175, 82, 222, 0.1)', gradient: 'linear-gradient(45deg, #AF52DE, rgba(175, 82, 222, 0.3))' },
      calm: { main: '#5AC8FA', light: 'rgba(90, 200, 250, 0.1)', gradient: 'linear-gradient(45deg, #5AC8FA, rgba(90, 200, 250, 0.3))' },
      sad: { main: '#007AFF', light: 'rgba(0, 122, 255, 0.1)', gradient: 'linear-gradient(45deg, #007AFF, rgba(0, 122, 255, 0.3))' },
      angry: { main: '#FF3B30', light: 'rgba(255, 59, 48, 0.1)', gradient: 'linear-gradient(45deg, #FF3B30, rgba(255, 59, 48, 0.3))' },
      tired: { main: '#8E8E93', light: 'rgba(142, 142, 147, 0.1)', gradient: 'linear-gradient(45deg, #8E8E93, rgba(142, 142, 147, 0.3))' }
    };
    
    // 当前情绪的CSS类
    const currentMoodClass = computed(() => {
      return currentMood.value ? `mood-${currentMood.value}` : '';
    });
    
    // 格式化AI响应，将换行符转换为HTML换行
    const formattedResponse = computed(() => {
      return response.value.replace(/\n/g, '<br>');
    });
    
    // 选择情绪
    const selectMood = (mood) => {
      currentMood.value = mood;
      // 如果用户已经输入了内容，不要清空
      if (!userInput.value.trim()) {
        userInput.value = '';
      }
    };
    
    // 创建动态背景气泡
    const createBubbles = () => {
      const newBubbles = [];
      for (let i = 0; i < 15; i++) {
        newBubbles.push({
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: 20 + Math.random() * 80,
          duration: 15 + Math.random() * 30,
          delay: Math.random() * 5,
          opacity: 0.1 + Math.random() * 0.1
        });
      }
      bubbles.value = newBubbles;
    };
    
    // 提交用户输入到AI进行分析
    const submitFeelings = async () => {
      if (!userInput.value.trim() || isLoading.value) return;
      
      isLoading.value = true;
      response.value = '';
      
      try {
        // 准备用户输入，包含情绪信息
        let inputWithMood = userInput.value;
        if (currentMood.value) {
          // 如果用户选择了情绪，将情绪信息添加到输入中进行分析
          inputWithMood = `[${moods[currentMood.value].label}] ${userInput.value}`;
        }
        
        // 尝试调用API
        try {
          // 准备请求数据
          const requestData = {
            model: "deepseek-r1-distill-qwen-7b-250120",
            messages: [
              {
                role: "system",
                content: "你是一位专业的心理健康顾问，擅长倾听、共情和提供心理支持。请根据用户的情绪和描述，提供温暖、专业的心理健康建议。回复应该包含对用户情绪的理解、积极的支持和实用的建议。请使用中文回复，语气温和友善。"
              },
              {
                role: "user",
                content: inputWithMood
              }
            ]
          };
          
          console.log('正在调用API，请求数据:', requestData);
          
          // 确定是否使用本地代理
          const useLocalProxy = true; // 设置为true启用本地代理，解决CORS问题
          
          // 使用火山引擎API - 确保使用正确的API密钥和端点
          // 修正API URL，确保使用正确的域名和路径
          const apiUrl = 'https://api.volcengine.com/v1/services/maas/chat/completions';
          console.log('API URL:', apiUrl);
          console.log('API密钥是否存在:', !!import.meta.env.VITE_VOLCENGINE_API_KEY);
          console.log('API密钥长度:', import.meta.env.VITE_VOLCENGINE_API_KEY ? import.meta.env.VITE_VOLCENGINE_API_KEY.length : 0);
          console.log('API密钥前10个字符:', import.meta.env.VITE_VOLCENGINE_API_KEY ? import.meta.env.VITE_VOLCENGINE_API_KEY.substring(0, 10) + '...' : 'N/A');
          
          let apiResponse;
          
          if (useLocalProxy) {
            // 使用代理服务器
            console.log('使用CORS代理服务器');
            // 根据环境选择合适的代理URL
            const proxyUrl = window.location.hostname === 'localhost' 
              ? 'http://localhost:3000/api/chat' // 本地开发环境
              : '/api/chat'; // Vercel部署环境
            
            // 通过代理发送请求，不需要包含API密钥
            apiResponse = await axios.post(proxyUrl, requestData, {
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              timeout: 60000 // 60秒超时
            });
            
            console.log('代理服务器响应成功');
          } else {
            // 直接调用火山引擎API
            console.log('直接调用火山引擎API');
            
            // 准备请求头，添加CORS相关配置
            const headers = {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_VOLCENGINE_API_KEY}`,
              'Accept': 'application/json'
            };
            
            // 记录请求信息（不包含敏感信息）
            console.log('请求头信息:', { 
              'Content-Type': headers['Content-Type'],
              'Accept': headers['Accept'],
              'Authorization': '已设置但不显示'
            });
            
            // 发送API请求
            apiResponse = await axios.post(apiUrl, requestData, {
              headers: headers,
              timeout: 60000 // 60秒超时
            });
          }
          
          console.log('API调用成功，正在处理响应...');
          
          // 获取API返回的回复内容
          if (apiResponse.data && apiResponse.data.choices && apiResponse.data.choices.length > 0) {
            const aiResponse = apiResponse.data.choices[0].message.content;
            console.log('API响应成功:', aiResponse);
            response.value = aiResponse;
            
            // 简单情感分析
            if (aiResponse.includes('开心') || aiResponse.includes('快乐') || aiResponse.includes('积极')) {
              sentimentResult.value = '积极';
            } else if (aiResponse.includes('难过') || aiResponse.includes('悲伤') || aiResponse.includes('消极')) {
              sentimentResult.value = '消极';
            } else {
              sentimentResult.value = '中性';
            }
            
            // 生成心灵车票
            generateTicket(currentMood.value || 'calm', userInput.value, aiResponse);
          } else {
            throw new Error('API返回数据格式不正确');
          }
        } catch (apiError) {
          console.error('API调用失败:', apiError);
          // 显示更详细的API错误信息给用户
          let errorMessage = '抱歉，AI服务暂时无法访问。';
          
          if (apiError.message && apiError.message.includes('Network Error')) {
            errorMessage += '网络连接出现问题，请检查您的网络连接并稍后再试。';
            console.warn('网络连接错误，无法访问API服务器');
          } else if (apiError.response) {
            errorMessage += `服务器返回错误: ${apiError.response.status} - ${JSON.stringify(apiError.response.data)}`;
            console.warn(`API服务器返回错误状态码: ${apiError.response.status}`, apiError.response.data);
          } else if (apiError.request) {
            errorMessage += '服务器未响应，请稍后再试。';
            console.warn('API请求已发送但服务器未响应');
          } else {
            errorMessage += '错误信息: ' + (apiError.message || '未知错误');
            console.warn('API调用过程中发生未知错误:', apiError.message);
          }
          
          // 记录API调用的详细信息，帮助调试
          console.log('API调用详情:', {
            url: 'https://api.volcengine.com/v1/services/maas/chat/completions',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ****' // 隐藏实际API密钥
            },
            hasApiKey: !!import.meta.env.VITE_VOLCENGINE_API_KEY,
            apiKeyLength: import.meta.env.VITE_VOLCENGINE_API_KEY ? import.meta.env.VITE_VOLCENGINE_API_KEY.length : 0
          });
          
          // 检查是否在开发环境中
          if (import.meta.env.DEV) {
            console.log('当前在开发环境中运行');
          } else {
            console.log('当前在生产环境中运行');
          }
          
          response.value = errorMessage;
          console.warn('API调用失败:', apiError.message);
        }
        
        // 分析情感并设置情绪
        const sentiment = analyzeSentiment(inputWithMood);
        sentimentResult.value = sentiment; // 保存情感分析结果
        
        // 如果用户没有选择情绪，根据分析结果设置情绪
        if (!currentMood.value) {
          if (sentiment === '积极') currentMood.value = 'happy';
          else if (sentiment === '消极') currentMood.value = 'sad';
          else currentMood.value = 'calm';
        }
        
        // 生成心灵车票
        try {
          const ticket = generateTicket();
        } catch (error) {
          console.error('生成车票失败:', error);
        }
        
        // 生成心灵车票函数
        function generateTicket() {
            try {
              console.log('开始生成心灵车票...');
              // 根据当前情绪和回复生成车票数据
              const destinations = {
                happy: ['幸福谷', '快乐岛', '阳光城', '希望镇'],
                anxious: ['平静湖', '安宁山', '舒缓林', '冥想谷'],
                calm: ['宁静湾', '和平村', '安详地', '静心谷'],
                sad: ['温暖港', '疗愈林', '拥抱镇', '理解城'],
                angry: ['释放峰', '冷静湖', '和解谷', '平衡地'],
                tired: ['休息站', '恢复谷', '能量城', '滋养地']
              };
              
              const departures = ['现实世界', '日常生活', '当下', '此刻'];
              
              const advices = {
                happy: '享受这段美好的旅程，记得将快乐分享给身边的人。保持积极的心态，但也接纳生活中的各种情绪。',
                anxious: '深呼吸，放松身心。记住，焦虑只是暂时的，你有能力度过这段旅程。尝试正念冥想，关注当下。',
                calm: '珍惜这份平静，用它来滋养自己。在忙碌的生活中，定期给自己创造这样的空间很重要。',
                sad: '允许自己感受悲伤，这是情感的自然流动。记住，没有永远的雨天，阳光终会到来。',
                angry: '给自己一些空间冷静下来。尝试将注意力转移到呼吸上，找到健康的方式表达你的情绪。',
                tired: '休息是为了更好的前行。给自己充分的时间恢复，调整作息，寻找能量的来源。'
              };
              
              // 确保当前情绪有效，如果无效则使用默认值
              const mood = (currentMood.value && destinations[currentMood.value]) ? currentMood.value : 'calm';
              console.log('当前情绪:', mood);
              
              // 提取关键词
              const extractKeywords = (text) => {
                // 常见的停用词
                const stopWords = ['的', '了', '是', '在', '我', '有', '和', '就', '不', '人', '都', '一', '一个', '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好', '自己', '这'];
                
                // 分词并过滤停用词
                const words = text.split(/\s+|[,，.。!！?？;；:\：\(\)（）\[\]【】]/)
                  .filter(word => word.length > 1) // 过滤单字
                  .filter(word => !stopWords.includes(word)) // 过滤停用词
                  .filter(word => !/^\d+$/.test(word)); // 过滤纯数字
                
                // 统计词频
                const wordCount = {};
                words.forEach(word => {
                  wordCount[word] = (wordCount[word] || 0) + 1;
                });
                
                // 按词频排序并取前5个
                return Object.entries(wordCount)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 5)
                  .map(entry => entry[0]);
              };
              
              // 从用户输入和AI回复中提取关键词
              const combinedText = userInput.value + ' ' + response.value;
              const keywords = extractKeywords(combinedText);
              console.log('提取的关键词:', keywords);
              
              // 随机生成车票信息
              const destination = destinations[mood][Math.floor(Math.random() * destinations[mood].length)];
              const departure = departures[Math.floor(Math.random() * departures.length)];
              const trainNumber = `MJ${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
              const seatNumber = `${String.fromCharCode(65 + Math.floor(Math.random() * 6))}${Math.floor(Math.random() * 100 + 1)}`;
              const price = `${Math.floor(Math.random() * 50 + 30)}心灵币`;
              
              // 生成当前时间和到达时间（模拟1-3小时后）
              const now = new Date();
              const departureTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
              const arrivalHours = now.getHours() + Math.floor(Math.random() * 3 + 1);
              const arrivalTime = `${(arrivalHours % 24).toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
              
              // 格式化日期：年-月-日
              const date = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
              
              // 创建车票对象
              const ticket = {
                mood,
                departure,
                destination,
                trainNumber,
                departureTime,
                arrivalTime,
                seatNumber,
                price,
                date,
                advice: advices[mood],
                keywords // 添加关键词到车票对象
              };
              
              console.log('车票对象创建成功:', ticket);
              
              // 设置当前车票并添加到车票列表
              currentTicket.value = ticket;
              console.log('currentTicket已设置为:', JSON.stringify(currentTicket.value));
              tickets.value.push(ticket);
              
              // 保存车票到本地存储
              saveTickets();
              console.log('车票已保存到本地存储，当前tickets长度:', tickets.value.length);
              
              return ticket; // 返回生成的车票对象
            } catch (error) {
              console.error('生成车票时发生错误:', error);
              // 创建一个基本的备用车票
              const fallbackTicket = {
                mood: currentMood.value || 'calm',
                departure: '当下',
                destination: '心灵港湾',
                trainNumber: 'MJ000',
                departureTime: new Date().getHours() + ':' + new Date().getMinutes(),
                arrivalTime: (new Date().getHours() + 1) + ':' + new Date().getMinutes(),
                seatNumber: 'A1',
                price: '30心灵币',
                date: new Date().toISOString().split('T')[0],
                advice: '保持冷静，关注当下，接纳自己的情绪。'
              };
              
              // 设置当前车票并添加到车票列表
              currentTicket.value = null; // 先清空，强制触发视图更新
              setTimeout(() => {
                currentTicket.value = fallbackTicket;
                console.log('generateTicket中fallbackTicket已设置:', currentTicket.value);
                tickets.value.push(fallbackTicket);
                
                // 保存车票到本地存储
                try {
                  saveTickets();
                } catch (saveError) {
                  console.error('保存车票失败:', saveError);
                }
              }, 0);
              
              return fallbackTicket; // 返回备用车票
            }
          };
          
          // 保存车票到本地存储
          const saveTickets = () => {
            localStorage.setItem('mindTickets', JSON.stringify(tickets.value));
          };
          
          // 从本地存储加载车票
          const loadTickets = () => {
            const savedTickets = localStorage.getItem('mindTickets');
            if (savedTickets) {
              tickets.value = JSON.parse(savedTickets);
            }
          };
          
          onMounted(() => {
            createBubbles();
            loadTickets(); // 加载历史车票
          });
          
          // 查看历史车票
          const viewHistoryTicket = (ticket) => {
            currentTicket.value = ticket;
          };
          
          // 处理车票撕开事件
          const handleTicketTorn = (ticket) => {
            console.log('车票已撕开:', ticket);
          };
          
          return {
            userInput,
            response,
            isLoading,
            bubbles,
            formattedResponse,
            submitFeelings,
            moods,
            moodColors,
            currentMood,
            currentMoodClass,
            selectMood,
            sentimentResult,
            currentTicket,
            tickets,
            viewHistoryTicket,
            handleTicketTorn
          };
      } catch (error) {
        console.error('提交失败:', error);
        // 输出更详细的错误信息
        if (error.response) {
          // 服务器响应了，但状态码不在2xx范围内
          console.error('错误状态码:', error.response.status);
          console.error('错误数据:', error.response.data);
          console.error('错误头信息:', error.response.headers);
          response.value = `请求失败: ${error.response.status} - ${JSON.stringify(error.response.data)}`;
        } else if (error.request) {
          // 请求已发出，但没有收到响应
          console.error('未收到响应:', error.request);
          response.value = '服务器未响应，请检查网络连接或API服务是否可用。';
        } else {
          // 设置请求时发生错误
          console.error('请求错误:', error.message);
          response.value = `请求错误: ${error.message}`;
        }
        // 确保有错误响应
        if (!response.value) {
          response.value = '抱歉，我们暂时无法处理您的请求。请稍后再试。';
        }
      } finally {
        isLoading.value = false;
      }
    };
    
    // 简单的情感分析模拟函数
    const analyzeSentiment = (text) => {
      const positiveWords = ['开心', '快乐', '高兴', '满足', '幸福', '喜欢', '爱', '希望', '感恩'];
      const negativeWords = ['难过', '伤心', '痛苦', '焦虑', '压力', '担心', '害怕', '失望', '沮丧', '生气'];
      
      let positiveScore = 0;
      let negativeScore = 0;
      
      positiveWords.forEach(word => {
        if (text.includes(word)) positiveScore++;
      });
      
      negativeWords.forEach(word => {
        if (text.includes(word)) negativeScore++;
      });
      
      if (positiveScore > negativeScore) return '积极';
      if (negativeScore > positiveScore) return '消极';
      return '中性';
    };
    
    // 情感分析函数保留，用于分析用户输入的情感倾向
    
    // 生成心灵车票函数
    const generateTicket = () => {
      try {
        console.log('开始生成心灵车票...');
        // 根据当前情绪和回复生成车票数据
        const destinations = {
          happy: ['幸福谷', '快乐岛', '阳光城', '希望镇'],
          anxious: ['平静湖', '安宁山', '舒缓林', '冥想谷'],
          calm: ['宁静湾', '和平村', '安详地', '静心谷'],
          sad: ['温暖港', '疗愈林', '拥抱镇', '理解城'],
          angry: ['释放峰', '冷静湖', '和解谷', '平衡地'],
          tired: ['休息站', '恢复谷', '能量城', '滋养地']
        };
        
        const departures = ['现实世界', '日常生活', '当下', '此刻'];
        
        const advices = {
          happy: '享受这段美好的旅程，记得将快乐分享给身边的人。保持积极的心态，但也接纳生活中的各种情绪。',
          anxious: '深呼吸，放松身心。记住，焦虑只是暂时的，你有能力度过这段旅程。尝试正念冥想，关注当下。',
          calm: '珍惜这份平静，用它来滋养自己。在忙碌的生活中，定期给自己创造这样的空间很重要。',
          sad: '允许自己感受悲伤，这是情感的自然流动。记住，没有永远的雨天，阳光终会到来。',
          angry: '给自己一些空间冷静下来。尝试将注意力转移到呼吸上，找到健康的方式表达你的情绪。',
          tired: '休息是为了更好的前行。给自己充分的时间恢复，调整作息，寻找能量的来源。'
        };
        
        // 确保当前情绪有效，如果无效则使用默认值
        const mood = (currentMood.value && destinations[currentMood.value]) ? currentMood.value : 'calm';
        console.log('当前情绪:', mood);
        
        // 随机生成车票信息
        const destination = destinations[mood][Math.floor(Math.random() * destinations[mood].length)];
        const departure = departures[Math.floor(Math.random() * departures.length)];
        const trainNumber = `MJ${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
        const seatNumber = `${String.fromCharCode(65 + Math.floor(Math.random() * 6))}${Math.floor(Math.random() * 100 + 1)}`;
        const price = `${Math.floor(Math.random() * 50 + 30)}心灵币`;
        
        // 生成当前时间和到达时间（模拟1-3小时后）
        const now = new Date();
        const departureTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        const arrivalHours = now.getHours() + Math.floor(Math.random() * 3 + 1);
        const arrivalTime = `${(arrivalHours % 24).toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        // 格式化日期：年-月-日
        const date = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
        
        // 提取关键词
        const extractKeywords = (text) => {
          // 常见的停用词
          const stopWords = ['的', '了', '是', '在', '我', '有', '和', '就', '不', '人', '都', '一', '一个', '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好', '自己', '这'];
          
          // 分词并过滤停用词
          const words = text.split(/\s+|[,，.。!！?？;；:\：\(\)（）\[\]【】]/)
            .filter(word => word.length > 1) // 过滤单字
            .filter(word => !stopWords.includes(word)) // 过滤停用词
            .filter(word => !/^\d+$/.test(word)); // 过滤纯数字
          
          // 统计词频
          const wordCount = {};
          words.forEach(word => {
            wordCount[word] = (wordCount[word] || 0) + 1;
          });
          
          // 按词频排序并取前5个
          return Object.entries(wordCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(entry => entry[0]);
        };
        
        // 从用户输入和响应中提取关键词
        const combinedText = userInput.value + ' ' + response.value;
        const keywords = extractKeywords(combinedText);
        console.log('提取的关键词:', keywords);
        
        // 创建车票对象
        const ticket = {
          mood,
          departure,
          destination,
          trainNumber,
          departureTime,
          arrivalTime,
          seatNumber,
          price,
          date,
          advice: advices[mood],
          keywords // 添加关键词到车票对象
        };
        
        console.log('车票对象创建成功:', ticket);
        
        // 设置当前车票并添加到车票列表
        currentTicket.value = ticket;
        console.log('currentTicket已设置为:', JSON.stringify(currentTicket.value));
        tickets.value.push(ticket);
        
        // 保存车票到本地存储
        saveTickets();
        console.log('车票已保存到本地存储，当前tickets长度:', tickets.value.length);
        
        return ticket; // 返回生成的车票对象
      } catch (error) {
        console.error('生成车票时发生错误:', error);
        // 创建一个基本的备用车票
        const fallbackTicket = {
          mood: currentMood.value || 'calm',
          departure: '当下',
          destination: '心灵港湾',
          trainNumber: 'MJ000',
          departureTime: new Date().getHours() + ':' + new Date().getMinutes(),
          arrivalTime: (new Date().getHours() + 1) + ':' + new Date().getMinutes(),
          seatNumber: 'A1',
          price: '30心灵币',
          date: new Date().toISOString().split('T')[0],
          advice: '保持冷静，关注当下，接纳自己的情绪。',
          keywords: ['平静', '接纳', '当下', '情绪', '冷静'] // 默认关键词
        };
        
        // 设置当前车票并添加到车票列表
        currentTicket.value = null; // 先清空，强制触发视图更新
        setTimeout(() => {
          currentTicket.value = fallbackTicket;
          console.log('generateTicket中fallbackTicket已设置:', currentTicket.value);
          tickets.value.push(fallbackTicket);
          
          // 保存车票到本地存储
          try {
            saveTickets();
          } catch (saveError) {
            console.error('保存车票失败:', saveError);
          }
        }, 0);
        
        return fallbackTicket; // 返回备用车票
      }
    };
    
    // 保存车票到本地存储
    const saveTickets = () => {
      localStorage.setItem('mindTickets', JSON.stringify(tickets.value));
    };
    
    // 从本地存储加载车票
    const loadTickets = () => {
      const savedTickets = localStorage.getItem('mindTickets');
      if (savedTickets) {
        tickets.value = JSON.parse(savedTickets);
      }
    };
    
    // 处理车票撕开事件
    const handleTicketTorn = (ticket) => {
      console.log('车票已撕开:', ticket);
      // 这里可以添加撕票后的逻辑，比如显示分享选项或保存票根
    };
    
    onMounted(() => {
      createBubbles();
      loadTickets(); // 加载历史车票
      
      // 导入车票动画样式
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = '/src/assets/tickets/ticket-animations.css';
      document.head.appendChild(link);
      
      // 添加SVG图标到DOM
      fetch('/src/assets/tickets/theme-icons.svg')
        .then(response => response.text())
        .then(svgContent => {
          const div = document.createElement('div');
          div.innerHTML = svgContent;
          div.style.display = 'none';
          document.body.appendChild(div);
        })
        .catch(error => console.error('加载SVG图标失败:', error));
    });
    
    // 查看历史车票
    const viewHistoryTicket = (ticket) => {
      currentTicket.value = ticket;
    };
    
    return {
      userInput,
      response,
      isLoading,
      bubbles,
      formattedResponse,
      submitFeelings,
      moods,
      moodColors,
      currentMood,
      currentMoodClass,
      selectMood,
      sentimentResult,
      currentTicket,
      tickets,
      generateTicket,
      viewHistoryTicket,
      handleTicketTorn
    };
  }
};
</script>

<style>
:root {
  --primary-color: #0071e3;
  --background-color: #f5f5f7;
  --card-background: rgba(255, 255, 255, 0.65);
  --text-color: #1d1d1f;
  --secondary-text: #86868b;
  --border-radius: 16px;
  --shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  --transition: all 0.3s ease;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
}

body {
  background-color: var(--background-color);
  color: var(--text-color);
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.app-container {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}

.dynamic-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  overflow: hidden;
  background-color: var(--bg-color, rgba(245, 245, 247, 0.8));
  transition: background-color 0.5s ease;
}

.bubble {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(45deg, var(--primary-color), rgba(0, 113, 227, 0.3));
  animation: float 20s infinite linear;
  opacity: 0.1;
  transition: background 0.5s ease;
}

@keyframes float {
  0% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
  100% { transform: translateY(0) rotate(360deg); }
}

.content {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
  position: relative;
  z-index: 1;
}

.logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30px;
}

.logo {
  width: 50px;
  height: 50px;
  margin-right: 15px;
}

h1 {
  font-size: 28px;
  font-weight: 600;
  color: var(--text-color);
}

.card {
  background-color: var(--card-background);
  border-radius: var(--border-radius);
  padding: 30px;
  box-shadow: var(--shadow);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

h2 {
  font-size: 24px;
  font-weight: 500;
  margin-bottom: 10px;
  color: var(--text-color);
}

.subtitle {
  color: var(--secondary-text);
  margin-bottom: 25px;
}

.input-container {
  display: flex;
  margin-bottom: 25px;
}

textarea {
  flex: 1;
  height: 100px;
  padding: 15px;
  border-radius: var(--border-radius) 0 0 var(--border-radius);
  border: 1px solid rgba(255, 255, 255, 0.3);
  background-color: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  resize: none;
  font-size: 16px;
  color: var(--text-color);
  transition: var(--transition);
}

textarea:focus {
  outline: none;
  background-color: rgba(255, 255, 255, 0.4);
  border-color: var(--primary-color);
  box-shadow: 0 0 0 1px rgba(0, 113, 227, 0.2);
}

.submit-button {
  width: 80px;
  border: none;
  background-color: var(--primary-color);
  color: white;
  border-radius: 0 var(--border-radius) var(--border-radius) 0;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.submit-button:hover:not(:disabled) {
  background-color: #0062c3;
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.submit-button:active:not(:disabled) {
  transform: scale(0.98);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.submit-button:disabled {
  background-color: rgba(134, 134, 139, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  cursor: not-allowed;
}

.loading-spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.response-container {
  margin-top: 30px;
  animation: fadeIn 0.5s ease-out;
}

.ticket-section {
  margin-top: 30px;
  background-color: rgba(255, 255, 255, 0.4);
  border-radius: var(--border-radius);
  padding: 20px;
  animation: fadeIn 0.5s ease-out;
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

.ticket-intro {
  margin-bottom: 15px;
  color: var(--secondary-text);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

h3 {
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 15px;
  color: var(--text-color);
}

.response-content {
  background-color: rgba(255, 255, 255, 0.4);
  border-radius: var(--border-radius);
  padding: 20px;
  line-height: 1.6;
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

footer {
  text-align: center;
  color: var(--secondary-text);
  font-size: 14px;
  padding: 20px 0;
}

/* 情绪选择器样式 */
.mood-selector {
  margin-bottom: 20px;
}

.mood-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}

.mood-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 15px;
  border-radius: var(--border-radius);
  border: 1px solid rgba(255, 255, 255, 0.3);
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.mood-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.12);
  border-color: rgba(255, 255, 255, 0.5);
}

.mood-button.active {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  border-color: rgba(255, 255, 255, 0.6);
}

.mood-emoji {
  font-size: 24px;
  margin-bottom: 5px;
}

.mood-label {
  font-size: 12px;
  font-weight: 500;
}

/* 情绪对应的动态背景颜色 */
.mood-happy .dynamic-background {
  --bg-color: rgba(255, 149, 0, 0.05);
}

.mood-anxious .dynamic-background {
  --bg-color: rgba(175, 82, 222, 0.05);
}

.mood-calm .dynamic-background {
  --bg-color: rgba(90, 200, 250, 0.05);
}

.mood-sad .dynamic-background {
  --bg-color: rgba(0, 122, 255, 0.05);
}

.mood-angry .dynamic-background {
  --bg-color: rgba(255, 59, 48, 0.05);
}

.mood-tired .dynamic-background {
  --bg-color: rgba(142, 142, 147, 0.05);
}

/* AI分析结果的情感颜色 */
.response-icon {
  margin-right: 8px;
  font-size: 20px;
}

.response-content.positive {
  border-left: 4px solid #34C759;
}

.response-content.negative {
  border-left: 4px solid #FF3B30;
}

.response-content.neutral {
  border-left: 4px solid #5AC8FA;
}
</style>