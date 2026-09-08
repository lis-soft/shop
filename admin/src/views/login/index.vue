<template>
  <div class="login-container">
    <div class="login-background">
      <div class="bg-overlay"></div>
    </div>
    <div class="login-content">
      <h1 class="login-title">HT Admin</h1>
      <a-form
        :model="formState"
        name="login"
        @finish="handleFinish"
        autocomplete="off"
        class="login-form"
      >
        <a-form-item
          name="username"
          :rules="[{ required: true, message: '请输入用户名' }]"
        >
          <a-input 
            v-model:value="formState.username" 
            size="large"
            placeholder="用户名"
            :bordered="false"
            class="custom-input"
          >
            <template #prefix>
              <UserOutlined class="form-icon" />
            </template>
          </a-input>
        </a-form-item>

        <a-form-item
          name="password"
          :rules="[{ required: true, message: '请输入密码' }]"
        >
          <a-input-password 
            v-model:value="formState.password" 
            size="large"
            placeholder="密码"
            :bordered="false"
            class="custom-input"
          >
            <template #prefix>
              <LockOutlined class="form-icon" />
            </template>
          </a-input-password>
        </a-form-item>

        <a-form-item
          name="captcha"
          :rules="[{ required: true, message: '请输入验证码' }]"
        >
          <div class="captcha-container">
            <a-input 
              v-model:value="formState.captcha" 
              size="large"
              placeholder="验证码"
              :bordered="false"
              class="custom-input captcha-input"
            >
              <template #prefix>
                <SafetyOutlined class="form-icon" />
              </template>
            </a-input>
            <div class="captcha-image" @click="refreshCaptcha">
              <img v-if="captchaUrl" :src="captchaUrl" alt="验证码" />
              <div v-else class="captcha-loading">
                <loading-outlined spin />
              </div>
            </div>
          </div>
        </a-form-item>

        <div class="form-footer">
          <a-checkbox v-model:checked="rememberMe">记住我</a-checkbox>
        </div>

        <a-button
          type="primary"
          html-type="submit"
          size="large"
          :loading="loading"
          class="login-button"
        >
          登录
        </a-button>
      </a-form>
      <div class="login-footer">
        <p>© {{ new Date().getFullYear() }} HT Admin - 版权所有</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import { UserOutlined, LockOutlined, SafetyOutlined, LoadingOutlined } from '@ant-design/icons-vue'
import { login, getCaptcha } from '@/api/login'

const router = useRouter()
const loading = ref(false)
const rememberMe = ref(true)
const captchaUrl = ref('')

const formState = reactive({
  username: '',
  password: '',
  captcha: '',
  captchaKey: ''
})

const refreshCaptcha = async () => {
  try {
    const response = await getCaptcha()
    captchaUrl.value = URL.createObjectURL(response.data)
    const captchaKey = response.headers['captcha-key']
    formState.captchaKey = captchaKey

    if (!captchaKey) {
      throw new Error('未获取到验证码key')
    }
  } catch (error) {
    message.error('获取验证码失败，请刷新页面重试')
  }
}

onMounted(() => {
  refreshCaptcha()
})

const handleFinish = async (values) => {
  loading.value = true
  
  try {
    const response = await login({
      username: values.username,
      password: values.password,
      captcha: formState.captcha,
      captchaKey: formState.captchaKey
    })
    
    const { token, userInfo } = response.data.data
    
    localStorage.setItem('token', token)
    localStorage.setItem('userInfo', JSON.stringify(userInfo))
    
    if (rememberMe.value) {
      localStorage.setItem('remember', 'true')
    } else {
      localStorage.removeItem('remember')
    }
    
    message.success('登录成功')
    router.push('/dashboard')
  } catch (error) {
    formState.captcha = ''
    refreshCaptcha()
  } finally {
    loading.value = false
  }
}
</script>

<style lang="less" scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  position: fixed;
  inset: 0;
  overflow: hidden;
  
  .login-background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url('@/assets/images/login-bg.jpg');
    background-size: cover;
    background-position: center;
    z-index: -2;
    
    .bg-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      //background: linear-gradient(135deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.7) 100%);
      z-index: -1;
    }
  }

  .login-content {
    width: 400px;
    padding: 40px;
    background: rgba(255, 255, 255, 0.40);
    border-radius: 8px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);
    position: relative;
    z-index: 1;
  }

  .login-title {
    text-align: center;
    font-size: 28px;
    font-weight: 600;
    color: #1a1a1a;
    margin-bottom: 40px;
    letter-spacing: 1px;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }

  .login-form {
    :deep(.ant-form-item) {
      margin-bottom: 24px;
    }

    .custom-input {
      background-color: rgba(245, 245, 245, 0.8);
      border-radius: 4px;
      height: 48px;
      transition: all 0.3s;

      input {
        background: transparent;
        height: 48px;
        font-size: 15px;
      }

      &:hover, &:focus {
        background-color: rgba(240, 240, 240, 0.9);
      }

      .form-icon {
        color: #999;
        font-size: 16px;
      }
    }

    .form-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 0 2px 24px;

      .forgot-link {
        color: #666;
        font-size: 14px;
        cursor: pointer;
        
        &:hover {
          color: #1890ff;
        }
      }
    }

    .login-button {
      width: 100%;
      height: 48px;
      font-size: 16px;
      border-radius: 4px;
      background: #1890ff;
      border: none;
      box-shadow: 0 4px 12px rgba(24, 144, 255, 0.35);
      transition: all 0.3s ease;
      
      &:hover {
        background: #40a9ff;
        box-shadow: 0 6px 16px rgba(24, 144, 255, 0.45);
        transform: translateY(-2px);
      }
    }
  }
  
  .login-footer {
    text-align: center;
    margin-top: 30px;
    
    p {
      color: #666;
      font-size: 14px;
    }
  }

  .captcha-container {
    display: flex;
    align-items: center;
    
    .captcha-input {
      flex: 1;
    }
    
    .captcha-image {
      margin-left: 10px;
      height: 48px;
      width: 120px;
      background-color: #f5f5f5;
      border-radius: 4px;
      overflow: hidden;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      .captcha-loading {
        color: #999;
        font-size: 24px;
      }
    }
  }
}

:deep(.ant-checkbox-wrapper) {
  color: #666;
  font-size: 14px;
}

:deep(.ant-form-item-explain-error) {
  font-size: 13px;
  padding-left: 2px;
}

@media (max-width: 576px) {
  .login-container {
    .login-content {
      width: 90%;
      max-width: 360px;
      padding: 30px 20px;
    }
    
    .login-title {
      font-size: 24px;
      margin-bottom: 30px;
    }
  }
}
</style> 