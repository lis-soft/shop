const BaseController = require('./BaseController')
const userService = require('../services/UserService')
const { t } = require('../lang')
const Withdraw = require('@/admin/models/Withdraw')
const Config = require('@/admin/models/Config')
const Admin = require('@/admin/models/Admin')
const config = require('@/config/config')

class UserController extends BaseController {
  //获取用户信息
  getUserInfo = async (req, res) => {
    try {
      const result = await userService.getUserInfo(req)
      this.success(req, res, result, '获取成功')
    } catch (error) {
      this.fail(req, res, error)
    }
  }

  uploadImage = async (req, res) => {
    try {
      if (!req.file) {
        throw { code: 400, message: '没有上传文件' }
      }

      const filePath = req.file.path.replace(/\\/g, '/')
      const relativePath = filePath.split('uploads/')[1]
      const fileUrl = `${config.upload.url}/${relativePath}`

      this.success(req, res, { url: fileUrl }, '上传成功')
    } catch (error) {
      this.fail(req, res, error)
    }
  }
  
  //更新用户信息
  updateUserInfo = async (req, res) => {
    try {
      const result = await userService.updateUserInfo(req)
      this.success(req, res, result, '更新成功')
    } catch (error) {
      this.fail(req, res, error)
    }
  }
  
  //修改密码
  changePassword = async (req, res) => {
    try {
      await userService.changePassword(req)
      this.success(req, res, null, '密码修改成功')
    } catch (error) {
      this.fail(req, res, error)
    }
  }
  
  //修改支付密码
  changePayPassword = async (req, res) => {
    try {
      await userService.changePayPassword(req)
      this.success(req, res, null, '支付密码修改成功')
    } catch (error) {
      this.fail(req, res, error)
    }
  }

  //验证支付密码
  verifyPayPassword = async (req, res) => {
    try {
      const result = await userService.verifyPayPassword(req)
      this.success(req, res, result, '验证成功')
    } catch (error) {
      this.fail(req, res, error)
    }
  }

  //提现申请
  submitWithdraw = async (req, res) => {
    try {
      const result = await userService.submitWithdraw(req)
      this.success(req, res, result, '提现申请已提交')
    } catch (error) {
      this.fail(req, res, error)
    }
  }

  //获取银行卡信息
  getBankInfo = async (req, res) => {
    try {
      const result = await userService.getBankInfo(req)
      this.success(req, res, result, '获取成功')
    } catch (error) {
      this.fail(req, res, error)
    }
  }
  
  //保存银行卡信息
  saveBankInfo = async (req, res) => {
    try {
      const result = await userService.saveBankInfo(req)
      this.success(req, res, result, '银行卡信息保存成功')
    } catch (error) {
      this.fail(req, res, error)
    }
  }

  //升级VIP
  upgradeVip = async (req, res) => {
    try {
      const result = await userService.upgradeVip(req)
      this.success(req, res, result, 'VIP升级成功')
    } catch (error) {
      this.fail(req, res, error)
    }
  }

  //获取资金记录
  getMoneyLogs = async (req, res) => {
    try {
      const result = await userService.getMoneyLogs(req)
      this.success(req, res, result, '获取成功')
    } catch (error) {
      this.fail(req, res, error)
    }
  }

  //获取交易流水
  getTransactionLogs = async (req, res) => {
    try {
      const result = await userService.getTransactionLogs(req)
      this.success(req, res, result, '获取交易记录成功')
    } catch (error) {
      this.fail(req, res, error)
    }
  }

  //获取签到信息
  getCheckinInfo = async (req, res) => {
    try {
      const result = await userService.getCheckinInfo(req)
      this.success(req, res, result, '获取签到信息成功')
    } catch (error) {
      this.fail(req, res, error)
    }
  }

  //执行签到
  submitCheckin = async (req, res) => {
    try {
      const result = await userService.submitCheckin(req)
      this.success(req, res, result, '签到成功')
    } catch (error) {
      this.fail(req, res, error)
    }
  }

  //退出登录
  logout = async (req, res) => {
    try {
      await userService.logout(req)
      this.success(req, res, null, '退出登录成功')
    } catch (error) {
      this.fail(req, res, error)
    }
  }

}

module.exports = new UserController() 
