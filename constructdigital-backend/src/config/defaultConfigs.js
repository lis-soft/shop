const DEFAULT_EVENT_CASHBACK_RULES = [
  { id: 1, type: 'Basic Member', deposit: 400, bonus: 150 },
  { id: 2, type: 'Basic Member', deposit: 400, bonus: 150 },
  { id: 3, type: 'Basic Member', deposit: 400, bonus: 150 },
  { id: 4, type: 'Basic Member', deposit: 400, bonus: 150 }
]

const DEFAULT_EVENT_CASHBACK_CONDITIONS = [
  'User accounts must meet the above requirements at the time of task reset in order to claim the reward.',
  'Each task set can only be rewarded once.',
  'Rewards cannot be claimed after the task has started.',
  'Please contact customer service to claim your reward.'
]

const DEFAULT_CHECKIN_REWARDS = [
  { id: 1, day: 7, amount: 500 },
  { id: 2, day: 14, amount: 800 }
]

const DEFAULT_CHECKIN_NOTICE = 'Complete daily check-ins on time to unlock milestone rewards.'
const DEFAULT_PARTNER_RANKINGS = [
  { id: 1, name: 'Apple', logo: '' },
  { id: 2, name: 'Microsoft', logo: '' },
  { id: 3, name: 'Amazon', logo: '' },
  { id: 4, name: 'Google', logo: '' },
  { id: 5, name: 'Samsung', logo: '' },
  { id: 6, name: 'Toyota', logo: '' },
  { id: 7, name: 'Coca-Cola', logo: '' }
]
const DEFAULT_PROCESS_SUMMARY_NOTICE = 'Welcome to the Process page. Please follow the task instructions carefully and complete the current step in time.'
const DEFAULT_ABOUT_AWARDS_IMAGES = []
const DEFAULT_HOME_BANNERS_PRIMARY = []
const DEFAULT_HOME_BANNERS = []
const DEFAULT_HOME_NOTICE = 'Welcome to our official platform. Stay tuned for the latest announcements and service updates.'
const DEFAULT_HOME_HERO_TITLE = 'WE TELL <span class="highlight-yellow">BRAND<br />STORIES</span> WITH<br />NUMBERS'
const DEFAULT_HOME_HERO_DESCRIPTION = "The tours featured throughout our website are intended to give you ideas for what's possible when you travel with us. Treat them simply as inspiration, because your trip will be created individually by one of our specialists to match your tastes and budget."
const DEFAULT_HOME_STORIES_TITLE = 'SUCCESS STORIES'
const DEFAULT_HOME_STORIES_BUTTON_TEXT = 'VIEW ALL'
const DEFAULT_HOME_CLIENTS_TITLE = 'Our Clients'
const DEFAULT_HOME_CLIENTS_DESCRIPTION = 'Maximising brand health and business outcomes for leading brands'
const DEFAULT_HOME_CLIENT_LOGOS = []
const DEFAULT_HOME_TESTIMONIAL_TEXT = 'It took Construct just 2 weeks to rank our keyword on the top spot; and just under3 months to get us a positive return on investment. These folks are on a different level when it comes to SEO!'
const DEFAULT_CONTACT_US_TITLE = "Let's Connect"
const DEFAULT_CONTACT_US_DESCRIPTION = 'If you have any inquiries, please contact our customer support team.'
const DEFAULT_CONTACT_US_BUTTON_TEXT = 'Contact Us'
const DEFAULT_CONTACT_US_HEAD_IMAGE = []
const DEFAULT_CONTACT_US_ICON_IMAGE = []
const DEFAULT_LANDING_GALLERY_IMAGES = []
const DEFAULT_LANDING_FEATURE_IMAGE = []
const DEFAULT_LANDING_BRAND_TITLE = 'WE TELL <span class="highlight-yellow">BRAND<br />STORIES</span> WITH<br />NUMBERS'
const DEFAULT_LANDING_BRAND_DESCRIPTION = "At Construct Digital, we're not just storytellers. We're masters of numbers-driven narratives. Like you, we know that success isn't abstract. It's measured in hard metrics like leads, sales and ROI."
const DEFAULT_LANDING_STORIES_TITLE = 'SUCCESS STORIES'
const DEFAULT_LANDING_STORIES_BUTTON_TEXT = 'VIEW ALL'
const DEFAULT_LANDING_STORY_CARDS = [
  { metric: '86%', caption: 'rise in applications', image: '' },
  { metric: '17 Million', caption: 'impressions from a KOL activation', image: '' },
  { metric: '138%', caption: 'spike in CXO engagement', image: '' },
  { metric: '3 Months', caption: 'to dominate SEO rankings', image: '' }
]
const DEFAULT_LANDING_CLIENTS_TITLE = 'OUR CLIENTS'
const DEFAULT_LANDING_CLIENTS_DESCRIPTION = 'Maximising brand health and business outcomes for leading brands'
const DEFAULT_LANDING_CLIENTS_LOGOS = []
const DEFAULT_LANDING_TESTIMONIAL_TEXT = 'It took Construct just 2 weeks to rank our keyword on the top spot; and just under 3 months to get us a positive return on investment. These folks are on a different level when it comes to SEO!'
const DEFAULT_LANDING_TESTIMONIAL_NAME = 'Sagar Khatri,'
const DEFAULT_LANDING_TESTIMONIAL_ROLE = 'CEO - Multiplier HR'
const DEFAULT_LANDING_TESTIMONIAL_BRAND = 'Multiplier'
const DEFAULT_LANDING_NAV_ITEMS = [
  { label: 'Work', link: '#work' },
  { label: 'About', link: '#about' },
  { label: 'Clients', link: '#clients' },
  { label: 'Contact', link: '#contact' }
]
const DEFAULT_LANDING_HERO_MEDIA_TYPE = 'video'
const DEFAULT_LANDING_HERO_VIDEO = ''
const DEFAULT_LANDING_HERO_POSTER = []
const DEFAULT_LANDING_STORY_IMAGES = []
const DEFAULT_LANDING_BRAND_BUTTON_TEXT = 'LEARN MORE'
const DEFAULT_LANDING_BRAND_BUTTON_LINK = '/about-us'
const DEFAULT_LANDING_CONTACT_TITLE = 'Get In Touch'
const DEFAULT_LANDING_CONTACT_BUTTON_TEXT = 'CONTACT US'
const DEFAULT_LANDING_CONTACT_BUTTON_LINK = '/contact-us'
const DEFAULT_LANDING_FOOTER_USEFUL_LINKS = [
  { label: 'Home', link: '/' },
  { label: 'About Us', link: '/about-us' },
  { label: 'FAQs', link: '/faqs' },
  { label: 'Contact Us', link: '/contact-us' }
]
const DEFAULT_LANDING_FOOTER_CAPABILITIES = [
  'UX, Creative & Content',
  'Marketing, Activation & Measurement',
  'Data and Technology Enablement',
  'AI and Automation'
]
const DEFAULT_LANDING_FOOTER_SOCIAL_LINKS = [
  { label: 'Fb', link: '' },
  { label: 'X', link: '' },
  { label: 'Ig', link: '' },
  { label: 'In', link: '' }
]
const DEFAULT_SITE_MAINTENANCE_ENABLED = false
const DEFAULT_SITE_MAINTENANCE_TITLE = 'Website Under Maintenance'
const DEFAULT_SITE_MAINTENANCE_MESSAGE = 'The website is currently under maintenance. Please check back later.'
const DEFAULT_SITE_MAINTENANCE_PAGE_CONTENT = '<h1>Website Under Maintenance</h1><p>The website is currently under maintenance. Please check back later.</p>'
const DEFAULT_CERTIFICATE_TITLE = 'Certificates'
const DEFAULT_CERTIFICATE_PAGE_CONTENT = '<h1 style="text-align:center;">Certificates</h1>'
const DEFAULT_CERTIFICATE_IMAGE = []
const DEFAULT_CERTIFICATE_TITLE_ALIGN = 'center'
const DEFAULT_CERTIFICATE_TITLE_MARGIN_TOP = 0
const DEFAULT_DESKTOP_FRAME_BACKGROUND_TYPE = 'none'
const DEFAULT_DESKTOP_FRAME_BACKGROUND_IMAGE = []
const DEFAULT_DESKTOP_FRAME_BACKGROUND_VIDEO = ''
const DEFAULT_PROCESS_REVIEW_QUESTIONS = [
  {
    question: 'How would you evaluate this brand?',
    answers: [
      'Excellent room and great service',
      'Very comfortable and worth recommending',
      'Clean room and smooth booking experience',
      'Great location and reasonable price',
      'Overall satisfied with this product'
    ]
  }
]
const DEFAULT_FAQ_ITEMS = [
  {
    question: 'How do I start a task?',
    answer: 'Open the Process page, review the assigned item, and submit the required answer to complete the current step.'
  },
  {
    question: 'Why can I not withdraw right now?',
    answer: 'Please confirm your account status, completed task requirements, and linked payout information. If the issue remains, contact customer support.'
  },
  {
    question: 'Where can I find my referral code?',
    answer: 'You can view your referral code in the profile drawer. Eligible members can copy and share it directly from there.'
  }
]
const DEFAULT_FAQ_PAGE_CONTENT = '<h1>Frequently Asked Questions (FAQ)</h1><hr><h2>1. How do I start a task?</h2><p>Open the Process page, review the assigned item, and submit the required answer to complete the current step.</p><hr><h2>2. Why can I not withdraw right now?</h2><p>Please confirm your account status, completed task requirements, and linked payout information. If the issue remains, contact customer support.</p><hr><h2>3. Where can I find my referral code?</h2><p>You can view your referral code in the profile drawer. Eligible members can copy and share it directly from there.</p>'
const DEFAULT_WEBSITE_TERMS = '<h2>Brand Evaluation Service Terms</h2><p>Last Updated: April 2025</p><p>These Brand Evaluation Service Terms ("Terms") govern the provision and use of brand evaluation services provided by Grey Group Pte. Ltd., a company incorporated in Singapore ("Evaluation Party", "Company", "we", "us").</p><p>By clicking "Agree," "Submit Request," or otherwise using the brand evaluation services, you ("Client" or "User") acknowledge that you have read, understood, and agree to be legally bound by these Terms.</p><h3>1. Acceptance of Terms</h3><p>Before submitting any evaluation request or receiving any evaluation report, you must carefully read and fully understand these Terms. Your continued use of the brand evaluation services constitutes your acceptance of these Terms.</p><h3>2. Service Content and Scope of Use</h3><p>Before submitting any evaluation request or receiving any evaluation report, you must carefully read and fully understand these Terms. Your continued use of the brand evaluation services constitutes your acceptance of these Terms.</p><h3>3. Client Obligations</h3><p>Before submitting any evaluation request or receiving any evaluation report, you must carefully read and fully understand these Terms. Your continued use of the brand evaluation services constitutes your acceptance of these Terms.</p>'

