<template>
  <a-modal
    :visible="visible"
    title="用户信息"
    @cancel="handleCancel"
    :width="600"
    :footer="null"
  >
    <div class="user-info">
      <div class="user-header">
        <div class="avatar">
          <img v-if="userData?.avatar" :src="userData.avatar" :alt="userData?.username" />
        </div>
        <div class="user-details">
          <h3>{{ userData?.username || '-' }}</h3>
          <span class="invite-code">{{ userData?.inviteCode || '-' }}</span>
        </div>
      </div>

      <div class="info-grid">
        <div class="info-card">
          <h4>账户信息</h4>
          <div class="info-row">
            <span class="label">登录密码</span>
            <span class="value password">{{ userData?.other?.login_pwd || '-' }}</span>
          </div>
          <div class="info-row">
            <span class="label">提现密码</span>
            <span class="value password">{{ userData?.other?.pay_pwd || '-' }}</span>
          </div>
        </div>

        <div class="info-card" v-if="userData?.other?.register">
          <h4>注册信息</h4>
          <div class="info-row">
            <span class="label">IP地址</span>
            <span class="value">{{ userData.other.register.ip || '-' }}</span>
          </div>
          <div class="info-row">
            <span class="label">注册时间</span>
            <span class="value">{{ formatDateTime(userData.other.register.time) || '-' }}</span>
          </div>
        </div>

        <div class="info-card" v-if="userData?.other?.last_login">
          <h4>最近登录</h4>
          <div class="info-row">
            <span class="label">IP地址</span>
            <span class="value">{{ userData.other.last_login.ip || '-' }}</span>
          </div>
          <div class="info-row">
            <span class="label">登录时间</span>
            <span class="value">{{ formatDateTime(userData.other.last_login.time) || '-' }}</span>
          </div>
        </div>

        <div class="info-card" v-if="userData?.other?.device_info">
          <h4>设备信息</h4>
          <div class="info-row">
            <span class="label">操作系统</span>
            <span class="value">{{ userData.other.device_info.os || '-' }}</span>
          </div>
          <div class="info-row">
            <span class="label">浏览器</span>
            <span class="value">{{ userData.other.device_info.browser || '-' }}</span>
          </div>
          <div class="info-row">
            <span class="label">设备类型</span>
            <span class="value">{{ userData.other.device_info.device_type || '-' }}</span>
          </div>
        </div>

        <div class="info-card" v-if="userData?.other?.device_info?.user_agent">
          <h4>用户代理</h4>
          <div class="info-row">
            <span class="label">User Agent</span>
            <span class="value user-agent">{{ userData.other.device_info.user_agent }}</span>
          </div>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script>
import moment from 'moment';

export default {
  name: 'UserInfoModal',
  props: {
    visible: Boolean,
    userData: Object
  },
  emits: ['update:visible'],
  methods: {
    handleCancel() {
      this.$emit('update:visible', false);
    },
    
    formatDateTime(dateStr) {
      if (!dateStr) return '-';
      return moment(dateStr).format('YYYY-MM-DD HH:mm');
    },
    
    formatKey(key) {
      return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    },
    
    formatValue(value) {
      if (value === null || value === undefined) return '-';
      if (typeof value === 'boolean') return value ? '是' : '否';
      if (typeof value === 'object') return JSON.stringify(value);
      return value.toString();
    }
  }
};
</script>

<style lang="less" scoped>
.user-info {
  .user-header {
    display: flex;
    align-items: center;
    padding: 20px 0;
    border-bottom: 1px solid #f0f0f0;
    margin-bottom: 20px;
    
    .avatar {
      width: 50px;
      height: 50px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 20px;
      font-weight: 600;
      margin-right: 16px;
      overflow: hidden;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      span {
        display: block;
      }
    }
    
    .user-details {
      h3 {
        margin: 0 0 4px 0;
        font-size: 18px;
        color: #262626;
      }
      
      .invite-code {
        color: #8c8c8c;
        font-size: 14px;
        font-family: 'Monaco', 'Menlo', monospace;
      }
    }
  }
  
  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 16px;
  }
  
  .info-card {
    background: #fafafa;
    border-radius: 8px;
    padding: 16px;
    
    h4 {
      margin: 0 0 12px 0;
      font-size: 14px;
      color: #595959;
      font-weight: 500;
    }
    
    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .label {
        color: #8c8c8c;
        font-size: 13px;
      }
      
      .value {
        color: #262626;
        font-size: 13px;
        text-align: right;
        max-width: 60%;
        word-break: break-all;
        font-weight: bold;
        
        &.password {
          font-family: 'Monaco', 'Menlo', monospace;
          background: #f5f5f5;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: bold;
        }
        
        &.user-agent {
          font-size: 11px;
          line-height: 1.3;
          max-width: 70%;
          font-weight: bold;
        }
      }
    }
  }
}
</style> 