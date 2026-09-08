<template>
  <div class="products-container">
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
          新增商品
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
              placeholder="商品名称"
              allow-clear
            />
          </a-form-item>
          <a-form-item label="状态">
            <a-select v-model:value="filters.status" placeholder="请选择状态" allow-clear>
              <a-select-option :value="1">上架</a-select-option>
              <a-select-option :value="0">下架</a-select-option>
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
        :data-source="productList"
        :loading="loading"
        :pagination="pagination"
        @change="onTableChange"
        row-key="id"
        :bordered="false"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'product_pic'">
            <img
              v-if="record.product_pic"
              :src="resolveProductImageUrl(record.product_pic)"
              style="width: 50px; height: 50px; object-fit: cover;"
            />
            <span v-else>-</span>
          </template>
          <template v-else-if="column.key === 'product_info'">
            <div style="max-width: 200px; word-break: break-all;">
              {{ record.product_info || '-' }}
            </div>
          </template>
          <template v-else-if="column.key === 'price'">
            ¥{{ record.price }}
          </template>
          <template v-else-if="column.key === 'commission'">
            {{ Number(record.commission || 0).toFixed(2) }}%
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="record.status === 1 ? 'green' : 'red'">
              {{ record.status === 1 ? '上架' : '下架' }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'created_at'">
            {{ formatDateTime(record.created_at) }}
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space size="small" class="action-buttons">
              <a-button type="primary" size="small" @click="() => showModal(record)">
                <template #icon><edit-outlined /></template>
                编辑
              </a-button>
              <a-button
                :type="record.isPlaying ? 'warning' : 'success'"
                size="small"
                :loading="record.audioLoading"
                @click="() => handleTogglePlay(record)"
              >
                <template #icon>
                  <loading-outlined v-if="record.audioLoading" />
                  <pause-outlined v-else-if="record.isPlaying" />
                  <play-circle-outlined v-else />
                </template>
                {{ record.audioLoading ? '加载中' : (record.isPlaying ? '暂停' : '播放') }}
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
                {{ record.status === 1 ? '下架' : '上架' }}
              </a-button>
              <a-popconfirm
                title="确定要删除此商品吗？"
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

    <ProductModal
      v-model:visible="modal.visible"
      :title="modal.title"
      :edit-data="modal.data"
      :loading="modal.loading"
      @submit="handleSubmit"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { message } from 'ant-design-vue'
import {
  PlusOutlined, ReloadOutlined, FilterOutlined,
  SearchOutlined, ClearOutlined, EditOutlined, DeleteOutlined,
  EyeOutlined, EyeInvisibleOutlined, PlayCircleOutlined, PauseOutlined
} from '@ant-design/icons-vue'
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus
} from '@/api/product'
import { formatDateTime } from '@/utils/dateFormat'
import ProductModal from './components/ProductModal.vue'

const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 80, align: 'center' },
  { title: '商品名称', dataIndex: 'product_title', key: 'product_title', width: 200, align: 'center' },
  { title: '商品图片', dataIndex: 'product_pic', key: 'product_pic', width: 100, align: 'center' },
  { title: '商品信息', dataIndex: 'product_info', key: 'product_info', width: 200, align: 'center' },
  { title: '价格', dataIndex: 'price', key: 'price', width: 100, align: 'center' },
  { title: '商品利润率', dataIndex: 'commission', key: 'commission', width: 120, align: 'center' },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100, align: 'center' },
  { title: '创建时间', dataIndex: 'created_at', key: 'created_at', width: 180, align: 'center' },
  { title: '操作', key: 'action', width: 320, fixed: 'right', align: 'center' }
]

const productList = ref([])
const loading = ref(false)
const page = reactive({ current: 1, size: 10, total: 0 })
const filters = reactive({ visible: false, keyword: '', status: undefined })
const currentAudio = ref(null)
const modal = reactive({
  visible: false,
  title: '新增商品',
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

function onTableChange(pagination) {
  page.current = pagination.current
  page.size = pagination.pageSize
  fetchList()
}

function refreshList() {
  fetchList()
  message.success('数据已刷新')
}

function resolveProductImageUrl(value) {
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
    
    const response = await getProducts(params)
    if (response.data?.data) {
      const { list, pagination: pager } = response.data.data
      productList.value = list.map(item => ({
        ...item,
        isPlaying: false,
        audioLoading: false
      }))
      page.total = pager.total
    }
  } catch (error) {
    message.error(error.response?.data?.message || '获取数据失败')
  } finally {
    loading.value = false
  }
}

function showModal(record = null) {
  modal.title = record ? '编辑商品' : '新增商品'
  modal.data = record
  modal.visible = true
}


async function handleSubmit(formData) {
  try {
    modal.loading = true
    
    const data = {
      product_title: formData.product_title,
      product_info: formData.product_info,
      product_link: formData.product_link,
      product_pic: formData.product_pic,
      price: Number(formData.price),
      commission: Number(formData.commission),
      status: Number(formData.status)
    }
    
    if (formData.id) {
      await updateProduct(formData.id, data)
      message.success('更新成功')
    } else {
      await createProduct(data)
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

async function handleTogglePlay(record) {
  if (record.isPlaying) return pauseAudio(record)
  if (!record.product_link) return message.error('该商品没有音频链接')
  
  productList.value.forEach(item => item.id !== record.id && item.isPlaying && pauseAudio(item))
  await playAudio(record)
}

async function playAudio(record) {
  const resetState = () => {
    record.audioLoading = false
    record.isPlaying = false
    currentAudio.value = null
  }

  try {
    record.audioLoading = true
    currentAudio.value?.pause()
    
    const audio = new Audio(record.product_link)
    audio.preload = 'auto'
    
    const events = {
      canplay: () => {
        record.audioLoading = false
        record.isPlaying = true
        currentAudio.value = audio
        message.success(`开始播放: ${record.product_title}`)
      },
      ended: () => resetState(),
      error: () => {
        resetState()
        message.error(`音频加载失败: ${record.product_title}`)
      },
      pause: () => !audio.ended && (record.isPlaying = false)
    }
    
    Object.entries(events).forEach(([event, handler]) => audio.addEventListener(event, handler))
    
    audio.load()
    audio.play().catch(() => {
      resetState()
      message.error(`音频播放失败: ${record.product_title}`)
    })
  } catch (error) {
    resetState()
    message.error(`播放失败: ${record.product_title}`)
  }
}

function pauseAudio(record) {
  currentAudio.value?.pause()
  currentAudio.value = null
  record.isPlaying = false
  message.info(`暂停播放: ${record.product_title}`)
}

async function handleToggleStatus(record) {
  try {
    await toggleProductStatus(record.id)
    message.success('状态更新成功')
    fetchList()
  } catch (error) {
    message.error(error.response?.data?.message || '操作失败')
  }
}

async function handleDelete(record) {
  try {
    await deleteProduct(record.id)
    message.success('删除成功')
    fetchList()
  } catch (error) {
    message.error(error.response?.data?.message || '删除失败')
  }
}

onMounted(() => {
  fetchList()
})

onUnmounted(() => {
  currentAudio.value?.pause()
  currentAudio.value = null
})
</script>

<style lang="less" scoped>
.products-container {
  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
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
