<template>
  <div class="dashboard-container">
    <!-- 顶部统计卡片 -->
    <a-row :gutter="24">
      <a-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
        <a-card class="stat-card user-card">
          <template #title>
            <div class="card-title">
              <team-outlined />
              <span>用户总数</span>
            </div>
          </template>
          <div class="stat-content">
            <div class="stat-value">{{ stats.totalUsers }}</div>
            <div class="stat-desc">活跃用户: {{ stats.activeUsers }}</div>
          </div>
        </a-card>
      </a-col>
      
      <a-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
        <a-card class="stat-card order-card">
          <template #title>
            <div class="card-title">
              <shopping-outlined />
              <span>订单总数</span>
            </div>
          </template>
          <div class="stat-content">
            <div class="stat-value">{{ stats.totalOrders }}</div>
            <div class="stat-desc">今日订单: {{ stats.todayOrders }}</div>
          </div>
        </a-card>
      </a-col>
      
      <a-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
        <a-card class="stat-card income-card">
          <template #title>
            <div class="card-title">
              <dollar-outlined />
              <span>总收入</span>
            </div>
          </template>
          <div class="stat-content">
            <div class="stat-value">¥{{ formatNumber(stats.totalIncome) }}</div>
            <div class="stat-desc">今日收入: ¥{{ formatNumber(stats.todayIncome) }}</div>
          </div>
        </a-card>
      </a-col>
      
      <a-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
        <a-card class="stat-card withdraw-card" @click="goToWithdraws" :hoverable="true">
          <template #title>
            <div class="card-title">
              <wallet-outlined />
              <span>待处理提现</span>
            </div>
          </template>
          <div class="stat-content">
            <div class="stat-value">{{ stats.pendingWithdraws }}</div>
            <div class="stat-desc">总支出: ¥{{ formatNumber(stats.totalExpense) }}</div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 图表区域 -->
    <a-row :gutter="24" style="margin-top: 24px">
      <!-- 订单和收入趋势图 -->
      <a-col :xs="24" :lg="16">
        <a-card title="近7天数据趋势" class="chart-card">
          <div id="trend-chart" class="chart-container"></div>
        </a-card>
      </a-col>
      
      <!-- 用户状态分布图 -->
      <a-col :xs="24" :lg="8">
        <a-card title="用户状态分布" class="chart-card">
          <div id="user-status-chart" class="chart-container"></div>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="24" style="margin-top: 24px">
      <!-- 用户注册趋势图 -->
      <a-col :xs="24" :lg="12">
        <a-card title="用户注册趋势" class="chart-card">
          <div id="user-reg-chart" class="chart-container"></div>
        </a-card>
      </a-col>
      
      <!-- 充值方式分布 -->
      <a-col :xs="24" :lg="12">
        <a-card title="充值方式分布" class="chart-card">
          <a-table 
            :columns="rechargeColumns"
            :data-source="chartData.rechargeMethodStats"
            :pagination="false"
            size="small"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'total_amount'">
                ¥{{ formatNumber(record.total_amount) }}
              </template>
              <template v-else-if="column.key === 'method_name'">
                {{ record.network }}/{{ record.coin }}
              </template>
            </template>
          </a-table>
        </a-card>
      </a-col>
      
      <!-- 最近注册用户 -->
      <a-col :xs="24" :lg="12">
        <a-card title="最近注册用户" class="table-card">
          <a-table 
            :columns="userColumns"
            :data-source="recentUsers"
            :pagination="false"
            :loading="loading"
            row-key="id"
            size="small"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'status'">
                <a-tag :color="record.status === 1 ? 'success' : 'error'">
                  {{ record.status === 1 ? '活跃' : '禁用' }}
                </a-tag>
              </template>
              <template v-else-if="column.key === 'balance'">
                ¥{{ formatNumber(record.balance) }}
              </template>
              <template v-else-if="column.key === 'action'">
                <a-button type="link" size="small" @click="goToUserDetail(record)">
                  查看
                </a-button>
              </template>
            </template>
          </a-table>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import { 
  TeamOutlined, 
  ShoppingOutlined, 
  DollarOutlined, 
  WalletOutlined
} from '@ant-design/icons-vue'
import { getDashboardStats, getRecentUsers } from '@/api/dashboard'

