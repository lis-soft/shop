<template>
  <a-modal
    :visible="visible"
    title="用户密码"
    :mask-closable="true"
    @cancel="handleCancel"
    :centered="true"
    :footer="null"
    :bodyStyle="{ padding: '24px' }"
  >
    <div class="password-container">
      <div class="password-header">
        <lock-outlined />
        <div class="password-title">安全信息</div>
      </div>
      
      <a-divider />
      
      <a-card class="password-card">
        <div class="password-item">
          <div class="password-label">
            <key-outlined class="icon" />
            <span>登录密码：</span>
          </div>
          <div class="password-value-container">
            <div class="password-value" :class="{ 'password-masked': !showLoginPassword }">
              {{ showLoginPassword ? login_pwd : '••••••••' }}
            </div>
            <a-button 
              type="link" 
              class="toggle-button" 
              @click="showLoginPassword = !showLoginPassword"
            >
              <eye-outlined v-if="!showLoginPassword" />
              <eye-invisible-outlined v-else />
            </a-button>
            <a-button 
              type="link" 
              class="copy-button" 
              @click="copyToClipboard(login_pwd)"
              v-if="showLoginPassword"
            >
              <copy-outlined />
            </a-button>
          </div>
        </div>
      </a-card>
      
      <a-card class="password-card">
        <div class="password-item">
          <div class="password-label">
            <safety-outlined class="icon" />
            <span>安全密码：</span>
          </div>
          <div class="password-value-container">
            <div class="password-value" :class="{ 'password-masked': !showPayPassword }">
              {{ showPayPassword ? pay_pwd : '••••••••' }}
            </div>
            <a-button 
              type="link" 
              class="toggle-button" 
              @click="showPayPassword = !showPayPassword"
            >
              <eye-outlined v-if="!showPayPassword" />
              <eye-invisible-outlined v-else />
            </a-button>
            <a-button 
              type="link" 
              class="copy-button" 
              @click="copyToClipboard(pay_pwd)"
              v-if="showPayPassword"
            >
              <copy-outlined />
            </a-button>
          </div>
        </div>
      </a-card>
      
      <div class="password-tips">
        <info-circle-outlined />
        <span>请妥善保管用户密码信息，切勿泄露给他人</span>
      </div>
      
      <div class="password-footer">
        <a-button type="primary" @click="handleCancel">
          <template #icon><close-outlined /></template>
          关闭
        </a-button>
      </div>
    </div>
  </a-modal>
</template>

<script>
import { defineComponent, ref } from 'vue';
import { message } from 'ant-design-vue';
import { 
  LockOutlined, EyeOutlined, EyeInvisibleOutlined, 
  CopyOutlined, KeyOutlined, SafetyOutlined, 
  InfoCircleOutlined, CloseOutlined 
} from '@ant-design/icons-vue';

export default defineComponent({
  name: 'PasswordModal',
  components: {
    LockOutlined,
    EyeOutlined,
    EyeInvisibleOutlined,
    CopyOutlined,
    KeyOutlined,
    SafetyOutlined,
    InfoCircleOutlined,
    CloseOutlined
  },
  props: {
    login_pwd: {
      type: String,
      default: ''
    },
    pay_pwd: {
      type: String,
      default: ''
    },
    visible: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:visible'],
  setup(props, { emit }) {
    const showLoginPassword = ref(false);
    const showPayPassword = ref(false);
    
    const handleCancel = () => {
      showLoginPassword.value = false;
      showPayPassword.value = false;
      emit('update:visible', false);
    };
    
    const copyToClipboard = (text) => {
      navigator.clipboard.writeText(text)
        .then(() => {
          message.success('已复制到剪贴板');
        })
        .catch(() => {
          message.error('复制失败，请手动复制');
        });
    };

    return {
      showLoginPassword,
      showPayPassword,
      handleCancel,
      copyToClipboard
    };
  }
});
</script>

<style lang="less" scoped>
.password-container {
  .password-header {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
    
    :deep(.anticon) {
      font-size: 24px;
      color: #1890ff;
      margin-right: 12px;
    }
    
    .password-title {
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }
  }
  
  .password-card {
    margin-bottom: 16px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
    
    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    }
  }
  
  .password-item {
    display: flex;
    flex-direction: column;
    padding: 8px;
    
    .password-label {
      display: flex;
      align-items: center;
      margin-bottom: 12px;
      
      .icon {
        font-size: 16px;
        color: #1890ff;
        margin-right: 8px;
      }
      
      span {
        font-weight: 500;
        color: #555;
      }
    }
    
    .password-value-container {
      display: flex;
      align-items: center;
      background-color: #f9f9f9;
      border-radius: 4px;
      padding: 8px 12px;
      
      .password-value {
        flex: 1;
        font-family: monospace;
        font-size: 16px;
        color: #1890ff;
        
        &.password-masked {
          color: #666;
          letter-spacing: 2px;
        }
      }
      
      .toggle-button, .copy-button {
        padding: 4px 8px;
        
        :deep(.anticon) {
          font-size: 16px;
        }
      }
    }
  }
  
  .password-tips {
    display: flex;
    align-items: center;
    background-color: #e6f7ff;
    border: 1px solid #91d5ff;
    border-radius: 4px;
    padding: 8px 12px;
    margin-bottom: 24px;
    
    :deep(.anticon) {
      color: #1890ff;
      margin-right: 8px;
    }
    
    span {
      color: #555;
      font-size: 14px;
    }
  }
  
  .password-footer {
    display: flex;
    justify-content: center;
    margin-top: 24px;
  }
}
</style> 