const BaseService = require('@/admin/services/BaseService')
const AdminGroup = require('@/admin/models/AdminGroup')
const AdminRule = require('@/admin/models/AdminRule')
const Admin = require('@/admin/models/Admin')
const { Op } = require('sequelize')

class AdminGroupService extends BaseService {
  async getList(req) {
    try {
      const { query: params } = req
      
      const result = await this.paginate(AdminGroup, {
        params,
        searchFields: ['name'],
        include: [{
          model: Admin,
          as: 'admins',
          attributes: ['id', 'username', 'realName'],
          required: false
        }],
        order: [['created_at', 'DESC']]
      })

      const processedRows = result.data.list.map(group => {
        const groupData = group.toJSON()
        groupData.rulesArray = group.getRulesArray()
        groupData.adminCount = groupData.admins ? groupData.admins.length : 0
        return groupData
      })

      return this.success({
        ...result.data,
        list: processedRows
      })
    } catch (error) {
      return this.fail(error)
    }
  }

  async getDetail(req) {
    try {
      const { params: { id } } = req
      
      const group = await AdminGroup.findByPk(id, {
        include: [{
          model: Admin,
          as: 'admins',
          attributes: ['id', 'username', 'realName', 'email', 'mobile'],
          required: false
        }]
      })

      if (!group) {
        throw new Error('权限组不存在')
      }

      const groupData = group.toJSON()
      groupData.rulesArray = group.getRulesArray()

      return this.success(groupData)
    } catch (error) {
      return this.fail(error)
    }
  }

  async create(req) {
    try {
      const { body: data } = req
      const { name, rules, status = 1 } = data

      if (!name) {
        throw new Error('权限组名称不能为空')
      }

      const existGroup = await AdminGroup.findOne({ where: { name } })
      if (existGroup) {
        throw new Error('权限组名称已存在')
      }

      const group = await AdminGroup.create({
        name,
        rules: Array.isArray(rules) ? rules.join(',') : (rules || ''),
        status
      })

      return this.success(group, '创建成功')
    } catch (error) {
      return this.fail(error)
    }
  }

  async update(req) {
    try {
      const { params: { id }, body: data } = req
      
      const group = await AdminGroup.findByPk(id)
      if (!group) {
        throw new Error('权限组不存在')
      }

      const { name, rules, status } = data

      if (name && name !== group.name) {
        const existGroup = await AdminGroup.findOne({ 
          where: { 
            name,
            id: { [Op.ne]: id }
          } 
        })
        if (existGroup) {
          throw new Error('权限组名称已存在')
        }
      }

      const updateData = {}
      if (name !== undefined) updateData.name = name
      if (rules !== undefined) {
        updateData.rules = Array.isArray(rules) ? rules.join(',') : (rules || '')
      }
      if (status !== undefined) updateData.status = status

      await group.update(updateData)

      return this.success(group, '更新成功')
    } catch (error) {
      return this.fail(error)
    }
  }

  async delete(req) {
    try {
      const { params: { id } } = req
      
      const group = await AdminGroup.findByPk(id)
      if (!group) {
        throw new Error('权限组不存在')
      }

      const adminCount = await Admin.count({ where: { role_id: id } })
      if (adminCount > 0) {
        throw new Error(`无法删除，还有 ${adminCount} 个管理员使用此权限组`)
      }

      await group.destroy()

      return this.success(null, '删除成功')
    } catch (error) {
      return this.fail(error)
    }
  }

  async toggleStatus(req) {
    try {
      const { params: { id } } = req
      
      const group = await AdminGroup.findByPk(id)
      if (!group) {
        throw new Error('权限组不存在')
      }

      const newStatus = group.status === 1 ? 0 : 1
      await group.update({ status: newStatus })

      return this.success(group, `${newStatus === 1 ? '启用' : '禁用'}成功`)
    } catch (error) {
      return this.fail(error)
    }
  }

  async getAllRules(req) {
    try {
      const rules = await AdminRule.findAll({
        where: { status: 1 },
        order: [['weigh', 'DESC'], ['id', 'ASC']],
        attributes: ['id', 'pid', 'type', 'title', 'name', 'path', 'icon']
      })

      const ruleTree = this.buildRuleTree(rules)

      return this.success(ruleTree, '获取成功')
    } catch (error) {
      return this.fail(error)
    }
  }

  buildRuleTree(rules) {
    const ruleMap = new Map()
    const rootRules = []

    rules.forEach(rule => {
      const ruleItem = {
        id: rule.id,
        pid: rule.pid,
        type: rule.type,
        title: rule.title,
        name: rule.name,
        path: rule.path,
        icon: rule.icon,
        children: []
      }
      ruleMap.set(rule.id, ruleItem)
      
      if (rule.pid === 0) {
        rootRules.push(ruleItem)
      }
    })

    rules.forEach(rule => {
      if (rule.pid !== 0) {
        const parent = ruleMap.get(rule.pid)
        const child = ruleMap.get(rule.id)
        if (parent && child) {
          parent.children.push(child)
        }
      }
    })

    return rootRules
  }
}

module.exports = new AdminGroupService()