const WEBSITE_GROUP = 'website'
const WEBSITE_GROUP_DESCRIPTION = '网站配置'
const EVENT_GROUP = 'event'
const EVENT_GROUP_DESCRIPTION = '活动配置'
const CHECKIN_GROUP = 'checkin'
const CHECKIN_GROUP_DESCRIPTION = '签到配置'
const PARTNER_GROUP = 'partner'
const PARTNER_GROUP_DESCRIPTION = '合作商配置'
const ABOUT_GROUP = 'about'
const ABOUT_GROUP_DESCRIPTION = 'About Us配置'
const LANDING_GROUP = 'landing'
const LANDING_GROUP_DESCRIPTION = '落地页配置'
const MAINTENANCE_GROUP = 'maintenance'
const MAINTENANCE_GROUP_DESCRIPTION = '维护设置'
const PROCESS_REVIEW_GROUP = 'process_review'
const PROCESS_REVIEW_GROUP_DESCRIPTION = '流程题库配置'
const FAQ_GROUP = 'faq'
const FAQ_GROUP_DESCRIPTION = 'FAQ配置'
const ORDER_GROUP = 'order'
const ORDER_GROUP_DESCRIPTION = '刷单规则'
const DEFAULT_AUTO_ORDER_PRICE_MIN_PERCENT = '30'
const DEFAULT_AUTO_ORDER_PRICE_MAX_PERCENT = '80'
const LEGACY_EVENT_CONFIG_KEYS = [
  'event_recharge_cashback_rules',
  'event_recharge_cashback_conditions'
]
const OBSOLETE_CONFIG_KEYS = [
  ...LEGACY_EVENT_CONFIG_KEYS,
  'service_url',
  'website_latest_activity',
  'website_faq',
  'website_about_us',
  'scroll_title'
]

