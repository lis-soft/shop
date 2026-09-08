<script setup>
import {onBeforeUnmount, onMounted, ref} from 'vue'
import {useRouter} from 'vue-router'
import LandingHeader from '@/components/landing/LandingHeader.vue'
import LandingHeroStage from '@/components/landing/LandingHeroStage.vue'
import LandingBrandSection from '@/components/landing/LandingBrandSection.vue'
import LandingStoriesSection from '@/components/landing/LandingStoriesSection.vue'
import LandingClientsSection from '@/components/landing/LandingClientsSection.vue'
import LandingTestimonialSection from '@/components/landing/LandingTestimonialSection.vue'
import LandingContactStrip from '@/components/landing/LandingContactStrip.vue'
import LandingFooter from '@/components/landing/LandingFooter.vue'
import LandingScrollTopButton from '@/components/landing/LandingScrollTopButton.vue'
import {request} from '@/utils/request'
import {resolveFileUrl} from '@/utils/currentUser'
import fallbackFeatureImage from '@/assets/hero.png'
import fallbackGalleryImage from '@/assets/static/img/home/Rectangle 462.png'
import fallbackStoryImage from '@/assets/static/img/home/image 102.png'

const router = useRouter()
const showScrollTop = ref(false)

const defaultNavItems = []

const defaultFooterUsefulLinks = [
  {label: 'Home', link: '/'},
  {label: 'About Us', link: '/about-us'},
  {label: 'FAQs', link: '/faqs'},
  {label: 'Contact Us', link: '/contact-us'}
]

const defaultFooterCapabilities = [
  'UX, Creative & Content',
  'Marketing, Activation & Measurement',
  'Data and Technology Enablement',
  'AI and Automation'
]

const defaultFooterSocialLinks = []

const defaultConfig = {
  navItems: defaultNavItems,
  galleryImages: [fallbackGalleryImage],
  featureImage: fallbackFeatureImage,
  brandTitle: 'WE TELL <span class="highlight-yellow">BRAND<br />STORIES</span> WITH<br />NUMBERS',
  brandDescription: "At Construct Digital, we're not just storytellers. We're masters of numbers-driven narratives. Like you, we know that success isn't abstract. It's measured in hard metrics like leads, sales and ROI.",
  brandButtonText: 'LEARN MORE',
  brandButtonLink: '/about-us',
  storiesTitle: 'SUCCESS STORIES',
  storiesButtonText: 'VIEW ALL',
  storyCards: [
    {metric: '86%', caption: 'rise in applications', image: fallbackStoryImage},
    {metric: '17 Million', caption: 'impressions from a KOL activation', image: fallbackStoryImage},
    {metric: '138%', caption: 'spike in CXO engagement', image: fallbackStoryImage},
    {metric: '3 Months', caption: 'to dominate SEO rankings', image: fallbackStoryImage}
  ],
  clientsTitle: 'OUR CLIENTS',
  clientsDescription: 'Maximising brand health and business outcomes for leading brands',
  clientLogos: [],
  testimonialText: 'It took Construct just 2 weeks to rank our keyword on the top spot; and just under 3 months to get us a positive return on investment. These folks are on a different level when it comes to SEO!',
  testimonialName: 'Sagar Khatri,',
  testimonialRole: 'CEO - Multiplier HR',
  testimonialBrand: 'Multiplier',
  contactTitle: 'Get In Touch',
  contactButtonText: 'CONTACT US',
  contactButtonLink: '/contact-us',
  usefulLinks: defaultFooterUsefulLinks,
  capabilities: defaultFooterCapabilities,
  socialLinks: defaultFooterSocialLinks,
  copyrightText: '@ 2015 Construct Digital International Pte. Ltd.'
}

const landingConfig = ref({...defaultConfig})

function normalizeImageList(value) {
  if (Array.isArray(value)) {
    return value.map(item => resolveFileUrl(item)).filter(Boolean)
  }

  if (typeof value === 'string' && value.trim()) {
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? parsed.map(item => resolveFileUrl(item)).filter(Boolean) : []
    } catch {
      return value.split(',').map(item => resolveFileUrl(item.trim())).filter(Boolean)
    }
  }

  return []
}

function normalizeText(value, fallback = '') {
  const text = String(value || '').trim()
  return text || fallback
}

function normalizeLinkList(value, fallback = []) {
  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value
    if (!Array.isArray(parsed)) {
      return fallback
    }

    const items = parsed
        .filter(item => item && typeof item === 'object')
        .map(item => ({
          label: normalizeText(item.label),
          link: normalizeText(item.link)
        }))
        .filter(item => item.label)

    return items.length ? items : fallback
  } catch {
    return fallback
  }
}

function normalizeStringList(value, fallback = []) {
  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value
    if (!Array.isArray(parsed)) {
      return fallback
    }

    const items = parsed.map(item => normalizeText(item)).filter(Boolean)
    return items.length ? items : fallback
  } catch {
    return fallback
  }
}

function normalizeStoryCards(value) {
  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value
    if (!Array.isArray(parsed)) {
      return defaultConfig.storyCards
    }

    const items = parsed
        .filter(item => item && typeof item === 'object')
        .map(item => ({
          metric: normalizeText(item.metric),
          caption: normalizeText(item.caption),
          image: resolveFileUrl(item.image) || fallbackStoryImage
        }))
        .filter(item => item.metric || item.caption || item.image)

    return items.length ? items : defaultConfig.storyCards
  } catch {
    return defaultConfig.storyCards
  }
}

function buildHeroGalleryCards(images) {
  return images.slice(0, 6).map((image, index) => ({
    className: `gallery-card gallery-card-${index + 1}`,
    image,
    label: `Highlight ${String(index + 1).padStart(2, '0')}`
  }))
}

