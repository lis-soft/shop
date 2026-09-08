<template>
  <a-layout class="layout-container">
    <a-layout-sider
      v-model:collapsed="collapsed"
      :trigger="null"
      collapsible
      class="layout-sider"
      :breakpoint="'lg'"
      @breakpoint="onBreakpoint"
    >
      <div class="logo">
        <h1 v-show="!collapsed">{{ title }}</h1>
        <h1 v-show="collapsed">{{ title.charAt(0) }}</h1>
      </div>
      <a-menu
        v-model:selectedKeys="selectedKeys"
        v-model:openKeys="openKeys"
        theme="dark"
        mode="inline"
        class="side-menu"
      >
        <template v-for="menu in menuList" :key="`menu-${menu.id}`">
          <!-- 菜单目录 -->
          <a-sub-menu v-if="menu.type === 'menu_dir'" :key="menu.key">
            <template #icon>
              <component :is="getIconComponent(menu.icon)" />
            </template>
            <template #title>{{ menu.title }}</template>
            
            <a-menu-item 
              v-for="child in menu.children" 
              :key="child.key" 
              @click="() => navigateTo(child.path.substring(1))"
            >
              <template #icon>
                <component :is="getIconComponent(child.icon)" />
              </template>
              <span>{{ child.title }}</span>
            </a-menu-item>
          </a-sub-menu>
          
          <!-- 单独菜单项 -->
          <a-menu-item 
            v-else-if="menu.type === 'menu'" 
            :key="menu.key" 
            @click="() => navigateTo(menu.path.substring(1))"
          >
            <template #icon>
              <component :is="getIconComponent(menu.icon)" />
            </template>
            <span>{{ menu.title }}</span>
          </a-menu-item>
        </template>
      </a-menu>
    </a-layout-sider>
    
    <a-layout :style="mainContainerStyle">
      <a-layout-header class="layout-header" :style="headerStyle">
        <div class="header-left">
          <menu-unfold-outlined
            v-if="collapsed"
            class="trigger"
            @click="() => (collapsed = !collapsed)"
          />
          <menu-fold-outlined
            v-else
            class="trigger"
            @click="() => (collapsed = !collapsed)"
          />
          <breadcrumb class="breadcrumb" />
        </div>
        
        <div class="header-right">
          <a-space>
            <a-tooltip title="待处理提现">
              <a-badge :count="pendingWithdraws" :offset="[-3,3]" size="small">
                <a-button type="text" shape="circle" @click="goToWithdraws">
                  <template #icon>
                    <wallet-outlined />
                  </template>
                </a-button>
              </a-badge>
            </a-tooltip>
            <a-tooltip title="全屏">
              <a-button type="text" shape="circle" @click="toggleFullScreen">
                <template #icon>
                  <fullscreen-outlined v-if="!isFullScreen" />
                  <fullscreen-exit-outlined v-else />
                </template>
              </a-button>
            </a-tooltip>
            <a-dropdown>
              <div class="user-info">
                <a-avatar class="avatar" :src="userInfo.avatar" v-if="userInfo.avatar">
                </a-avatar>
                <a-avatar class="avatar" v-else>
                  <template #icon><user-outlined /></template>
                </a-avatar>
                <span class="username" v-if="!isMobile">{{ userInfo.username }}</span>
              </div>
              <template #overlay>
                <a-menu>
                  <a-menu-item key="1" @click="showUserProfile">
                    <template #icon><user-outlined /></template>
                    个人中心
                  </a-menu-item>
                  <a-menu-item key="2">
                    <template #icon><setting-outlined /></template>
                    系统设置
                  </a-menu-item>
                  <a-menu-divider />
                  <a-menu-item key="3" @click="logout">
                    <template #icon><logout-outlined /></template>
                    退出登录
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </a-space>
        </div>
      </a-layout-header>
      
      <a-layout-content class="layout-content">
        <router-view v-slot="{ Component }">
          <component :is="Component" />
        </router-view>
      </a-layout-content>
    </a-layout>
    
    <user-profile-modal 
      v-model:visible="profileVisible" 
      @avatar-updated="handleAvatarUpdated" 
      @profile-updated="fetchUserInfo"
    />
  </a-layout>
</template>

<script setup>
import { ref, watch, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { getUserInfo, getUserMenus } from '@/api/admin'
import { getDashboardStats } from '@/api/dashboard'
import UserProfileModal from './components/UserProfileModal.vue'
import Breadcrumb from './components/Breadcrumb.vue'

import {
  DashboardOutlined,
  UserOutlined,
  SettingOutlined,
  TeamOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  LogoutOutlined,
  WalletOutlined,
  TransactionOutlined,
  ShoppingOutlined,
  HistoryOutlined,
  MessageOutlined,
  UnorderedListOutlined,
  MoneyCollectOutlined,
  AccountBookOutlined,
  BankOutlined,
  ShoppingCartOutlined,
  BarChartOutlined,
  ToolOutlined,
  CrownOutlined,
  StarOutlined
} from '@ant-design/icons-vue'

const route = useRoute()
const router = useRouter()
const collapsed = ref(false)
const isFullScreen = ref(false)
const profileVisible = ref(false)

const selectedKeys = ref([])
const openKeys = ref([])
const userInfo = ref({})
const menuList = ref([])
const pendingWithdraws = ref(0)
const title = import.meta.env.VITE_APP_TITLE
const isMobile = computed(() => window.innerWidth < 768)

const siderWidth = computed(() => (collapsed.value ? 80 : 200))
const mainContainerStyle = computed(() => ({
  paddingLeft: `${siderWidth.value}px`,
  transition: 'padding-left 0.2s'
}))
const headerStyle = computed(() => ({
  left: `${siderWidth.value}px`,
  transition: 'left 0.2s'
}))

const updateMenu = (path) => {
  if (!menuList.value.length) return
  
  const [, group = 'dashboard', child] = path.split('/')
  
  let selectedKey = null
  let openKey = null
  
  for (const menu of menuList.value) {
    if (menu.type === 'menu' && menu.path === path) {
      selectedKey = menu.key
      break
    }
    
    if (menu.type === 'menu_dir' && menu.children) {
      for (const childMenu of menu.children) {
        if (childMenu.path === path) {
          selectedKey = childMenu.key
          openKey = menu.key
          break
        }
      }
      if (selectedKey) break
    }
  }
  
  selectedKeys.value = selectedKey ? [selectedKey] : []
  openKeys.value = openKey ? [openKey] : []
}

watch(() => route.path, updateMenu, { immediate: true })

onMounted(() => {
  document.addEventListener('fullscreenchange', () => {
    isFullScreen.value = !!document.fullscreenElement
  })
  fetchUserInfo()
  fetchUserMenus()
  fetchPendingWithdraws()
  
  const interval = setInterval(fetchPendingWithdraws, 2000)
  onUnmounted(() => {
    clearInterval(interval)
  })
})

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', () => {})
})

