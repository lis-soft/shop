const BaseService = require('./BaseService')
const User = require('@/admin/models/User')
const Product = require('@/admin/models/Product')
const Order = require('@/admin/models/Order')
const { Op } = require('sequelize')
const sequelize = require('@/config/database')
const Config = require('@/admin/models/Config')
const MoneyLog = require('@/admin/models/MoneyLog')
const UserTask = require('@/admin/models/UserTask')
const Vip = require('@/admin/models/Vip')

const ACTIVE_FROZEN_ORDER_STATUSES = [0, 2, 3, 5]
const AUTO_ORDER_PRICE_MIN_PERCENT_KEY = 'auto_order_price_min_percent'
const AUTO_ORDER_PRICE_MAX_PERCENT_KEY = 'auto_order_price_max_percent'
const DEFAULT_AUTO_ORDER_PRICE_MIN_PERCENT = 30
const DEFAULT_AUTO_ORDER_PRICE_MAX_PERCENT = 80

class OrderService extends BaseService {
    getAvailableBalance(user) {
        const balance = parseFloat(user?.balance)
        const frozenBalance = parseFloat(user?.frozen_balance)
        const normalizedBalance = Number.isFinite(balance) ? balance : 0
        const normalizedFrozenBalance = Number.isFinite(frozenBalance) ? frozenBalance : 0

        return +(normalizedBalance - normalizedFrozenBalance).toFixed(8)
    }

    normalizeRate(rate) {
        const parsedRate = parseFloat(rate)
        if (!Number.isFinite(parsedRate) || parsedRate <= 0) {
            return 0
        }

        // 兼容旧数据：历史幸运订单可能按 0.12 这种小数存储 12%
        return parsedRate > 0 && parsedRate < 1 ? parsedRate * 100 : parsedRate
    }

    calculateCommissionByRate(amount, rate) {
        const totalAmount = parseFloat(amount)
        const normalizedAmount = Number.isFinite(totalAmount) ? totalAmount : 0
        const normalizedRate = this.normalizeRate(rate)
        return +(normalizedAmount * normalizedRate / 100).toFixed(2)
    }

    formatAmount(amount) {
        const normalizedAmount = parseFloat(amount)
        return (Number.isFinite(normalizedAmount) ? normalizedAmount : 0).toFixed(2)
    }

    async getOrderSpendLog(orderId, transaction = null) {
        if (!orderId) {
            return null
        }

        return MoneyLog.findOne({
            where: {
                order_id: orderId,
                type: 4
            },
            order: [['id', 'DESC']],
            transaction
        })
    }

    async resolveOrderSettlement(user, orderLike, transaction = null) {
        const total = parseFloat(orderLike?.order_price ?? orderLike?.total ?? 0)
        const commission = parseFloat(orderLike?.order_commission ?? orderLike?.commission ?? 0)
        const normalizedTotal = Number.isFinite(total) ? total : 0
        const normalizedCommission = Number.isFinite(commission) ? commission : 0
        const standardFreezeAmount = +(normalizedTotal + normalizedCommission).toFixed(8)
        const currentFrozen = parseFloat(user?.frozen_balance)
        const normalizedFrozen = Number.isFinite(currentFrozen) ? currentFrozen : 0
        const spendLog = await this.getOrderSpendLog(orderLike?.order_id, transaction)

        let settlementMode = 'preissued'
        if (spendLog?.status === 2) {
            settlementMode = 'deferred'
        } else if (normalizedFrozen + 1e-8 < standardFreezeAmount && normalizedFrozen + 1e-8 >= normalizedTotal) {
            settlementMode = 'legacy'
        }

        return {
            total: normalizedTotal,
            commission: normalizedCommission,
            freezeAmount: settlementMode === 'preissued' ? standardFreezeAmount : normalizedTotal,
            legacyMode: settlementMode === 'legacy',
            settlementMode,
            spendLog
        }
    }

    async markOrderSpendLogSettled(orderId, transaction = null) {
        if (!orderId) {
            return
        }

        await MoneyLog.update({
            status: 1
        }, {
            where: {
                order_id: orderId,
                type: 4,
                status: 2
            },
            transaction
        })
    }

