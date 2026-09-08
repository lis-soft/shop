const BaseService = require('./BaseService')
const Config = require('../models/Config')
const { Op } = require('sequelize')
const { DEFAULT_CONFIGS, OBSOLETE_CONFIG_KEYS } = require('@/config/defaultConfigs')

class ConfigService extends BaseService {
  async ensureDefaultConfigs() {
    await Config.update(
      { is_active: false },
      { where: { key: { [Op.in]: OBSOLETE_CONFIG_KEYS } } }
    )

    for (const defaultConfig of DEFAULT_CONFIGS) {
      const [config, created] = await Config.findOrCreate({
        where: { key: defaultConfig.key },
        defaults: defaultConfig
      })

      if (!created) {
        const patch = {}

        if ((config.value === null || config.value === undefined || config.value === '') && defaultConfig.value !== undefined && defaultConfig.value !== null && defaultConfig.value !== '') {
          patch.value = defaultConfig.value
        }
        if (config.group_description !== defaultConfig.group_description && defaultConfig.group_description) {
          patch.group_description = defaultConfig.group_description
        }
        if (config.description !== defaultConfig.description && defaultConfig.description) {
          patch.description = defaultConfig.description
        }
        if (config.type !== defaultConfig.type && defaultConfig.type) {
          patch.type = defaultConfig.type
        }
        if (config.group !== defaultConfig.group && defaultConfig.group) {
          patch.group = defaultConfig.group
        }
        if (config.sort !== defaultConfig.sort && defaultConfig.sort !== undefined) {
          patch.sort = defaultConfig.sort
        }
        if (config.is_active !== defaultConfig.is_active && defaultConfig.is_active !== undefined) {
          patch.is_active = defaultConfig.is_active
        }

        if (Object.keys(patch).length > 0) {
          await config.update(patch)
        }
      }
    }
  }

  async getConfig(req) {
    try {
      await this.ensureDefaultConfigs()
      const { query: { key } } = req
      
      if (key) {
        const config = await Config.findOne({ where: { key, is_active: true } })
        if (!config) {
          throw new Error('配置不存在')
        }
        return this.success({ [key]: this.parseValue(config.value, config.type) }, '获取成功')
      } else {
        const configs = await Config.findAll({ where: { is_active: true } })
        const result = {}
        configs.forEach(config => {
          result[config.key] = this.parseValue(config.value, config.type)
        })
        return this.success(result, '获取成功')
      }
    } catch (error) {
      return this.fail(error)
    }
  }

  async getList(req) {
    try {
      await this.ensureDefaultConfigs()
      const { query: params } = req
      const where = {}

      if (params.group) {
        where.group = params.group
      }

      return await this.paginate(Config, {
        params,
        searchFields: ['key', 'description'],
        where,
        order: [['group', 'ASC'], ['sort', 'ASC'], ['id', 'ASC']]
      })
    } catch (error) {
      return this.fail(error)
    }
  }

  async getByGroup(req) {
    try {
      await this.ensureDefaultConfigs()
      const { params: { group } } = req
      
      const configs = await Config.findAll({
        where: { group, is_active: true },
        order: [['sort', 'ASC'], ['id', 'ASC']]
      })
      return this.success(configs, '获取成功')
    } catch (error) {
      return this.fail(error)
    }
  }

  async create(req) {
    try {
      const { body: data } = req
      const { key, value, type = 'string', group = 'system', group_description, description, is_active = true, sort = 0 } = data

      const existingConfig = await Config.findOne({ where: { key } })
      if (existingConfig) {
        throw new Error('配置键名已存在')
      }

      const config = await Config.create({
        key,
        value,
        type,
        group,
        group_description,
        description,
        is_active,
        sort
      })

      return this.success(config, '创建成功')
    } catch (error) {
      return this.fail(error)
    }
  }

  async update(req) {
    try {
      const { params: { id }, body: data } = req
      
      const config = await Config.findByPk(id)
      if (!config) {
        throw new Error('配置不存在')
      }

      const { key, value, type, group, group_description, description, is_active, sort } = data

      if (key && key !== config.key) {
        const existingConfig = await Config.findOne({ where: { key, id: { [Op.ne]: id } } })
        if (existingConfig) {
          throw new Error('配置键名已存在')
        }
      }

      await config.update({
        key: key || config.key,
        value: value !== undefined ? value : config.value,
        type: type || config.type,
        group: group || config.group,
        group_description: group_description !== undefined ? group_description : config.group_description,
        description: description !== undefined ? description : config.description,
        is_active: is_active !== undefined ? is_active : config.is_active,
        sort: sort !== undefined ? sort : config.sort
      })

      return this.success(config, '更新成功')
    } catch (error) {
      return this.fail(error)
    }
  }

  async delete(req) {
    try {
      const { params: { id } } = req
      
      const config = await Config.findByPk(id)
      if (!config) {
        throw new Error('配置不存在')
      }

      await config.destroy()
      return this.success(null, '删除成功')
    } catch (error) {
      return this.fail(error)
    }
  }

  async updateConfig(req) {
    try {
      await this.ensureDefaultConfigs()
      const { body: data } = req
      
      if (!data || Object.keys(data).length === 0) {
        throw new Error('参数错误')
      }

      const updates = []
      for (const [key, value] of Object.entries(data)) {
        const [config, created] = await Config.findOrCreate({
          where: { key },
          defaults: { key, value: String(value), description: '' }
        })

        if (!created) {
          config.value = String(value)
          await config.save()
        }
        updates.push(config)
      }

      return this.success(updates, '更新成功')
    } catch (error) {
      return this.fail(error)
    }
  }

  async getAllConfig(req) {
    try {
      await this.ensureDefaultConfigs()
      const configs = await Config.findAll({
        order: [['group', 'ASC'], ['sort', 'ASC'], ['id', 'ASC']]
      })
      return this.success(configs, '获取成功')
    } catch (error) {
      return this.fail(error)
    }
  }

  parseValue(value, type) {
    if (!value) return value
    
    switch (type) {
      case 'number':
        return parseFloat(value)
      case 'boolean':
        return value === 'true' || value === '1' || value === 1
      case 'json':
        try {
          return JSON.parse(value)
        } catch {
          return value
        }
      case 'images':
        try {
          return JSON.parse(value)
        } catch {
          return value ? value.split(',') : []
        }
      default:
        return value
    }
  }
}

module.exports = new ConfigService() 
