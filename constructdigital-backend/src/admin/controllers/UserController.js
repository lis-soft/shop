const BaseController = require('./BaseController')
const userService = require('../services/UserService')
const { getClientIp } = require('@/utils/getClientIp')
const { RESOURCES } = require('@/config/resources')

class UserController extends BaseController {
  static resource = RESOURCES.USER

  // 获取用户列表
  getList = async (req, res) => {
    try {
      const result = await userService.getList(req)
      return this.success(req, res, result.data)
    } catch (error) {
      return this.fail(req, res, error)
    }
  }

  // 获取用户详情
  getDetail = async (req, res) => {
    try {
      const result = await userService.getDetail(req)
      return this.success(req, res, result.data)
    } catch (error) {
      return this.fail(req, res, error)
    }
  }

  // 创建用户
  create = async (req, res) => {
    try {
      const result = await userService.create(req)
      return this.success(req, res, result.data, '创建成功')
    } catch (error) {
      return this.fail(req, res, error)
    }
  }

  // 更新用户
  update = async (req, res) => {
    try {
      const result = await userService.update(req)
      return this.success(req, res, result.data, '更新用户成功')
    } catch (error) {
      return this.fail(req, res, error)
    }
  }

  // 删除用户
  delete = async (req, res) => {
    try {
      const result = await userService.delete(req)
      return this.success(req, res, null, '删除用户成功')
    } catch (error) {
      return this.fail(req, res, error)
    }
  }

  // 调整用户余额
  adjustBalance = async (req, res) => {
    try {
      const result = await userService.adjustBalance(req)
      return this.success(req, res, result.data, '余额调整成功')
    } catch (error) {
      return this.fail(req, res, error)
    }
  }

  // 获取用户余额记录
  getBalanceRecords = async (req, res) => {
    try {
      const result = await userService.getBalanceRecords(req)
      return this.success(req, res, result.data)
    } catch (error) {
      return this.fail(req, res, error)
    }
  }

  // 切换用户状态
  toggleStatus = async (req, res) => {
    try {
      const result = await userService.toggleStatus(req)
      return this.success(req, res, result.data, '状态更新成功')
    } catch (error) {
      return this.fail(req, res, error)
    }
  }

  // 切换用户抢单权限
  toggleTaskStatus = async (req, res) => {
    try {
      const result = await userService.toggleTaskStatus(req)
      return this.success(req, res, result.data, '抢单权限更新成功')
    } catch (error) {
      return this.fail(req, res, error)
    }
  }

  // 查看团队成员及统计
  getTeam = async (req, res) => {
    try {
      const result = await userService.getTeam(req)
      return this.success(req, res, result.data)
    } catch (error) {
      return this.fail(req, res, error)
    }
  }

  // 重置用户订单
  resetTasks = async (req, res) => {
    try {
      const result = await userService.resetTasks(req)
      return this.success(req, res, null, '订单重置成功')
    } catch (error) {
      return this.fail(req, res, error)
    }
  }

  // 获取用户任务设置
  getUserTask = async (req, res) => {
    try {
      const result = await userService.getUserTask(req)
      return this.success(req, res, result.data)
    } catch (error) {
      return this.fail(req, res, error)
    }
  }

  // 保存用户任务设置
  saveUserTask = async (req, res) => {
    try {
      const result = await userService.saveUserTask(req)
      return this.success(req, res, result.data, '任务设置保存成功')
    } catch (error) {
      return this.fail(req, res, error)
    }
  }

  // 获取管理员列表
  getAdminList = async (req, res) => {
    try {
      const result = await userService.getAdminList(req)
      return this.success(req, res, result.data)
    } catch (error) {
      return this.fail(req, res, error)
    }
  }

  // 更新用户银行卡信息
  updateBankCard = async (req, res) => {
    try {
      const result = await userService.updateBankCard(req)
      return this.success(req, res, result.data, '银行卡信息更新成功')
    } catch (error) {
      return this.fail(req, res, error)
    }
  }

}

module.exports = new UserController() 