    parsePercentConfig(value, fallback) {
        const parsed = parseFloat(value)
        if (!Number.isFinite(parsed)) {
            return fallback
        }

        return parsed
    }

    async getAutoOrderPricePercentConfig(transaction = null) {
        const rows = await Config.findAll({
            where: {
                key: {
                    [Op.in]: [AUTO_ORDER_PRICE_MIN_PERCENT_KEY, AUTO_ORDER_PRICE_MAX_PERCENT_KEY]
                }
            },
            transaction
        })

        const valueMap = Object.fromEntries(rows.map(row => [row.key, row.value]))
        let minPercent = this.parsePercentConfig(
            valueMap[AUTO_ORDER_PRICE_MIN_PERCENT_KEY],
            DEFAULT_AUTO_ORDER_PRICE_MIN_PERCENT
        )
        let maxPercent = this.parsePercentConfig(
            valueMap[AUTO_ORDER_PRICE_MAX_PERCENT_KEY],
            DEFAULT_AUTO_ORDER_PRICE_MAX_PERCENT
        )

        if (minPercent <= 0 || maxPercent <= 0 || minPercent > 100 || maxPercent > 100 || minPercent > maxPercent) {
            minPercent = DEFAULT_AUTO_ORDER_PRICE_MIN_PERCENT
            maxPercent = DEFAULT_AUTO_ORDER_PRICE_MAX_PERCENT
        }

        return { minPercent, maxPercent }
    }

    calcAutoOrderPriceRange(availableBalance, minPercent, maxPercent) {
        const balance = parseFloat(availableBalance)
        const normalizedBalance = Number.isFinite(balance) ? balance : 0
        const minPrice = +(normalizedBalance * minPercent / 100).toFixed(2)
        const maxPrice = +(normalizedBalance * maxPercent / 100).toFixed(2)

        return {
            minPrice: Math.min(minPrice, maxPrice),
            maxPrice: Math.max(minPrice, maxPrice)
        }
    }

    async selectProductInBalancePercentRange(availableBalance, usedProductIds = [], transaction = null) {
        const { minPercent, maxPercent } = await this.getAutoOrderPricePercentConfig(transaction)
        const { minPrice, maxPrice } = this.calcAutoOrderPriceRange(availableBalance, minPercent, maxPercent)

        if (!(maxPrice > 0) || minPrice > maxPrice) {
            return null
        }

        const availableWhere = {
            status: 1,
            price: {
                [Op.gte]: minPrice,
                [Op.lte]: maxPrice
            }
        }

        if (usedProductIds.length > 0) {
            availableWhere.id = { [Op.notIn]: usedProductIds }
        }

        const availableProducts = await Product.findAll({
            where: availableWhere,
            transaction
        })

        if (!availableProducts.length) {
            return null
        }

        const midPrice = (minPrice + maxPrice) / 2
        availableProducts.sort((a, b) => {
            const diffA = Math.abs(parseFloat(a.price) - midPrice)
            const diffB = Math.abs(parseFloat(b.price) - midPrice)
            return diffA - diffB
        })

        const topProducts = availableProducts.slice(0, Math.min(3, availableProducts.length))
        return topProducts[Math.floor(Math.random() * topProducts.length)]
    }

    async findAffordableProduct(balance, usedProductIds = [], transaction = null) {
        const normalizedBalance = parseFloat(balance)
        if (!Number.isFinite(normalizedBalance) || normalizedBalance <= 0) {
            return null
        }

        const availableWhere = {
            status: 1,
            price: { [Op.lte]: normalizedBalance }
        }

        if (usedProductIds.length > 0) {
            availableWhere.id = { [Op.notIn]: usedProductIds }
        }

        let product = await Product.findOne({
            where: availableWhere,
            order: [['price', 'DESC']],
            transaction
        })

        if (!product) {
            product = await Product.findOne({
                where: {
                    status: 1,
                    price: { [Op.lte]: normalizedBalance }
                },
                order: [['price', 'DESC']],
                transaction
            })
        }

        return product
    }

