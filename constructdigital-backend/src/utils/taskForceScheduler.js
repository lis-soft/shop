const moment = require('moment')
const User = require('@/admin/models/User')
const Order = require('@/admin/models/Order')

class TaskForceScheduler {
  constructor() {
    this.hasRunToday = false
  }

  start() {
    this.checkAndRun()
    setInterval(() => this.checkAndRun(), 1000) // 每秒检查一次
    console.log('任务调度器已启动 - 每天北京时间 5:00 自动执行')
  }

  async checkAndRun() {
    const now = moment().utcOffset(8)
    const hour = now.hour()
    const minute = now.minute()

    if (hour === 2 && minute === 0 && !this.hasRunToday) {
      this.hasRunToday = true
      console.log('开始更新用户任务等级...')
      await this.updateTaskForce()
      
      setTimeout(() => {
        this.hasRunToday = false
        console.log('任务等级更新标记已重置，准备下一天执行')
      }, 86400000)
    }
  }

  async updateTaskForce() {
    try {
      const users = await User.findAll({
        attributes: ['id', 'task_force'],
        where: { status: 1 }
      })

      for (const user of users) {
        const currentTaskForce = parseFloat(user.task_force || 0)
        
        const completedCount = await Order.count({
          where: {
            user_id: user.id,
            status: 1,
            task_force: currentTaskForce
          }
        })

        if (completedCount >= 60) {
          await user.update({ task_force: currentTaskForce + 1 })
          console.log(`用户 ${user.id} 的 task_force 从 ${currentTaskForce} 提升到 ${currentTaskForce + 1}`)
        }
      }

      console.log('用户任务等级更新完成')
    } catch (error) {
      console.error('用户任务等级更新失败:', error)
    }
  }
}

module.exports = new TaskForceScheduler()