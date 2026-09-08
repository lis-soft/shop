<template>
  <div class="vip-container">
    <a-card class="table-card">
      <div class="table-header">
        <a-space>
          <a-button @click="refreshList">
            <template #icon><reload-outlined /></template>
            刷新
          </a-button>
          <a-button @click="toggleFilter">
            <template #icon><filter-outlined /></template>
            筛选
          </a-button>
        </a-space>
        <a-button type="primary" @click="showModal()">
          <template #icon><plus-outlined /></template>
          新增VIP等级
        </a-button>
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
              placeholder="VIP名称或等级"
              allow-clear
            />
          </a-form-item>
          <a-form-item label="状态">
            <a-select v-model:value="filters.status" placeholder="请选择状态" allow-clear>
              <a-select-option :value="1">启用</a-select-option>
              <a-select-option :value="0">禁用</a-select-option>
            </a-select>
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
        :columns="columns"
        :data-source="vipList"
        :loading="loading"
        :pagination="pagination"
        @change="handleTableChange"
        row-key="id"
        :bordered="false"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'vip_image'">
            <a-image
              v-if="record.vip_image"
              :width="40"
              :height="40"
              :src="resolveVipImageUrl(record.vip_image)"
              :preview="false"
              style="border-radius: 4px"
            />
            <span v-else class="text-gray-400">无图片</span>
          </template>

          <template v-if="column.key === 'balance_limit'">
            <span class="text-blue-600">¥{{ record.balance_limit }}</span>
          </template>

          <template v-if="column.key === 'reward_rate'">
            <a-tag color="green">{{ record.reward_rate }}%</a-tag>
          </template>

          <template v-if="column.key === 'card_reward_rate'">
            <a-tag :color="record.card_reward_rate !== null && record.card_reward_rate !== undefined && record.card_reward_rate !== '' ? 'gold' : 'default'">
              {{ record.card_reward_rate !== null && record.card_reward_rate !== undefined && record.card_reward_rate !== '' ? `${record.card_reward_rate}%` : '-' }}
            </a-tag>
          </template>

          <template v-if="column.key === 'task_info'">
            <div>
              <div>每日套数: <span class="font-medium">{{ record.daily_sets }}</span></div>
              <div>每套任务: <span class="font-medium">{{ record.task_count }}</span></div>
            </div>
          </template>

          <template v-if="column.key === 'status'">
            <a-tag :color="record.status === 1 ? 'green' : 'red'">
              {{ record.status === 1 ? '启用' : '禁用' }}
            </a-tag>
          </template>

          <template v-if="column.key === 'created_at'">
            {{ formatDateTime(record.created_at) }}
          </template>

          <template v-if="column.key === 'action'">
            <a-space size="small" class="action-buttons">
              <a-button type="primary" size="small" @click="() => showModal(record)">
                <template #icon><edit-outlined /></template>
                编辑
              </a-button>
              <a-button
                :type="record.status === 1 ? 'warning' : 'success'"
                size="small"
                @click="() => handleToggleStatus(record)"
              >
                <template #icon>
                  <eye-outlined v-if="record.status === 0" />
                  <eye-invisible-outlined v-else />
                </template>
                {{ record.status === 1 ? '禁用' : '启用' }}
              </a-button>
              <a-popconfirm
                title="确定要删除这个VIP等级吗？"
                ok-text="确定"
                cancel-text="取消"
                @confirm="() => handleDelete(record)"
              >
                <a-button danger size="small">
                  <template #icon><delete-outlined /></template>
                  删除
                </a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <VipModal
      v-model:visible="modal.visible"
      :title="modal.title"
      :edit-data="modal.data"
      :loading="modal.loading"
      @submit="handleSubmit"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import {
  PlusOutlined, ReloadOutlined, FilterOutlined,
  SearchOutlined, ClearOutlined, EditOutlined, DeleteOutlined,
  EyeOutlined, EyeInvisibleOutlined
} from '@ant-design/icons-vue'
import { getVipLevels, createVipLevel, updateVipLevel, deleteVipLevel } from '@/api/vip'
import { formatDateTime } from '@/utils/dateFormat'
import VipModal from './components/VipModal.vue'

const loading = ref(false)
const vipList = ref([])
const page = reactive({ current: 1, size: 10, total: 0 })
const filters = reactive({ visible: false, keyword: '', status: undefined })
const modal = reactive({
  visible: false,
  title: '新增VIP等级',
  loading: false,
  data: null
})

const pagination = computed(() => ({
  total: page.total,
  current: page.current,
  pageSize: page.size,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total) => `共 ${total} 条`
}))