    getManualDispatchRate(vip) {
        if (!vip) {
            return 0
        }

        const cardRewardRate = this.normalizeRate(vip.card_reward_rate)
        if (cardRewardRate > 0) {
            return cardRewardRate
        }

        return this.normalizeRate(vip.reward_rate)
    }

    getAutoDispatchRate(vip) {
        if (!vip) {
            return 0
        }

        return this.normalizeRate(vip.reward_rate)
    }

    getOrderCommissionRate(orderLike) {
        const orderPrice = parseFloat(orderLike?.order_price ?? orderLike?.product_price ?? 0)
        const orderCommission = parseFloat(orderLike?.order_commission ?? orderLike?.commission ?? 0)
        if (!Number.isFinite(orderPrice) || orderPrice <= 0 || !Number.isFinite(orderCommission) || orderCommission < 0) {
            return 0
        }

        return +((orderCommission / orderPrice) * 100).toFixed(2)
    }

    isManualDispatchOrder(orderLike, vip) {
        const orderData = typeof orderLike?.toJSON === 'function' ? orderLike.toJSON() : (orderLike || {})
        if (Number(orderData?.is_lucky) === 1) {
            return false
        }

        const cardRewardRate = this.normalizeRate(vip?.card_reward_rate)
        if (cardRewardRate <= 0) {
            return false
        }

        const rewardRate = this.normalizeRate(vip?.reward_rate)
        const orderRate = this.getOrderCommissionRate(orderData)

        if (Math.abs(orderRate - cardRewardRate) > 0.01) {
            return false
        }

        return rewardRate <= 0 || Math.abs(orderRate - rewardRate) > 0.01
    }

    getDisplayRewardRate(orderLike, vip, fallbackRate = 0) {
        const orderData = typeof orderLike?.toJSON === 'function' ? orderLike.toJSON() : (orderLike || {})
        const defaultRewardRate = this.normalizeRate(vip?.reward_rate)
        const cardRewardRate = this.normalizeRate(vip?.card_reward_rate)
        const normalizedFallbackRate = this.normalizeRate(fallbackRate)
        const isLuckyOrder = Number(orderData?.is_lucky) === 1
        const isManualDispatchOrder = this.isManualDispatchOrder(orderData, vip)

        if (isLuckyOrder || isManualDispatchOrder) {
            if (cardRewardRate > 0) {
                return cardRewardRate
            }

            if (defaultRewardRate > 0) {
                return defaultRewardRate
            }
        } else if (defaultRewardRate > 0) {
            return defaultRewardRate
        }

        return normalizedFallbackRate
    }

    buildOrderPayload(order, product, options = {}) {
        if (!order) {
            return null
        }

        const { rewardRate, vip } = typeof options === 'object' && options !== null
            ? options
            : { rewardRate: options }
        const orderData = typeof order.toJSON === 'function' ? order.toJSON() : order
        const calculatedRewardRate = rewardRate !== undefined
            ? parseFloat(rewardRate || 0)
            : (() => {
                const orderPrice = parseFloat(orderData.order_price || orderData.product_price || 0)
                const orderCommission = parseFloat(orderData.order_commission || 0)
                if (!Number.isFinite(orderPrice) || orderPrice <= 0 || !Number.isFinite(orderCommission) || orderCommission <= 0) {
                    return 0
                }

                return +((orderCommission / orderPrice) * 100).toFixed(2)
            })()
        const displayRewardRate = this.getDisplayRewardRate(orderData, vip, calculatedRewardRate)
        const isManualDispatch = options?.manualDispatch === true || this.isManualDispatchOrder(orderData, vip)

        return {
            ...orderData,
            product_title: product?.product_title || orderData.product_title || '',
            product_pic: product?.product_pic || orderData.product_pic || '',
            product_info: product?.product_info || orderData.product_info || '',
            product_link: product?.product_link || orderData.product_link || '',
            reward_rate: calculatedRewardRate,
            card_reward_rate: this.normalizeRate(vip?.card_reward_rate),
            display_reward_rate: displayRewardRate,
            is_manual_dispatch: isManualDispatch ? 1 : 0,
            available_balance_after_completion: options?.availableBalanceAfterCompletion ?? null
        }
    }

