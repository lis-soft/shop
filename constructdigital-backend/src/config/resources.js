// 资源配置
const RESOURCES = {
  ADMIN: '管理员',
  USER: '用户',
  LOG: '日志',
  CAPTCHA: 'captcha',
  FISH: 'fish',
  SETTING: 'setting',
  TRANSFER: 'transfer',
  DASHBOARD: 'dashboard',
  CONFIG: '配置',
  USER_TASK: 'user_task',
  PRODUCT: '商品',
  USER_WALLET: '用户钱包',
  WITHDRAW: '提现',
  MONEY_LOG: '财务记录',
  RECHARGE_METHOD: '充值方式',
  RECHARGE: '充值记录'
}

// 资源操作定义
const CRUD_ACTIONS = {
  get: '查看',
    post: '创建',
    put: '更新',
    delete: '删除'
  }

// 特定路由的操作定义
const ACTIONS = {
  'POST /admin/login': '登录系统',
  'GET /admin/user/info': '获取个人信息',
  'POST /admin/logout': '退出登录',
  'GET /admin/dashboard/stats': '查看仪表盘',
  'GET /admin/logs': '查看操作日志',
  'DELETE /admin/logs/clear': '清空操作日志',
  'GET /admin/admins': '查看管理员列表',
  'POST /admin/admins': '创建管理员',
  'PUT /admin/admins/:id': '更新管理员',
  'DELETE /admin/admins/:id': '删除管理员',
  'PUT /admin/admins/:id/status': '修改管理员状态',
  'GET /admin/admin/profile': '查看个人资料',
  'PUT /admin/admin/profile': '更新个人资料',
  'POST /admin/admin/avatar': '更新头像',
  'PUT /admin/admin/password': '修改密码',
  
  // 用户管理
  'GET /admin/users': '查看用户列表',
  'GET /admin/users/:id': '查看用户详情',
  'POST /admin/users': '创建用户',
  'PUT /admin/users/:id': '更新用户',
  'DELETE /admin/users/:id': '删除用户',
  'PUT /admin/users/:id/status': '修改用户状态',
  'PUT /admin/users/:id/password': '重置用户密码',
  'POST /admin/users/balance': '调整用户余额',
  'GET /admin/users/:userId/balance-records': '查看用户余额记录',
  'GET /admin/users/:id/team': '查看用户团队',
  'POST /admin/users/:id/reset-tasks': '重置用户订单',
  'GET /admin/users/:id/task': '查看用户任务设置',
  'POST /admin/users/:id/task': '保存用户任务设置',
  
  // 配置管理
  'GET /admin/config': '获取系统配置',
  'PUT /admin/config': '更新系统配置',
  'GET /admin/config/all': '获取所有配置',
  
  // 用户任务管理
  'GET /admin/user-tasks': '获取用户任务列表',
  'GET /admin/users/:userId/task': '获取用户任务',
  'POST /admin/users/:userId/task': '创建用户任务',
  'PUT /admin/users/:userId/task': '更新用户任务',
  'DELETE /admin/users/:userId/task': '删除用户任务',
  'PUT /admin/users/:userId/task/status': '更新用户任务状态',
  
  // 商品管理
  'GET /admin/products': '获取商品列表',
  'GET /admin/products/:id': '获取商品详情',
  'POST /admin/products': '创建商品',
  'PUT /admin/products/:id': '更新商品',
  'DELETE /admin/products/:id': '删除商品',
  'PUT /admin/products/:id/status': '更新商品状态',
  
  // 充值方式管理
  'GET /admin/recharge-methods': '获取充值方式列表',
  'GET /admin/recharge-methods/:id': '获取充值方式详情',
  'POST /admin/recharge-methods': '创建充值方式',
  'PUT /admin/recharge-methods/:id': '更新充值方式',
  'DELETE /admin/recharge-methods/:id': '删除充值方式',
  'PUT /admin/recharge-methods/:id/status': '更新充值方式状态',
  
  // 订单管理
  'GET /admin/orders': '查看订单列表',
  'GET /admin/orders/:id': '查看订单详情',
  'PUT /admin/orders/:id/status': '更新订单状态',
  'POST /admin/orders/:id/complete': '手动完成订单',
  'DELETE /admin/orders/:id': '删除订单'
}

module.exports = {
  RESOURCES,
  CRUD_ACTIONS,
  ACTIONS
} 