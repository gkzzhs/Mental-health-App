/**
 * 车票动画管理类
 * 用于生成和管理不同情绪主题的动画效果
 */
export default class TicketAnimationManager {
  constructor(container, mood) {
    this.container = container;
    this.mood = mood;
    this.animationElements = [];
  }

  // 初始化动画
  init() {
    // 清除现有动画元素
    this.clear();
    
    // 根据情绪类型创建对应的动画
    switch(this.mood) {
      case 'happy':
        this.createHappyAnimation();
        break;
      case 'anxious':
        this.createAnxiousAnimation();
        break;
      case 'calm':
        this.createCalmAnimation();
        break;
      case 'sad':
        this.createSadAnimation();
        break;
      case 'angry':
        this.createAngryAnimation();
        break;
      case 'tired':
        this.createTiredAnimation();
        break;
      default:
        this.createCalmAnimation(); // 默认使用平静主题
    }
  }

  // 清除动画元素
  clear() {
    this.animationElements.forEach(element => {
      if (element && element.parentNode) {
        element.parentNode.removeChild(element);
      }
    });
    this.animationElements = [];
  }

  // 创建开心主题动画：粒子光点
  createHappyAnimation() {
    // 粒子光点已通过CSS实现，这里可以添加额外的动态元素
    for (let i = 0; i < 5; i++) {
      const particle = document.createElement('div');
      particle.className = 'happy-particle';
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      particle.style.width = `${3 + Math.random() * 5}px`;
      particle.style.height = `${3 + Math.random() * 5}px`;
      particle.style.animationDelay = `${Math.random() * 5}s`;
      particle.style.animationDuration = `${5 + Math.random() * 10}s`;
      
      this.container.appendChild(particle);
      this.animationElements.push(particle);
    }
  }

  // 创建焦虑主题动画：波浪
  createAnxiousAnimation() {
    // 波浪动画已通过CSS实现
  }

  // 创建平静主题动画：气泡
  createCalmAnimation() {
    // 创建上升的气泡
    for (let i = 0; i < 8; i++) {
      const bubble = document.createElement('div');
      bubble.className = 'bubble';
      bubble.style.left = `${Math.random() * 100}%`;
      bubble.style.width = `${5 + Math.random() * 15}px`;
      bubble.style.height = `${5 + Math.random() * 15}px`;
      bubble.style.animationDuration = `${8 + Math.random() * 12}s`;
      bubble.style.animationDelay = `${Math.random() * 5}s`;
      
      this.container.appendChild(bubble);
      this.animationElements.push(bubble);
    }
  }

  // 创建难过主题动画：雨滴
  createSadAnimation() {
    // 创建下落的雨滴
    for (let i = 0; i < 15; i++) {
      const raindrop = document.createElement('div');
      raindrop.className = 'raindrop';
      raindrop.style.left = `${Math.random() * 100}%`;
      raindrop.style.animationDuration = `${1 + Math.random() * 2}s`;
      raindrop.style.animationDelay = `${Math.random() * 5}s`;
      
      this.container.appendChild(raindrop);
      this.animationElements.push(raindrop);
    }
  }

  // 创建生气主题动画：火花
  createAngryAnimation() {
    // 火花动画已通过CSS实现
  }

  // 创建疲惫主题动画：波纹
  createTiredAnimation() {
    // 波纹动画已通过CSS实现
  }

  // 检测设备性能，决定是否降级动画
  static checkPerformance() {
    // 检测设备是否为低性能设备
    const isLowPerformance = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // 如果是低性能设备，添加降级样式类
    if (isLowPerformance) {
      document.body.classList.add('reduced-motion');
    }
    
    return !isLowPerformance;
  }
}