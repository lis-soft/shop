<template>
  <div class="permissions-page">
    <a-card :bordered="false">
      <div class="table-header" style="display: flex; justify-content: space-between; align-items: center;">
        <a-space>
          <a-button @click="refreshData" :loading="loading">
            <template #icon><reload-outlined /></template>
            刷新
          </a-button>
          <a-button @click="toggleFilter">
            <template #icon><filter-outlined /></template>
            筛选
          </a-button>
        </a-space>
        <div>
          <a-button type="primary" @click="handleCreate">
            <template #icon><plus-outlined /></template>
            新增权限组
          </a-button>
        </div>
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
              placeholder="权限组名称"
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
        :data-source="dataSource"
        :loading="loading"
        :pagination="pagination"
        row-key="id"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="record.status === 1 ? 'success' : 'error'">
              {{ record.status === 1 ? '启用' : '禁用' }}
            </a-tag>
          </template>
          
          <template v-else-if="column.key === 'adminCount'">
            <a-tag color="blue">{{ record.adminCount }}</a-tag>
          </template>
          
          <template v-else-if="column.key === 'rulesCount'">
            <a-tag color="green">{{ record.rulesArray ? record.rulesArray.length : 0 }}</a-tag>
          </template>
          
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button
                type="primary"
                size="small"
                @click="handleEdit(record)"
              >
                编辑
              </a-button>
              <a-button
                v-if="record.status === 1"
                danger
                size="small"
                @click="handleToggleStatus(record)"
              >
                禁用
              </a-button>
              <a-button
                v-else
                type="primary"
                size="small"
                @click="handleToggleStatus(record)"
              >
                启用
              </a-button>
              <a-popconfirm
                title="确定要删除这个权限组吗？"
                ok-text="确定"
                cancel-text="取消"
                @confirm="handleDelete(record)"
              >
                <a-button
                  danger
                  size="small"
                >
                  删除
                </a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <permission-modal
      v-model:visible="modalVisible"
      :mode="modalMode"
      :record="currentRecord"
      @success="handleModalSuccess"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { 
  ReloadOutlined, 
  PlusOutlined,
  FilterOutlined,
  SearchOutlined,
  ClearOutlined
} from '@ant-design/icons-vue'
import { 
  getAdminGroupList, 
  deleteAdminGroup, 
  toggleAdminGroupStatus 
} from '@/api/adminGroup'
import PermissionModal from './components/PermissionModal.vue'

const loading = ref(false)
const dataSource = ref([])
const modalVisible = ref(false)
const modalMode = ref('create')
const currentRecord = ref(null)

const filters = reactive({
  keyword: '',
  status: '',
  visible: false
})

const statusOptions = [
  { label: '启用', value: 1 },
  { label: '禁用', value: 0 }
]

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total) => `共 ${total} 条记录`
})

const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    width: 150,
    align: 'center'
  },
  {
    title: '权限组名称',
    dataIndex: 'name',
    key: 'name',
    width: 200,
    ellipsis: true,
    align: 'center'
  },
  {
    title: '管理员数量',
    key: 'adminCount',
    width: 120,
    align: 'center'
  },
  {
    title: '权限数量',
    key: 'rulesCount',
    width: 120,
    align: 'center'
  },
  {
    title: '状态',
    key: 'status',
    width: 100,
    align: 'center'
  },
  {
    title: '创建时间',
    dataIndex: 'created_at',
    key: 'created_at',
    width: 180,
    customRender: ({ text }) => {
      return text ? new Date(text).toLocaleString() : '-'
    }
  },
  {
    title: '操作',
    key: 'action',
    width: 200,
    align: 'center'
  }
]

const fetchData = async () => {
  try {
    loading.value = true
    const params = {
      page: pagination.current,
      limit: pagination.pageSize,
      keyword: filters.keyword || undefined,
      status: filters.status
    }

    const { data } = await getAdminGroupList(params)
    if (data.code === 200) {
      dataSource.value = data.data.list
      pagination.total = data.data.total
    }
  } catch (error) {
    console.error('获取权限组列表失败:', error)
  } finally {
    loading.value = false
  }
}

const refreshData = () => {
  fetchData()
  message.success('数据已刷新')
}

const toggleFilter = () => {
  filters.visible = !filters.visible
}

const applyFilters = () => {
  pagination.current = 1
  fetchData()
  filters.visible = false
  message.success('筛选条件已应用')
}

const resetFilters = () => {
  filters.keyword = ''
  filters.status = ''
  pagination.current = 1
  fetchData()
  message.success('筛选条件已重置')
}

const handleTableChange = (pag) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  fetchData()
}

const handleCreate = () => {
  modalMode.value = 'create'
  currentRecord.value = null
  modalVisible.value = true
}

const handleEdit = (record) => {
  modalMode.value = 'edit'
  currentRecord.value = record
  modalVisible.value = true
}

const handleToggleStatus = async (record) => {
  try {
    const { data } = await toggleAdminGroupStatus(record.id)
    if (data.code === 200) {
      message.success(data.message)
      fetchData()
    }
  } catch (error) {
    console.error('切换状态失败:', error)
  }
}

const handleDelete = async (record) => {
  try {
    const { data } = await deleteAdminGroup(record.id)
    if (data.code === 200) {
      message.success(data.message)
      fetchData()
    }
  } catch (error) {
    console.error('删除权限组失败:', error)
  }
}

const handleModalSuccess = () => {
  modalVisible.value = false
  fetchData()
}

onMounted(() => {
  fetchData()
})
</script>

<style lang="less" scoped>
.permissions-page {
  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    
    .header-left {
      flex: 1;
    }
    
    .header-right {
      margin-left: 16px;
    }
  }
}
</style>