    async getCurrentOrder(req) {
        const user = await User.findByPk(req.user.id, {
            include: [{ model: Vip, as: 'vip', required: false }]
        })
        if (!user) {
            throw new Error('用户不存在')
        }

        const currentOrder = await Order.findOne({
            where: {
                user_id: user.id,
                status: { [Op.in]: ACTIVE_FROZEN_ORDER_STATUSES }
            },
            order: [['id', 'DESC']]
        })

        if (!currentOrder) {
            return null
        }

        const product = await Product.findByPk(currentOrder.product_id)
        return this.buildOrderPayload(currentOrder, product, { vip: user.vip })
    }

    async createOrder(req) {
        const transaction = await sequelize.transaction()
        try {
            const user = await User.findByPk(req.user.id, {
                include: [{ model: Vip, as: 'vip', required: false }],
                transaction,
                lock: transaction.LOCK.UPDATE
            })
            if (!user) {
                throw new Error('用户不存在')
            }

            if (user.is_task == 0) {
                throw new Error('您已被禁止抢单')
            }

            const availableBalance = this.getAvailableBalance(user)
            if (availableBalance <= 0) {
                throw new Error('余额不足')
            }

            const taskForce = parseFloat(user.task_force)

            const unfinished = await Order.findOne({
                where: {
                    user_id: user.id,
                    status: { [Op.in]: ACTIVE_FROZEN_ORDER_STATUSES },
                    task_force: taskForce
                },
                transaction
            })
            if (unfinished) {
                throw new Error('您有未完成的订单')
            }

            const vip = user.vip
            if (!vip) {
                throw new Error('请先升级VIP等级')
            }

            const taskCount = vip.task_count

            const totalTasks = await Order.count({
                where: { user_id: user.id, task_force: taskForce },
                transaction
            })
            if (totalTasks >= taskCount) {
                throw new Error('订单数已达上限请联系客服重置')
            }

            const [userTask, orderCount] = await Promise.all([
                UserTask.findOne({ where: { user_id: user.id, status: 1 }, transaction }),
                Order.count({ where: { user_id: user.id, task_force: taskForce }, transaction })
            ])

            if (userTask) {
                let continuousOrders = []
                try {
                    continuousOrders = userTask.continuous_order ? JSON.parse(userTask.continuous_order) : []
                } catch {}
                if (Array.isArray(continuousOrders) && continuousOrders.length > 0) {
                    const idx = continuousOrders.findIndex(item => item.start_after == orderCount + 1)
                    if (idx !== -1) {
                        const orderData = continuousOrders[idx]
                        const lastOrder = await this._createOrder(user, vip, orderData, taskForce, {
                            isLucky: false,
                            allowOverAvailable: true,
                            manualDispatch: true,
                            transaction,
                            ip: req.ip
                        })
                        continuousOrders.splice(idx, 1)
                        await userTask.update({
                            continuous_order: continuousOrders.length === 0 ? null : JSON.stringify(continuousOrders),
                            status: continuousOrders.length === 0 ? 0 : 1
                        }, { transaction })
                        await transaction.commit()
                        return lastOrder
                    }
                }

                let luckyGroups = []
                try {
                    if (userTask.lucky_order) {
                        luckyGroups = JSON.parse(userTask.lucky_order)
                        if (luckyGroups.length > 0 && !Array.isArray(luckyGroups[0])) {
                            luckyGroups = [luckyGroups]
                        }
                    }
                } catch {}
                const luckyOrders = luckyGroups.flat()
                if (luckyOrders.length > 0) {
                    const idx = luckyOrders.findIndex(item => item.start_after == orderCount + 1)
                    if (idx !== -1) {
                        const orderData = luckyOrders[idx]
                        const order = await this._createOrder(user, vip, orderData, taskForce, {
                            isLucky: true,
                            allowOverAvailable: true,
                            transaction,
                            ip: req.ip
                        })
                        const newGroups = luckyGroups
                            .map(group => group.filter(item => item !== orderData))
                            .filter(g => g.length > 0)
                        await userTask.update({
                            lucky_order: newGroups.length === 0 ? '' : JSON.stringify(newGroups),
                            status: newGroups.length === 0 ? 0 : 1
                        }, { transaction })
                        await transaction.commit()
                        return order
                    }
                }
            }

            const usedProductIds = await Order.findAll({
                where: { user_id: user.id, task_force: taskForce },
                attributes: ['product_id'],
                transaction
            }).then(orders => orders.map(o => o.product_id))

            const finalProduct = await this.selectProductInBalancePercentRange(
                availableBalance,
                usedProductIds,
                transaction
            )

            if (!finalProduct) {
                throw new Error('暂无符合当前余额金额范围的商品')
            }

            const price = parseFloat(finalProduct.price)

            if (!Number.isFinite(price) || price > availableBalance) {
                throw new Error('当前余额不足以自动派单，请充值后重试')
            }

            const order = await this._createOrder(user, vip, {
                product_id: finalProduct.id,
                order_nums: 1,
                price
            }, taskForce, {
                transaction,
                ip: req.ip
            })

            await transaction.commit()
            return order
        } catch (error) {
            await transaction.rollback()
            throw error
        }
    }

