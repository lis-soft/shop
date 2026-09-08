const BaseService = require('./BaseService')
const Vip = require('@/admin/models/Vip')
const { Op } = require('sequelize')
const sequelize = require('@/config/database')

class VipService extends BaseService {

  async getList(req) {
    try {
      const result = await this.paginate(Vip, {
        params: req.query,
        searchFields: ['vip_name', 'vip_level'],
        order: [['vip_level', 'ASC']]
      })
      return this.success(result.data, '获取成功')
    } catch (error) {
      return this.fail(error)
    }
  }

  async getDetail(req) {
    try {
      const { params: { id } } = req
      const vip = await this.checkVipExists(id)
      return this.success(vip, '获取成功')
    } catch (error) {
      return this.fail(error)
    }
  }

  async create(req) {
    try {
      const { body: data } = req
      const { vip_level } = data

      await this.checkVipLevelUnique(vip_level)
      const vipData = this.buildVipData(data)

      const transaction = await sequelize.transaction()

      try {
        const vip = await Vip.create(vipData, { transaction })
        await transaction.commit()
        return this.success(vip, '创建成功')
      } catch (error) {
        await transaction.rollback()
        throw error
      }
    } catch (error) {
      return this.fail(error)
    }
  }

  async update(req) {
    try {
      const { params: { id }, body: data } = req
      const { vip_level } = data

      const vip = await this.checkVipExists(id)

      if (vip_level && vip_level !== vip.vip_level) {
        await this.checkVipLevelUnique(vip_level, id)
      }

      const updateData = this.buildVipData(data, vip)

      const transaction = await sequelize.transaction()

      try {
        await vip.update(updateData, { transaction })
        await transaction.commit()
        return this.success(vip, '更新成功')
      } catch (error) {
        await transaction.rollback()
        throw error
      }
    } catch (error) {
      return this.fail(error)
    }
  }

  async delete(req) {
    try {
      const { params: { id } } = req

      const vip = await this.checkVipExists(id)

      const transaction = await sequelize.transaction()

      try {
        await vip.destroy({ transaction })
        await transaction.commit()
        return this.success(null, '删除成功')
      } catch (error) {
        await transaction.rollback()
        throw error
      }
    } catch (error) {
      return this.fail(error)
    }
  }

  async toggleStatus(req) {
    try {
      const { params: { id }, body: { status } } = req

      const vip = await this.checkVipExists(id)

      const transaction = await sequelize.transaction()

      try {
        await vip.update({ status }, { transaction })
        await transaction.commit()
        return this.success(vip, status ? '启用成功' : '禁用成功')
      } catch (error) {
        await transaction.rollback()
        throw error
      }
    } catch (error) {
      return this.fail(error)
    }
  }

  async checkVipExists(id) {
    const vip = await Vip.findByPk(id)
    if (!vip) {
      throw new Error('VIP等级不存在')
    }
    return vip
  }

  async checkVipLevelUnique(vip_level, excludeId = null) {
    const whereCondition = { vip_level }
    if (excludeId) {
      whereCondition.id = { [Op.ne]: excludeId }
    }
    
    const existingVip = await Vip.findOne({ where: whereCondition })
    if (existingVip) {
      throw new Error('VIP等级已存在')
    }
  }

  buildVipData(data, existingVip = null) {
    const { vip_level, vip_name, balance_limit, reward_rate, card_reward_rate, task_count, daily_sets, min_salary, vip_image, status } = data
    
    if (existingVip) {
      return {
        vip_level: vip_level || existingVip.vip_level,
        vip_name: vip_name || existingVip.vip_name,
        balance_limit: balance_limit !== undefined ? balance_limit : existingVip.balance_limit,
        reward_rate: reward_rate !== undefined ? reward_rate : existingVip.reward_rate,
        card_reward_rate: card_reward_rate !== undefined ? card_reward_rate : existingVip.card_reward_rate,
        task_count: task_count !== undefined ? task_count : existingVip.task_count,
        daily_sets: daily_sets !== undefined ? daily_sets : existingVip.daily_sets,
        min_salary: min_salary !== undefined ? min_salary : existingVip.min_salary,
        vip_image: vip_image !== undefined ? vip_image : existingVip.vip_image,
        status: status !== undefined ? status : existingVip.status
      }
    } else {
      return {
        vip_level,
        vip_name,
        balance_limit,
        reward_rate,
        card_reward_rate,
        task_count,
        daily_sets,
        min_salary,
        vip_image,
        status
      }
    }
  }
}

module.exports = new VipService()