const fetchUserInfo = async () => {
  try {
    const { data } = await getUserInfo()
    if (data.data) {
      userInfo.value = data.data
      localStorage.setItem('userInfo', JSON.stringify(data.data))
    }
  } catch (error) {
    console.error('获取用户信息失败', error)
  }
}

const fetchUserMenus = async () => {
  try {
    const { data } = await getUserMenus()
    if (data.data) {
      menuList.value = data.data
      // 菜单加载完成后更新选中状态
      updateMenu(route.path)
    }
  } catch (error) {
    console.error('获取用户菜单失败', error)
  }
}

const fetchPendingWithdraws = async () => {
  try {
    const { data } = await getDashboardStats()
    if (data.data && data.data.stats) {
      pendingWithdraws.value = data.data.stats.pendingWithdraws || 0
    }
  } catch (error) {
    console.error('获取待处理提现数据失败', error)
  }
}

// 图标映射
const iconMap = {
  'dashboard-outlined': DashboardOutlined,
  'setting-outlined': SettingOutlined,
  'team-outlined': TeamOutlined,
  'history-outlined': HistoryOutlined,
  'user-outlined': UserOutlined,
  'shopping-outlined': ShoppingOutlined,
  'unordered-list-outlined': UnorderedListOutlined,
  'shopping-cart-outlined': ShoppingCartOutlined,
  'crown-outlined': CrownOutlined,
  'star-outlined': StarOutlined,
  'transaction-outlined': TransactionOutlined,
  'money-collect-outlined': MoneyCollectOutlined,
  'account-book-outlined': AccountBookOutlined,
  'tool-outlined': ToolOutlined
}

// 获取图标组件
const getIconComponent = (iconName) => {
  return iconMap[iconName] || SettingOutlined
}

const toggleFullScreen = () => {
  const el = document.documentElement
  if (!document.fullscreenElement) {
    el.requestFullscreen().then(() => (isFullScreen.value = true))
  } else {
    document.exitFullscreen().then(() => (isFullScreen.value = false))
  }
}

const onBreakpoint = (broken) => {
  collapsed.value = broken
  if (broken) openKeys.value = []
}

const navigateTo = (path) => router.push(`/${path}`)
const showUserProfile = () => (profileVisible.value = true)
const goToWithdraws = () => router.push('/finance/withdraws')
const logout = () => {
  localStorage.clear()
  router.push('/login')
  message.success('已退出登录')
}
const handleAvatarUpdated = (avatar) => {
  userInfo.value.avatar = avatar
  fetchUserInfo()
}

</script>


<style lang="less" scoped>
.layout-container {
  min-height: 100vh;
  
  .layout-sider {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    z-index: 100;
    box-shadow: 2px 0 8px 0 rgba(29, 35, 41, 0.05);
    
    .logo {
      height: 64px;
      padding: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #001529;
      overflow: hidden;
      
      h1 {
        margin: 0;
        color: white;
        font-weight: 600;
        font-size: 18px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }

    .side-menu {
      :deep(.ant-menu-item) {
        margin: 4px 0;
        
        &.ant-menu-item-selected {
          background-color: #1890ff;
        }
      }
      
      :deep(.ant-menu-submenu) {
        .ant-menu-submenu-title {
          margin: 4px 0;
        }
      }
    }

    @media (max-width: 992px) {
      position: absolute;
    }
  }
  
  .layout-header {
    position: fixed;
    top: 0;
    right: 0;
    z-index: 99;
    background: #fff;
    padding: 0 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
    height: 64px;
    
    @media (max-width: 992px) {
      left: 0 !important;
      padding-left: 80px;
    }
    
    .header-left {
      display: flex;
      align-items: center;
      
      .trigger {
        padding: 0 12px;
        font-size: 18px;
        cursor: pointer;
        transition: color 0.3s;
        
        &:hover {
          color: #1890ff;
        }
      }
      
      .breadcrumb {
        margin-left: 16px;
      }
    }
    
    .header-right {
      display: flex;
      align-items: center;
      
      .user-info {
        display: flex;
        align-items: center;
        cursor: pointer;
        
        .avatar {
          margin-right: 8px;
          background-color: #1890ff;
        }
        
        .username {
          color: rgba(0, 0, 0, 0.85);
          font-size: 14px;
        }
      }
    }
  }
  
  .layout-content {
    margin-top: 64px;
    padding: 16px;
    min-height: calc(100vh - 64px);
    background: #f0f2f5;
    
    @media (max-width: 992px) {
      padding: 12px;
    }
  }
}
</style> 