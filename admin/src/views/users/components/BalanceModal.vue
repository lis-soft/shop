<template>
  <a-modal
    title="余额调整"
    :visible="visible"
    @cancel="handleCancel"
    :maskClosable="true"
    :destroyOnClose="true"
    :confirmLoading="loading"
  >
    <a-form
      ref="formRef"
      :model="formState"
      :rules="rules"
      layout="vertical"
      name="balance_form"
    >
      <a-form-item label="用户信息">
        <div class="user-info">
          <div class="info-item">
            <span class="label">用户名：</span>
            <span class="value">{{ userData?.username }}</span>
          </div>
          <div class="info-item">
            <span class="label">可用资金：</span>
            <span class="value">{{ formatMoney(currentAvailableBalance) }}</span>
          </div>
        </div>
      </a-form-item>
      
      <a-form-item name="amount" label="调整金额">
        <a-input-number
          v-model:value="formState.amount"
          :step="0.01"
          :precision="2"
          style="width: 100%"
          placeholder="请输入调整金额"
        />
      </a-form-item>
      
      <a-form-item name="createLog" label="是否创建余额变动日志">
        <a-switch v-model:checked="formState.createLog" checked-children="是" un-checked-children="否" />
      </a-form-item>
      
      <a-form-item v-if="formState.createLog" name="type" label="调整类型">
        <a-select v-model:value="formState.type" placeholder="请选择调整类型">
          <a-select-option :value="1">充值</a-select-option>
          <a-select-option :value="2">提现</a-select-option>
          <a-select-option :value="3">佣金收入</a-select-option>
          <a-select-option :value="4">订单支出</a-select-option>
          <a-select-option :value="5">系统调整</a-select-option>
          <a-select-option value="activity_gift">活动赠送</a-select-option>
          <a-select-option :value="6">购买VIP</a-select-option>
        </a-select>
      </a-form-item>
      
      <a-form-item v-if="formState.createLog" name="remark" label="调整备注">
        <a-textarea
          v-model:value="formState.remark"
          placeholder="请输入调整备注"
          :rows="3"
        />
      </a-form-item>
      
      <a-form-item label="调整后余额">
        <a-alert
          :message="balanceAfterAdjustment"
          :type="balanceType"
          show-icon
        />
      </a-form-item>
    </a-form>
    
    <template #footer>
      <a-button key="back" @click="handleCancel">取消</a-button>
      <a-button key="submit" type="primary" :loading="loading" @click="handleSubmit">提交</a-button>
    </template>
  </a-modal>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { message } from 'ant-design-vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  userData: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:visible', 'submit'])

const formRef = ref()
const loading = ref(false)

const formState = reactive({
  userId: undefined,
  type: 1,
  amount: undefined,
  remark: '',
  createLog: true
})

const rules = {
  type: [
    { required: true, message: '请选择调整类型' }
  ],
  amount: [
    { required: true, message: '请输入调整金额' },
    { type: 'number', message: '请输入有效的数字' },
    { 
      validator: (rule, value) => {
        if (value === undefined || value === null || value === 0) {
          return Promise.reject('调整金额不能为0')
        }
        return Promise.resolve()
      }
    }
  ]
}

const currentAvailableBalance = computed(() => {
  if (!props.userData) {
    return 0
  }

  if (props.userData.availableBalance !== undefined && props.userData.availableBalance !== null) {
    return Number(props.userData.availableBalance) || 0
  }

  const balance = Number(props.userData.balance) || 0
  const frozenBalance = Number(props.userData.frozenBalance ?? props.userData.frozen_balance) || 0
  return balance - frozenBalance
})

const balanceAfterAdjustment = computed(() => {
  if (!props.userData || formState.amount === undefined) {
    return '请输入调整金额'
  }

  const newBalance = currentAvailableBalance.value + Number(formState.amount)

  return `调整后可用资金: ${formatMoney(newBalance)}`
})

const balanceType = computed(() => {
  if (!props.userData || formState.amount === undefined) {
    return 'info'
  }

  const amount = Number(formState.amount)
  const newBalance = currentAvailableBalance.value + amount
  
  if (newBalance < 0) {
    return 'error'
  }
  
  return amount > 0 ? 'success' : 'warning'
})

watch(() => props.visible, (val) => {
  if (val && props.userData) {
    formState.userId = props.userData.id
    formState.type = 1
    formState.amount = undefined
    formState.remark = ''
    formState.createLog = true
  }
})

function formatMoney(value) {
  const numValue = typeof value === 'string' ? parseFloat(value) : Number(value)
  return '$ ' + numValue.toFixed(2)
}

const handleCancel = () => {
  emit('update:visible', false)
}

const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    loading.value = true
    emit('submit', { ...formState })
  } catch (error) {
    console.error('表单验证失败:', error)
    message.error('请检查表单填写是否正确')
  } finally {
    loading.value = false
  }
}
</script>

<style lang="less" scoped>
.user-info {
  padding: 12px;
  background-color: #f5f5f5;
  border-radius: 4px;
  
  .info-item {
    margin-bottom: 8px;
    display: flex;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .label {
      width: 80px;
      color: #666;
    }
    
    .value {
      font-weight: 500;
    }
  }
}

:deep(.ant-form-item) {
  margin-bottom: 16px;
}
</style> 