const DEFAULT_CONFIGS = [
  {
    key: 'home_banners_primary',
    value: JSON.stringify(DEFAULT_HOME_BANNERS_PRIMARY),
    type: 'images',
    group: WEBSITE_GROUP,
    group_description: WEBSITE_GROUP_DESCRIPTION,
    description: '首页轮播图1',
    is_active: true,
    sort: 10
  },
  {
    key: 'home_banners',
    value: JSON.stringify(DEFAULT_HOME_BANNERS),
    type: 'images',
    group: WEBSITE_GROUP,
    group_description: WEBSITE_GROUP_DESCRIPTION,
    description: '首页轮播图2',
    is_active: true,
    sort: 11
  },
  {
    key: 'home_notice',
    value: DEFAULT_HOME_NOTICE,
    type: 'text',
    group: WEBSITE_GROUP,
    group_description: WEBSITE_GROUP_DESCRIPTION,
    description: '首页顶部公告',
    is_active: true,
    sort: 12
  },
  {
    key: 'process_summary_notice',
    value: DEFAULT_PROCESS_SUMMARY_NOTICE,
    type: 'text',
    group: PROCESS_REVIEW_GROUP,
    group_description: PROCESS_REVIEW_GROUP_DESCRIPTION,
    description: '流程页顶部滚动公告',
    is_active: true,
    sort: 339
  },
  {
    key: 'website_terms',
    value: DEFAULT_WEBSITE_TERMS,
    type: 'text',
    group: WEBSITE_GROUP,
    group_description: WEBSITE_GROUP_DESCRIPTION,
    description: '服务条款内容',
    is_active: true,
    sort: 13
  },
  {
    key: 'home_hero_title',
    value: DEFAULT_HOME_HERO_TITLE,
    type: 'text',
    group: WEBSITE_GROUP,
    group_description: WEBSITE_GROUP_DESCRIPTION,
    description: '首页主标题',
    is_active: true,
    sort: 14
  },
  {
    key: 'home_hero_description',
    value: DEFAULT_HOME_HERO_DESCRIPTION,
    type: 'text',
    group: WEBSITE_GROUP,
    group_description: WEBSITE_GROUP_DESCRIPTION,
    description: '首页主描述',
    is_active: true,
    sort: 15
  },
  {
    key: 'home_stories_title',
    value: DEFAULT_HOME_STORIES_TITLE,
    type: 'string',
    group: WEBSITE_GROUP,
    group_description: WEBSITE_GROUP_DESCRIPTION,
    description: '首页案例标题',
    is_active: true,
    sort: 16
  },
  {
    key: 'home_stories_button_text',
    value: DEFAULT_HOME_STORIES_BUTTON_TEXT,
    type: 'string',
    group: WEBSITE_GROUP,
    group_description: WEBSITE_GROUP_DESCRIPTION,
    description: '首页案例按钮文案',
    is_active: true,
    sort: 17
  },
  {
    key: 'home_clients_title',
    value: DEFAULT_HOME_CLIENTS_TITLE,
    type: 'string',
    group: WEBSITE_GROUP,
    group_description: WEBSITE_GROUP_DESCRIPTION,
    description: '首页客户标题',
    is_active: true,
    sort: 18
  },
  {
    key: 'home_clients_description',
    value: DEFAULT_HOME_CLIENTS_DESCRIPTION,
    type: 'string',
    group: WEBSITE_GROUP,
    group_description: WEBSITE_GROUP_DESCRIPTION,
    description: '首页客户描述',
    is_active: true,
    sort: 19
  },
  {
    key: 'home_clients_logos',
    value: JSON.stringify(DEFAULT_HOME_CLIENT_LOGOS),
    type: 'images',
    group: WEBSITE_GROUP,
    group_description: WEBSITE_GROUP_DESCRIPTION,
    description: '首页客户Logo',
    is_active: true,
    sort: 20
  },
  {
    key: 'home_testimonial_text',
    value: DEFAULT_HOME_TESTIMONIAL_TEXT,
    type: 'text',
    group: WEBSITE_GROUP,
    group_description: WEBSITE_GROUP_DESCRIPTION,
    description: '首页评价文案',
    is_active: true,
    sort: 21
  },
  {
    key: 'contact_us_title',
    value: DEFAULT_CONTACT_US_TITLE,
    type: 'string',
    group: WEBSITE_GROUP,
    group_description: WEBSITE_GROUP_DESCRIPTION,
    description: '联系我们标题',
    is_active: true,
    sort: 22
  },
  {
    key: 'contact_us_description',
    value: DEFAULT_CONTACT_US_DESCRIPTION,
    type: 'text',
    group: WEBSITE_GROUP,
    group_description: WEBSITE_GROUP_DESCRIPTION,
    description: '联系我们描述',
    is_active: true,
    sort: 23
  },
  {
    key: 'contact_us_button_text',
    value: DEFAULT_CONTACT_US_BUTTON_TEXT,
    type: 'string',
    group: WEBSITE_GROUP,
    group_description: WEBSITE_GROUP_DESCRIPTION,
    description: '联系我们按钮文案',
    is_active: true,
    sort: 24
  },
  {
    key: 'contact_us_head_image',
    value: JSON.stringify(DEFAULT_CONTACT_US_HEAD_IMAGE),
    type: 'images',
    group: WEBSITE_GROUP,
    group_description: WEBSITE_GROUP_DESCRIPTION,
    description: '联系我们头图',
    is_active: true,
    sort: 25
  },
  {
    key: 'contact_us_icon_image',
    value: JSON.stringify(DEFAULT_CONTACT_US_ICON_IMAGE),
    type: 'images',
    group: WEBSITE_GROUP,
    group_description: WEBSITE_GROUP_DESCRIPTION,
    description: '联系我们图标',
    is_active: true,
    sort: 26
  },
  {
    key: 'landing_nav_items',
    value: JSON.stringify(DEFAULT_LANDING_NAV_ITEMS),
    type: 'json',
    group: LANDING_GROUP,
    group_description: LANDING_GROUP_DESCRIPTION,
    description: '顶部导航',
    is_active: true,
    sort: 300
  },
  {
    key: 'landing_hero_media_type',
    value: DEFAULT_LANDING_HERO_MEDIA_TYPE,
    type: 'string',
    group: LANDING_GROUP,
    group_description: LANDING_GROUP_DESCRIPTION,
    description: '首屏资源类型',
    is_active: true,
    sort: 300.05
  },
  {
    key: 'landing_hero_video',
    value: DEFAULT_LANDING_HERO_VIDEO,
    type: 'string',
    group: LANDING_GROUP,
    group_description: LANDING_GROUP_DESCRIPTION,
    description: '首屏视频',
    is_active: true,
    sort: 300.1
  },
  {
    key: 'landing_hero_poster',
    value: JSON.stringify(DEFAULT_LANDING_HERO_POSTER),
    type: 'images',
    group: LANDING_GROUP,
    group_description: LANDING_GROUP_DESCRIPTION,
    description: '首屏封面图',
    is_active: true,
    sort: 300.2
  },
  {
    key: 'landing_gallery_images',
    value: JSON.stringify(DEFAULT_LANDING_GALLERY_IMAGES),
    type: 'images',
    group: LANDING_GROUP,
    group_description: LANDING_GROUP_DESCRIPTION,
    description: '首屏轮播图',
    is_active: true,
    sort: 301
  },
  {
    key: 'landing_feature_image',
    value: JSON.stringify(DEFAULT_LANDING_FEATURE_IMAGE),
    type: 'images',
    group: LANDING_GROUP,
    group_description: LANDING_GROUP_DESCRIPTION,
    description: '首屏主视觉图',
    is_active: true,
    sort: 302
  },
  {
    key: 'landing_brand_title',
    value: DEFAULT_LANDING_BRAND_TITLE,
    type: 'text',
    group: LANDING_GROUP,
    group_description: LANDING_GROUP_DESCRIPTION,
    description: '品牌标题',
    is_active: true,
    sort: 303
  },
  {
    key: 'landing_brand_description',
    value: DEFAULT_LANDING_BRAND_DESCRIPTION,
    type: 'string',
    group: LANDING_GROUP,
    group_description: LANDING_GROUP_DESCRIPTION,
    description: '品牌描述',
    is_active: true,
    sort: 304
  },
  {
    key: 'landing_brand_button_text',
    value: DEFAULT_LANDING_BRAND_BUTTON_TEXT,
    type: 'string',
    group: LANDING_GROUP,
    group_description: LANDING_GROUP_DESCRIPTION,
    description: '品牌按钮文案',
    is_active: true,
    sort: 305
  },
  {
    key: 'landing_brand_button_link',
    value: DEFAULT_LANDING_BRAND_BUTTON_LINK,
    type: 'string',
    group: LANDING_GROUP,
    group_description: LANDING_GROUP_DESCRIPTION,
    description: '品牌按钮链接',
    is_active: true,
    sort: 306
  },
  {
    key: 'landing_stories_title',
    value: DEFAULT_LANDING_STORIES_TITLE,
    type: 'string',
    group: LANDING_GROUP,
    group_description: LANDING_GROUP_DESCRIPTION,
    description: '案例区标题',
    is_active: true,
    sort: 307
  },
  {
    key: 'landing_stories_button_text',
    value: DEFAULT_LANDING_STORIES_BUTTON_TEXT,
    type: 'string',
    group: LANDING_GROUP,
    group_description: LANDING_GROUP_DESCRIPTION,
    description: '案例区按钮文案',
    is_active: true,
    sort: 308
  },
  {
    key: 'landing_story_cards',
    value: JSON.stringify(DEFAULT_LANDING_STORY_CARDS),
    type: 'json',
    group: LANDING_GROUP,
    group_description: LANDING_GROUP_DESCRIPTION,
    description: '案例卡片配置',
    is_active: true,
    sort: 309
  },
  {
    key: 'landing_story_images',
    value: JSON.stringify(DEFAULT_LANDING_STORY_IMAGES),
    type: 'images',
    group: LANDING_GROUP,
    group_description: LANDING_GROUP_DESCRIPTION,
    description: '案例区4张图片',
    is_active: true,
    sort: 309.1
  },
  {
    key: 'landing_clients_title',
    value: DEFAULT_LANDING_CLIENTS_TITLE,
    type: 'string',
    group: LANDING_GROUP,
    group_description: LANDING_GROUP_DESCRIPTION,
    description: '客户区标题',
    is_active: true,
    sort: 310
  },
  {
    key: 'landing_clients_description',
    value: DEFAULT_LANDING_CLIENTS_DESCRIPTION,
    type: 'string',
    group: LANDING_GROUP,
    group_description: LANDING_GROUP_DESCRIPTION,
    description: '客户区描述',
    is_active: true,
    sort: 311
  },
  {
    key: 'landing_clients_logos',
    value: JSON.stringify(DEFAULT_LANDING_CLIENTS_LOGOS),
    type: 'images',
    group: LANDING_GROUP,
    group_description: LANDING_GROUP_DESCRIPTION,
    description: '客户区Logo',
    is_active: true,
    sort: 312
  },
  {
    key: 'landing_testimonial_text',
    value: DEFAULT_LANDING_TESTIMONIAL_TEXT,
    type: 'string',
    group: LANDING_GROUP,
    group_description: LANDING_GROUP_DESCRIPTION,
    description: '口碑文案',
    is_active: true,
    sort: 313
  },
  {
    key: 'landing_testimonial_name',
    value: DEFAULT_LANDING_TESTIMONIAL_NAME,
    type: 'string',
    group: LANDING_GROUP,
    group_description: LANDING_GROUP_DESCRIPTION,
    description: '口碑姓名',
    is_active: true,
    sort: 314
  },
  {
    key: 'landing_testimonial_role',
    value: DEFAULT_LANDING_TESTIMONIAL_ROLE,
    type: 'string',
    group: LANDING_GROUP,
    group_description: LANDING_GROUP_DESCRIPTION,
    description: '口碑职位',
    is_active: true,
    sort: 315
  },
  {
    key: 'landing_testimonial_brand',
    value: DEFAULT_LANDING_TESTIMONIAL_BRAND,
    type: 'string',
    group: LANDING_GROUP,
    group_description: LANDING_GROUP_DESCRIPTION,
    description: '口碑品牌名称',
    is_active: true,
    sort: 316
  },
  {
    key: 'landing_contact_title',
    value: DEFAULT_LANDING_CONTACT_TITLE,
    type: 'string',
    group: LANDING_GROUP,
    group_description: LANDING_GROUP_DESCRIPTION,
    description: '联系区标题',
    is_active: true,
    sort: 317
  },
  {
    key: 'landing_contact_button_text',
    value: DEFAULT_LANDING_CONTACT_BUTTON_TEXT,
    type: 'string',
    group: LANDING_GROUP,
    group_description: LANDING_GROUP_DESCRIPTION,
    description: '联系区按钮文案',
    is_active: true,
    sort: 318
  },
  {
    key: 'landing_contact_button_link',
    value: DEFAULT_LANDING_CONTACT_BUTTON_LINK,
    type: 'string',
    group: LANDING_GROUP,
    group_description: LANDING_GROUP_DESCRIPTION,
    description: '联系区按钮链接',
    is_active: true,
    sort: 319
  },
  {
    key: 'landing_footer_useful_links',
    value: JSON.stringify(DEFAULT_LANDING_FOOTER_USEFUL_LINKS),
    type: 'json',
    group: LANDING_GROUP,
    group_description: LANDING_GROUP_DESCRIPTION,
    description: '页脚常用链接',
    is_active: true,
    sort: 320
  },
  {
    key: 'landing_footer_capabilities',
    value: JSON.stringify(DEFAULT_LANDING_FOOTER_CAPABILITIES),
    type: 'json',
    group: LANDING_GROUP,
    group_description: LANDING_GROUP_DESCRIPTION,
    description: '页脚能力列表',
    is_active: true,
    sort: 321
  },
  {
    key: 'landing_footer_social_links',
    value: JSON.stringify(DEFAULT_LANDING_FOOTER_SOCIAL_LINKS),
    type: 'json',
    group: LANDING_GROUP,
    group_description: LANDING_GROUP_DESCRIPTION,
    description: '页脚社媒链接',
    is_active: true,
    sort: 322
  },
  {
    key: 'site_maintenance_enabled',
    value: DEFAULT_SITE_MAINTENANCE_ENABLED ? '1' : '0',
    type: 'boolean',
    group: MAINTENANCE_GROUP,
    group_description: MAINTENANCE_GROUP_DESCRIPTION,
    description: '网站维护模式',
    is_active: true,
    sort: 330
  },
  {
    key: 'site_maintenance_title',
    value: DEFAULT_SITE_MAINTENANCE_TITLE,
    type: 'string',
    group: MAINTENANCE_GROUP,
    group_description: MAINTENANCE_GROUP_DESCRIPTION,
    description: '维护页标题',
    is_active: true,
    sort: 331
  },
  {
    key: 'site_maintenance_message',
    value: DEFAULT_SITE_MAINTENANCE_MESSAGE,
    type: 'text',
    group: MAINTENANCE_GROUP,
    group_description: MAINTENANCE_GROUP_DESCRIPTION,
    description: '维护页说明',
    is_active: true,
    sort: 332
  },
  {
    key: 'site_maintenance_page_content',
    value: DEFAULT_SITE_MAINTENANCE_PAGE_CONTENT,
    type: 'text',
    group: MAINTENANCE_GROUP,
    group_description: MAINTENANCE_GROUP_DESCRIPTION,
    description: '维护页内容',
    is_active: true,
    sort: 333
  },
  {
    key: 'certificate_page_content',
    value: DEFAULT_CERTIFICATE_PAGE_CONTENT,
    type: 'text',
    group: WEBSITE_GROUP,
    group_description: WEBSITE_GROUP_DESCRIPTION,
    description: '证书页内容',
    is_active: true,
    sort: 28
  },
  {
    key: 'certificate_title',
    value: DEFAULT_CERTIFICATE_TITLE,
    type: 'string',
    group: WEBSITE_GROUP,
    group_description: WEBSITE_GROUP_DESCRIPTION,
    description: '证书页标题',
    is_active: true,
    sort: 28
  },
  {
    key: 'certificate_title_align',
    value: DEFAULT_CERTIFICATE_TITLE_ALIGN,
    type: 'string',
    group: WEBSITE_GROUP,
    group_description: WEBSITE_GROUP_DESCRIPTION,
    description: '证书页标题对齐方式（left/center/right）',
    is_active: true,
    sort: 29
  },
  {
    key: 'certificate_title_margin_top',
    value: String(DEFAULT_CERTIFICATE_TITLE_MARGIN_TOP),
    type: 'number',
    group: WEBSITE_GROUP,
    group_description: WEBSITE_GROUP_DESCRIPTION,
    description: '证书页标题顶部间距（rem）',
    is_active: true,
    sort: 30
  },
  {
    key: 'certificate_image',
    value: JSON.stringify(DEFAULT_CERTIFICATE_IMAGE),
    type: 'images',
    group: WEBSITE_GROUP,
    group_description: WEBSITE_GROUP_DESCRIPTION,
    description: '证书页图片',
    is_active: true,
    sort: 31
  },
  {
    key: 'desktop_frame_background_type',
    value: DEFAULT_DESKTOP_FRAME_BACKGROUND_TYPE,
    type: 'string',
    group: WEBSITE_GROUP,
    group_description: WEBSITE_GROUP_DESCRIPTION,
    description: 'PC兼容模式外围背景类型（none/image/video）',
    is_active: true,
    sort: 32
  },
  {
    key: 'desktop_frame_background_image',
    value: JSON.stringify(DEFAULT_DESKTOP_FRAME_BACKGROUND_IMAGE),
    type: 'images',
    group: WEBSITE_GROUP,
    group_description: WEBSITE_GROUP_DESCRIPTION,
    description: 'PC兼容模式外围背景图',
    is_active: true,
    sort: 33
  },
  {
    key: 'desktop_frame_background_video',
    value: DEFAULT_DESKTOP_FRAME_BACKGROUND_VIDEO,
    type: 'string',
    group: WEBSITE_GROUP,
    group_description: WEBSITE_GROUP_DESCRIPTION,
    description: 'PC兼容模式外围背景视频',
    is_active: true,
    sort: 34
  },
  {
    key: 'process_review_questions',
    value: JSON.stringify(DEFAULT_PROCESS_REVIEW_QUESTIONS),
    type: 'json',
    group: PROCESS_REVIEW_GROUP,
    group_description: PROCESS_REVIEW_GROUP_DESCRIPTION,
    description: '流程页Step2题目与答案配置',
    is_active: true,
    sort: 340
  },
  {
    key: 'faq_page_content',
    value: DEFAULT_FAQ_PAGE_CONTENT,
    type: 'text',
    group: FAQ_GROUP,
    group_description: FAQ_GROUP_DESCRIPTION,
    description: 'FAQ页面内容',
    is_active: true,
    sort: 349
  },
  {
    key: 'faq_items',
    value: JSON.stringify(DEFAULT_FAQ_ITEMS),
    type: 'json',
    group: FAQ_GROUP,
    group_description: FAQ_GROUP_DESCRIPTION,
    description: 'FAQ问题与答案配置',
    is_active: true,
    sort: 350
  },
  ...DEFAULT_EVENT_CASHBACK_RULES.flatMap((rule, index) => {
    const slot = index + 1
    const sortBase = 10 + index * 3

    return [
      {
        key: `event_recharge_cashback_${slot}_type`,
        value: String(rule.type),
        type: 'string',
        group: EVENT_GROUP,
        group_description: EVENT_GROUP_DESCRIPTION,
        description: `充值返现活动${slot}会员类型`,
        is_active: true,
        sort: sortBase
      },
      {
        key: `event_recharge_cashback_${slot}_deposit`,
        value: String(rule.deposit),
        type: 'number',
        group: EVENT_GROUP,
        group_description: EVENT_GROUP_DESCRIPTION,
        description: `充值返现活动${slot}充值金额`,
        is_active: true,
        sort: sortBase + 1
      },
      {
        key: `event_recharge_cashback_${slot}_bonus`,
        value: String(rule.bonus),
        type: 'number',
        group: EVENT_GROUP,
        group_description: EVENT_GROUP_DESCRIPTION,
        description: `充值返现活动${slot}返现金额`,
        is_active: true,
        sort: sortBase + 2
      }
    ]
  }),
  ...DEFAULT_EVENT_CASHBACK_CONDITIONS.map((condition, index) => ({
    key: `event_recharge_cashback_condition_${index + 1}`,
    value: condition,
    type: 'string',
    group: EVENT_GROUP,
    group_description: EVENT_GROUP_DESCRIPTION,
    description: `充值返现说明${index + 1}`,
    is_active: true,
    sort: 30 + index
  })),
  ...DEFAULT_CHECKIN_REWARDS.flatMap((reward, index) => {
    const slot = index + 1
    const sortBase = 110 + index * 2

    return [
      {
        key: `checkin_reward_${slot}_day`,
        value: String(reward.day),
        type: 'number',
        group: CHECKIN_GROUP,
        group_description: CHECKIN_GROUP_DESCRIPTION,
        description: `签到奖励${slot}连续天数`,
        is_active: true,
        sort: sortBase
      },
      {
        key: `checkin_reward_${slot}_amount`,
        value: String(reward.amount),
        type: 'number',
        group: CHECKIN_GROUP,
        group_description: CHECKIN_GROUP_DESCRIPTION,
        description: `签到奖励${slot}奖励金额`,
        is_active: true,
        sort: sortBase + 1
      }
    ]
  }),
  {
    key: 'checkin_notice',
    value: DEFAULT_CHECKIN_NOTICE,
    type: 'string',
    group: CHECKIN_GROUP,
    group_description: CHECKIN_GROUP_DESCRIPTION,
    description: '签到公告',
    is_active: true,
    sort: 130
  },
  {
    key: 'partner_rankings',
    value: JSON.stringify(DEFAULT_PARTNER_RANKINGS),
    type: 'json',
    group: PARTNER_GROUP,
    group_description: PARTNER_GROUP_DESCRIPTION,
    description: '合作商列表',
    is_active: true,
    sort: 210
  },
  {
    key: 'about_hero_title',
    value: 'CRAFTING <span class="highlight-yellow">RESULTS-</span><br /><span class="highlight-yellow">DRIVEN</span> SUCCESS',
    type: 'text',
    group: ABOUT_GROUP,
    group_description: ABOUT_GROUP_DESCRIPTION,
    description: 'Hero标题',
    is_active: true,
    sort: 310
  },
  {
    key: 'about_brand_title',
    value: 'WE DO MORE THAN TELL<br />BRAND STORIES - WE<br />QUANTIFY THEM',
    type: 'text',
    group: ABOUT_GROUP,
    group_description: ABOUT_GROUP_DESCRIPTION,
    description: '品牌故事标题',
    is_active: true,
    sort: 311
  },
  {
    key: 'about_brand_content',
    value: 'Every customer journey and every creative concept is grounded in meticulously researched data and analytics. Why? Because we know the most powerful brand stories are those backed by indisputable numbers. Success has always been measured in numbers - leads, conversions, ROI, impressions, clicks. The brands that win are the ones that can shift these metrics through authentic storytelling. But you cannot hit your targets blindly. Effective brand storytelling demands a deeper understanding of your audience and business goals from the outset.',
    type: 'text',
    group: ABOUT_GROUP,
    group_description: ABOUT_GROUP_DESCRIPTION,
    description: '品牌故事正文',
    is_active: true,
    sort: 312
  },
  {
    key: 'about_brand_button_text',
    value: 'GET IN TOUCH',
    type: 'string',
    group: ABOUT_GROUP,
    group_description: ABOUT_GROUP_DESCRIPTION,
    description: '品牌故事按钮文案',
    is_active: true,
    sort: 313
  },
  {
    key: 'about_brand_button_link',
    value: '/contact-us',
    type: 'string',
    group: ABOUT_GROUP,
    group_description: ABOUT_GROUP_DESCRIPTION,
    description: '品牌故事按钮链接',
    is_active: true,
    sort: 314
  },
  {
    key: 'about_approach_title',
    value: 'OUR APPR<br />OACH',
    type: 'text',
    group: ABOUT_GROUP,
    group_description: ABOUT_GROUP_DESCRIPTION,
    description: '方法论标题',
    is_active: true,
    sort: 315
  },
  {
    key: 'about_approach_content',
    value: '<p>We obsess over the numbers surrounding your customers preferences, behaviours, and motivations. Our strategists immerse themselves in your brand core metrics and KPIs. Only once we have mastered the numbers behind your goals do we unleash our creative storytellers.</p><p>Leveraging the power of creativity and technology, we help brands deliver real business growth. Our collaborative B2Human approach combines strategic thinking, compelling creative ideas and smart technologies.</p><p>The result? Data-driven narratives engineered for quantifiable impact. Every story we craft - whether through digital content, social campaigns, or immersive experiences - is designed to provoke tangible results. Because the power of our work is not just measured in clever copy or dazzling visuals. It is measured in the numbers you cannot argue with.</p>',
    type: 'text',
    group: ABOUT_GROUP,
    group_description: ABOUT_GROUP_DESCRIPTION,
    description: '方法论正文',
    is_active: true,
    sort: 316
  },
  {
    key: 'about_people_title',
    value: 'OUR PEOPLE',
    type: 'string',
    group: ABOUT_GROUP,
    group_description: ABOUT_GROUP_DESCRIPTION,
    description: '团队标题',
    is_active: true,
    sort: 317
  },
  {
    key: 'about_people_content',
    value: 'We are Construct Digital. We are creatives, tinkerers, scientists, engineers and inventors, all in the pursuit of what is next in marketing.',
    type: 'text',
    group: ABOUT_GROUP,
    group_description: ABOUT_GROUP_DESCRIPTION,
    description: '团队正文',
    is_active: true,
    sort: 318
  },
  {
    key: 'about_people_button_text',
    value: 'LEARN MORE',
    type: 'string',
    group: ABOUT_GROUP,
    group_description: ABOUT_GROUP_DESCRIPTION,
    description: '团队按钮文案',
    is_active: true,
    sort: 319
  },
  {
    key: 'about_people_button_link',
    value: '/contact-us',
    type: 'string',
    group: ABOUT_GROUP,
    group_description: ABOUT_GROUP_DESCRIPTION,
    description: '团队按钮链接',
    is_active: true,
    sort: 320
  },
  {
    key: 'about_awards_count',
    value: '45',
    type: 'string',
    group: ABOUT_GROUP,
    group_description: ABOUT_GROUP_DESCRIPTION,
    description: '奖项数字',
    is_active: true,
    sort: 321
  },
  {
    key: 'about_awards_title',
    value: 'AWARDS AND<br />COUNTING',
    type: 'text',
    group: ABOUT_GROUP,
    group_description: ABOUT_GROUP_DESCRIPTION,
    description: '奖项标题',
    is_active: true,
    sort: 322
  },
  {
    key: 'about_awards_content',
    value: 'We are continually recognised for our creativity and effectiveness when it comes to delivering on the metrics that matter. And each win is a win we proudly share with our clients.',
    type: 'text',
    group: ABOUT_GROUP,
    group_description: ABOUT_GROUP_DESCRIPTION,
    description: '奖项正文',
    is_active: true,
    sort: 323
  },
  {
    key: 'about_awards_images',
    value: JSON.stringify(DEFAULT_ABOUT_AWARDS_IMAGES),
    type: 'images',
    group: ABOUT_GROUP,
    group_description: ABOUT_GROUP_DESCRIPTION,
    description: '奖项轮播图片',
    is_active: true,
    sort: 324
  },
  {
    key: 'about_join_title',
    value: 'WANT TO JOIN THE<br />CONSTRUCT CREW?',
    type: 'text',
    group: ABOUT_GROUP,
    group_description: ABOUT_GROUP_DESCRIPTION,
    description: '加入我们标题',
    is_active: true,
    sort: 325
  },
  {
    key: 'about_join_button_text',
    value: 'LEARN MORE',
    type: 'string',
    group: ABOUT_GROUP,
    group_description: ABOUT_GROUP_DESCRIPTION,
    description: '加入我们按钮文案',
    is_active: true,
    sort: 326
  },
  {
    key: 'about_join_button_link',
    value: '/contact-us',
    type: 'string',
    group: ABOUT_GROUP,
    group_description: ABOUT_GROUP_DESCRIPTION,
    description: '加入我们按钮链接',
    is_active: true,
    sort: 327
  },
  {
    key: 'auto_order_price_min_percent',
    value: DEFAULT_AUTO_ORDER_PRICE_MIN_PERCENT,
    type: 'number',
    group: ORDER_GROUP,
    group_description: ORDER_GROUP_DESCRIPTION,
    description: '非卡单商品金额最低占比（占可用余额%）',
    is_active: true,
    sort: 10
  },
  {
    key: 'auto_order_price_max_percent',
    value: DEFAULT_AUTO_ORDER_PRICE_MAX_PERCENT,
    type: 'number',
    group: ORDER_GROUP,
    group_description: ORDER_GROUP_DESCRIPTION,
    description: '非卡单商品金额最高占比（占可用余额%）',
    is_active: true,
    sort: 11
  }
]

