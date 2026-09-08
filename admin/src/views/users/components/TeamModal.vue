<template>
  <div class="team-page">
    <a-card class="header-card" :bordered="false">
      <div class="team-header">
        <div class="user-info">
          <a-avatar :size="64" :src="userData.avatar">
            <template #icon><user-outlined /></template>
          </a-avatar>
          <div class="user-details">
            <h2>{{ userData.username || '用户详情' }}</h2>
            <p>ID: {{ userId }}</p>
          </div>
        </div>
        <a-button type="primary" @click="goBack">
          <arrow-left-outlined /> 返回
        </a-button>
      </div>
    </a-card>

    <a-row :gutter="16" class="stats-row">
      <a-col :xs="24" :sm="12" :md="6">
        <a-card class="stat-card">
          <statistic 
            title="团队总人数" 
            :value="teamStats.totalMembers" 
            :precision="0"
            :loading="loading"
          >
            <template #prefix>
              <team-outlined />
            </template>
          </statistic>
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="12" :md="6">
        <a-card class="stat-card">
          <statistic 
            title="团队总充值" 
            :value="teamStats.totalRecharge" 
            :precision="2"
            :loading="loading"
            prefix="$"
          >
            <template #prefix>
              <bank-outlined />
            </template>
          </statistic>
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="12" :md="6">
        <a-card class="stat-card">
          <statistic 
            title="团队总提现" 
            :value="teamStats.totalWithdraw" 
            :precision="2"
            :loading="loading"
            prefix="$"
          >
            <template #prefix>
              <transaction-outlined />
            </template>
          </statistic>
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="12" :md="6">
        <a-card class="stat-card">
          <statistic 
            title="佣金总额" 
            :value="teamStats.totalCommission" 
            :precision="2"
            :loading="loading"
            prefix="$"
          >
            <template #prefix>
              <dollar-outlined />
            </template>
          </statistic>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="16" class="chart-row">
      <a-col :xs="24" :md="12">
        <a-card title="各层级佣金分布" :bordered="false" class="chart-card">
          <div class="chart-container">
            <v-chart class="chart" :option="commissionChartOption" autoresize />
          </div>
        </a-card>
      </a-col>
      <a-col :xs="24" :md="12">
        <a-card title="各层级充值/提现" :bordered="false" class="chart-card">
          <div class="chart-container">
            <v-chart class="chart" :option="transactionChartOption" autoresize />
          </div>
        </a-card>
      </a-col>
    </a-row>

    <a-card class="team-card" title="团队成员" :bordered="false">
      <template #extra>
        <a-space>
          <a-radio-group v-model:value="currentLevel" button-style="solid" @change="handleLevelChange">
            <a-radio-button :value="1">一级团队</a-radio-button>
            <a-radio-button :value="2">二级团队</a-radio-button>
            <a-radio-button :value="3">三级团队</a-radio-button>
          </a-radio-group>
          <a-input-search 
            v-model:value="searchQuery" 
            placeholder="搜索用户名/ID" 
            style="width: 200px" 
            @search="handleSearch"
          />
        </a-space>
      </template>

      <div class="table-container">
        <a-table
          :columns="columns"
          :data-source="teamMembers"
          :loading="loading"
          :pagination="pagination"
          @change="handleTableChange"
          row-key="id"
          :scroll="{ y: 'calc(100vh - 600px)', x: '100%' }"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'avatar'">
              <a-avatar :src="record.avatar">
                <template #icon><user-outlined /></template>
              </a-avatar>
            </template>
            <template v-else-if="column.key === 'username'">
              <div>
                <div>{{ record.username || '用户' + record.id }}</div>
                <div class="text-secondary">{{ formatDate(record.created_at) }}</div>
              </div>
            </template>
            <template v-else-if="column.key === 'task_force'">
              {{ record.task_force || '未知' }}
            </template>
            <template v-else-if="column.key === 'orders'">
              <a-tag color="blue">{{ record.orderCount || 0 }}</a-tag>
            </template>
            <template v-else-if="column.key === 'recharge'">
              <span class="amount">$ {{ formatNumber(record.recharge) }}</span>
            </template>
            <template v-else-if="column.key === 'withdraw'">
              <span class="amount">$ {{ formatNumber(record.withdraw) }}</span>
            </template>
            <template v-else-if="column.key === 'commission'">
              <span class="amount success">$ {{ formatNumber(record.commission) }}</span>
            </template>
          </template>
          <template #emptyText>
            <a-empty :description="loading ? '加载中...' : '暂无数据'" />
          </template>
        </a-table>
      </div>
    </a-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch, nextTick } from 'vue'
