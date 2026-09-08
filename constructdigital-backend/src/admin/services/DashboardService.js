const { Op } = require('sequelize')
const sequelize = require('sequelize')
const dayjs = require('dayjs')
const User = require('@/admin/models/User')
const Order = require('@/admin/models/Order')
const Product = require('@/admin/models/Product')
const MoneyLog = require('@/admin/models/MoneyLog')
const Withdraw = require('@/admin/models/Withdraw')
const Admin = require('@/admin/models/Admin')

class DashboardService {
  async getDashboardStats(adminId, role) {
    try {
      const where = role === 1 ? { admin_id: adminId } : {};
      const todayStart = dayjs().startOf('day').toDate();
      const todayEnd = dayjs().endOf('day').toDate();

      const totalUsers = await User.count({ where });
      const activeUsers = await User.count({ where: { ...where, status: 1 } });
      const totalOrders = await Order.count({ where });
      const todayOrders = await Order.count({ where: { ...where, created_at: { [Op.between]: [todayStart, todayEnd] } } });

      const totalIncome = await MoneyLog.sum('amount', { where: { ...where, type: 1 } }) || 0;
      const todayIncome = await MoneyLog.sum('amount', { where: { ...where, type: 1, created_at: { [Op.between]: [todayStart, todayEnd] } } }) || 0;
      const totalExpense = await MoneyLog.sum('amount', { where: { ...where, type: 2 } }) || 0;
      const pendingWithdraws = await Withdraw.count({ where: { ...where, status: 0 } });

      const last7Days = [];
      const orderData = [];
      const incomeData = [];
      const userRegData = [];
      for (let i = 6; i >= 0; i--) {
        const date = dayjs().subtract(i, 'day');
        const dateStr = date.format('MM-DD');
        const startOfDay = date.startOf('day').toDate();
        const endOfDay = date.endOf('day').toDate();

        last7Days.push(dateStr);
        orderData.push(await Order.count({ where: { ...where, created_at: { [Op.between]: [startOfDay, endOfDay] } } }));
        incomeData.push(await MoneyLog.sum('amount', { where: { ...where, type: 1, created_at: { [Op.between]: [startOfDay, endOfDay] } } }) || 0);
        userRegData.push(await User.count({ where: { ...where, created_at: { [Op.between]: [startOfDay, endOfDay] } } }));
      }

      const userStatusData = [
        { name: '活跃', value: activeUsers },
        { name: '禁用', value: totalUsers - activeUsers }
      ];

      return {
        stats: {
          totalUsers,
          activeUsers,
          totalOrders,
          todayOrders,
          totalIncome,
          todayIncome,
          totalExpense,
          pendingWithdraws
        },
        chartData: {
          last7Days,
          orderData,
          incomeData,
          userRegData,
          userStatusData,
        }
      };
    } catch (error) {
      console.error('获取仪表盘统计数据失败:', error);
      throw error;
    }
  }

  async getRecentUsers(limit = 10, adminId, role) {
    try {
      const userWhere = role === 1 ? { admin_id: adminId } : {};
      const users = await User.findAll({
        where: userWhere,
        attributes: ['id', 'username', 'phone', 'status', 'balance', 'remarks', 'created_at', 'updated_at'],
        order: [['created_at', 'DESC']],
        limit,
        raw: true
      });

      users.forEach(user => {
        user.created_at = dayjs(user.created_at).format('YYYY-MM-DD HH:mm:ss');
        user.updated_at = dayjs(user.updated_at).format('YYYY-MM-DD HH:mm:ss');
      });

      return { users };
    } catch (error) {
      console.error('获取最近注册用户失败:', error);
      throw error;
    }
  }
}

module.exports = new DashboardService()
