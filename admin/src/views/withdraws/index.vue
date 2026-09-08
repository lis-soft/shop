<template>
  <div class="withdraw-container">
    <a-card class="table-card">
      <div class="table-header" style="display: flex; justify-content: space-between; align-items: center;">
        <a-space>
          <a-button type="primary" @click="refreshList">
            <template #icon><reload-outlined /></template>
            刷新
          </a-button>
          <a-button @click="toggleFilter">
            <template #icon><filter-outlined /></template>
            筛选
          </a-button>
        </a-space>
      </div>

      <a-drawer
        title="筛选条件"
        placement="right"
        :width="360"
        :open="filters.visible"
        @close="toggleFilter"
      >
        <a-form layout="vertical">
          <a-form-item label="关键词搜索">
            <a-input
              v-model:value="filters.keyword"
              placeholder="用户ID/账户标识/钱包地址"
              allow-clear
            />
          </a-form-item>
          <a-form-item label="状态">
            <a-select
              v-model:value="filters.status"
              placeholder="全部"
              style="width: 100%"
            >
              <a-select-option value="">全部</a-select-option>
              <a-select-option v-for="item in statusOptions" :key="item.value" :value="item.value">
                {{ item.label }}
              </a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="日期范围">
            <a-range-picker
              v-model:value="filters.dateRange"
              style="width: 100%"
              format="YYYY-MM-DD"
              :placeholder="['开始日期', '结束日期']"
            />
          </a-form-item>
          <a-form-item>
            <a-space>
              <a-button type="primary" @click="applyFilters">
                <template #icon><search-outlined /></template>
                应用筛选
              </a-button>
              <a-button @click="resetFilters">
                <template #icon><clear-outlined /></template>
                重置
              </a-button>
            </a-space>
          </a-form-item>
        </a-form>
      </a-drawer>

      <a-table
        :loading="loading"
        :data-source="withdrawList"
        :columns="columns"
        :pagination="pagination"
        @change="onTableChange"
        :bordered="false"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'type'">
            <a-tag :color="record.type === 0 ? 'blue' : 'green'">
              {{ record.type === 0 ? 'TRC' : 'ERC' }}
            </a-tag>
          </template>
          <template v-if="column.key === 'account_number'">
            <span class="address">{{ record.account_number || '-' }}</span>
          </template>
          <template v-if="column.key === 'amount'">
            {{ formatMoney(record.amount) }}
          </template>
          <template v-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">{{ getStatusText(record.status) }}</a-tag>
          </template>
          <template v-if="column.key === 'created_at'">
            {{ formatDateTime(record.created_at) }}
          </template>
          <template v-if="column.key === 'action'">
            <a-space>
              <a-button
                v-if="record.status === 0"
                type="primary"
                size="small"
                @click="handleApprove(record)"
              >
                通过
              </a-button>
              <a-button
                v-if="record.status === 0"
                danger
                size="small"
                @click="handleReject(record)"
              >
                拒绝
              </a-button>
              <a-button
                v-if="record.status === 1"
                type="primary"
                size="small"
                @click="handleConfirmPayment(record)"
              >
                确认打款
              </a-button>
              <a-button
                size="small"
                @click="handleDetail(record)"
              >
                详情
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <WithdrawModal
      v-model:visible="modal.visible"
      :mode="modal.mode"
      :detail-data="modal.data"
      :loading="modal.loading"
      @submit="handleModalSubmit"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { getWithdrawList, getWithdrawDetail, approveWithdraw, rejectWithdraw, confirmPayment } from '@/api/withdraw'
import { formatDateTime } from '@/utils/dateFormat'
import { message } from 'ant-design-vue'
import {
  ReloadOutlined,
  FilterOutlined,
  SearchOutlined,
  ClearOutlined
} from '@ant-design/icons-vue'
import WithdrawModal from './components/WithdrawModal.vue'

const withdrawList = ref([])
const loading = ref(false)
const page = reactive({ current: 1, size: 10, total: 0 })
const filters = reactive({
  keyword: '',
  status: '',
  dateRange: null,
  startDate: '',
  endDate: '',
  visible: false
})

