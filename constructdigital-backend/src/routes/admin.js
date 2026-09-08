const express = require('express')
const router = express.Router()
const { imageUpload, mediaUpload } = require('@/utils/upload')
const authController = require('@/admin/controllers/AuthController')
const logController = require('@/admin/controllers/LogController')
const adminController = require('@/admin/controllers/AdminController')
const adminGroupController = require('@/admin/controllers/AdminGroupController')
const userController = require('@/admin/controllers/UserController')
const dashboardController = require('@/admin/controllers/DashboardController')
const configController = require('@/admin/controllers/ConfigController')
const userTaskController = require('@/admin/controllers/UserTaskController')
const productController = require('@/admin/controllers/ProductController')
const uploadController = require('@/admin/controllers/UploadController')
const withdrawController = require('@/admin/controllers/WithdrawController')
const moneyLogController = require('@/admin/controllers/MoneyLogController')
const orderController = require('@/admin/controllers/OrderController')
const vipController = require('@/admin/controllers/VipController')
const { checkPermission, checkSuperAdmin } = require('@/admin/middlewares/permission')

// 公开路由
router.post('/login', authController.login)
router.get('/captcha', authController.generateCaptcha)

// 需要认证的路由
router.use(authController.auth)

// 仪表盘相关路由
router.get('/dashboard/stats', dashboardController.getDashboardStats)
router.get('/dashboard/recent-users', dashboardController.getRecentUsers)

// 获取用户信息
router.get('/user/info', authController.getUserInfo)

// 获取用户菜单
router.get('/user/menus', authController.getUserMenus)

// 退出登录
router.post('/logout', authController.logout)

// 日志相关路由
router.get('/logs', checkPermission('system.logs'), logController.getList)
router.get('/logs/:id', checkPermission('system.logs.view'), logController.getDetail)
router.delete('/logs/clear', checkPermission('system.logs.clear'), logController.clear) 

// 管理员管理路由
router.get('/admins', checkPermission('system.admins'), adminController.getList)
router.post('/admins', checkPermission('system.admins.create'), adminController.create)
router.put('/admins/:id', checkPermission('system.admins.update'), adminController.update)
router.delete('/admins/:id', checkPermission('system.admins.delete'), adminController.delete)
router.put('/admins/:id/status', checkPermission('system.admins.toggle_status'), adminController.toggleStatus)

// 权限组管理路由
router.get('/admin-groups', checkPermission('system.permissions'), adminGroupController.getList)
router.get('/admin-groups/:id', checkPermission('system.permissions.view'), adminGroupController.getDetail)
router.post('/admin-groups', checkPermission('system.permissions.create'), adminGroupController.create)
router.put('/admin-groups/:id', checkPermission('system.permissions.update'), adminGroupController.update)
router.delete('/admin-groups/:id', checkPermission('system.permissions.delete'), adminGroupController.delete)
router.put('/admin-groups/:id/status', checkPermission('system.permissions.toggle_status'), adminGroupController.toggleStatus)
router.get('/admin-rules', checkPermission('system.permissions.config'), adminGroupController.getAllRules)

// 管理员个人信息路由
router.get('/admin/profile', adminController.getProfile)
router.put('/admin/profile', adminController.updateProfile)
router.post('/admin/avatar', imageUpload.single('avatar'), adminController.updateAvatar)
router.put('/admin/password', adminController.updatePassword)

// 用户管理路由
router.get('/users', checkPermission('users.list'), userController.getList)
router.get('/users/admins', checkPermission('users.list'), userController.getAdminList)
router.get('/users/:id', checkPermission('users.list.view'), userController.getDetail)
router.post('/users', checkPermission('users.list.create'), userController.create)
router.put('/users/:id', checkPermission('users.list.update'), userController.update)
router.delete('/users/:id', checkPermission('users.list.delete'), userController.delete)
router.put('/users/:id/status', checkPermission('users.list.toggle_status'), userController.toggleStatus)
router.put('/users/:id/task-status', checkPermission('users.list.toggle_task'), userController.toggleTaskStatus)
router.post('/users/balance', checkPermission('users.list.adjust_balance'), userController.adjustBalance)
router.get('/users/:userId/balance-records', checkPermission('users.list.view'), userController.getBalanceRecords)
router.get('/users/:id/team', checkPermission('users.list.view'), userController.getTeam)
router.post('/users/:id/reset-tasks', checkPermission('users.list.reset_tasks'), userController.resetTasks)
router.get('/users/:id/task', checkPermission('users.list.view'), userController.getUserTask)
router.post('/users/:id/task', checkPermission('users.list.update'), userController.saveUserTask)
router.put('/users/:id/bank-card', checkPermission('users.list.update'), userController.updateBankCard)