    async _createOrder(user, vip, orderData, taskForce, options = {}) {
        const {
            isLucky = false,
            allowOverAvailable = false,
            manualDispatch = false,
            transaction,
            ip
        } = options

        if (!transaction) {
            throw new Error('创建订单缺少事务上下文')
        }

        const product = await Product.findByPk(orderData.product_id, { transaction })
        if (!product) {
            throw new Error('商品不存在')
        }

        let price, order_nums, total

        if (isLucky) {
            price = parseFloat(user.balance) + parseFloat(orderData.price)
            order_nums = 1
            total = +price.toFixed(2)
        } else {
            price = parseFloat(product.price)
            order_nums = parseInt(orderData.order_nums || 1)
            total = +(price * order_nums).toFixed(2)
        }

        const appliedRate = (manualDispatch || isLucky)
            ? this.getManualDispatchRate(vip)
            : this.getAutoDispatchRate(vip)
        const commission = this.calculateCommissionByRate(total, appliedRate)

        const order_id = await this._generateOrderId()

        const before = parseFloat(user.balance)
        const beforeFrozen = parseFloat(user.frozen_balance)
        const beforeAvailable = this.getAvailableBalance(user)
        const freezeAmount = total

        if (!Number.isFinite(total) || total <= 0) {
            throw new Error('商品金额不合法')
        }

        if (!allowOverAvailable && total > beforeAvailable) {
            if (manualDispatch) {
                throw new Error(`手动派单金额 ${this.formatAmount(total)} 超过当前可用余额 ${this.formatAmount(beforeAvailable)}，请等待客户充值至足够余额后再继续提交`)
            }

            throw new Error('当前可用余额不足以匹配该商品')
        }

        const after = before
        const afterFrozen = +(beforeFrozen + freezeAmount).toFixed(8)
        const afterAvailable = +(beforeAvailable - total).toFixed(8)

        const order = await Order.create({
            user_id: user.id,
            order_id,
            product_id: product.id,
            product_title: product.product_title,
            product_pic: product.product_pic,
            product_price: price,
            order_nums,
            order_price: total,
            order_commission: commission,
            task_force: taskForce,
            is_lucky: isLucky ? 1 : 0,
            status: 0
        }, { transaction })

        await user.update({ balance: after, frozen_balance: afterFrozen }, { transaction })

        await MoneyLog.createLog({
            user_id: user.id,
            type: 4,
            amount: -total,
            before_balance: beforeAvailable,
            after_balance: afterAvailable,
            remark: `创建订单 订单号{order_id} 金额{amount}`,
            order_id,
            status: 2,
            ip,
            transaction
        })

        return this.buildOrderPayload(order, product, {
            rewardRate: appliedRate,
            vip,
            manualDispatch
        })
    }

    async _generateOrderId() {
        let tryCount = 0
        while (tryCount <= 5) {
            const now = new Date()
            const dateStr = now.getFullYear().toString()
                + (now.getMonth() + 1).toString().padStart(2, '0')
                + now.getDate().toString().padStart(2, '0')
            const randomNum = Math.floor(Math.random() * 1000000).toString().padStart(6, '0')
            const order_id = 'MC' + dateStr + randomNum
            const exist = await Order.findOne({ where: { order_id } })
            if (!exist) return order_id
            tryCount++
        }
        throw new Error('订单号生成失败，请重试')
    }

