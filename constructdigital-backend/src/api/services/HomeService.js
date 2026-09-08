const BaseService = require('./BaseService')
const Config = require('@/admin/models/Config')
const Product = require('@/admin/models/Product')
const Vip = require('@/admin/models/Vip')
const sequelize = require('@/config/database')
const MoneyLog = require('@/admin/models/MoneyLog')
const Withdraw = require('@/admin/models/Withdraw')
const { Op } = require('sequelize')
const Wallet = require('@/admin/models/Wallet')
const {
  DEFAULT_CONFIGS,
  DEFAULT_EVENT_CASHBACK_RULES,
  DEFAULT_EVENT_CASHBACK_CONDITIONS,
  DEFAULT_PARTNER_RANKINGS,
  DEFAULT_ABOUT_AWARDS_IMAGES
} = require('@/config/defaultConfigs')

class HomeService extends BaseService {
  parseConfigValue(value, type) {
    if (value === null || value === undefined || value === '') {
      return value
    }

    switch (type) {
      case 'number':
        return Number(value)
      case 'boolean':
        return value === true || value === 'true' || value === '1' || value === 1
      case 'json':
        try {
          return JSON.parse(value)
        } catch {
          return value
        }
      case 'images':
        try {
          const parsed = JSON.parse(value)
          return Array.isArray(parsed) ? parsed.filter(Boolean) : []
        } catch {
          return value ? String(value).split(',').map(item => item.trim()).filter(Boolean) : []
        }
      default:
        return value
    }
  }

  async ensureDefaultConfigs() {
    for (const defaultConfig of DEFAULT_CONFIGS) {
      const [config, created] = await Config.findOrCreate({
        where: { key: defaultConfig.key },
        defaults: defaultConfig
      })

      if (!created && (config.value === null || config.value === undefined || config.value === '') && defaultConfig.value !== undefined && defaultConfig.value !== null && defaultConfig.value !== '') {
        await config.update({ value: defaultConfig.value })
      }
    }
  }