const router = useRouter()
const loading = ref(false)

const stats = reactive({
  totalUsers: 0,
  activeUsers: 0,
  totalOrders: 0,
  todayOrders: 0,
  totalIncome: 0,
  todayIncome: 0,
  totalExpense: 0,
  pendingWithdraws: 0
})

const chartData = reactive({
  last7Days: [],
  orderData: [],
  incomeData: [],
  userRegData: [],
  userStatusData: [],
  rechargeMethodStats: []
})

const recentUsers = ref([])

const userColumns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
  { title: '用户名', dataIndex: 'username', key: 'username', width: 120 },
  { title: '手机号', dataIndex: 'phone', key: 'phone', width: 120 },
  { title: '余额', dataIndex: 'balance', key: 'balance', width: 100 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 80 },
  { title: '注册时间', dataIndex: 'created_at', key: 'created_at', width: 180 },
  { title: '操作', key: 'action', width: 80 }
]

const rechargeColumns = [
  { title: '充值方式', dataIndex: 'method_name', key: 'method_name', width: 150 },
  { title: '充值次数', dataIndex: 'count', key: 'count', width: 100 },
  { title: '充值总额', dataIndex: 'total_amount', key: 'total_amount', width: 150 }
]

let trendChart = null
let userStatusChart = null
let userRegChart = null

// 格式化数字
function formatNumber(num) {
  if (num === undefined || num === null) return '0.00'
  return parseFloat(num).toFixed(2)
}

async function fetchDashboardStats() {
  loading.value = true
  try {
    const res = await getDashboardStats()
    if (res.data && res.data.code === 200) {
      const data = res.data.data
      
      // 更新统计数据
      Object.assign(stats, data.stats || {})
      
      // 更新图表数据
      if (data.chartData) {
        chartData.last7Days = data.chartData.last7Days || []
        chartData.orderData = data.chartData.orderData || []
        chartData.incomeData = data.chartData.incomeData || []
        chartData.userRegData = data.chartData.userRegData || []
        chartData.userStatusData = data.chartData.userStatusData || []
        chartData.rechargeMethodStats = data.chartData.rechargeMethodStats || []
        
        // 初始化图表
        initTrendChart()
        initUserStatusChart()
        initUserRegChart()
      }
    }
  } catch (error) {
    console.error('获取仪表盘数据失败:', error)
  } finally {
    loading.value = false
  }
}

async function fetchRecentUsers() {
  try {
    const res = await getRecentUsers(5) // 只获取5条记录
    if (res.data && res.data.code === 200) {
      recentUsers.value = res.data.data.users || []
    }
  } catch (error) {
    console.error('获取最近注册用户失败:', error)
  }
}

function initTrendChart() {
  const chartDom = document.getElementById('trend-chart')
  if (!chartDom) return
  
  trendChart = echarts.init(chartDom)
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['订单数', '收入']
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
        data: chartData.last7Days
      }
    ],
    yAxis: [
      {
        type: 'value',
        name: '订单数',
        position: 'left'
      },
      {
        type: 'value',
        name: '收入',
        position: 'right',
        axisLabel: {
          formatter: '¥{value}'
        }
      }
    ],
    series: [
      {
        name: '订单数',
        type: 'bar',
        data: chartData.orderData,
        itemStyle: {
          color: '#1890ff'
        }
      },
      {
        name: '收入',
        type: 'line',
        yAxisIndex: 1,
        data: chartData.incomeData,
        itemStyle: {
          color: '#52c41a'
        },
        lineStyle: {
          width: 3
        },
        symbol: 'circle',
        symbolSize: 8
      }
    ]
  }
  
  trendChart.setOption(option)
}

