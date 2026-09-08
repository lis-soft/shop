<template>
  <div class="money-logs-container">
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
              placeholder="用户ID/备注/订单号"
              allow-clear
            />
          </a-form-item>
          <a-form-item label="交易类型">
            <a-select
              v-model:value="filters.type"
              placeholder="全部"
              style="width: 100%"
            >
              <a-select-option value="">全部</a-select-option>
              <a-select-option v-for="item in typeOptions" :key="item.value" :value="item.value">
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
        :data-source="moneyLogList"
        :columns="columns"
        :pagination="pagination"
        @change="onTableChange"
        :bordered="false"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'user'">
            <div class="user-info">
              <span class="username">{{ record.user?.username }}</span>
            </div>
          </template>
          <template v-if="column.key === 'relatedUser'">
            <div class="user-info" v-if="record.relatedUser">
              <span class="username">{{ record.relatedUser?.username }}</span>
            </div>
            <span v-else>-</span>
          </template>
          <template v-if="column.key === 'type'">
            <a-tag :color="getTypeColor(record.type)">{{ getTypeText(record.type) }}</a-tag>
          </template>
          <template v-if="column.key === 'amount'">
            <span :class="['amount', getAmountClass(record.type)]">{{ formatMoney(record.amount) }}</span>
          </template>
          <template v-if="column.key === 'before_balance'">
            {{ formatMoney(record.before_balance) }}
          </template>
          <template v-if="column.key === 'after_balance'">
            {{ formatMoney(record.after_balance) }}
          </template>
          <template v-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">{{ getStatusText(record.status) }}</a-tag>
          </template>
          <template v-if="column.key === 'created_at'">
            {{ formatDateTime(record.created_at) }}
          </template>
          <template v-if="column.key === 'action'">
            <a-button size="small" @click="handleDetail(record)">详情</a-button>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 详情弹窗 -->
    <MoneyLogDetailModal
      v-model:visible="detailDialogVisible"
      :detail-data="detailData"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { getMoneyLogList, getMoneyLogDetail } from '@/api/moneyLog'
import { formatDateTime } from '@/utils/dateFormat'
import { message } from 'ant-design-vue'
import {
  ReloadOutlined,
  FilterOutlined,
  SearchOutlined,
  ClearOutlined
} from '@ant-design/icons-vue'
import MoneyLogDetailModal from './components/MoneyLogModal.vue'

const moneyLogList = ref([])
const loading = ref(false)
const detailDialogVisible = ref(false)
const detailData = ref({})

const page = reactive({ current: 1, size: 10, total: 0 })
const filters = reactive({
  keyword: '',
  type: '',
  dateRange: null,
  startDate: '',
  endDate: '',
  visible: false
})

// 类型 1-充值 2-提现 3-佣金收入 4-订单支出 5-系统调整(增加) 6-系统调整(减少)
const typeOptions = [
  { label: '充值', value: '1' },
  { label: '提现', value: '2' },
  { label: '佣金收入', value: '3' },
  { label: '订单支出', value: '4' },
  { label: '系统调整(增加)', value: '5' },
  { label: '系统调整(减少)', value: '6' }
]

const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id', align: 'center', width: 80 },
  { title: '用户', key: 'user', align: 'center', width: 150 },
  { title: '关联用户', key: 'relatedUser', align: 'center', width: 150 },
  { title: '类型', key: 'type', align: 'center', width: 120 },
  { title: '金额', key: 'amount', align: 'center', width: 120 },
  { title: '交易前余额', key: 'before_balance', align: 'center', width: 120 },
  { title: '交易后余额', key: 'after_balance', align: 'center', width: 120 },
  { title: '状态', key: 'status', align: 'center', width: 100 },
  { title: '备注', dataIndex: 'remark', key: 'remark', align: 'center', width: 200, ellipsis: true },
  { title: '时间', key: 'created_at', align: 'center', width: 170 },
  { title: '操作', key: 'action', align: 'center', width: 100 }
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
  // 类型 1-充值 2-提现 3-佣金收入 4-订单支出 5-系统调整(增加) 6-系统调整(减少)
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
  filters.type = ''
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
      type: filters.type,
      startDate: filters.startDate,
      endDate: filters.endDate
    }
    
    const response = await getMoneyLogList(params)
    if (response.data?.data) {
      const { list, pagination: pager } = response.data.data
      moneyLogList.value = list
      page.total = pager.total
    }
  } catch (error) {
    message.error(error.response?.data?.message || '获取数据失败')
  } finally {
    loading.value = false
  }
}

async function handleDetail(record) {
  try {
    loading.value = true
    const response = await getMoneyLogDetail(record.id)
    if (response.data?.data) {
      detailData.value = response.data.data
      detailDialogVisible.value = true
    }
  } catch (error) {
    message.error(error.response?.data?.messag)
  } finally {
    loading.value = false
  }
}

watch(filters.dateRange, (val) => {
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
.user-info {
  display: flex;
  align-items: center;
  justify-content: center;
}
.username {
  font-weight: normal;
}
.amount {
  font-weight: 500;
}
.income-amount {
  color: #52c41a;
}
.expense-amount {
  color: #f5222d;
}

:deep(.ant-table-thead > tr > th) {
  text-align: center;
}

:deep(.ant-table-tbody > tr > td) {
  text-align: center;
}
</style>