async function fetchLandingConfig() {
  try {
    const result = await request('/api/home/websiteConfig')
    const payload = result?.data || {}
    const galleryImages = normalizeImageList(payload.landing_gallery_images)
    const featureImages = normalizeImageList(payload.landing_feature_image)
    const clientLogos = normalizeImageList(payload.landing_clients_logos)

    landingConfig.value = {
      navItems: [],
      galleryImages: galleryImages.length ? galleryImages : [fallbackGalleryImage],
      featureImage: featureImages[0] || fallbackFeatureImage,
      brandTitle: normalizeText(payload.landing_brand_title, defaultConfig.brandTitle),
      brandDescription: normalizeText(payload.landing_brand_description, defaultConfig.brandDescription),
      brandButtonText: normalizeText(payload.landing_brand_button_text, defaultConfig.brandButtonText),
      brandButtonLink: normalizeText(payload.landing_brand_button_link, defaultConfig.brandButtonLink),
      storiesTitle: normalizeText(payload.landing_stories_title, defaultConfig.storiesTitle),
      storiesButtonText: normalizeText(payload.landing_stories_button_text, defaultConfig.storiesButtonText),
      storyCards: normalizeStoryCards(payload.landing_story_cards),
      clientsTitle: normalizeText(payload.landing_clients_title, defaultConfig.clientsTitle),
      clientsDescription: normalizeText(payload.landing_clients_description, defaultConfig.clientsDescription),
      clientLogos,
      testimonialText: normalizeText(payload.landing_testimonial_text, defaultConfig.testimonialText),
      testimonialName: normalizeText(payload.landing_testimonial_name, defaultConfig.testimonialName),
      testimonialRole: normalizeText(payload.landing_testimonial_role, defaultConfig.testimonialRole),
      testimonialBrand: normalizeText(payload.landing_testimonial_brand, defaultConfig.testimonialBrand),
      contactTitle: normalizeText(payload.landing_contact_title, defaultConfig.contactTitle),
      contactButtonText: normalizeText(payload.landing_contact_button_text, defaultConfig.contactButtonText),
      contactButtonLink: normalizeText(payload.landing_contact_button_link, defaultConfig.contactButtonLink),
      usefulLinks: normalizeLinkList(payload.landing_footer_useful_links, defaultFooterUsefulLinks),
      capabilities: normalizeStringList(payload.landing_footer_capabilities, defaultFooterCapabilities),
      socialLinks: normalizeLinkList(payload.landing_footer_social_links, defaultFooterSocialLinks),
      copyrightText: defaultConfig.copyrightText
    }
  } catch {
    landingConfig.value = {...defaultConfig}
  }
}

function handleScroll() {
  showScrollTop.value = window.scrollY > 360
}

function scrollToTop() {
  window.scrollTo({top: 0, behavior: 'smooth'})
}

function scrollToAnchor(target) {
  const element = document.querySelector(target)
  if (!element) {
    return
  }

  element.scrollIntoView({behavior: 'smooth', block: 'start'})
}

function navigateToLink(item) {
  const link = normalizeText(item?.link)

  if (!link) {
    return
  }

  if (link.startsWith('#')) {
    scrollToAnchor(link)
    return
  }

  if (/^(https?:)?\/\//i.test(link)) {
    window.open(link, '_blank', 'noopener')
    return
  }

  router.push(link)
}

onMounted(() => {
  fetchLandingConfig()
  handleScroll()
  window.addEventListener('scroll', handleScroll, {passive: true})
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <main class="landing-page">
    <LandingHeader :nav-items="landingConfig.navItems" @navigate="navigateToLink"/>
    <LandingHeroStage
        :hero-gallery-cards="buildHeroGalleryCards(landingConfig.galleryImages)"
        :hero-image="landingConfig.featureImage"
    />
    <LandingBrandSection
        :title="landingConfig.brandTitle"
        :description="landingConfig.brandDescription"
        :button-text="landingConfig.brandButtonText"
        @learn-more="navigateToLink({ link: landingConfig.brandButtonLink })"
    />
    <LandingStoriesSection
        :title="landingConfig.storiesTitle"
        :button-text="landingConfig.storiesButtonText"
        :cards="landingConfig.storyCards"
        @view-all="scrollToAnchor('#clients')"
    />
    <LandingClientsSection
        :title="landingConfig.clientsTitle"
        :description="landingConfig.clientsDescription"
        :logos="landingConfig.clientLogos"
    />
    <LandingTestimonialSection
        :text="landingConfig.testimonialText"
        :name="landingConfig.testimonialName"
        :role="landingConfig.testimonialRole"
        :brand="landingConfig.testimonialBrand"
    />
    <LandingContactStrip
      :title="landingConfig.contactTitle"
      :button-text="landingConfig.contactButtonText"
      @contact="navigateToLink({ link: landingConfig.contactButtonLink })"
    />
    <LandingFooter
        :useful-links="landingConfig.usefulLinks"
        :capabilities="landingConfig.capabilities"
        :social-links="landingConfig.socialLinks"
        :copyright-text="landingConfig.copyrightText"
        @navigate="navigateToLink"
    />
    <LandingScrollTopButton :visible="showScrollTop" @click="scrollToTop"/>
  </main>
</template>

<style scoped>
.landing-page {
  min-height: 100vh;
  background: radial-gradient(circle at top, rgba(30, 64, 175, 0.08), transparent 26%),
  linear-gradient(180deg, #f8fafc, #eef2ff 18%, #ffffff 42%);
}

:deep(#work),
:deep(#about),
:deep(#clients),
:deep(#contact) {
  scroll-margin-top: 110px;
}
</style>