module.exports = {
  DEFAULT_CONFIGS,
  DEFAULT_EVENT_CASHBACK_RULES,
  DEFAULT_EVENT_CASHBACK_CONDITIONS,
  DEFAULT_CHECKIN_REWARDS,
  DEFAULT_CHECKIN_NOTICE,
  DEFAULT_PARTNER_RANKINGS,
  DEFAULT_ABOUT_AWARDS_IMAGES,
  DEFAULT_HOME_BANNERS_PRIMARY,
  DEFAULT_HOME_NOTICE,
  DEFAULT_PROCESS_SUMMARY_NOTICE,
  DEFAULT_SITE_MAINTENANCE_ENABLED,
  DEFAULT_SITE_MAINTENANCE_TITLE,
  DEFAULT_SITE_MAINTENANCE_MESSAGE,
  DEFAULT_SITE_MAINTENANCE_PAGE_CONTENT,
  DEFAULT_PROCESS_REVIEW_QUESTIONS,
  DEFAULT_FAQ_ITEMS,
  DEFAULT_FAQ_PAGE_CONTENT,
  DEFAULT_CERTIFICATE_PAGE_CONTENT,
  DEFAULT_AUTO_ORDER_PRICE_MIN_PERCENT,
  DEFAULT_AUTO_ORDER_PRICE_MAX_PERCENT,
  OBSOLETE_CONFIG_KEYS,
  LEGACY_EVENT_CONFIG_KEYS
}
