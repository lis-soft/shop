import { createRouter, createWebHashHistory } from 'vue-router'
import Layout from '@/views/public/Layout.vue'
import { message } from 'ant-design-vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录', noAuth: true }
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '仪表盘', icon: 'dashboard', roles: [0, 1] }
      }
    ]
  },
  {
    path: '/users',
    component: Layout,
    name: 'UserManagement',
    meta: { title: '用户管理', icon: 'user', roles: [0, 1] },
    children: [
      {
        path: 'list',
        name: 'UserList',
        component: () => import('@/views/users/index.vue'),
        meta: { title: '用户列表', icon: 'team', roles: [0, 1] }
      },
      {
        path: ':id/team',
        name: 'UserTeam',
        component: () => import('@/views/users/components/TeamModal.vue'),
        meta: { title: '用户团队', icon: 'team', roles: [0, 1] },
        props: (route) => ({ userId: parseInt(route.params.id) || route.params.id })
      }
    ]
  },
  {
    path: '/system',
    component: Layout,
    name: 'SystemManagement',
    meta: { title: '系统管理', icon: 'setting', roles: [0] },
    children: [
      {
        path: 'admins',
        name: 'Admins',
        component: () => import('@/views/system/admins/index.vue'),
        meta: { title: '管理员管理', icon: 'team', roles: [0] }
      },
      {
        path: 'logs',
        name: 'Logs',
        component: () => import('@/views/system/logs/index.vue'),
        meta: { title: '操作日志', icon: 'history', roles: [0] }
      },
      {
        path: 'permissions',
        name: 'Permissions',
        component: () => import('@/views/system/permissions/index.vue'),
        meta: { title: '权限管理', icon: 'safety', roles: [0] }
      }
    ]
  },
  {
    path: '/settings',
    component: Layout,
    redirect: '/settings/index',
    meta: { title: '系统设置', icon: 'setting', roles: [0] },
    children: [
      {
        path: 'index',
        name: 'Settings',
        component: () => import('@/views/settings/index.vue'),
        meta: { title: '网站配置', icon: 'tool', roles: [0] }
      }
    ]
  },
  {
    path: '/products',
    component: Layout,
    redirect: '/products/index',
    meta: { title: '商品管理', icon: 'shopping-outlined', roles: [0, 1] },
    children: [
      {
        path: 'index',
        name: 'Products',
        component: () => import('@/views/products/index.vue'),
        meta: { title: '商品列表', icon: 'unordered-list-outlined', roles: [0, 1] }
      }
    ]
  },
  {
    path: '/orders',
    component: Layout,
    redirect: '/orders/list',
    meta: { title: '订单管理', icon: 'shopping-cart-outlined', roles: [0, 1] },
    children: [
      {
        path: 'list',
        name: 'OrdersList',
        component: () => import('@/views/orders/index.vue'),
        meta: { title: '订单列表', icon: 'unordered-list-outlined', roles: [0, 1] }
      }
    ]
  },
  {
    path: '/vip',
    component: Layout,
    redirect: '/vip/index',
    meta: { title: 'VIP管理', icon: 'crown-outlined', roles: [0, 1] },
    children: [
      {
        path: 'index',
        name: 'VipLevels',
        component: () => import('@/views/vip/index.vue'),
        meta: { title: 'VIP等级', icon: 'star-outlined', roles: [0, 1] }
      }
    ]
  },
  {
    path: '/finance',
    component: Layout,
    name: 'FinanceManagement',
    meta: { title: '财务管理', icon: 'transaction-outlined', roles: [0, 1] },
    children: [
      {
        path: 'withdraws',
        name: 'Withdraws',
        component: () => import('@/views/withdraws/index.vue'),
        meta: { title: '提现记录', icon: 'money-collect-outlined', roles: [0, 1] }
      },
      {
        path: 'money-logs',
        name: 'MoneyLogs',
        component: () => import('@/views/moneyLogs/index.vue'),
        meta: { title: '财务记录', icon: 'account-book-outlined', roles: [0, 1] }
      },
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404'
  },
  {
    path: '/404',
    name: '404',
    component: () => import('@/views/error/404.vue'),
    meta: { title: '404', noAuth: true }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - ${import.meta.env. VITE_APP_TITLE}` : (import.meta.env.VITE_APP_TITLE)
  
  if (to.meta.noAuth) {
    next()
    return
  }
  
  const token = localStorage.getItem('token')
  if (!token) {
    message.warning('请先登录')
    next({ path: '/login' })
    return
  }
  
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
  const userRole = userInfo.role ?? 0
  
  const hasPermission = to.matched.every(record => 
    !record.meta.roles || record.meta.roles.includes(userRole)
  )
  
  if (!hasPermission) {
    next({ path: '/404' })
    return
  }
  
  next()
})

export default router 