import { message, Statistic } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import { getUserTeam, getUserDetail } from '@/api/user'
import { 
  UserOutlined, TeamOutlined, BankOutlined, 
  TransactionOutlined, DollarOutlined, ArrowLeftOutlined 
} from '@ant-design/icons-vue'
import moment from 'moment'

const props = defineProps({
  userId: {
    type: [Number, String],
    required: true
  }
})

const router = useRouter()
const loading = ref(false)
const currentLevel = ref(1)
const searchQuery = ref('')
const teamMembers = ref([])
const userData = ref({})

const teamStats = reactive({
  totalMembers: 0,
  level1Count: 0,
  level2Count: 0,
  level3Count: 0,
  totalRecharge: 0,
  totalWithdraw: 0,
  totalCommission: 0,
  level1Commission: 0,
  level2Commission: 0,
  level3Commission: 0,
  level1Recharge: 0,
  level2Recharge: 0,
  level3Recharge: 0,
  level1Withdraw: 0,
  level2Withdraw: 0,
  level3Withdraw: 0
})

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total) => `共 ${total} 条`
})

const columns = [
  { title: '头像', dataIndex: 'avatar', key: 'avatar', width: 80 },
  { title: '用户名/注册时间', dataIndex: 'username', key: 'username', width: 200 },
  { title: '任务组', dataIndex: 'task_force', key: 'task_force', width: 80 },
  { title: '订单数', dataIndex: 'orders', key: 'orders', width: 100 },
  { title: '充值金额', dataIndex: 'recharge', key: 'recharge', width: 150, sorter: true },
  { title: '提现金额', dataIndex: 'withdraw', key: 'withdraw', width: 150, sorter: true },
  { title: '佣金', dataIndex: 'commission', key: 'commission', width: 150, sorter: true }
]

const commissionChartOption = computed(() => ({
  tooltip: {
    trigger: 'item',
    formatter: '{a} <br/>{b}: {c} ({d}%)'
  },
  legend: {
    orient: 'vertical',
    right: 10,
    top: 'center',
    data: ['一级佣金', '二级佣金', '三级佣金']
  },
  color: ['#1890ff', '#52c41a', '#faad14'],
  series: [
    {
      name: '佣金分布',
      type: 'pie',
      radius: ['50%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: false,
        position: 'center'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: '18',
          fontWeight: 'bold'
        }
      },
      labelLine: {
        show: false
      },
      data: [
        { value: parseFloat(teamStats.level1Commission) || 0, name: '一级佣金' },
        { value: parseFloat(teamStats.level2Commission) || 0, name: '二级佣金' },
        { value: parseFloat(teamStats.level3Commission) || 0, name: '三级佣金' }
      ]
    }
  ]
}))

const transactionChartOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },
  legend: {
    data: ['充值', '提现']
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: [
    {
      type: 'category',
      data: ['一级团队', '二级团队', '三级团队']
    }
  ],
  yAxis: [
    {
      type: 'value'
    }
  ],
  series: [
    {
      name: '充值',
      type: 'bar',
      emphasis: {
        focus: 'series'
      },
      itemStyle: {
        color: '#1890ff'
      },
      data: [
        parseFloat(teamStats.level1Recharge) || 0,
        parseFloat(teamStats.level2Recharge) || 0,
        parseFloat(teamStats.level3Recharge) || 0
      ]
    },
    {
      name: '提现',
      type: 'bar',
      emphasis: {
        focus: 'series'
      },
      itemStyle: {
        color: '#ff4d4f'
      },
      data: [
        parseFloat(teamStats.level1Withdraw) || 0,
        parseFloat(teamStats.level2Withdraw) || 0,
        parseFloat(teamStats.level3Withdraw) || 0
      ]
    }
  ]
}))

