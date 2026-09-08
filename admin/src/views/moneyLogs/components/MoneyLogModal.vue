<template>
  <a-modal
    :visible="visible"
    title="资金记录详情"
    :maskClosable="true"
    :destroyOnClose="true"
    width="550px"
    :centered="true"
    @cancel="handleCancel"
  >
    <div class="modal-content">
      <div class="user-info-section">
        <div class="user-info-header">
          <div class="user-avatar">
            <a-avatar :size="48" :src="detailData.user?.avatar">
              <template #icon><user-outlined /></template>
            </a-avatar>
          </div>
          <div class="user-details">
            <div class="username">{{ detailData.user?.username || '用户' }}</div>
            <div class="user-id">ID: {{ detailData.user_id }}</div>
          </div>
        </div>
        
        <a-divider />
        
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">交易类型</div>
            <div class="info-value">
              <a-tag :color="getTypeColor(detailData.type)">{{ getTypeText(detailData.type) }}</a-tag>
            </div>
          </div>
          <div class="info-item">
            <div class="info-label">交易金额</div>
            <div class="info-value" :class="getAmountClass(detailData.type)">
              {{ formatMoney(detailData.amount) }}
            </div>
          </div>
          <div class="info-item">
            <div class="info-label">交易前余额</div>
            <div class="info-value">{{ formatMoney(detailData.before_balance) }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">交易后余额</div>
            <div class="info-value">{{ formatMoney(detailData.after_balance) }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">交易状态</div>
            <div class="info-value">
              <a-tag :color="getStatusColor(detailData.status)">{{ getStatusText(detailData.status) }}</a-tag>
            </div>
          </div>
          <div class="info-item">
            <div class="info-label">交易时间</div>
            <div class="info-value">{{ formatDateTime(detailData.created_at) }}</div>
          </div>
          <div class="info-item" v-if="detailData.relatedUser">
            <div class="info-label">关联用户</div>
            <div class="info-value">
              {{ detailData.relatedUser?.username }} (ID: {{ detailData.related_user_id }})
            </div>
          </div>
          <div class="info-item" v-if="detailData.order_id">
            <div class="info-label">关联订单</div>
            <div class="info-value">{{ detailData.order_id }}</div>
          </div>
          <div class="info-item" v-if="detailData.ip">
            <div class="info-label">IP地址</div>
            <div class="info-value">{{ detailData.ip }}</div>
          </div>
          <div class="info-item full-width">
            <div class="info-label">备注</div>
            <div class="info-value remark-value">{{ detailData.remark || '-' }}</div>
          </div>
        </div>
      </div>
    </div>
    
    <template #footer>
      <a-button key="close" type="primary" @click="handleCancel">关闭</a-button>
    </template>
  </a-modal>
</template>

<script setup>
import { UserOutlined } from '@ant-design/icons-vue'
import { formatDateTime } from '@/utils/dateFormat'

const props = defineProps({
  visible: { type: Boolean, default: false },
  detailData: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['update:visible'])

function formatMoney(value) {
  const numValue = typeof value === 'string' ? parseFloat(value) : (Number(value) || 0)
  return `$ ${Math.abs(numValue).toFixed(2)}`
}

function getTypeText(type) {
  const typeMap = {
    1: '充值',
    2: '提现',
    3: '佣金收入',
    4: '订单支出',
    5: '系统调整(增加)',
    6: '系统调整(减少)'
  }
  return typeMap[type] || '未知'
}

function getTypeColor(type) {
  const typeMap = {
    1: 'green',
    2: 'orange',
    3: 'blue',
    4: 'red',
    5: 'purple',
    6: 'volcano'
  }
  return typeMap[type] || 'default'
}

function getAmountClass(type) {
  if ([1, 3, 5].includes(Number(type))) {
    return 'income-amount'
  } else {
    return 'expense-amount'
  }
}

function getStatusText(status) {
  const statusMap = {
    0: '失败',
    1: '成功',
    2: '处理中'
  }
  return statusMap[status] || '未知'
}

function getStatusColor(status) {
  const statusMap = {
    0: 'error',
    1: 'success',
    2: 'processing'
  }
  return statusMap[status] || 'default'
}

function handleCancel() {
  emit('update:visible', false)
}
</script>

<style scoped>
.modal-content {
  padding: 0;
}
.user-info-section {
  margin-bottom: 20px;
}
.user-info-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
.user-avatar {
  margin-right: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.user-avatar :deep(.ant-avatar) {
  background-color: #1890ff;
}
.user-details {
  flex: 1;
}
.username {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 4px;
}
.user-id {
  font-size: 14px;
  color: #666;
}
.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-top: 16px;
}
.info-item {
  margin-bottom: 8px;
}
.info-item.full-width {
  grid-column: span 2;
}
.info-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
}
.info-value {
  font-size: 16px;
  font-weight: 500;
}
.income-amount {
  color: #52c41a;
}
.expense-amount {
  color: #f5222d;
}
.remark-value {
  word-break: break-all;
  white-space: normal;
  line-height: 1.5;
  max-height: 120px;
  overflow-y: auto;
  padding: 8px;
  background-color: #f9f9f9;
  border-radius: 4px;
}
</style>