// 配置管理
router.get('/configs', checkPermission('settings.view'), configController.getList)
router.get('/configs/group/:group', checkPermission('settings.view'), configController.getByGroup)
router.get('/config', checkPermission('settings.view'), configController.getConfig)
router.post('/configs', checkPermission('settings.create'), configController.create)
router.put('/configs/:id', checkPermission('settings.update'), configController.update)
router.delete('/configs/:id', checkPermission('settings.delete'), configController.delete)
router.put('/config', checkPermission('settings.save'), configController.updateConfig)
router.get('/config/all', checkPermission('settings.view'), configController.getAllConfig)

// 用户任务管理
router.get('/user-tasks', userTaskController.getUserTasks)
router.get('/users/:userId/task', userTaskController.getUserTask)
router.post('/users/:userId/task', userTaskController.createOrUpdateUserTask)
router.put('/users/:userId/task', userTaskController.createOrUpdateUserTask)
router.delete('/users/:userId/task', userTaskController.deleteUserTask)
router.put('/users/:userId/task/status', userTaskController.updateUserTaskStatus)
router.patch('/user-task/:userId/lucky-order', userTaskController.updateLuckyOrder)
router.patch('/user-task/:userId/continuous-order', userTaskController.updateContinuousOrder)

// 商品管理
router.get('/products', checkPermission('products.index'), productController.getList)
router.get('/products/:id', checkPermission('products.index.view'), productController.getDetail)
router.post('/products', checkPermission('products.index.create'), productController.create)
router.put('/products/:id', checkPermission('products.index.update'), productController.update)
router.delete('/products/:id', checkPermission('products.index.delete'), productController.delete)
router.put('/products/:id/toggle-status', checkPermission('products.index.toggle_status'), productController.toggleStatus)

// 提现管理
router.get('/withdraws', checkPermission('finance.withdraws'), withdrawController.getList)
router.get('/withdraws/:id', checkPermission('finance.withdraws.view'), withdrawController.getDetail)
router.post('/withdraws/:id/approve', checkPermission('finance.withdraws.approve'), withdrawController.approve)
router.post('/withdraws/:id/reject', checkPermission('finance.withdraws.reject'), withdrawController.reject)
router.post('/withdraws/:id/confirm-payment', checkPermission('finance.withdraws.confirm'), withdrawController.confirmPayment)

// 财务记录管理
router.get('/money-logs', checkPermission('finance.money-logs'), moneyLogController.getList)
router.get('/money-logs/:id', checkPermission('finance.money-logs.view'), moneyLogController.getDetail)
router.get('/money-logs-stats', checkPermission('finance.money-logs.statistics'), moneyLogController.getStats)

// 订单管理
router.get('/orders', checkPermission('orders.list'), orderController.getList)
router.get('/orders/:id', checkPermission('orders.list.view'), orderController.getDetail)
router.get('/orders-export', orderController.exportOrders)
router.put('/orders/:id/status', checkPermission('orders.list.update'), orderController.updateStatus)
router.post('/orders/:id/complete', checkPermission('orders.list.force_complete'), orderController.completeOrder)
router.delete('/orders/:id', checkPermission('orders.list.delete'), orderController.delete)

// VIP等级管理
router.get('/vips', checkPermission('vip.index'), vipController.getList)
router.get('/vips/:id', checkPermission('vip.index.view'), vipController.getDetail)
router.post('/vips', checkPermission('vip.index.create'), vipController.create)
router.put('/vips/:id', checkPermission('vip.index.update'), vipController.update)
router.delete('/vips/:id', checkPermission('vip.index.delete'), vipController.delete)
router.put('/vips/:id/status', checkPermission('vip.index.toggle_status'), vipController.toggleStatus)

// 上传接口
router.post('/upload/image', authController.auth, imageUpload.single('file'), uploadController.uploadImage)
router.post('/upload/media', authController.auth, mediaUpload.single('file'), uploadController.uploadMedia)

module.exports = router 