const fetchTeamData = async () => {
  loading.value = true
  try {
    const params = {
      level: currentLevel.value,
      page: pagination.current,
      pageSize: pagination.pageSize,
      keyword: searchQuery.value
    }
    
    const response = await getUserTeam(props.userId, params)
    if (response.data && response.data.code === 200) {
      const data = response.data.data
      
      if (data.stats) {
        Object.keys(data.stats).forEach(key => {
          if (key in teamStats) {
            teamStats[key] = data.stats[key] || 0
          }
        })
      }
      
      if (data.user) {
        userData.value = data.user
      }
      
      teamMembers.value = data.members || []
      pagination.total = data.total || 0
    }
  } catch (error) {
    message.error('获取团队数据失败')
  } finally {
    loading.value = false
  }
}

const handleLevelChange = () => {
  pagination.current = 1
  fetchTeamData()
}

const handleSearch = () => {
  pagination.current = 1
  fetchTeamData()
}

const handleTableChange = (pag, filters, sorter) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  
  const sortParams = {}
  if (sorter && sorter.order) {
    sortParams.sortField = sorter.field
    sortParams.sortOrder = sorter.order
  }
  
  fetchTeamData()
}

const formatDate = (date) => {
  if (!date) return '未知'
  return moment(date).format('YYYY-MM-DD HH:mm')
}

const formatNumber = (value) => {
  return (Number(value) || 0).toFixed(2)
}

const goBack = () => {
  router.back()
}

watch(() => props.userId, (newVal) => {
  if (newVal) {
    fetchTeamData()
  }
})

onMounted(() => {
  fetchTeamData()
})

// 监听teamStats变化，更新图表
watch(teamStats, () => {
  nextTick(() => {
    // 强制图表重新渲染
    if (document.querySelector('.chart')) {
      window.dispatchEvent(new Event('resize'))
    }
  })
})
</script>

<style lang="less" scoped>
.team-page {
  padding: 24px;
  
  .header-card {
    margin-bottom: 24px;
    
    .team-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .user-info {
        display: flex;
        align-items: center;
        
        .user-details {
          margin-left: 16px;
          
          h2 {
            margin-bottom: 4px;
            font-size: 20px;
          }
          
          p {
            margin: 0;
            color: rgba(0, 0, 0, 0.45);
          }
        }
      }
    }
  }
  
  .stats-row {
    margin-bottom: 24px;
    
    .stat-card {
      height: 100%;
      border-radius: 8px;
      overflow: hidden;
      transition: all 0.3s;
      
      &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transform: translateY(-2px);
      }
    }
  }
  
  .chart-row {
    margin-bottom: 24px;
    
    .chart-card {
      height: 100%;
      border-radius: 8px;
      overflow: hidden;
      
      .chart-container {
        height: 300px;
        
        .chart {
          height: 100%;
          width: 100%;
        }
      }
    }
  }
  
  .team-card {
    border-radius: 8px;
    overflow: hidden;
    
    .table-container {
      margin-top: 16px;
      position: relative;
      
      // 确保表格高度固定，避免抖动
      :deep(.ant-table-wrapper) {
        .ant-table {
          overflow-x: auto;
          
          .ant-table-container {
            .ant-table-body {
              overflow-y: auto !important; // 强制显示垂直滚动条
            }
          }
        }
        
        .ant-pagination {
          margin: 16px 0;
        }
      }
    }
    
    .text-secondary {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.45);
    }
    
    .amount {
      font-weight: 500;
      
      &.success {
        color: #52c41a;
      }
    }
  }
}

@media (max-width: 768px) {
  .team-page {
    padding: 12px;
    
    .stats-row, .chart-row {
      .ant-col {
        margin-bottom: 12px;
      }
    }
  }
}
</style> 