const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 80, align: 'center' },
  { title: 'VIP等级', dataIndex: 'vip_level', key: 'vip_level', width: 100, align: 'center' },
  { title: 'VIP名称', dataIndex: 'vip_name', key: 'vip_name', width: 120, align: 'center' },
  { title: 'VIP图标', dataIndex: 'vip_image', key: 'vip_image', width: 80, align: 'center' },
  { title: '激活余额', dataIndex: 'balance_limit', key: 'balance_limit', width: 120, align: 'center' },
  { title: '利润率', dataIndex: 'reward_rate', key: 'reward_rate', width: 100, align: 'center' },
  { title: '卡单利润率', dataIndex: 'card_reward_rate', key: 'card_reward_rate', width: 120, align: 'center' },
  { title: '任务配置', dataIndex: 'task_info', key: 'task_info', width: 120, align: 'center' },
  { title: '状态', dataIndex: 'status', key: 'status', width: 80, align: 'center' },
  { title: '创建时间', dataIndex: 'created_at', key: 'created_at', width: 160, align: 'center' },
  { title: '操作', key: 'action', width: 280, fixed: 'right', align: 'center' }
]

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
  filters.status = undefined
  page.current = 1
  fetchList()
  message.success('筛选条件已重置')
}

function refreshList() {
  fetchList()
  message.success('数据已刷新')
}

function resolveVipImageUrl(value) {
  if (!value) {
    return ''
  }

  if (/^(https?:)?\/\//i.test(value) || value.startsWith('data:') || value.startsWith('blob:')) {
    return value
  }

  const baseUrl = import.meta.env.VITE_API_URL || ''
  if (!baseUrl) {
    return value
  }

  const origin = baseUrl.replace(/\/admin\/?$/, '').replace(/\/$/, '')
  return value.startsWith('/') ? `${origin}${value}` : `${origin}/${value}`
}

async function fetchList() {
  loading.value = true
  try {
    const params = {
      page: page.current,
      pageSize: page.size,
      keyword: filters.keyword,
      status: filters.status
    }

    const res = await getVipLevels(params)
    if (res.data?.data) {
      const { list, pagination: pager } = res.data.data
      vipList.value = list.map(item => ({
        ...item,
        statusLoading: false
      }))
      page.total = pager.total
    }
  } catch (error) {
    message.error(error.response?.data?.message || '获取数据失败')
  } finally {
    loading.value = false
  }
}

function handleTableChange(pagination) {
  page.current = pagination.current
  page.size = pagination.pageSize
  fetchList()
}

function showModal(record = null) {
  modal.title = record ? '编辑VIP等级' : '新增VIP等级'
  modal.data = record
  modal.visible = true
}

function toNullableNumber(value) {
  if (value === '' || value === null || value === undefined) {
    return null
  }

  const parsedValue = Number(value)
  return Number.isFinite(parsedValue) ? parsedValue : null
}

async function handleSubmit(formData) {
  try {
    modal.loading = true
    
    const data = {
      vip_level: Number(formData.vip_level),
      vip_name: formData.vip_name,
      vip_image: formData.vip_image,
      balance_limit: Number(formData.balance_limit),
      reward_rate: Number(formData.reward_rate),
      card_reward_rate: toNullableNumber(formData.card_reward_rate),
      daily_sets: Number(formData.daily_sets),
      task_count: Number(formData.task_count),
      min_salary: Number(formData.min_salary),
      status: Number(formData.status)
    }
    
    if (formData.id) {
      await updateVipLevel(formData.id, data)
      message.success('更新成功')
    } else {
      await createVipLevel(data)
      message.success('创建成功')
    }
    
    modal.visible = false
    fetchList()
  } catch (error) {
    message.error(error.response?.data?.message || '操作失败')
  } finally {
    modal.loading = false
  }
}

async function handleToggleStatus(record) {
  try {
    await updateVipLevel(record.id, { status: record.status === 1 ? 0 : 1 })
    message.success('状态更新成功')
    fetchList()
  } catch (error) {
    message.error(error.response?.data?.message || '操作失败')
  }
}

async function handleDelete(record) {
  try {
    await deleteVipLevel(record.id)
    message.success('删除成功')
    fetchList()
  } catch (error) {
    message.error(error.response?.data?.message || '删除失败')
  }
}

onMounted(() => {
  fetchList()
})
</script>

<style lang="less" scoped>
.vip-container {
  .table-header {
    margin-bottom: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .action-buttons {
    display: flex;
    justify-content: center;
  }
  
  :deep(.ant-table-thead > tr > th) {
    text-align: center;
  }
  
  :deep(.ant-table-tbody > tr > td) {
    text-align: center;
  }
}
</style>