    async submitOrder(req) {
        const transaction = await sequelize.transaction()
        try {
            const user = await User.findByPk(req.user.id, {
                transaction,
                lock: transaction.LOCK.UPDATE
            })
            if (!user) {
                throw new Error('用户不存在')
            }

            const { order_id } = req.body
            const order = await Order.findOne({
                where: { user_id: user.id, order_id, status: 0 },
                transaction,
                lock: transaction.LOCK.UPDATE
            })
            if (!order) {
                throw new Error('订单不存在或已处理')
            }

            if (user.is_task == 0) {
                throw new Error('您已被禁止抢单')
            }

            const settlement = await this.resolveOrderSettlement(user, order, transaction)
            const { total, commission, freezeAmount, legacyMode, settlementMode } = settlement
            const beforeFrozen = parseFloat(user.frozen_balance)
            const beforeBalance = parseFloat(user.balance)
            const beforeAvailable = this.getAvailableBalance(user)

            if (beforeAvailable < -1e-8) {
                throw new Error(`当前订单金额超出可用余额，请等待充值后再提交。当前还差 ${this.formatAmount(Math.abs(beforeAvailable))}`)
            }

            if (beforeFrozen < freezeAmount) {
                throw new Error('冻结金额不足')
            }

            const afterFrozen = +(beforeFrozen - freezeAmount).toFixed(8)
            const afterBalance = legacyMode
                ? +(beforeBalance + total + commission).toFixed(8)
                : settlementMode === 'deferred'
                    ? +(beforeBalance + commission).toFixed(8)
                    : beforeBalance
            const afterPrincipalBalance = legacyMode
                ? +(beforeBalance + total).toFixed(8)
                : +(beforeAvailable + total).toFixed(8)
            const afterCommissionBalance = legacyMode
                ? afterBalance
                : +(afterPrincipalBalance + commission).toFixed(8)

            await user.update({ frozen_balance: afterFrozen, balance: afterBalance }, { transaction })

            await MoneyLog.createLog({
                user_id: user.id,
                type: 5,
                amount: total,
                before_balance: legacyMode ? beforeBalance : beforeAvailable,
                after_balance: afterPrincipalBalance,
                remark: `订单返还本金 订单号{order_id}`,
                order_id: order.order_id,
                status: 1,
                ip: req.ip,
                transaction
            })

            await MoneyLog.createLog({
                user_id: user.id,
                type: 3,
                amount: commission,
                before_balance: afterPrincipalBalance,
                after_balance: afterCommissionBalance,
                remark: `订单佣金 订单号{order_id}`,
                order_id: order.order_id,
                status: 1,
                ip: req.ip,
                transaction
            })

            await this.markOrderSpendLogSettled(order.order_id, transaction)
            await this._distributeTeamCommission(user, commission, order.order_id, transaction)

            await order.update({ status: 1 }, { transaction })

            await transaction.commit()
            return null
        } catch (error) {
            await transaction.rollback()
            throw error
        }
    }

    async _distributeTeamCommission(user, commission, orderId, transaction) {
        const keys = ['comm_l1', 'comm_l2', 'comm_l3']
        const configs = await Promise.all(keys.map(key => Config.findOne({ where: { key } })))
        const rates = configs.map(cfg => cfg ? parseFloat(cfg.value) / 100 : 0)

        const parents = []
        let superiorId = user.superior_id
        while (superiorId && parents.length < 3) {
            const parent = await User.findByPk(superiorId)
            if (!parent) break
            parents.push(parent)
            superiorId = parent.superior_id
        }

        await Promise.all(parents.map((parent, i) => {
            const parentBefore = parseFloat(parent.balance)
            const teamCommission = +(commission * rates[i]).toFixed(2)
            const parentAfter = +(parentBefore + teamCommission).toFixed(8)
            return Promise.all([
                parent.update({ balance: parentAfter }, { transaction }),
                MoneyLog.createLog({
                    user_id: parent.id,
                    related_user_id: user.id,
                    type: 3,
                    amount: teamCommission,
                    before_balance: parentBefore,
                    after_balance: parentAfter,
                    remark: `下级订单佣金 订单号{order_id}`,
                    order_id: orderId,
                    status: 1,
                    transaction
                })
            ])
        }))
    }

