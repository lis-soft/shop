const express = require('express')
const router = express.Router()
const { imageUpload } = require('@/utils/upload')
const indexController = require('@/api/controllers/IndexController')
const userController = require('@/api/controllers/UserController')
const HomeController = require('@/api/controllers/HomeController')
const BaseController = require('@/api/controllers/BaseController')
const { authMiddleware } = require('@/admin/services/AuthService')
const OrderController = require('@/api/controllers/OrderController')

const baseController = new BaseController()

// 公开路由
router.get('/', indexController.index)
router.get('/index/captcha', indexController.captcha)
router.post('/index/verifyCaptcha', indexController.verifyCaptcha)
router.post('/index/register', indexController.register)
router.post('/index/login', indexController.login)
router.get('/home/websiteConfig', HomeController.getWebsiteConfig)


// 需要认证的路由
router.use(baseController.authenticate)

// 用户
router.get('/user/info', userController.getUserInfo)
router.post('/user/upload/image', imageUpload.single('file'), userController.uploadImage)
router.put('/user/info', userController.updateUserInfo)
router.put('/user/changePassword', userController.changePassword)
router.put('/user/changePayPassword', userController.changePayPassword)
router.post('/user/verifyPayPassword', userController.verifyPayPassword)
router.post('/user/withdraw', userController.submitWithdraw)
router.get('/user/bankInfo', userController.getBankInfo)
router.post('/user/bankInfo', userController.saveBankInfo)
router.post('/user/upgradeVip', userController.upgradeVip)
router.get('/user/moneyLogs', userController.getMoneyLogs)
router.get('/user/transactions', userController.getTransactionLogs)
router.get('/user/checkin', userController.getCheckinInfo)
router.post('/user/checkin', userController.submitCheckin)
router.post('/user/logout', userController.logout)

// 订单
router.get('/order/current', OrderController.getCurrentOrder)
router.post('/order/create', OrderController.createOrder)
router.post('/order/submit', OrderController.submitOrder)
router.get('/order/orderStats', OrderController.getOrderStats)
router.get('/order/orderList', OrderController.getOrderList)

// 财务记录
router.get('/home/moneyLogs', HomeController.getMoneyLogs)
// 随机商品
router.get('/home/randomProducts', HomeController.getRandomProducts)
// VIP等级列表
router.get('/home/vipLevels', HomeController.getVipLevels)
// 充值返现活动配置
router.get('/home/eventConfig', HomeController.getEventConfig)
// 合作商配置
router.get('/home/partnerConfig', HomeController.getPartnerConfig)
// About Us配置
router.get('/home/aboutConfig', HomeController.getAboutConfig)
module.exports = router 
