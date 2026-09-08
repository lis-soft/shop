<template>
  <div class="admins-container">
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
          新增管理员
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
              placeholder="用户名/邮箱/手机号"
              allow-clear
            />
          </a-form-item>
          <a-form-item label="管理员状态">
            <a-select
              v-model:value="filters.status"
              placeholder="全部"
              style="width: 100%"
            >
              <a-select-option v-for="opt in [{value:'',label:'全部'},{value:'1',label:'启用'},{value:'0',label:'禁用'}]" 
                              :key="opt.value" :value="opt.value">{{ opt.label }}</a-select-option>
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
        :data-source="adminList"
        :loading="loading"
        :pagination="pagination"
        @change="onTableChange"
        row-key="id"
        :bordered="false"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="record.status == 1 ? 'success' : 'error'">
              {{ record.status == 1 ? '启用' : '禁用' }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'adminGroup'">
            <a-tag v-if="record.adminGroup" color="blue">
              {{ record.adminGroup.name }}
            </a-tag>
            <span v-else>-</span>
          </template>
          <template v-else-if="column.key === 'created_at'">
            {{ formatDate(record.created_at) }}
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space size="small">
              <a-button type="primary" size="small" @click="() => showModal(record)">
                <template #icon><edit-outlined /></template>
                编辑
              </a-button>
              <a-popconfirm
                title="确定要删除此管理员吗？"
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

    <AdminModal
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
import AdminModal from '@/views/system/admins/components/AdminModal.vue'
import { 
  PlusOutlined, ReloadOutlined, FilterOutlined, 
  SearchOutlined, ClearOutlined, EditOutlined, DeleteOutlined
} from '@ant-design/icons-vue'
import {
  getAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin
} from '@/api/admin'

const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 100, align: 'center' },
  { title: '用户名', dataIndex: 'username', key: 'username', width: 120, align: 'center' },
  { title: '姓名', dataIndex: 'realName', key: 'realName', width: 120, align: 'center' },
  { title: '手机号', dataIndex: 'mobile', key: 'mobile', width: 120, align: 'center' },
  { title: '邮箱', dataIndex: 'email', key: 'email', width: 120, align: 'center' },
  { title: '角色', dataIndex: 'adminGroup', key: 'adminGroup', width: 120, align: 'center' },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100, align: 'center' },
  { title: '创建时间', dataIndex: 'created_at', key: 'created_at', width: 180, align: 'center' },
  { title: '操作', key: 'action', width: 180, align: 'center' }
]

const adminList = ref([])
const loading = ref(false)
const page = reactive({ current: 1, size: 10, total: 0 })
const filters = reactive({ visible: false, keyword: '', status: '' })
const modal = reactive({
  visible: false,
  title: '新增管理员',
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

function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN')
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
  page.current = 1
  fetchList()
  message.success('筛选条件已重置')
}

function onTableChange(pagination) {
  page.current = pagination.current
  page.size = pagination.pageSize
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
      status: filters.status
    }
    
    const response = await getAdmins(params)
    if (response.data?.data) {
      const { list, pagination: pager } = response.data.data
      adminList.value = list
      page.total = pager.total
    }
  } catch (error) {
    message.error(error.response?.data?.message)
  } finally {
    loading.value = false
  }
}

function showModal(record = null) {
  modal.title = record ? '编辑管理员' : '新增管理员'
  modal.data = record
  modal.visible = true
}

async function handleDelete(record) {
  if (record.username === 'admin') {
    return message.error('超级管理员不能删除')
  }
  
  try {
    await deleteAdmin(record.id)
    message.success('删除成功')
    fetchList()
  } catch (error) {
    message.error(error.response?.data?.message)
  }
}

async function handleSubmit(formData) {
  try {
    modal.loading = true
    
    const data = {
      username: formData.username,
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      role_id: formData.role_id,
      status: formData.status
    }
    
    if (formData.id) {
      await updateAdmin(formData.id, data)
      message.success('更新成功')
    } else {
      data.password = formData.password
      await createAdmin(data)
      message.success('创建成功')
    }
    
    modal.visible = false
    fetchList()
  } catch (error) {
    message.error(error.response?.data?.message)
  } finally {
    modal.loading = false
  }
}

onMounted(fetchList)
</script>

<style scoped>
.admins-container {
  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }
  
  :deep(.ant-table-thead > tr > th) {
    text-align: center;
  }
  
  :deep(.ant-table-tbody > tr > td) {
    text-align: center;
  }
}
</style>