const statusOptions = [
  { label: '待审核', value: 0 },
  { label: '已通过', value: 1 },
  { label: '已拒绝', value: 2 },
  { label: '已打款', value: 3 }
]

const modal = reactive({
  visible: false,
  mode: 'detail', // detail, approve, reject, payment
  loading: false,
  data: {}
})

const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id', align: 'center', width: 80 },
  { title: '用户ID', dataIndex: 'user_id', key: 'user_id', align: 'center', width: 100 },
  { title: '用户名', dataIndex: ['user', 'username'], key: 'username', align: 'center', width: 120 },
  { title: '类型', key: 'type', align: 'center', width: 100 },
  { title: '账户标识', dataIndex: 'name', key: 'name', align: 'center', width: 140 },
  { title: '钱包地址', dataIndex: 'account_number', key: 'account_number', align: 'center', width: 240 },
  { title: '提现金额', key: 'amount', align: 'center', width: 120 },
  { title: '状态', key: 'status', align: 'center', width: 100 },
  { title: '创建时间', key: 'created_at', align: 'center', width: 170 },
  { title: '操作', key: 'action', align: 'center', width: 220 }
]

const pagination = computed(() => ({
  total: page.total,
  current: page.current,
  pageSize: page.size,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total) => `共 ${total} 条`
}))

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

function toggleFilter() {
  filters.visible = !filters.visible
}

function applyFilters() {
  page.current = 1
  fetchList()
  filters.visible = false
  message.success('筛选条件已应用')
}

function resetFilters() {
  filters.keyword = ''
  filters.status = ''
  filters.dateRange = null
  filters.startDate = ''
  filters.endDate = ''
  page.current = 1
  fetchList()
  message.success('筛选条件已重置')
}

function onTableChange(pag) {
  page.current = pag.current
  page.size = pag.pageSize
  fetchList()
}

function refreshList() {
  fetchList()
  message.success('数据已刷新')
}

async function fetchList() {
  loading.value = true
  try {
    const params = {
      page: page.current,
      pageSize: page.size,
      keyword: filters.keyword,
      status: filters.status,
      startDate: filters.startDate,
      endDate: filters.endDate
    }
    
    const response = await getWithdrawList(params)
    if (response.data?.data) {
      const { list, pagination: pager } = response.data.data
      withdrawList.value = list
      page.total = pager.total
    }
  } catch (error) {
    message.error(error.response?.data?.message || '获取数据失败')
  } finally {
    loading.value = false
  }
}

async function handleApprove(record) {
  await openModal(record, 'approve')
}

async function handleReject(record) {
  await openModal(record, 'reject')
}

async function handleConfirmPayment(record) {
  await openModal(record, 'payment')
}

async function handleDetail(record) {
  await openModal(record, 'detail')
}

async function openModal(record, mode) {
  try {
    loading.value = true
    const response = await getWithdrawDetail(record.id)
    if (response.data?.data) {
      modal.data = response.data.data
      modal.mode = mode
      modal.visible = true
    }
  } catch (error) {
    message.error(error.response?.data?.message || '获取详情失败')
  } finally {
    loading.value = false
  }
}

async function handleModalSubmit(data) {
  try {
    modal.loading = true
    
    if (data.mode === 'approve') {
      await approveWithdraw(data.id, { remarks: data.remarks })
      message.success('审批通过成功')
    } else if (data.mode === 'reject') {
      await rejectWithdraw(data.id, { remarks: data.remarks })
      message.success('拒绝提现成功')
    } else if (data.mode === 'payment') {
      await confirmPayment(data.id, { remarks: data.remarks })
      message.success('确认打款成功')
    }
    
    modal.visible = false
    fetchList()
  } catch (error) {
    message.error(error.response?.data?.message || '操作失败')
  } finally {
    modal.loading = false
  }
}

watch(() => filters.dateRange, (val) => {
  if (val && val.length === 2) {
    filters.startDate = val[0].format('YYYY-MM-DD')
    filters.endDate = val[1].format('YYYY-MM-DD')
  } else {
    filters.startDate = ''
    filters.endDate = ''
  }
})

onMounted(() => {
  fetchList()
})
</script>

<style scoped>
.table-card {
  background: #fff;
  border-radius: 2px;
}
.table-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}
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