  async getMoneyLogs(req) {
    const { type, page = 1, limit = 20 } = req.query
    const offset = (parseInt(page) - 1) * parseInt(limit)
    
    const options = {
      where: { user_id: req.user.id },
      order: [['id', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    }
    
    if (type == 2) {
      const { count, rows } = await Withdraw.findAndCountAll(options)
      return {
        data: rows,
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit))
      }
    }
    
    const where = type ? { ...options.where, type } : options.where
    const { count, rows } = await MoneyLog.findAndCountAll({ ...options, where })
    
    return {
      data: rows,
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / parseInt(limit))
    }
  }

  async getRandomProducts(req) {
    const availableIds = [4, 7, 8, 84, 6, 9, 1, 3, 97, 2, 90, 85, 5, 10, 31, 73, 34, 68, 16, 58, 70, 35, 60, 54, 66, 55, 67, 69, 71, 72, 87, 86, 57, 65, 22, 88, 59]
    
    const shuffledIds = availableIds.sort(() => Math.random() - 0.5)
    const selectedIds = shuffledIds.slice(0, 10)
    
    const products = await Product.findAll({
      where: { 
        status: 1,
        id: { [Op.in]: selectedIds }
      },
      attributes: ['id', 'product_title', 'product_info', 'product_pic', 'product_link', 'price', 'commission'],
      order: sequelize.random()
    })
    
    return products
  }

  async getVipLevels(req) {
    const vipLevels = await Vip.findAll({
      where: { status: 1 },
      attributes: ['id', 'vip_level', 'vip_name', 'vip_image', 'balance_limit', 'daily_sets', 'task_count', 'reward_rate', 'card_reward_rate', 'min_salary'],
      order: [['vip_level', 'ASC']]
    })
    
    return vipLevels
  }

  async getEventConfig(req) {
    await this.ensureDefaultConfigs()

    const configKeys = [
      ...Array.from({ length: 4 }, (_, index) => ([
        `event_recharge_cashback_${index + 1}_type`,
        `event_recharge_cashback_${index + 1}_deposit`,
        `event_recharge_cashback_${index + 1}_bonus`
      ])).flat(),
      ...Array.from({ length: 4 }, (_, index) => `event_recharge_cashback_condition_${index + 1}`)
    ]

    const configs = await Config.findAll({
      where: {
        key: configKeys,
        is_active: true
      },
      attributes: ['key', 'value']
    })

    const configMap = {}
    configs.forEach(config => {
      configMap[config.key] = config.value
    })

    const events = DEFAULT_EVENT_CASHBACK_RULES.map((defaultRule, index) => ({
      id: index + 1,
      type: configMap[`event_recharge_cashback_${index + 1}_type`] || defaultRule.type,
      deposit: String(configMap[`event_recharge_cashback_${index + 1}_deposit`] ?? defaultRule.deposit),
      bonus: String(configMap[`event_recharge_cashback_${index + 1}_bonus`] ?? defaultRule.bonus)
    }))

    const conditions = DEFAULT_EVENT_CASHBACK_CONDITIONS.map((defaultCondition, index) =>
      configMap[`event_recharge_cashback_condition_${index + 1}`] || defaultCondition
    )

    return {
      events,
      conditions
    }
  }

  async getPartnerConfig(req) {
    await this.ensureDefaultConfigs()

    const config = await Config.findOne({
      where: {
        key: 'partner_rankings',
        is_active: true
      },
      attributes: ['value']
    })

    let partners = DEFAULT_PARTNER_RANKINGS

    if (config?.value) {
      try {
        const parsed = JSON.parse(config.value)
        if (Array.isArray(parsed)) {
          partners = parsed
        }
      } catch {
        partners = DEFAULT_PARTNER_RANKINGS
      }
    }

    return partners
      .filter(item => item && typeof item === 'object')
      .map((item, index) => ({
        id: item.id || index + 1,
        name: String(item.name || '').trim(),
        logo: String(item.logo || '').trim()
      }))
      .filter(item => item.name || item.logo)
  }

  async getAboutConfig(req) {
    await this.ensureDefaultConfigs()

    const configKeys = [
      'about_hero_title',
      'about_brand_title',
      'about_brand_content',
      'about_brand_button_text',
      'about_brand_button_link',
      'about_approach_title',
      'about_approach_content',
      'about_people_title',
      'about_people_content',
      'about_people_button_text',
      'about_people_button_link',
      'about_awards_count',
      'about_awards_title',
      'about_awards_content',
      'about_awards_images',
      'about_join_title',
      'about_join_button_text',
      'about_join_button_link'
    ]

    const configs = await Config.findAll({
      where: {
        key: configKeys,
        is_active: true
      },
      attributes: ['key', 'value']
    })

    const configMap = {}
    configs.forEach(config => {
      configMap[config.key] = config.value
    })

    let awardsImages = DEFAULT_ABOUT_AWARDS_IMAGES
    if (configMap.about_awards_images) {
      try {
        const parsed = JSON.parse(configMap.about_awards_images)
        awardsImages = Array.isArray(parsed) ? parsed.filter(Boolean) : DEFAULT_ABOUT_AWARDS_IMAGES
      } catch {
        awardsImages = DEFAULT_ABOUT_AWARDS_IMAGES
      }
    }

    return {
      heroTitle: configMap.about_hero_title || '',
      brandTitle: configMap.about_brand_title || '',
      brandContent: configMap.about_brand_content || '',
      brandButtonText: configMap.about_brand_button_text || '',
      brandButtonLink: configMap.about_brand_button_link || '',
      approachTitle: configMap.about_approach_title || '',
      approachContent: configMap.about_approach_content || '',
      peopleTitle: configMap.about_people_title || '',
      peopleContent: configMap.about_people_content || '',
      peopleButtonText: configMap.about_people_button_text || '',
      peopleButtonLink: configMap.about_people_button_link || '',
      awardsCount: configMap.about_awards_count || '',
      awardsTitle: configMap.about_awards_title || '',
      awardsContent: configMap.about_awards_content || '',
      awardsImages,
      joinTitle: configMap.about_join_title || '',
      joinButtonText: configMap.about_join_button_text || '',
      joinButtonLink: configMap.about_join_button_link || ''
    }
  }

  async getWebsiteConfig(req) {
    await this.ensureDefaultConfigs()
    const eventRuleKeys = Array.from({ length: 4 }, (_, index) => ([
      `event_recharge_cashback_${index + 1}_type`,
      `event_recharge_cashback_${index + 1}_deposit`,
      `event_recharge_cashback_${index + 1}_bonus`
    ])).flat()
    const eventConditionKeys = Array.from({ length: 4 }, (_, index) => `event_recharge_cashback_condition_${index + 1}`)
    const configKeys = [
      'home_banners_primary',
      'home_banners',
      'home_notice',
      'home_hero_title',
      'home_hero_description',
      'home_stories_title',
      'home_stories_button_text',
      'home_clients_title',
      'home_clients_description',
      'home_clients_logos',
      'home_testimonial_text',
      'contact_us_title',
      'contact_us_description',
      'contact_us_button_text',
      'contact_us_head_image',
      'contact_us_icon_image',
      'landing_nav_items',
      'landing_hero_media_type',
      'landing_hero_video',
      'landing_hero_poster',
      'landing_gallery_images',
      'landing_feature_image',
      'landing_brand_title',
      'landing_brand_description',
      'landing_brand_button_text',
      'landing_brand_button_link',
      'landing_stories_title',
      'landing_stories_button_text',
      'landing_story_cards',
      'landing_story_images',
      'landing_clients_title',
      'landing_clients_description',
      'landing_clients_logos',
      'landing_testimonial_text',
      'landing_testimonial_name',
      'landing_testimonial_role',
      'landing_testimonial_brand',
      'landing_contact_title',
      'landing_contact_button_text',
      'landing_contact_button_link',
      'landing_footer_useful_links',
      'landing_footer_capabilities',
      'landing_footer_social_links',
      'site_maintenance_enabled',
      'site_maintenance_title',
      'site_maintenance_message',
      'site_maintenance_page_content',
      'certificate_page_content',
      'certificate_title',
      'certificate_title_align',
      'certificate_title_margin_top',
      'certificate_image',
      'desktop_frame_background_type',
      'desktop_frame_background_image',
      'desktop_frame_background_video',
      'process_summary_notice',
      'process_notice',
      'process_review_questions',
      'faq_page_content',
      'faq_items',
      'website_terms',
      ...eventRuleKeys,
      ...eventConditionKeys
    ]
    
    const configs = await Config.findAll({
      where: { 
        key: configKeys,
        is_active: true 
      },
      attributes: ['key', 'value', 'type'],
      order: [['sort', 'ASC']]
    })
    
    const websiteConfig = {}
    configs.forEach(config => {
      websiteConfig[config.key] = this.parseConfigValue(config.value, config.type)
    })
    
    return websiteConfig
  }
}

module.exports = new HomeService() 