    async getOrderStats(req) {
        const user = await User.findByPk(req.user.id, {
            include: [{ model: Vip, as: 'vip', required: false }]
        })
        if (!user) {
            throw new Error('用户不存在')
        }

        const vip = user.vip
        if (!vip) {
            throw new Error('请先升级VIP等级')
        }

        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const tomorrow = new Date(today)
        tomorrow.setDate(today.getDate() + 1)

        const todayEarnings = await MoneyLog.sum('amount', {
            where: {
                user_id: user.id,
                type: 3,
                status: 1,
                created_at: { [Op.gte]: today, [Op.lt]: tomorrow },
                [Op.or]: [
                    { related_user_id: null },
                    { related_user_id: 0 }
                ]
            }
        })

        const startTaskForce = Math.max(0, user.task_force - vip.daily_sets)

        const roundOrders = await Order.findAll({
            where: {
                user_id: user.id,
                status: 1,
                task_force: { [Op.gte]: startTaskForce, [Op.lte]: user.task_force },
                created_at: { [Op.gte]: today, [Op.lt]: tomorrow }
            }
        })
        const roundProfit = roundOrders.reduce((sum, o) => sum + parseFloat(o.order_commission), 0)

        const allOrders = await Order.findAll({
            where: { user_id: user.id, task_force: user.task_force, status: 1 }
        })
        const totalProfit = allOrders.reduce((sum, o) => sum + parseFloat(o.order_commission), 0)
        const released = allOrders.reduce((sum, o) => sum + parseFloat(o.order_price), 0)

        const pending = Math.max(0, parseFloat(user.frozen_balance) || 0)

        return {
            todayEarnings: parseFloat((todayEarnings || 0).toFixed(2)),
            roundProfit: parseFloat(roundProfit.toFixed(2)),
            totalProfit: parseFloat(totalProfit.toFixed(2)),
            released: parseFloat(released.toFixed(2)),
            pending: parseFloat(pending.toFixed(2)),
            completed_tasks: allOrders.length,
            current_round_earnings: parseFloat(roundProfit.toFixed(2)),
            task_total: vip.task_count,
            profit_rate: parseFloat(vip.reward_rate)
        }
    }

    async getOrderList(req) {
        const user = await User.findByPk(req.user.id)
        const { status, page = 1, limit = 20 } = req.query

        const where = { user_id: user.id }
        if (status !== undefined && status !== '' && status !== null) where.status = status

        const offset = (parseInt(page) - 1) * parseInt(limit)
        const { count, rows } = await Order.findAndCountAll({
            where,
            include: [{
                model: Product,
                as: 'product',
                required: false,
                attributes: ['id', 'product_title', 'product_info', 'product_pic', 'product_link']
            }],
            order: [['id', 'DESC']],
            limit: parseInt(limit),
            offset
        })

        const completedOrderIds = rows
            .filter(order => Number(order.status) === 1 && order.order_id)
            .map(order => order.order_id)

        const settlementLogs = completedOrderIds.length
            ? await MoneyLog.findAll({
                where: {
                    user_id: user.id,
                    type: 3,
                    order_id: { [Op.in]: completedOrderIds },
                    [Op.or]: [
                        { related_user_id: null },
                        { related_user_id: 0 }
                    ]
                },
                order: [['id', 'DESC']]
            })
            : []

        const settlementBalanceMap = settlementLogs.reduce((map, log) => {
            if (!log?.order_id || Object.prototype.hasOwnProperty.call(map, log.order_id)) {
                return map
            }

            map[log.order_id] = log.after_balance
            return map
        }, {})

        const data = rows.map(order => this.buildOrderPayload(order, order.product || null, {
            availableBalanceAfterCompletion: settlementBalanceMap[order.order_id] ?? null
        }))

        return {
            data,
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(count / parseInt(limit))
        }
    }
}

module.exports = new OrderService()
