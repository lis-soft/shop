<template>
  <a-modal
    :open="visible"
    title="银行卡信息"
    width="600px"
    centered
    :maskClosable="true"
    :destroyOnClose="true"
    @update:open="handleClose"
    @cancel="handleClose"
  >
    <div v-if="bankCardData && bankCardData.length > 0">
      <a-tabs :activeKey="activeTab" @change="handleTabChange">
        <a-tab-pane 
          v-for="(bank, index) in bankCardData" 
          :key="String(index)" 
          :tab="bank.type === 0 ? 'PayPay' : '银行卡'"
        >
          <a-form layout="vertical">
            <a-form-item label="持卡人姓名" required>
              <a-input v-model:value="editFormData.name" placeholder="请输入持卡人姓名" />
            </a-form-item>
            
            <template v-if="bank.type === 0">
              <a-form-item label="PayPay ID" required>
                <a-input v-model:value="editFormData.paypay_id" placeholder="请输入PayPay ID" />
              </a-form-item>
            </template>
            
            <template v-else>
              <a-form-item label="银行名称" required>
                <a-input v-model:value="editFormData.bank_name" placeholder="请输入银行名称" />
              </a-form-item>
              <a-form-item label="支行名称">
                <a-input v-model:value="editFormData.branch_name" placeholder="请输入支行名称" />
              </a-form-item>
              <a-form-item label="支行号">
                <a-input v-model:value="editFormData.branch_code" placeholder="请输入支行号" />
              </a-form-item>
              <a-form-item label="账户号" required>
                <a-input v-model:value="editFormData.account_number" placeholder="请输入账户号" />
              </a-form-item>
            </template>
            
            <a-form-item label="绑定时间">
              <a-input :value="formatDateTime(bank.created_at)" readonly />
            </a-form-item>
          </a-form>
        </a-tab-pane>
      </a-tabs>
    </div>
    <div v-else class="no-bank-info">
      <a-empty description="该用户暂未绑定任何银行卡" />
    </div>
    
    <template #footer>
      <div class="modal-footer">
        <a-button @click="handleClose">取消</a-button>
        <a-button type="primary" :loading="loading" @click="handleSubmit">确定</a-button>
      </div>
    </template>
  </a-modal>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { message } from 'ant-design-vue'
import moment from 'moment'
import { updateUserBankCard } from '@/api/user'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  bankCardData: {
    type: Array,
    default: () => []
  },
  userId: {
    type: [Number, String],
    required: true
  }
})

const emit = defineEmits(['update:visible', 'success'])

const activeTab = ref('0')
const loading = ref(false)
const editFormData = ref({
  name: '',
  paypay_id: '',
  bank_name: '',
  branch_name: '',
  branch_code: '',
  account_number: ''
})

const currentBank = computed(() => {
  const index = parseInt(activeTab.value)
  return props.bankCardData[index] || null
})

function formatDateTime(dateStr) {
  if (!dateStr) return '-'
  const date = moment(dateStr)
  return date.format('YYYY-MM-DD HH:mm:ss')
}

function handleTabChange(key) {
  activeTab.value = key
  loadCurrentBankData()
}

function loadCurrentBankData() {
  if (currentBank.value) {
    editFormData.value = {
      name: currentBank.value.name || '',
      paypay_id: currentBank.value.paypay_id || '',
      bank_name: currentBank.value.bank_name || '',
      branch_name: currentBank.value.branch_name || '',
      branch_code: currentBank.value.branch_code || '',
      account_number: currentBank.value.account_number || ''
    }
  }
}

function handleClose() {
  emit('update:visible', false)
}

async function handleSubmit() {
  if (!currentBank.value) {
    message.error('请选择要编辑的银行卡')
    return
  }

  // 验证必填字段
  if (!editFormData.value.name) {
    message.error('请输入持卡人姓名')
    return
  }

  if (currentBank.value.type === 0) {
    // PayPay 验证
    if (!editFormData.value.paypay_id) {
      message.error('请输入PayPay ID')
      return
    }
  } else {
    // 银行卡验证
    if (!editFormData.value.bank_name) {
      message.error('请输入银行名称')
      return
    }
    if (!editFormData.value.account_number) {
      message.error('请输入账户号')
      return
    }
  }

  loading.value = true
  try {
    const updateData = {
      id: currentBank.value.id,
      type: currentBank.value.type,
      name: editFormData.value.name
    }

    if (currentBank.value.type === 0) {
      updateData.paypay_id = editFormData.value.paypay_id
    } else {
      updateData.bank_name = editFormData.value.bank_name
      updateData.branch_name = editFormData.value.branch_name
      updateData.branch_code = editFormData.value.branch_code
      updateData.account_number = editFormData.value.account_number
    }

    await updateUserBankCard(props.userId, updateData)
    handleClose()
    emit('success')
  } catch (error) {
    console.error('更新银行卡信息失败:', error)
  } finally {
    loading.value = false
  }
}

watch(() => props.visible, (newVal) => {
  if (newVal && props.bankCardData.length > 0) {
    activeTab.value = '0'
    loadCurrentBankData()
  }
})

watch(() => props.bankCardData, (newData) => {
  if (newData && newData.length > 0) {
    activeTab.value = '0'
    loadCurrentBankData()
  }
})
</script>

<style lang="less" scoped>
.no-bank-info {
  padding: 40px 0;
  text-align: center;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

:deep(.ant-form-item) {
  margin-bottom: 16px;
}

:deep(.ant-tabs-content) {
  padding-top: 8px;
}

:deep(.ant-tabs-tab) {
  font-weight: 500;
}

:deep(.ant-input[readonly]) {
  background-color: #f5f5f5;
  border-color: #d9d9d9;
  color: #000;
  cursor: default;
}

:deep(.ant-form-item-label > label) {
  font-weight: 500;
}

:deep(.ant-form-item-required::before) {
  display: inline-block;
  margin-right: 4px;
  color: #ff4d4f;
  font-size: 14px;
  font-family: SimSun, sans-serif;
  line-height: 1;
  content: '*';
}
</style>