function initUserStatusChart() {
  const chartDom = document.getElementById('user-status-chart')
  if (!chartDom) return
  
  userStatusChart = echarts.init(chartDom)
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      data: chartData.userStatusData.map(item => item.name)
    },
    series: [
      {
        name: '用户状态',
      type: 'pie',
      radius: ['50%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
          show: true,
          formatter: '{b}: {c} ({d}%)'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: '18',
          fontWeight: 'bold'
        }
      },
      labelLine: {
          show: true
      },
        data: chartData.userStatusData,
    color: ['#52c41a', '#ff4d4f']
  }
    ]
  }
  
  userStatusChart.setOption(option)
}

function initUserRegChart() {
  const chartDom = document.getElementById('user-reg-chart')
  if (!chartDom) return
  
  userRegChart = echarts.init(chartDom)
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
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
        data: chartData.last7Days,
        axisTick: {
          alignWithLabel: true
        }
      }
    ],
    yAxis: [
      {
        type: 'value',
        name: '注册用户数'
      }
    ],
    series: [
      {
        name: '注册用户数',
        type: 'bar',
        barWidth: '60%',
        data: chartData.userRegData,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#83bff6' },
            { offset: 0.5, color: '#188df0' },
            { offset: 1, color: '#188df0' }
          ])
        }
      }
    ]
  }
  
  userRegChart.setOption(option)
}

function goToUserDetail(record) {
  router.push(`/users/list?id=${record.id}`)
}

function goToWithdraws() {
  router.push('/finance/withdraws')
}

function handleResize() {
  if (trendChart) trendChart.resize()
  if (userStatusChart) userStatusChart.resize()
  if (userRegChart) userRegChart.resize()
}

onMounted(() => {
  fetchDashboardStats()
  fetchRecentUsers()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (trendChart) trendChart.dispose()
  if (userStatusChart) userStatusChart.dispose()
  if (userRegChart) userRegChart.dispose()
})
</script>

<style lang="less" scoped>
.dashboard-container {
  padding: 24px;
  
  .stat-card {
    height: 160px;
    overflow: hidden;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    
    :deep(.ant-card-head) {
      border-bottom: 1px solid rgba(0, 0, 0, 0.06);
      min-height: 48px;
      
      .ant-card-head-title {
        padding: 12px 0;
      }
    }
    
    :deep(.ant-card-body) {
      padding: 20px 24px;
    }
    
    &.user-card {
      border-top: 4px solid #1890ff;
    }
    
    &.order-card {
      border-top: 4px solid #52c41a;
    }
    
    &.income-card {
      border-top: 4px solid #fa8c16;
    }
    
    &.withdraw-card {
      border-top: 4px solid #722ed1;
      cursor: pointer;
      transition: all 0.3s;
      
      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
      }
    }
    
    .card-title {
      display: flex;
      align-items: center;
      
      .anticon {
        margin-right: 8px;
        font-size: 16px;
      }
    }
    
    .stat-content {
      display: flex;
      flex-direction: column;
      justify-content: center;
      height: calc(100% - 20px);
    
    .stat-value {
        font-size: 32px;
        font-weight: 600;
        margin-bottom: 8px;
    }
    
    .stat-desc {
      font-size: 14px;
        color: rgba(0, 0, 0, 0.45);
      }
    }
  }
  
  .chart-card, .table-card {
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    height: 100%;
    
    :deep(.ant-card-head) {
      border-bottom: 1px solid #f0f0f0;
      
      .ant-card-head-title {
        padding: 16px 0;
        font-size: 16px;
        font-weight: 600;
      }
    }
    
    :deep(.ant-card-body) {
      padding: 24px;
    }
  }
  
  .chart-container {
    height: 300px;
    width: 100%;
  }
  

}
</style> 