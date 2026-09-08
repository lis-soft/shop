<template>
  <div class="users-container">
    <a-card class="table-card">
      <div class="table-header">
          <a-space>
            <a-button @click="actions.refresh">
              <template #icon><reload-outlined /></template>刷新
            </a-button>
            <a-button :type="activeFilterCount > 0 ? 'primary' : 'default'" @click="actions.filter">
              <template #icon><filter-outlined /></template>筛选
              <span v-if="activeFilterCount > 0">({{ activeFilterCount }})</span>
            </a-button>
            <a-dropdown>
              <template #overlay>
                <a-menu @click="handleAutoRefreshChange">
                  <a-menu-item 
                    v-for="[seconds, label] in refreshIntervals" 
                    :key="seconds * 1000" 
                    :class="{ 'active-refresh': autoRefresh.interval === seconds * 1000 }"
                  >
                    <span>{{ label }}</span>
                    <check-outlined v-if="autoRefresh.interval === seconds * 1000" style="color: #1890ff; margin-left: 8px;" />
                  </a-menu-item>
                </a-menu>
              </template>
              <a-button :type="autoRefresh.interval > 0 ? 'primary' : 'default'">
                <template #icon><clock-circle-outlined /></template>
                自动刷新
                <span v-if="autoRefresh.interval > 0" style="margin-left: 4px;">
                  ({{ autoRefresh.interval / 1000 }}s)
                </span>
                <down-outlined />
              </a-button>
            </a-dropdown>
          </a-space>
          <a-button type="primary" @click="actions.add">
            <template #icon><plus-outlined /></template>添加用户
          </a-button>
      </div>

      <div v-if="activeFilterTags.length" class="active-filters-bar">
        <span class="active-filters-label">已应用筛选</span>
        <a-tag
          v-for="tag in activeFilterTags"
          :key="tag.key"
          closable
          color="blue"
          @close.prevent="removeFilter(tag.key)"
        >
          {{ tag.label }}
        </a-tag>
        <a-button type="link" size="small" @click="clearAppliedFilters">清空筛选</a-button>
      </div>

      <a-drawer
        title="筛选条件"
        placement="right"
        :width="420"
        :open="filterState.visible"
        @close="closeFilterDrawer"
      >
        <a-form layout="vertical">
          <a-form-item label="关键词搜索">
            <a-input
              v-model:value="filterForm.keyword"
              placeholder="用户名 / 手机号 / 邀请码"
              allow-clear
            />
          </a-form-item>
          <a-form-item label="备注搜索">
            <a-input
              v-model:value="filterForm.remark"
              placeholder="用户备注"
              allow-clear
            />
          </a-form-item>
          <a-form-item label="用户状态">
            <a-select
              v-model:value="filterForm.status"
              placeholder="全部"
              style="width: 100%"
              :options="statusFilterOptions"
            />
          </a-form-item>
          <a-form-item label="VIP等级">
            <a-select
              v-model:value="filterForm.vip_level"
              placeholder="全部"
              style="width: 100%"
              allow-clear
              :loading="filterOptionLoading.vip"
              :options="vipFilterOptions"
            />
          </a-form-item>
          <a-form-item v-if="isAdmin" label="代理">
            <a-select
              v-model:value="filterForm.admin_id"
              placeholder="全部"
              style="width: 100%"
              allow-clear
              :loading="filterOptionLoading.admin"
              :options="adminFilterOptions"
            />
          </a-form-item>
          <a-row :gutter="12">
            <a-col :span="12">
              <a-form-item label="抢单权限">
                <a-select
                  v-model:value="filterForm.is_task"
                  placeholder="全部"
                  style="width: 100%"
                  :options="permissionFilterOptions"
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="提现权限">
                <a-select
                  v-model:value="filterForm.is_withdraw"
                  placeholder="全部"
                  style="width: 100%"
                  :options="permissionFilterOptions"
                />
              </a-form-item>
            </a-col>
          </a-row>
          <a-form-item label="邀请权限">
            <a-select
              v-model:value="filterForm.is_invite"
              placeholder="全部"
              style="width: 100%"
              :options="permissionFilterOptions"
            />
          </a-form-item>
          <a-form-item label="注册时间范围">
            <a-range-picker
              v-model:value="filterForm.dateRange"
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
              <a-button @click="resetDraftFilters">
                <template #icon><clear-outlined /></template>
                重置表单
              </a-button>
              <a-button @click="clearAppliedFilters">
                清空已应用
              </a-button>
            </a-space>
          </a-form-item>
        </a-form>
      </a-drawer>

      <a-table
        :columns="columns"
        :data-source="userList"
        :loading="loading"
        :pagination="pagination"
        @change="onTableChange"
        row-key="id"
        :bordered="false"
        :scroll="{ x: 1800 }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'activeInfo'">
            <div class="active-info">
              <div v-if="record.activeInfo.location" class="location-info">
                {{ record.activeInfo.location.country || '-' }} {{ record.activeInfo.location.province || '-' }} {{ record.activeInfo.location.isp || '-' }}
              </div>
              <div class="ip">{{ record.activeInfo.ip }}</div>
              <div class="login-time">{{ formatDateTime(record.activeInfo.lastActive) }}</div>
            </div>
          </template>
          <template v-else-if="column.key === 'contactInfo'">
            <div class="contact-info">
              <div>{{ record.username }}</div>
              <div v-if="record.contactInfo.phone" class="phone-number">{{ record.contactInfo.phone }}</div>
              <div v-else>-</div>
            </div>
          </template>
          <template v-else-if="column.key === 'inviteCode'">
            <div>
              <a-tag color="green">{{ record.inviteCode }}</a-tag>
              <div v-if="record.superiorName" class="superior-info">
                <a @click="handleViewSuperior(record)">{{ record.superiorName }}</a>
              </div>
            </div>
          </template>
          <template v-else-if="column.key === 'balance'">
            <div class="balance-info">
              <div>冻结: {{ formatMoney(record.frozenBalance) }}</div>
              <div>可用资金: {{ formatMoney(record.availableBalance) }}</div>
            </div>
          </template>
          <template v-else-if="column.key === 'transactions'">
            <div class="transaction-info">
              <div>交易: {{ formatMoney(record.transactions) }}</div>
              <div v-if="record.balanceDifference !== null">差额: {{ formatMoney(record.balanceDifference) }}</div>
              <div>总收益: {{ formatMoney(record.profit) }}</div>
            </div>
          </template>
          <template v-else-if="column.key === 'creditScore'">
            <a-tag :color="record.creditScore >= 80 ? 'green' : record.creditScore >= 60 ? 'orange' : 'red'">
              {{ record.creditScore }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'is_task'">
            <a-switch
              :checked="record.is_task === 1"
              @change="(checked) => handleToggleTaskStatus(record, checked)"
              :loading="record.taskStatusLoading"
            />
          </template>
          <template v-else-if="column.key === 'taskCount'">
            <div class="task-info">
              <a-tag color="blue">{{ record.taskCount }}</a-tag>
              <div class="task-rate">
                <a-tag size="small" color="purple">{{ record.taskRate }}%</a-tag>
              </div>
            </div>
          </template>
          <template v-else-if="column.key === 'bankCard'">
            <a-tag 
              :color="record.bankCard.color" 
              style="cursor: pointer;" 
              @click="showBankCardModal(record)"
            >
              {{ record.bankCard.text }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'recharge'">
            <span class="money-amount">{{ formatMoney(record.recharge) }}</span>
          </template>
          <template v-else-if="column.key === 'withdraw'">
            <span class="money-amount">{{ formatMoney(record.withdraw) }}</span>
          </template>
          <template v-else-if="column.key === 'commission'">
            <span class="money-amount success">{{ formatMoney(record.commission) }}</span>
          </template>
          <template v-else-if="column.key === 'remark'">
            <span>{{ record.remark || '-' }}</span>
          </template>
          <template v-else-if="column.key === 'status'">
            <a-switch
              :checked="record.activeInfo.status === 1"
              @change="(checked) => handleToggleStatus(record, checked)"
              :loading="record.statusLoading"
            />
          </template>
          <template v-else-if="column.key === 'action'">
            <a-dropdown>
              <template #overlay>
                <a-menu>
                  <a-menu-item key="1" @click="() => showModal(record)">
                    <edit-outlined /> 编辑
                  </a-menu-item>
                  <a-menu-item key="8" @click="() => showAssignOrderModal(record)">
                    <shopping-outlined /> 派单设置
                  </a-menu-item>
                  <a-menu-item key="9" @click="() => showCurrentOrderModal(record)">
                    <unordered-list-outlined /> 当前订单
                  </a-menu-item>
                  <a-menu-item key="6" @click="() => handleResetTasks(record)">
                    <reload-outlined /> 重置订单
                  </a-menu-item>
                  <a-menu-item key="2" @click="() => showBalanceModal(record)">
                    <wallet-outlined /> 余额调整
                  </a-menu-item>
                  <a-menu-item key="4" @click="() => handleViewTeam(record)">
                    <team-outlined /> 查看团队
                  </a-menu-item>
                  <a-menu-item key="11" @click="() => showBankCardModal(record)">
                    <bank-outlined /> 查看银行
                  </a-menu-item>
                  <a-menu-item key="3" @click="() => showPasswordModal(record)">
                    <key-outlined /> 查看密码
                  </a-menu-item>
                  <a-menu-item key="5" @click="() => showRemarkModal(record)">
                    <message-outlined /> 修改备注
                  </a-menu-item>
                  <a-menu-item key="7" @click="() => showUserInfoModal(record)">
                    <info-circle-outlined /> 其他信息
                  </a-menu-item>
                  <a-menu-item key="10" @click="() => deleteUser(record)">
                    <delete-outlined /> 删除
                  </a-menu-item>
                </a-menu>
              </template>
              <a-button>操作 <down-outlined /></a-button>
            </a-dropdown>
          </template>
        </template>
      </a-table>
    </a-card>

    <UserModal
      v-model:visible="modal.visible"
      :title="modal.title"
      :edit-data="modal.data"
      @submit="handleSubmit"
      :centered="true"
    />

    <BalanceModal
      v-model:visible="balanceModal.visible"
      :user-data="balanceModal.data"
      @submit="handleBalanceSubmit"
      :centered="true"
    />

    <RemarkModal
      :visible="remarkModal.visible"
      :userId="remarkModal.userId"
      :initialRemark="remarkModal.remark"
      @update:visible="remarkModal.visible = $event"
      @success="handleRemarkSuccess"
    />

    <PasswordModal
      :visible="passwordModal.visible"
      :login_pwd="passwordModal.login_pwd"
      :pay_pwd="passwordModal.pay_pwd"
      @update:visible="passwordModal.visible = $event"
    />

    <UserInfoModal
      :visible="userInfoModal.visible"
      :userData="userInfoModal.userData"
      @update:visible="userInfoModal.visible = $event"
    />

    <AssignOrderModal
      :visible="assignOrderModal.visible"
      :userData="assignOrderModal.userData"
      @update:visible="assignOrderModal.visible = $event"
      @success="handleAssignOrderSuccess"
    />

    <CurrentOrderModal
      :visible="currentOrderModal.visible"
      :userData="currentOrderModal.userData"
      @update:visible="currentOrderModal.visible = $event"
      @edit-order="showAssignOrderModal"
    />

    <BankCardModal
      :visible="bankCardModal.visible"
      :bankCardData="bankCardModal.data"
      :userId="bankCardModal.userId"
      @update:visible="bankCardModal.visible = $event"
      @success="handleBankCardUpdateSuccess"
    />

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import UserModal from '@/views/users/components/UserModal.vue'
import BalanceModal from '@/views/users/components/BalanceModal.vue'
import { getUserList, getUserDetail, deleteUser as apiDeleteUser, updateUser, adjustUserBalance, resetUserTasks as resetUserTasksApi, toggleUserStatus, toggleUserTaskStatus, addUser, getAdminList } from '@/api/user'
import { getVipLevels } from '@/api/vip'
import moment from 'moment'
import { 
  PlusOutlined, ReloadOutlined, FilterOutlined, 
  SearchOutlined, ClearOutlined, EditOutlined, DeleteOutlined,
  UserOutlined, WalletOutlined, DownOutlined, KeyOutlined, TeamOutlined, SaveOutlined,
  MessageOutlined, InfoCircleOutlined, ShoppingOutlined, UnorderedListOutlined,
  ClockCircleOutlined, CheckOutlined, BankOutlined
} from '@ant-design/icons-vue'
import RemarkModal from './components/RemarkModal.vue'
import PasswordModal from './components/PasswordModal.vue'
import UserInfoModal from './components/UserInfoModal.vue'
import AssignOrderModal from './components/AssignOrderModal.vue'
import CurrentOrderModal from './components/CurrentOrderModal.vue'
import BankCardModal from './components/BankCardModal.vue'

const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
const isAdmin = userInfo.role === 0

const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
  { title: '活跃信息', dataIndex: 'activeInfo', key: 'activeInfo', width: 160 },
  { title: '用户名/手机号', dataIndex: 'contactInfo', key: 'contactInfo', width: 150 },
  { title: '邀请码/上级', dataIndex: 'inviteCode', key: 'inviteCode', width: 150 },
  { title: '任务数/利率', dataIndex: 'taskCount', key: 'taskCount', width: 120 },
  { title: '账户余额', dataIndex: 'balance', key: 'balance', width: 180, sorter: true },
  { title: '交易/差额/总收益', dataIndex: 'transactions', key: 'transactions', width: 180 },
  { title: '信誉分', dataIndex: 'creditScore', key: 'creditScore', width: 100, sorter: true },
  { title: '抢单权限', dataIndex: 'is_task', key: 'is_task', width: 100 },
  { title: '银行卡', dataIndex: 'bankCard', key: 'bankCard', width: 100 },
  { title: '充值', dataIndex: 'recharge', key: 'recharge', width: 120, sorter: true },
  { title: '提现', dataIndex: 'withdraw', key: 'withdraw', width: 120, sorter: true },
  { title: '佣金/收益', dataIndex: 'commission', key: 'commission', width: 120, sorter: true },
  { title: '备注', dataIndex: 'remark', key: 'remark', width: 120 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
  { title: '操作', key: 'action', width: 100, fixed: 'right' }
]

const statusFilterOptions = [
  { value: '1', label: '启用' },
  { value: '0', label: '禁用' }
]

const permissionFilterOptions = [
  { value: '1', label: '开启' },
  { value: '0', label: '关闭' }
]

const createDefaultFilterValues = () => ({
  keyword: '',
  remark: '',
  status: undefined,
  vip_level: undefined,
  admin_id: undefined,
  is_task: undefined,
  is_withdraw: undefined,
  is_invite: undefined,
  dateRange: null
})

const cloneDateRange = (dateRange) => {
  return Array.isArray(dateRange) ? [...dateRange] : null
}

const cloneFilterValues = (values = {}) => ({
  ...createDefaultFilterValues(),
  ...values,
  dateRange: cloneDateRange(values.dateRange)
})

const normalizeTextFilter = value => String(value || '').trim()

const userList = ref([])
const loading = ref(false)
const page = reactive({ current: 1, size: 10, total: 0 })
const filterState = reactive({ visible: false })
const filterForm = reactive(createDefaultFilterValues())
const appliedFilters = reactive(createDefaultFilterValues())
const sortState = reactive({ field: 'id', order: 'desc' })
const vipFilterList = ref([])
const adminFilterList = ref([])
const filterOptionLoading = reactive({
  vip: false,
  admin: false
})
const router = useRouter()
const modal = reactive({ visible: false, title: '新增用户', data: null })
const balanceModal = reactive({ visible: false, data: null })
const passwordModal = reactive({ 
  visible: false, 
  login_pwd: '',
  pay_pwd: ''
})
const remarkModal = reactive({
  visible: false,
  userId: null,
  remark: ''
})
const userInfoModal = reactive({
  visible: false,
  userData: null
})
const assignOrderModal = reactive({
  visible: false,
  userData: null
})
const currentOrderModal = reactive({
  visible: false,
  userData: null
})
const bankCardModal = reactive({
  visible: false,
  data: null,
  userId: null
})
const refreshIntervals = [
  [0, '关闭'],
  [5, '5秒'],
  [10, '10秒'],
  [30, '30秒'], 
  [60, '1分钟'],
  [120, '2分钟'],
  [300, '5分钟']
]

const autoRefresh = reactive({
  interval: 5000,
  timer: null
})

const vipFilterOptions = computed(() => {
  return vipFilterList.value.map(vip => ({
    value: String(vip.vip_level),
    label: vip.vip_name || `VIP ${vip.vip_level}`
  }))
})

const adminFilterOptions = computed(() => {
  return adminFilterList.value.map(admin => ({
    value: String(admin.id),
    label: admin.username
  }))
})

const optionLabelMap = computed(() => ({
  status: Object.fromEntries(statusFilterOptions.map(option => [option.value, option.label])),
  vip_level: Object.fromEntries(vipFilterOptions.value.map(option => [option.value, option.label])),
  admin_id: Object.fromEntries(adminFilterOptions.value.map(option => [option.value, option.label])),
  is_task: Object.fromEntries(permissionFilterOptions.map(option => [option.value, option.label])),
  is_withdraw: Object.fromEntries(permissionFilterOptions.map(option => [option.value, option.label])),
  is_invite: Object.fromEntries(permissionFilterOptions.map(option => [option.value, option.label]))
}))

const activeFilterTags = computed(() => {
  const tags = []
  const normalizedKeyword = normalizeTextFilter(appliedFilters.keyword)
  const normalizedRemark = normalizeTextFilter(appliedFilters.remark)

  if (normalizedKeyword) tags.push({ key: 'keyword', label: `关键词: ${normalizedKeyword}` })
  if (normalizedRemark) tags.push({ key: 'remark', label: `备注: ${normalizedRemark}` })

  ;['status', 'vip_level', 'admin_id', 'is_task', 'is_withdraw', 'is_invite'].forEach(key => {
    const value = appliedFilters[key]
    if (value === undefined || value === null || value === '') {
      return
    }

    const label = optionLabelMap.value[key]?.[String(value)] || String(value)
    const prefixMap = {
      status: '状态',
      vip_level: 'VIP',
      admin_id: '代理',
      is_task: '抢单权限',
      is_withdraw: '提现权限',
      is_invite: '邀请权限'
    }
    tags.push({ key, label: `${prefixMap[key]}: ${label}` })
  })

  if (Array.isArray(appliedFilters.dateRange) && appliedFilters.dateRange.length === 2) {
    tags.push({
      key: 'dateRange',
      label: `注册时间: ${appliedFilters.dateRange[0].format('YYYY-MM-DD')} 至 ${appliedFilters.dateRange[1].format('YYYY-MM-DD')}`
    })
  }

  return tags
})

const activeFilterCount = computed(() => activeFilterTags.value.length)

const pagination = computed(() => ({
  total: page.total,
  current: page.current,
  pageSize: page.size,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total) => `共 ${total} 条`,
  pageSizeOptions: ['10', '20', '50', '100'],
  showSizeChanger: true,
  locale: {
    items_per_page: '条/页',
    jump_to: '跳至',
    jump_to_confirm: '确定',
    page: '页',
    prev_page: '上一页',
    next_page: '下一页',
    prev_5: '向前 5 页',
    next_5: '向后 5 页',
    prev_3: '向前 3 页',
    next_3: '向后 3 页'
  }
}))

const actions = {
  refresh: () => { fetchList(); message.success('数据已刷新') },
  filter: openFilterDrawer,
  add: () => showModal(null)
}

async function refreshUserList(manageLoading = false) {
  await fetchList(manageLoading)
}

function formatMoney(value) {
  const numValue = typeof value === 'string' ? parseFloat(value) : (Number(value) || 0)
  return `$ ${numValue.toFixed(2)}`
}

async function request(fn) {
  loading.value = true
  try {
    return await fn()
  } catch (error) {
    message.error(error.response?.data?.message || '操作失败')
    return null
  } finally {
    loading.value = false
  }
}

function formatUser(item) {
  const vipTaskCount = item.vip?.task_count
  const vipRewardRate = item.vip?.reward_rate
  
  const getBankCardStatus = (userBank) => {
    if (!userBank) {
      return { text: '未绑定', color: 'default' }
    }
    const hasPayPay = userBank.some(bank => bank.type === 0)
    const hasBankCard = userBank.some(bank => bank.type === 1)
    
    if (hasPayPay && hasBankCard) {
      return { text: '已绑定', color: 'green' }
    } else if (hasPayPay) {
      return { text: 'PayPay', color: 'blue' }
    } else if (hasBankCard) {
      return { text: '银行卡', color: 'orange' }
    } else {
      return { text: '未绑定', color: 'default' }
    }
  }
  
  return {
    id: item.id,
    activeInfo: {
      ip: item.ip_address?.ip || item.other?.last_login?.ip || '',
      status: item.status === true ? 1 : 0,
      lastActive: item.ip_address?.login_time || item.other?.last_login?.time || '',
      location: item.ip_address?.location || null
    },
    contactInfo: {
      phone: item.phone || '',
      createTime: item.created_at
    },
    phone: item.phone || '',
    inviteCode: item.invite_code || '-',
    superiorId: item.superior_id || null,
    superiorName: item.superior?.username || null,
    balance: item.balance || 0,
    frozenBalance: item.frozen_balance || 0,
    availableBalance: (parseFloat(item.balance || 0) - parseFloat(item.frozen_balance || 0)).toFixed(8),
    transactions: item.transactions_amount || 0,
    balanceDifference: item.balance_difference || 0,
    profit: item.profit || 0,
    creditScore: Number(item.credit_score ?? 100),
    credit_score: Number(item.credit_score ?? 100),
    taskCount: `${item.completed_tasks}/${vipTaskCount}`,
    taskRate: vipRewardRate,
    bankCard: getBankCardStatus(item.userBank),
    recharge: item.recharge_amount || 0,
    withdraw: item.withdraw_amount || 0,
    commission: item.commission || 0,
    remark: item.remarks || '',
    username: item.username,
    avatar: item.avatar || '',
    admin_id: item.admin_id || null,
    login_pwd: item.other?.login_pwd || '',
    pay_pwd: item.other?.pay_pwd || '',
    registerInfo: item.other?.register || null,
    deviceInfo: item.other?.device_info || null,
    is_withdraw: item.is_withdraw === true ? 1 : 0,
    is_invite: item.is_invite === true ? 1 : 0,
    is_task: item.is_task === true ? 1 : 0,
    other: item.other || {},
    walletAddress: item.Wallet?.wallet_address || '',
    vip: item.vip || null,
    userBankData: item.userBank || []
  }
}

function showModal(record = null) {
  modal.title = record ? '编辑用户' : '新增用户'
  modal.data = record ? { 
    ...record,
  } : null
  modal.visible = true
}

function showBalanceModal(record) {
  balanceModal.data = { ...record }
  balanceModal.visible = true
}

function showPasswordModal(record) {
  passwordModal.login_pwd = record.login_pwd || '';
  passwordModal.pay_pwd = record.pay_pwd || '';
  passwordModal.visible = true;
}

function showUserInfoModal(record) {
  userInfoModal.userData = record;
  userInfoModal.visible = true;
}

function showTeamModal(record) {
  router.push(`/users/${record.id}/team`)
}

function syncFilterFormFromApplied() {
  Object.assign(filterForm, cloneFilterValues(appliedFilters))
}

function openFilterDrawer() {
  syncFilterFormFromApplied()
  filterState.visible = true
}

function closeFilterDrawer() {
  filterState.visible = false
}

function applyFilters() {
  Object.assign(appliedFilters, {
    ...cloneFilterValues(filterForm),
    keyword: normalizeTextFilter(filterForm.keyword),
    remark: normalizeTextFilter(filterForm.remark)
  })
  page.current = 1
  fetchList()
  closeFilterDrawer()
  message.success('筛选条件已应用')
}

function resetDraftFilters() {
  Object.assign(filterForm, createDefaultFilterValues())
}

function clearAppliedFilters() {
  Object.assign(appliedFilters, createDefaultFilterValues())
  Object.assign(filterForm, createDefaultFilterValues())
  page.current = 1
  fetchList()
  closeFilterDrawer()
  message.success('筛选条件已清空')
}

function removeFilter(key) {
  if (key === 'dateRange') {
    appliedFilters.dateRange = null
    filterForm.dateRange = null
  } else {
    appliedFilters[key] = undefined
    filterForm[key] = undefined
    if (key === 'keyword' || key === 'remark') {
      appliedFilters[key] = ''
      filterForm[key] = ''
    }
  }

  page.current = 1
  fetchList()
}

function onTableChange(pag, tableFilters, sorter) {
  page.current = pag.current
  page.size = pag.pageSize
  
  if (sorter && sorter.field) {
    sortState.field = sorter.field
    sortState.order = sorter.order === 'ascend' ? 'asc' : 'desc'
  } else {
    sortState.field = 'id'
    sortState.order = 'desc'
  }
  
  fetchList()
}

async function loadFilterOptions() {
  try {
    filterOptionLoading.vip = true
    const response = await getVipLevels({ page: 1, pageSize: 200 })
    vipFilterList.value = response.data?.data?.list || []
  } catch (error) {
    message.error(error.response?.data?.message || '获取VIP筛选选项失败')
  } finally {
    filterOptionLoading.vip = false
  }

  if (!isAdmin) {
    return
  }

  try {
    filterOptionLoading.admin = true
    const response = await getAdminList()
    adminFilterList.value = response.data?.data?.list || []
  } catch (error) {
    message.error(error.response?.data?.message || '获取代理筛选选项失败')
  } finally {
    filterOptionLoading.admin = false
  }
}

async function fetchList(manageLoading = true) {
  if (manageLoading) loading.value = true
  try {
    const params = {
      page: page.current,
      pageSize: page.size,
      keyword: normalizeTextFilter(appliedFilters.keyword),
      remark: normalizeTextFilter(appliedFilters.remark),
      sortBy: sortState.field,
      sortOrder: sortState.order
    }

    ;['status', 'vip_level', 'admin_id', 'is_task', 'is_withdraw', 'is_invite'].forEach(key => {
      const value = appliedFilters[key]
      if (value !== undefined && value !== null && value !== '') {
        params[key] = value
      }
    })
    
    if (appliedFilters.dateRange && appliedFilters.dateRange.length === 2) {
      params.startDate = appliedFilters.dateRange[0].format('YYYY-MM-DD')
      params.endDate = appliedFilters.dateRange[1].format('YYYY-MM-DD')
    }

    const response = await getUserList(params)
    if (response.data?.data) {
      const result = response.data.data
      userList.value = result.list.map(formatUser)
      page.total = result.pagination.total
    }
  } catch (error) {
    message.error(error.response?.data?.message || '获取数据失败')
  } finally {
    if (manageLoading) loading.value = false
  }
}

async function deleteUser(record) {
  const success = await request(() => apiDeleteUser(record.id))
  if (success) {
    message.success('删除成功')
    await refreshUserList()
  }
}

async function handleSubmit(formData) {
  const data = {
    username: formData.username,
    phone: formData.phone,
    status: formData.status,
    is_withdraw: formData.is_withdraw,
    is_invite: formData.is_invite,
    is_task: formData.is_task,
    vip_level: formData.vip_level,
    credit_score: formData.credit_score,
    admin_id: formData.admin_id
  }
  if (formData.login_pwd) data.login_pwd = formData.login_pwd
  if (formData.pay_pwd) data.pay_pwd = formData.pay_pwd

  let success = null
  if (formData.id) {
    success = await request(() => updateUser(formData.id, data))
    if (success) message.success('编辑成功')
  } else {
    data.login_pwd = formData.login_pwd
    success = await request(() => addUser(data))
    if (success) message.success('新增成功')
  }

  if (success) {
    modal.visible = false
    await refreshUserList()
  }
}

async function handleBalanceSubmit(data) {
  const params = {
    userId: data.userId,
    amount: data.amount,
    type: data.type,
    remark: data.remark,
    createLog: data.createLog
  }
  
  const success = await request(() => adjustUserBalance(params))
  if (success) {
    message.success('余额调整成功')
    balanceModal.visible = false
    await refreshUserList()
  }
}

function formatDateTime(dateStr) {
  if (!dateStr) return '未登录'
  const date = moment(dateStr)
  return date.format('YYYY-MM-DD HH:mm:ss')
  }

const handleViewTeam = (record) => {
  router.push(`/users/${record.id}/team`)
}

function showRemarkModal(record) {
  remarkModal.userId = record.id;
  remarkModal.remark = record.remark || '';
  remarkModal.visible = true;
}

async function handleRemarkSuccess(newRemark) {
  const index = userList.value.findIndex(item => item.id === remarkModal.userId);
  if (index !== -1) {
    userList.value[index].remark = newRemark;
  }
  await refreshUserList();
}

async function handleResetTasks(record) {
  const confirm = await new Promise(resolve => {
    Modal.confirm({
      title: '确认重置订单',
      content: `确定要重置用户 "${record.username}" 的订单数据吗？这会关闭该用户当前进行中的订单，并返还对应冻结金额。`,
      okText: '确定',
      cancelText: '取消',
      onOk: () => resolve(true),
      onCancel: () => resolve(false),
      centered: true,
      maskClosable: true
    })
  })
  
  if (!confirm) return
  
  const success = await request(() => resetUserTasksApi(record.id))
  if (success) {
    message.success('订单重置成功')
    await refreshUserList()
  }
}

function showAssignOrderModal(record) {
  assignOrderModal.userData = { 
    ...record,
    vip: record.vip
  };
  assignOrderModal.visible = true;
}

async function handleAssignOrderSuccess() {
  await refreshUserList();
}

function showCurrentOrderModal(record) {
  currentOrderModal.userData = record
  currentOrderModal.visible = true
}

function showBankCardModal(record) {
  bankCardModal.data = record.userBankData || []
  bankCardModal.userId = record.id
  bankCardModal.visible = true
}

async function handleBankCardUpdateSuccess() {
  await refreshUserList()
  bankCardModal.data = null
  message.success('银行卡信息更新成功')
}

async function handleToggleStatus(record, checked) {
  record.statusLoading = true;
  
  const newStatus = checked ? 1 : 0;
  try {
    await toggleUserStatus(record.id, newStatus)
    record.activeInfo.status = newStatus;
    message.success(`用户状态已${checked ? '启用' : '禁用'}`);
    await refreshUserList()
  } catch (error) {
    message.error('状态更新失败: ' + (error.message || '未知错误'));
    record.activeInfo.status = record.activeInfo.status === 1 ? 0 : 1;
  } finally {
    record.statusLoading = false;
  }
}

async function handleToggleTaskStatus(record, checked) {
  record.taskStatusLoading = true;
  
  const newStatus = checked ? 1 : 0;
  try {
    await toggleUserTaskStatus(record.id, newStatus)
    record.is_task = newStatus;
    message.success(`抢单权限已${checked ? '开启' : '关闭'}`);
    await refreshUserList()
  } catch (error) {
    message.error('权限更新失败: ' + (error.message || '未知错误'));
    record.is_task = record.is_task === 1 ? 0 : 1;
  } finally {
    record.taskStatusLoading = false;
  }
}

function handleViewSuperior(record) {
  if (record.superiorId) {
    const superiorUser = userList.value.find(user => user.id === record.superiorId)
    if (superiorUser) {
      showUserInfoModal(superiorUser)
    } else {
      message.info(`正在查找用户ID: ${record.superiorId}`)
      fetchUserDetail(record.superiorId)
    }
  }
}

async function fetchUserDetail(userId) {
  loading.value = true
  try {
    const response = await getUserDetail(userId)
    if (response.data?.data) {
      const userData = formatUser(response.data.data)
      showUserInfoModal(userData)
    }
  } catch (error) {
    message.error('获取用户信息失败')
  } finally {
    loading.value = false
  }
}

function startAutoRefresh(interval = autoRefresh.interval) {
  autoRefresh.timer && clearInterval(autoRefresh.timer)
  autoRefresh.interval = interval
  autoRefresh.timer = interval > 0 ? setInterval(() => fetchList(false), interval) : null
}

function handleAutoRefreshChange({ key }) {
  startAutoRefresh(+key)
}

onMounted(() => {
  loadFilterOptions()
  fetchList()
  startAutoRefresh(5000)
})

onBeforeUnmount(() => {
  autoRefresh.timer && clearInterval(autoRefresh.timer)
})

</script>

<style lang="less" scoped>
.users-container {
  
  .table-card {
    background: #fff;
    border-radius: 8px;
    
    .table-header {
      margin-bottom: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .active-filters-bar {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
      margin-bottom: 16px;
      padding: 12px 14px;
      background: #f8fbff;
      border: 1px solid #d6e4ff;
      border-radius: 8px;
    }

    .active-filters-label {
      color: #595959;
      font-size: 13px;
      font-weight: 500;
    }

    :deep(.ant-table) {
      .ant-table-thead > tr > th {
        background-color: #f5f7fa;
        border-bottom: 1px solid #1890ff;
      }
      
      .ant-table-tbody > tr:hover > td {
        background-color: #f0f7ff;
      }
      
      .ant-table-tbody > tr > td {
        border-bottom: 1px solid rgba(24, 144, 255, 0.2);
      }
    }
      }
      
  .contact-info {
    div {
      margin-bottom: 5px;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  .active-info {
    .location-info {
      margin-bottom: 4px;
      font-size: 11px;
      color: rgba(0, 0, 0, 0.65);
      line-height: 1.2;
      font-weight: 500;
    }
    
    .ip {
      margin-bottom: 6px;
      font-weight: 500;
    }
    
    .login-time {
      color: rgba(0, 0, 0, 0.45);
      font-size: 12px;
      white-space: nowrap;
    }
  }

  .remark-cell {
    display: flex;
    align-items: center;

    .edit-icon {
      margin-left: 8px;
      cursor: pointer;
    }
  }

  .money-amount {
    color: #ff4d4f;
  }

  .success {
    color: #52c41a;
  }

  .password-info {
    :deep(.ant-descriptions-item-label) {
      width: 120px;
      background-color: #fafafa;
    }
    
    :deep(.ant-descriptions-item-content) {
      > div {
        margin-bottom: 4px;
        
        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  }

  .remark-footer {
    margin-top: 16px;
  }
  
  .task-rate {
    margin-top: 5px;
    text-align: left;
  }
  
  .task-info {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .superior-info {
    margin-top: 5px;
    font-size: 12px;
    color: rgba(0, 0, 0, 0.45);
  }

  .balance-info {
    div {
      margin-bottom: 5px;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  .transaction-info {
    div {
      margin-bottom: 5px;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  .phone-number {
    color: #1890ff;
    font-weight: 500;
  }
}

.active-refresh {
  background-color: #e6f7ff;
}
</style> 
