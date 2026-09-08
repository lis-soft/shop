<template>
  <a-modal
    :visible="visible"
    :title="modalTitle"
    :maskClosable="true"
    :destroyOnClose="true"
    :confirmLoading="loading"
    width="550px"
    :centered="true"
    @cancel="handleCancel"
    @ok="handleSubmit"
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
            <div class="info-label">提现类型</div>
            <div class="info-value">
              <a-tag :color="detailData.type === 0 ? 'blue' : 'green'">
                {{ detailData.type === 0 ? 'TRC' : 'ERC' }}
              </a-tag>
            </div>
          </div>
          <div class="info-item">
            <div class="info-label">提现金额</div>
            <div class="info-value amount">{{ formatMoney(detailData.amount) }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">账户标识</div>
            <div class="info-value">{{ detailData.name || '-' }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">钱包地址</div>
            <div class="info-value address">{{ detailData.account_number || '-' }}</div>
          </div>
          <div class="info-item" v-if="detailData.id_card">
            <div class="info-label">身份证号</div>
            <div class="info-value">{{ detailData.id_card }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">状态</div>
            <div class="info-value">
              <a-tag :color="getStatusColor(detailData.status)">{{ getStatusText(detailData.status) }}</a-tag>
            </div>
          </div>
          <div class="info-item">
            <div class="info-label">申请时间</div>
            <div class="info-value">{{ formatDateTime(detailData.created_at) }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">更新时间</div>
            <div class="info-value">{{ formatDateTime(detailData.updated_at) }}</div>
          </div>
          <div class="info-item" v-if="mode === 'detail'">
            <div class="info-label">备注</div>
            <div class="info-value">{{ detailData.remarks || '-' }}</div>
          </div>
        </div>
      </div>
      
      <!-- 操作表单 -->
      <div v-if="mode !== 'detail'">
        <a-form layout="vertical" :model="formData">
          <a-form-item 
            name="remarks" 
            :label="mode === 'approve' ? '审批备注' : '拒绝原因'"
            :required="mode === 'reject'"
          >
            <a-textarea 
              v-model:value="formData.remarks" 
              :rows="3" 
              :placeholder="mode === 'approve' ? '请输入备注信息（可选）' : '请输入拒绝原因'" 
            />
          </a-form-item>
        </a-form>
      </div>
    </div>
    
    <template #footer>
      <a-button key="back" @click="handleCancel">
        {{ mode === 'detail' ? '关闭' : '取消' }}
      </a-button>
      <a-button 
        v-if="mode === 'approve'" 
        key="submit" 
        type="primary" 
        :loading="loading" 
        @click="handleSubmit"
      >
        确认通过
      </a-button>
      <a-button 
        v-if="mode === 'reject'" 
        key="submit" 
        danger 
        :loading="loading" 
        @click="handleSubmit"
      >
        确认拒绝
      </a-button>
      <a-button 
        v-if="mode === 'payment'" 
        key="submit" 
        type="primary" 
        :loading="loading" 
        @click="handleSubmit"
      >
        确认打款
      </a-button>
    </template>
  </a-modal>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { UserOutlined } from '@ant-design/icons-vue'
import { formatDateTime } from '@/utils/dateFormat'

const props = defineProps({
  visible: { type: Boolean, default: false },
  mode: { type: String, default: 'detail' }, // detail, approve, reject, payment
  detailData: { type: Object, default: () => ({}) },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['update:visible', 'submit'])

const formData = reactive({
  remarks: ''
})

const modalTitle = computed(() => {
  const titleMap = {
    detail: '提现详情',
    approve: '审批通过',
    reject: '审批拒绝',
    payment: '确认打款'
  }
  return titleMap[props.mode] || '提现详情'
})

function formatMoney(value) {
  const numValue = typeof value === 'string' ? parseFloat(value) : (Number(value) || 0)
  return `$ ${Math.abs(numValue).toFixed(2)}`
}

function getStatusText(status) {
  const statusMap = {
    0: '待审核',
    1: '已通过',
    2: '已拒绝',
    3: '已打款'
  }
  return statusMap[status] || '未知'
}

function getStatusColor(status) {
  const statusMap = {
    0: 'warning',
    1: 'success',
    2: 'error',
    3: 'processing'
  }
  return statusMap[status] || 'default'
}

function handleCancel() {
  emit('update:visible', false)
  formData.remarks = ''
}

function handleSubmit() {
  if (props.mode === 'detail') {
    handleCancel()
    return
  }
  
  if (props.mode === 'reject' && !formData.remarks) {
    message.warning('请输入拒绝原因')
    return
  }
  
  const submitData = {
    id: props.detailData.id,
    remarks: formData.remarks,
    mode: props.mode
  }
  
  emit('submit', submitData)
}

watch(() => props.visible, (visible) => {
  if (!visible) {
    formData.remarks = ''
  }
})
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
.info-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
}
.info-value {
  font-size: 16px;
  font-weight: 500;
}
.amount {
  color: #1890ff;
  font-weight: bold;
}
.address {
  word-break: break-all;
  font-size: 14px;
}
</style>
