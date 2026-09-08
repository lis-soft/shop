const BaseController = require('./BaseController')
const userTaskService = require('../services/UserTaskService')
const { RESOURCES } = require('@/config/resources')

class UserTaskController extends BaseController {
  static resource = RESOURCES.USER_TASK

  constructor() {
    super()
  }

  // 获取用户任务列表
  getUserTasks = async (req, res) => {
    try {
      const params = req.method === 'GET' ? req.query : req.body
      const result = await userTaskService.getUserTasks(params)
      return this.success(req, res, result.data, result.message)
    } catch (error) {
      return this.fail(req, res, error)
    }
  }

  // 获取单个用户任务
  getUserTask = async (req, res) => {
    try {
      const userId = req.params.userId
      const result = await userTaskService.getUserTask(userId)
      return this.success(req, res, result.data, result.message)
    } catch (error) {
      return this.fail(req, res, error)
    }
  }

  // 创建或更新用户任务
  createOrUpdateUserTask = async (req, res) => {
    try {
      const data = req.body
      
      // 如果是通过URL参数指定用户ID
      if (req.params.userId) {
        data.user_id = req.params.userId
      }
      
      // 记录操作管理员
      if (req.user && req.user.id) {
        data.admin_id = req.user.id
      }
      
      const result = await userTaskService.createOrUpdateUserTask(data)
      return this.success(req, res, result.data, result.message)
    } catch (error) {
      return this.fail(req, res, error)
    }
  }

  // 删除用户任务
  deleteUserTask = async (req, res) => {
    try {
      const userId = req.params.userId
      const result = await userTaskService.deleteUserTask(userId)
      return this.success(req, res, result.data, result.message)
    } catch (error) {
      return this.fail(req, res, error)
    }
  }

  // 更新用户任务状态
  updateUserTaskStatus = async (req, res) => {
    try {
      const userId = req.params.userId
      const { status } = req.body
      
      if (status === undefined) {
        return this.fail(req, res, { message: '状态参数缺失' })
      }
      
      const result = await userTaskService.updateUserTaskStatus(userId, status)
      return this.success(req, res, result.data, result.message)
    } catch (error) {
      return this.fail(req, res, error)
    }
  }

  // 删除幸运订单
  updateLuckyOrder = async (req, res) => {
    try {
      const userId = req.params.userId
      const { lucky_order } = req.body
      const result = await userTaskService.updateLuckyOrder(userId, lucky_order)
      return this.success(req, res, result.data, result.message)
    } catch (error) {
      return this.fail(req, res, error)
    }
  }

  // 删除连续订单
  updateContinuousOrder = async (req, res) => {
    try {
      const userId = req.params.userId
      const { continuous_order } = req.body
      const result = await userTaskService.updateContinuousOrder(userId, continuous_order)
      return this.success(req, res, result.data, result.message)
    } catch (error) {
      return this.fail(req, res, error)
    }
  }
}

module.exports = new UserTaskController() 