<template>
  <div class="not-found">
    <div class="content">
      <h1>404</h1>
      <h2>页面不存在</h2>
      <p>抱歉，您访问的页面不存在或已被删除</p>
      <a-button type="primary" @click="goHome">返回首页</a-button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}
</script>

<style lang="less" scoped>
.not-found {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f0f2f5;
  
  .content {
    text-align: center;
    
    h1 {
      font-size: 120px;
      margin: 0;
      color: #1890ff;
    }
    
    h2 {
      font-size: 24px;
      margin: 20px 0;
      color: #333;
    }
    
    p {
      font-size: 16px;
      margin-bottom: 30px;
      color: #666;
    }
  }
}
</style> 