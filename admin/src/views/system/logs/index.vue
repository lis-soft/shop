<template>
  <div class="log-container">
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
      </div>

      <a-drawer
        title="筛选条件"
        placement="right"
        :width="360"
        :open="filters.visible"
        @close="toggleFilter"
      >
        <a-form layout="vertical">
          <a-form-item label="管理员">
            <a-input v-model:value="filters.adminId" placeholder="请输入管理员ID" allow-clear />
          </a-form-item>
          <a-form-item label="操作行为">
            <a-input v-model:value="filters.action" placeholder="请输入操作行为" allow-clear />
          </a-form-item>
          <a-form-item label="请求方法">
            <a-select v-model:value="filters.method" placeholder="全部" style="width: 100%">
              <a-select-option value="">全部</a-select-option>
              <a-select-option value="GET">GET</a-select-option>
              <a-select-option value="POST">POST</a-select-option>
              <a-select-option value="PUT">PUT</a-select-option>
              <a-select-option value="DELETE">DELETE</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="时间范围">
            <a-range-picker 
              v-model:value="filters.dateRange" 
              style="width: 100%" 
              format="YYYY-MM-DD" 
              :placeholder="['开始日期', '结束日期']"
            />
          </a-form-item>
          <a-form-item>
            <a-space>
              <a-button type="primary" @click="applyFilters"><template #icon><search-outlined /></template>应用筛选</a-button>
              <a-button @click="resetFilters"><template #icon><clear-outlined /></template>重置</a-button>
            </a-space>
          </a-form-item>
        </a-form>
      </a-drawer>

      <a-table
        :columns="columns"
        :data-source="logList"
        :loading="loading"
        :pagination="pagination"
        @change="onTableChange"
        row-key="id"
        :bordered="false"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'method'">
            <a-tag :color="getMethodColor(record.method)">{{ record.method }}</a-tag>
          </template>
          <template v-if="column.key === 'status'">
            <a-tag :color="record.status >= 200 && record.status < 300 ? 'success' : 'error'">{{ record.status }}</a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-tooltip title="查看详情">
                <a-button type="link" @click="() => showDetailModal(record)">
                  <template #icon><eye-outlined /></template>
                </a-button>
              </a-tooltip>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <log-detail-modal
      :visible="detailModal.visible"
      :data="detailModal.data"
      @update:visible="detailModal.visible = $event"
    />
  </div>
</template>

<script setup>
  import { ref, reactive, computed, onMounted } from 'vue';
  import { message, Modal } from 'ant-design-vue';
  import { 
    ReloadOutlined, 
    FilterOutlined, 
    SearchOutlined, 
    ClearOutlined, 
    EyeOutlined, 
    ExclamationCircleOutlined 
  } from '@ant-design/icons-vue';
  import { getLogList, getLogDetail, clearLogs } from '@/api/log';
  import { createVNode } from 'vue';
  import LogDetailModal from './components/LogDetailModal.vue';

const logList = ref([])
const loading = ref(false)
const page = reactive({ current: 1, size: 10, total: 0 })
const filters = reactive({ visible: false, adminId: '', action: '', method: '', dateRange: null })
const detailModal = reactive({ visible: false, data: null })

const pagination = computed(() => ({
  total: page.total,
  current: page.current,
  pageSize: page.size,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total) => `共 ${total} 条`
}))
  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60, align: 'center' },
    { title: '管理员', dataIndex: ['admin', 'username'], key: 'admin', width: 120, align: 'center' },
    { title: 'IP地址', dataIndex: 'ip', key: 'ip', width: 120 },
    { title: '方法', dataIndex: 'method', key: 'method', width: 80 },
    { title: '路径', dataIndex: 'path', key: 'path', width: 200, ellipsis: true },
    { title: '操作行为', dataIndex: 'action', key: 'action_desc', width: 150, ellipsis: true },
    { title: '状态', dataIndex: 'status', key: 'status', width: 80 },
    { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 180 },
    { title: '操作', key: 'action', width: 80, fixed: 'right' }
  ];

function getMethodColor(method) {
  return { GET: 'blue', POST: 'green', PUT: 'orange', DELETE: 'red' }[method] || 'default'
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
  filters.adminId = ''
  filters.action = ''
  filters.method = ''
  filters.dateRange = null
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

  function showDetailModal(record) {
    detailModal.data = null;
    detailModal.visible = true;
    
    getLogDetail(record.id)
      .then(res => detailModal.data = res.data?.data || res.data)
      .catch(() => message.error('获取日志详情失败'))
      .finally(() => loading.value = false);
  }

  function showClearConfirm() {
    Modal.confirm({
      title: '确定要清空所有操作日志吗？',
      icon: createVNode(ExclamationCircleOutlined),
      content: '此操作将永久删除所有操作日志，不可恢复！',
      okText: '确认', okType: 'danger', cancelText: '取消',
      async onOk() { const res = await clearLogs(); if (res.code === 200) { message.success('操作日志已清空'); fetchList(); } }
    });
  }

async function fetchList() {
  loading.value = true
  try {
    const params = {
      page: page.current,
      pageSize: page.size,
      adminId: filters.adminId,
      action: filters.action,
      method: filters.method
    }
    
    if (filters.dateRange?.length === 2) {
      params.startDate = filters.dateRange[0].format('YYYY-MM-DD')
      params.endDate = filters.dateRange[1].format('YYYY-MM-DD')
    }
    
    const response = await getLogList(params)
    if (response.data?.data) {
      const { list, pagination: pager } = response.data.data
      logList.value = list || []
      page.total = pager?.total || 0
    }
  } catch (error) {
    message.error(error.response?.data?.message || '获取数据失败')
  } finally {
    loading.value = false
  }
}

onMounted(fetchList)
</script>

<style lang="less" scoped>
.log-container {
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