<template>
  <div class="orders-container">
    <a-card class="table-card">
      <div class="table-header">
        <a-space>
          <a-button @click="refreshData">
            <template #icon><reload-outlined /></template>刷新
          </a-button>
          <a-button @click="toggleFilter">
            <template #icon><filter-outlined /></template>筛选
          </a-button>
        </a-space>
        <a-button type="primary" @click="exportData" :loading="exportLoading">
          <template #icon><download-outlined /></template>导出数据
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
          <a-form-item label="订单号">
            <a-input
              v-model:value="filters.orderId"
              placeholder="请输入订单号"
              allow-clear
            />
          </a-form-item>
          <a-form-item label="用户ID">
            <a-input
              v-model:value="filters.userId"
              placeholder="请输入用户ID"
              allow-clear
            />
          </a-form-item>
          <a-form-item label="订单状态">
            <a-select
              v-model:value="filters.status"
              placeholder="全部"
              style="width: 100%"
            >
              <a-select-option value="">全部</a-select-option>
              <a-select-option value="0">已派单</a-select-option>
              <a-select-option value="1">已完成</a-select-option>
              <a-select-option value="2">待结算</a-select-option>
              <a-select-option value="3">已冻结</a-select-option>
              <a-select-option value="4">已解冻</a-select-option>
              <a-select-option value="5">待反佣</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="订单类型">
            <a-select
              v-model:value="filters.isLucky"
              placeholder="全部"
              style="width: 100%"
            >
              <a-select-option value="">全部</a-select-option>
              <a-select-option value="1">幸运订单</a-select-option>
              <a-select-option value="0">普通订单</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="任务组">
            <a-input
              v-model:value="filters.taskForce"
              placeholder="请输入任务组"
              allow-clear
            />
          </a-form-item>
          <a-form-item label="创建时间范围">
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
        :columns="columns"
        :data-source="orderList"
        :loading="loading"
        :pagination="pagination"
        @change="onTableChange"
        row-key="id"
        :bordered="false"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'order_id'">
            <a-tooltip :title="record.order_id">
              <span>{{ record.order_id.substring(0, 10) }}...</span>
            </a-tooltip>
          </template>
          <template v-else-if="column.key === 'user_info'">
            <div>
              <div>ID: {{ record.user?.id }}</div>
              <div>{{ record.user?.username }}</div>
            </div>
          </template>
          <template v-else-if="column.key === 'product_info'">
            <div class="product-info">
              <a-image
                v-if="record.product_pic"
                :src="record.product_pic"
                :width="40"
                :height="40"
                :preview="false"
                style="object-fit: cover; border-radius: 4px"
              />
              <div>
                <div>{{ record.product_title }}</div>
                <div>¥{{ formatMoney(record.product_price) }} × {{ record.order_nums }}</div>
              </div>
            </div>
          </template>
          <template v-else-if="column.key === 'order_price'">
            <span class="money-amount">¥{{ formatMoney(record.order_price) }}</span>
          </template>
          <template v-else-if="column.key === 'order_commission'">
            <span class="money-amount success">¥{{ formatMoney(record.order_commission) }}</span>
          </template>
          <template v-else-if="column.key === 'is_lucky'">
            <a-tag :color="record.is_lucky === 1 ? 'gold' : 'default'">
              {{ record.is_lucky === 1 ? '幸运订单' : '普通订单' }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusText(record.status) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'created_at'">
            <span>{{ formatDateTime(record.created_at) }}</span>
          </template>
          <template v-else-if="column.key === 'updated_at'">
            <span>{{ formatDateTime(record.updated_at) }}</span>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="primary" size="small" @click="showOrderDetail(record)">
                <template #icon><eye-outlined /></template>
                详情
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <a-modal
      v-model:visible="detailModal.visible"
      title="订单详情"
      :width="700"
      :footer="null"
      :centered="true"
      class="order-detail-modal"
    >
      <div class="order-detail-header">
        <div class="order-id">
          <span class="label">订单ID:</span> 
          <span class="value">{{ detailModal.data?.id }}</span>
        </div>
        <a-tag :color="detailModal.data ? getStatusColor(detailModal.data.status) : ''" size="large">
          {{ detailModal.data ? getStatusText(detailModal.data.status) : '' }}
        </a-tag>
      </div>
      
      <a-divider />
      
      <div class="order-detail-content" v-if="detailModal.data">
        <div class="detail-section">
          <div class="section-title">基本信息</div>
          <div class="detail-row">
            <div class="detail-item">
              <div class="item-label">订单号</div>
              <div class="item-value">{{ detailModal.data.order_id }}</div>
            </div>
            <div class="detail-item">
              <div class="item-label">订单类型</div>
              <div class="item-value">
                <a-tag :color="detailModal.data.is_lucky === 1 ? 'gold' : 'default'">
                  {{ detailModal.data.is_lucky === 1 ? '幸运订单' : '普通订单' }}
                </a-tag>
              </div>
            </div>
          </div>
          <div class="detail-row">
            <div class="detail-item">
              <div class="item-label">创建时间</div>
              <div class="item-value">{{ formatDateTime(detailModal.data.created_at) }}</div>
            </div>
            <div class="detail-item">
              <div class="item-label">更新时间</div>
              <div class="item-value">{{ formatDateTime(detailModal.data.updated_at) }}</div>
            </div>
          </div>
          <div class="detail-row">
            <div class="detail-item">
              <div class="item-label">任务组</div>
              <div class="item-value">{{ detailModal.data.task_force || '-' }}</div>
            </div>
          </div>
        </div>
        
        <a-divider />
        
        <div class="detail-section">
          <div class="section-title">用户信息</div>
          <div class="detail-row">
            <div class="detail-item">
              <div class="item-label">用户ID</div>
              <div class="item-value">{{ detailModal.data.user?.id }}</div>
            </div>
            <div class="detail-item">
              <div class="item-label">用户名</div>
              <div class="item-value">{{ detailModal.data.user?.username }}</div>
            </div>
          </div>
          <div class="detail-row">
            <div class="detail-item">
              <div class="item-label">手机号</div>
              <div class="item-value">{{ detailModal.data.user?.phone || '-' }}</div>
            </div>
          </div>
        </div>
        
        <a-divider />
        
        <div class="detail-section">
          <div class="section-title">商品信息</div>
          <div class="product-detail-card">
            <a-image
              v-if="detailModal.data.product_pic"
              :src="detailModal.data.product_pic"
              :width="80"
              :height="80"
              style="object-fit: cover; border-radius: 4px"
            />
            <div class="product-detail-info">
              <div class="product-name">{{ detailModal.data.product_title }}</div>
              <div class="product-meta">
                <div class="product-price">单价: <span class="money">¥{{ formatMoney(detailModal.data.product_price) }}</span></div>
                <div class="product-quantity">数量: {{ detailModal.data.order_nums }}</div>
              </div>
            </div>
          </div>
        </div>
        
        <a-divider />
        
        <div class="detail-section">
          <div class="section-title">财务信息</div>
          <div class="detail-row">
            <div class="detail-item">
              <div class="item-label">冻结本金</div>
              <div class="item-value money">¥{{ formatMoney(detailModal.data.order_price) }}</div>
            </div>
            <div class="detail-item">
              <div class="item-label">完成后发放佣金</div>
              <div class="item-value money success">¥{{ formatMoney(detailModal.data.order_commission) }}</div>
            </div>
          </div>
          <div class="detail-row">
            <div class="detail-item">
              <div class="item-label">资金说明</div>
              <div class="item-value">下单时仅冻结本金，佣金在订单完成后发放。</div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <a-space>
          <a-button @click="detailModal.visible = false">关闭</a-button>
          <a-button type="primary" @click="completeOrder(detailModal.data)" v-if="detailModal.data && detailModal.data.status === 0">
            手动完成订单
          </a-button>
        </a-space>
      </div>
    </a-modal>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { useRoute } from 'vue-router'
import { 
  FilterOutlined, ReloadOutlined, DownloadOutlined, SearchOutlined, ClearOutlined,
  EyeOutlined, CheckCircleOutlined, UndoOutlined, ClockCircleOutlined, 
  LockOutlined, UnlockOutlined, DollarOutlined, DeleteOutlined, DownOutlined
} from '@ant-design/icons-vue'
import { 
  getOrderList, 
  updateOrderStatus, 
  completeOrder as completeOrderApi, 
  deleteOrder as deleteOrderApi,
  exportOrders
} from '@/api/order'
import moment from 'moment'

export default {
  name: 'OrdersList',
  components: {
    FilterOutlined, ReloadOutlined, DownloadOutlined, SearchOutlined, ClearOutlined,
    EyeOutlined, CheckCircleOutlined, UndoOutlined, ClockCircleOutlined, 
    LockOutlined, UnlockOutlined, DollarOutlined, DeleteOutlined, DownOutlined
  },
  setup() {
    const route = useRoute()
    const loading = ref(false)
    const exportLoading = ref(false)
    const orderList = ref([])
    const filters = reactive({
      visible: false,
      orderId: '',
      userId: '',
      status: '',
      isLucky: '',
      taskForce: '',
      dateRange: null,
      sortField: 'created_at',
      sortOrder: 'desc'
    })
    
    const pagination = reactive({
      current: 1,
      pageSize: 10,
      total: 0,
      showSizeChanger: true,
      showQuickJumper: true,
      showTotal: (total) => `共 ${total} 条记录`
    })
    
    const detailModal = reactive({
      visible: false,
      data: null
    })
    
    const columns = [
      {
        title: 'ID',
        dataIndex: 'id',
        key: 'id',
        width: 80
      },
      {
        title: '订单号',
        dataIndex: 'order_id',
        key: 'order_id',
        width: 120
      },
      {
        title: '用户信息',
        key: 'user_info',
        width: 120
      },
      {
        title: '商品信息',
        key: 'product_info',
        width: 200
      },
      {
        title: '冻结本金',
        dataIndex: 'order_price',
        key: 'order_price',
        width: 100,
        sorter: true
      },
      {
        title: '完成后佣金',
        dataIndex: 'order_commission',
        key: 'order_commission',
        width: 100,
        sorter: true
      },
      {
        title: '类型',
        dataIndex: 'is_lucky',
        key: 'is_lucky',
        width: 100,
        filters: [
          { text: '幸运订单', value: 1 },
          { text: '普通订单', value: 0 }
        ]
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        width: 100,
        filters: [
          { text: '已派单', value: 0 },
          { text: '已完成', value: 1 },
          { text: '待结算', value: 2 },
          { text: '已冻结', value: 3 },
          { text: '已解冻', value: 4 },
          { text: '待反佣', value: 5 }
        ]
      },
      {
        title: '创建时间',
        dataIndex: 'created_at',
        key: 'created_at',
        width: 150,
        sorter: true
      },
      {
        title: '更新时间',
        dataIndex: 'updated_at',
        key: 'updated_at',
        width: 150,
        sorter: true
      },
      {
        title: '操作',
        key: 'action',
        fixed: 'right',
        width: 150
      }
    ]
    
    const fetchData = async () => {
      loading.value = true
      try {
        const params = {
          page: pagination.current,
          pageSize: pagination.pageSize,
          sortBy: filters.sortField,
          sortOrder: filters.sortOrder
        }
        
        if (filters.orderId) params.orderId = filters.orderId
        if (filters.userId) params.userId = filters.userId
        if (filters.status !== '') params.status = filters.status
        if (filters.isLucky !== '') params.isLucky = filters.isLucky
        if (filters.taskForce) params.taskForce = filters.taskForce
        
        if (filters.dateRange && filters.dateRange.length === 2) {
          params.startDate = filters.dateRange[0].format('YYYY-MM-DD')
          params.endDate = filters.dateRange[1].format('YYYY-MM-DD')
        }
        
        const response = await getOrderList(params)
        
        if (response.data.code === 200) {
          orderList.value = response.data.data.list
          pagination.total = response.data.data.total
        } else {
          message.error(response.data.message || '获取订单列表失败')
        }
      } catch (error) {
        message.error('获取订单列表失败: ' + error.message)
      } finally {
        loading.value = false
      }
    }
    
    const toggleFilter = () => {
      filters.visible = !filters.visible
    }
    
    const applyFilters = () => {
      pagination.current = 1
      fetchData()
      filters.visible = false
    }
    
    const resetFilters = () => {
      filters.orderId = ''
      filters.userId = ''
      filters.status = ''
      filters.isLucky = ''
      filters.taskForce = ''
      filters.dateRange = null
      pagination.current = 1
      fetchData()
      message.success('筛选条件已重置')
    }
    
    const refreshData = () => {
      fetchData()
    }
    
    const onTableChange = (pag, tableFilters, sorter) => {
      pagination.current = pag.current
      pagination.pageSize = pag.pageSize
      
      if (sorter && sorter.field) {
        filters.sortField = sorter.field
        filters.sortOrder = sorter.order === 'ascend' ? 'asc' : 'desc'
      } else {
        filters.sortField = 'created_at'
        filters.sortOrder = 'desc'
      }
      
      fetchData()
    }
    
    const showOrderDetail = (record) => {
      detailModal.data = record
      detailModal.visible = true
    }
    
    const updateOrderStatus = async (record, status) => {
      try {
        const response = await updateOrderStatus(record.id, status)
        
        if (response.data.code === 200) {
          message.success('订单状态更新成功')
          fetchData()
        } else {
          message.error(response.data.message || '更新订单状态失败')
        }
      } catch (error) {
        message.error('更新订单状态失败: ' + error.message)
      }
    }
    
    const completeOrder = (record) => {
      Modal.confirm({
        title: '确认完成订单',
        content: '确定要手动完成该订单吗？此操作将返还用户本金，并在完成时发放佣金。',
        onOk: async () => {
          try {
            const response = await completeOrderApi(record.id)
            
            if (response.data.code === 200) {
              message.success('订单已手动完成')
              fetchData()
              detailModal.visible = false
            } else {
              message.error(response.data.message || '手动完成订单失败')
            }
          } catch (error) {
            message.error('手动完成订单失败: ' + error.message)
          }
        }
      })
    }
    
    const deleteOrder = (record) => {
      Modal.confirm({
        title: '确认删除',
        content: '确定要删除该订单吗？此操作不可恢复。',
        okText: '确认',
        okType: 'danger',
        cancelText: '取消',
        onOk: async () => {
          try {
            const response = await deleteOrderApi(record.id)
            
            if (response.data.code === 200) {
              message.success('订单删除成功')
              fetchData()
            } else {
              message.error(response.data.message || '删除订单失败')
            }
          } catch (error) {
            message.error('删除订单失败: ' + error.message)
          }
        }
      })
    }
    
    const exportData = async () => {
      if (exportLoading.value) return
      
      try {
        exportLoading.value = true
        
        const params = {
          sortBy: filters.sortField,
          sortOrder: filters.sortOrder
        }
        
        if (filters.orderId) params.orderId = filters.orderId
        if (filters.userId) params.userId = filters.userId
        if (filters.status !== '') params.status = filters.status
        if (filters.isLucky !== '') params.isLucky = filters.isLucky
        if (filters.taskForce) params.taskForce = filters.taskForce
        
        if (filters.dateRange && filters.dateRange.length === 2) {
          params.startDate = filters.dateRange[0].format('YYYY-MM-DD')
          params.endDate = filters.dateRange[1].format('YYYY-MM-DD')
        }
        
        message.loading('正在导出数据，请稍候...', 0)
        
        const response = await exportOrders(params)
        
        message.destroy()
        
        if (response.data) {
          const blob = new Blob([response.data], { 
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
          })
          const link = document.createElement('a')
          const url = URL.createObjectURL(blob)
          link.href = url
          link.download = `订单数据_${moment().format('YYYYMMDD_HHmmss')}.xlsx`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
          
          message.success('订单数据导出成功')
        } else {
          message.error('导出数据为空')
        }
      } catch (error) {
        message.destroy()
        console.error('导出失败:', error)
        message.error(error.response?.data?.message || '订单数据导出失败')
      } finally {
        exportLoading.value = false
      }
    }
    
    const formatMoney = (value) => {
      if (!value && value !== 0) return '0.00'
      return Number(value).toFixed(2)
    }
    
    const formatDateTime = (dateTime) => {
      if (!dateTime) return '-'
      return moment(dateTime).format('YYYY-MM-DD HH:mm:ss')
    }
    
    const getStatusText = (status) => {
      const statusMap = {
        0: '已派单',
        1: '已完成',
        2: '待结算',
        3: '已冻结',
        4: '已解冻',
        5: '待反佣'
      }
      return statusMap[status] || '未知状态'
    }
    
    const getStatusColor = (status) => {
      const colorMap = {
        0: 'blue',
        1: 'green',
        2: 'orange',
        3: 'red',
        4: 'purple',
        5: 'cyan'
      }
      return colorMap[status] || 'default'
    }
    
    onMounted(() => {
      const { userId, isLucky } = route.query
      if (userId) {
        filters.userId = userId
      }
      if (isLucky) {
        filters.isLucky = isLucky
      }
      fetchData()
    })
    
    return {
      loading,
      exportLoading,
      orderList,
      filters,
      pagination,
      columns,
      detailModal,
      toggleFilter,
      applyFilters,
      resetFilters,
      refreshData,
      onTableChange,
      showOrderDetail,
      updateOrderStatus,
      completeOrder,
      deleteOrder,
      exportData,
      formatMoney,
      formatDateTime,
      getStatusText,
      getStatusColor
    }
  }
}
</script>

<style scoped>
.table-card {
  margin-bottom: 24px;
}

.table-header {
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.product-detail {
  display: flex;
  align-items: center;
  gap: 12px;
}

.money-amount {
  font-weight: 500;
}

.money-amount.success {
  color: #52c41a;
}

.order-detail-modal :deep(.ant-modal-body) {
  padding: 24px;
}

.order-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-id {
  font-size: 16px;
}

.order-id .label {
  color: rgba(0, 0, 0, 0.45);
  margin-right: 8px;
}

.order-id .value {
  font-weight: 500;
}

.detail-section {
  margin-bottom: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 16px;
  color: rgba(0, 0, 0, 0.85);
}

.detail-row {
  display: flex;
  margin-bottom: 16px;
}

.detail-item {
  flex: 1;
  min-width: 0;
}

.item-label {
  color: rgba(0, 0, 0, 0.45);
  margin-bottom: 4px;
}

.item-value {
  color: rgba(0, 0, 0, 0.85);
  font-weight: 500;
  word-break: break-all;
}

.product-detail-card {
  display: flex;
  background-color: #f9f9f9;
  padding: 16px;
  border-radius: 8px;
  gap: 16px;
}

.product-detail-info {
  flex: 1;
}

.product-name {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 8px;
}

.product-meta {
  display: flex;
  gap: 16px;
}

.money {
  color: #1890ff;
  font-weight: 600;
}

.money.success {
  color: #52c41a;
}

.modal-footer {
  margin-top: 24px;
  text-align: right;
  border-top: 1px solid #f0f0f0;
  padding-top: 16px;
}
</style> 
