<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { request } from '@/utils/request'
import { resolveFileUrl } from '@/utils/currentUser'
import processVideo from '@/assets/static/video/process.mp4'
import successStoryImage1 from '@/assets/static/img/home/image 102.png'
import successStoryImage2 from '@/assets/static/img/home/image 103.png'
import successStoryImage3 from '@/assets/static/img/home/image 104.png'
import successStoryImage4 from '@/assets/static/img/home/image 105.png'
import multiplierTestimonialImage from '@/assets/static/img/landing/multiplier-testimonial.png'

const router = useRouter()
const route = useRoute()
const pageRef = ref(null)
const videoRef = ref(null)
const isVideoLoading = ref(true)
const isFloatingHeaderVisible = ref(false)
const isMobileMenuOpen = ref(false)
const heroMediaType = ref('video')
const heroCarouselImages = ref([])
const heroCarouselIndex = ref(0)
let lastScrollY = 0
let heroCarouselTimer = null
let hasTriedDefaultHeroVideo = false

const defaultNavigationItems = []

const defaultSuccessStories = [
    {
        badge: 'NUS',
        badgeClass: 'badge-nus',
        metric: '86%',
        caption: 'rise in applications',
        image: successStoryImage1
    },
    {
        badge: 'AIA GLOW',
        badgeClass: 'badge-aia',
        metric: '17 Million',
        caption: 'impressions from a KOL activation',
        image: successStoryImage2
    },
    {
        badge: 'SAP',
        badgeClass: 'badge-sap',
        metric: '138%',
        caption: 'spike in CXO engagement',
        image: successStoryImage3
    },
    {
        badge: 'Multiplier',
        badgeClass: 'badge-multiplier',
        metric: '3 Months',
        caption: 'to dominate SEO rankings',
        image: successStoryImage4
    }
]

const defaultClientLogos = [
    { label: 'BMW', className: 'client-logo--bmw' },
    { label: 'AMERICAN EXPRESS', className: 'client-logo--amex' },
    { label: 'STARBUCKS', className: 'client-logo--starbucks' },
    { label: 'TUV SUD', className: 'client-logo--tuv' },
    { label: 'NUS', className: 'client-logo--nus' },
    { label: 'SGX', className: 'client-logo--sgx' },
    { label: 'BHP', className: 'client-logo--bhp' },
    { label: 'SAP', className: 'client-logo--sap' },
    { label: 'ST Engineering', className: 'client-logo--st' },
    { label: 'NESPRESSO', className: 'client-logo--nespresso' },
    { label: 'PRUDENTIAL', className: 'client-logo--prudential' },
    { label: 'COMMSCOPE', className: 'client-logo--commscope' },
    { label: 'KAPLAN', className: 'client-logo--kaplan' },
    { label: 'Giant', className: 'client-logo--giant' },
    { label: 'Kimberly-Clark', className: 'client-logo--kimberly' }
]

const defaultFooterUsefulLinks = [
    { label: 'Home', link: '/' },
    { label: 'Our People', link: '/about-us' },
    { label: 'News', link: '/faqs' },
    { label: 'Downloads', link: '/faqs' },
    { label: 'Contact Us', link: '/contact-us' }
]

const defaultFooterCapabilities = [
    { label: 'UX, Creative & Content', link: '' },
    { label: 'Marketing, Activation & Measurement', link: '' },
    { label: 'Data and Technology Enablement', link: '' },
    { label: 'AI and Automation', link: '' }
]

const defaultFooterSocialLinks = [
    { label: 'f', link: '' },
    { label: 'X', link: '' },
    { label: '◎', link: '' },
    { label: 'in', link: '' }
]

const heroVideoSrc = ref(processVideo)
const heroPosterSrc = ref('')
const navigationItems = ref([])
const successStories = ref([...defaultSuccessStories])
const clientLogos = ref([...defaultClientLogos])
const brandTitleHtml = ref('<span>WE TELL <em>BRAND</em></span><span><em>STORIES</em> WITH</span><span>NUMBERS</span>')
const brandDescription = ref(`At Construct Digital, we're not just storytellers. We're masters of numbers-driven
                    narratives. Like you, we know that success isn't abstract. It's measured in hard metrics
                    like leads, sales and ROI - numbers you can't argue with. We understand your audience and
                    goals, crafting stories that resonate and drive action. Our secret? We start with the
                    right numbers. We're not just shifting dials - we're driving results.`)
const brandButtonText = ref('LEARN MORE')
const brandButtonLink = ref('/about-us')
const storiesTitle = ref('SUCCESS STORIES')
const storiesButtonText = ref('VIEW ALL')
const clientsTitle = ref('OUR CLIENTS')
const clientsDescription = ref('Maximising brand health and business outcomes for leading brands')
const testimonialText = ref(`It took Construct just 2 weeks to rank our keyword on the top spot; and just under 3
                        months to get us a positive return on investment. These folks are on a different level
                        when it comes to SEO!`)
const testimonialName = ref('Sagar Khatri,')
const testimonialRole = ref('CEO - Multiplier HR')
const contactTitle = ref('GET IN TOUCH')
const contactButtonText = ref('CONTACT US')
const contactButtonLink = ref('/contact-us')
const footerUsefulLinks = ref([...defaultFooterUsefulLinks])
const footerCapabilities = ref([...defaultFooterCapabilities])
const footerSocialLinks = ref([...defaultFooterSocialLinks])
const copyrightText = ref('@ 2015 Construct Digital International Pte. Ltd.')
const HERO_CAROUSEL_INTERVAL = 5000

function normalizeText(value, fallback = '') {
    const normalizedValue = String(value || '').trim()
    return normalizedValue || fallback
}

function normalizeLinkList(value, fallback = []) {
    try {
        const parsed = typeof value === 'string' ? JSON.parse(value) : value
        if (!Array.isArray(parsed)) {
            return fallback
        }

        const items = parsed
            .filter(item => item && typeof item === 'object')
            .map((item, index) => ({
                label: normalizeText(item.label, fallback[index]?.label || ''),
                link: normalizeText(item.link, fallback[index]?.link || ''),
                hasDropdown: Boolean(fallback[index]?.hasDropdown)
            }))
            .filter(item => item.label)

        return items.length ? items : fallback
    } catch {
        return fallback
    }
}

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

function normalizeStoryCards(value) {
    try {
        const parsed = typeof value === 'string' ? JSON.parse(value) : value
        if (!Array.isArray(parsed)) {
            return defaultSuccessStories
        }

        const items = parsed
            .filter(item => item && typeof item === 'object')
            .map((item, index) => ({
                ...defaultSuccessStories[index % defaultSuccessStories.length],
                metric: normalizeText(item.metric, defaultSuccessStories[index % defaultSuccessStories.length].metric),
                caption: normalizeText(item.caption, defaultSuccessStories[index % defaultSuccessStories.length].caption),
                image: resolveFileUrl(item.image) || defaultSuccessStories[index % defaultSuccessStories.length].image
            }))

        return items.length ? items : defaultSuccessStories
    } catch {
        return defaultSuccessStories
    }
}

function normalizeClientLogos(value) {
    const uploadedImages = normalizeImageList(value)
    if (!uploadedImages.length) {
        return defaultClientLogos
    }

    return uploadedImages.map((image, index) => ({
        label: `logo-${index + 1}`,
        className: 'client-logo--image',
        image
    }))
}

function applyLandingStoryImages(images = []) {
    if (!images.length) {
        return
    }

    successStories.value = successStories.value.map((item, index) => ({
        ...item,
        image: images[index] || item.image
    }))
}

function normalizeFooterItems(value, fallback = []) {
    try {
        const parsed = typeof value === 'string' ? JSON.parse(value) : value
        if (!Array.isArray(parsed)) {
            return fallback
        }

        const items = parsed
            .map(item => {
                if (item && typeof item === 'object') {
                    return {
                        label: normalizeText(item.label),
                        link: normalizeText(item.link)
                    }
                }

                return {
                    label: normalizeText(item),
                    link: ''
                }
            })
            .filter(item => item.label)

        return items.length ? items : fallback
    } catch {
        return fallback
    }
}

function buildAuthRoute(name = 'login') {
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect.trim() : ''
    return redirect && redirect !== '/landing'
        ? { name, query: { redirect } }
        : { name }
}

function navigateTo(_link, options = {}) {
    const authRouteName = options.authRouteName === 'register' ? 'register' : 'login'
    router.push(buildAuthRoute(authRouteName))
}

function toggleMobileMenu() {
    isMobileMenuOpen.value = !isMobileMenuOpen.value
}

function closeMobileMenu() {
    isMobileMenuOpen.value = false
}

function handleMobileMenuNavigate(link, options = {}) {
    closeMobileMenu()
    navigateTo(link, options)
}

function handleViewportResize() {
    if (window.innerWidth > 1024) {
        closeMobileMenu()
    }
}

function handleWindowKeydown(event) {
    if (event.key === 'Escape') {
        closeMobileMenu()
    }
}

async function fetchLandingConfig() {
    try {
        const result = await request('/api/home/websiteConfig')
        const payload = result?.data || {}
        const nextHeroCarouselImages = normalizeImageList(payload.landing_gallery_images)
        const requestedHeroMediaType = normalizeText(payload.landing_hero_media_type, 'video').toLowerCase()

        navigationItems.value = []
        heroMediaType.value = requestedHeroMediaType === 'carousel' && nextHeroCarouselImages.length ? 'carousel' : 'video'
        heroCarouselImages.value = nextHeroCarouselImages
        heroCarouselIndex.value = 0
        heroVideoSrc.value = resolveFileUrl(normalizeText(payload.landing_hero_video)) || processVideo
        heroPosterSrc.value = normalizeImageList(payload.landing_hero_poster)[0] || ''
        successStories.value = normalizeStoryCards(payload.landing_story_cards)
        applyLandingStoryImages(normalizeImageList(payload.landing_story_images).slice(0, 4))
        clientLogos.value = normalizeClientLogos(payload.landing_clients_logos)
        brandTitleHtml.value = normalizeText(payload.landing_brand_title, brandTitleHtml.value)
        brandDescription.value = normalizeText(payload.landing_brand_description, brandDescription.value)
        brandButtonText.value = normalizeText(payload.landing_brand_button_text, brandButtonText.value)
        brandButtonLink.value = normalizeText(payload.landing_brand_button_link, brandButtonLink.value)
        storiesTitle.value = normalizeText(payload.landing_stories_title, storiesTitle.value)
        storiesButtonText.value = normalizeText(payload.landing_stories_button_text, storiesButtonText.value)
        clientsTitle.value = normalizeText(payload.landing_clients_title, clientsTitle.value)
        clientsDescription.value = normalizeText(payload.landing_clients_description, clientsDescription.value)
        testimonialText.value = normalizeText(payload.landing_testimonial_text, testimonialText.value)
        testimonialName.value = normalizeText(payload.landing_testimonial_name, testimonialName.value)
        testimonialRole.value = normalizeText(payload.landing_testimonial_role, testimonialRole.value)
        contactTitle.value = normalizeText(payload.landing_contact_title, contactTitle.value)
        contactButtonText.value = normalizeText(payload.landing_contact_button_text, contactButtonText.value)
        contactButtonLink.value = normalizeText(payload.landing_contact_button_link, contactButtonLink.value)
        footerUsefulLinks.value = normalizeFooterItems(payload.landing_footer_useful_links, defaultFooterUsefulLinks)
        footerCapabilities.value = normalizeFooterItems(payload.landing_footer_capabilities, defaultFooterCapabilities)
        footerSocialLinks.value = normalizeFooterItems(payload.landing_footer_social_links, defaultFooterSocialLinks)
    } catch {
        heroMediaType.value = 'video'
        heroCarouselImages.value = []
        heroCarouselIndex.value = 0
        heroVideoSrc.value = processVideo
        heroPosterSrc.value = ''
        navigationItems.value = []
        successStories.value = [...defaultSuccessStories]
        clientLogos.value = [...defaultClientLogos]
    }
}

function stopHeroCarousel() {
    if (heroCarouselTimer) {
        window.clearInterval(heroCarouselTimer)
        heroCarouselTimer = null
    }
}

function startHeroCarousel() {
    stopHeroCarousel()

    if (heroMediaType.value !== 'carousel' || heroCarouselImages.value.length <= 1) {
        return
    }

    heroCarouselTimer = window.setInterval(() => {
        heroCarouselIndex.value = (heroCarouselIndex.value + 1) % heroCarouselImages.value.length
    }, HERO_CAROUSEL_INTERVAL)
}

async function tryStartVideo() {
    if (heroMediaType.value !== 'video') {
        return
    }

    const videoElement = videoRef.value
    if (!videoElement) {
        return
    }

    try {
        await videoElement.play()
    } catch {
        isVideoLoading.value = true
    }
}

async function syncHeroMediaPlayback() {
    stopHeroCarousel()
    heroCarouselIndex.value = 0
    hasTriedDefaultHeroVideo = false

    if (heroMediaType.value === 'carousel') {
        videoRef.value?.pause()
        isVideoLoading.value = false
        startHeroCarousel()
        return
    }

    isVideoLoading.value = true
    await nextTick()
    tryStartVideo()
}

function handleVideoReady() {
    isVideoLoading.value = false
}

function handleVideoWaiting() {
    isVideoLoading.value = true
}

function handleVideoError() {
    if (!hasTriedDefaultHeroVideo && heroVideoSrc.value !== processVideo) {
        hasTriedDefaultHeroVideo = true
        heroVideoSrc.value = processVideo
        isVideoLoading.value = true
        nextTick().then(tryStartVideo)
        return
    }

    isVideoLoading.value = false
}

onMounted(async () => {
    document.documentElement.classList.add('desktop-wide-page')
    document.body.classList.add('desktop-wide-page')
    await fetchLandingConfig()
    await nextTick()
    await syncHeroMediaPlayback()
    lastScrollY = pageRef.value?.scrollTop || window.scrollY || window.pageYOffset || 0
    pageRef.value?.addEventListener('scroll', handleWindowScroll, { passive: true })
    window.addEventListener('resize', handleViewportResize, { passive: true })
    window.addEventListener('keydown', handleWindowKeydown)
})

watch(isMobileMenuOpen, isOpen => {
    if (typeof document === 'undefined') {
        return
    }

    document.body.style.overflow = isOpen ? 'hidden' : ''
})

function scrollToTop() {
    if (pageRef.value) {
        pageRef.value.scrollTo({ top: 0, behavior: 'smooth' })
        return
    }

    window.scrollTo({ top: 0, behavior: 'smooth' })
}

function handleWindowScroll() {
    const currentScrollY = pageRef.value?.scrollTop || window.scrollY || window.pageYOffset || 0

    if (currentScrollY <= 24) {
        isFloatingHeaderVisible.value = false
        lastScrollY = 0
        return
    }

    if (currentScrollY < lastScrollY - 6) {
        isFloatingHeaderVisible.value = true
    } else if (currentScrollY > lastScrollY + 6) {
        isFloatingHeaderVisible.value = false
    }

    lastScrollY = currentScrollY
}

onBeforeUnmount(() => {
    document.documentElement.classList.remove('desktop-wide-page')
    document.body.classList.remove('desktop-wide-page')
    stopHeroCarousel()
    pageRef.value?.removeEventListener('scroll', handleWindowScroll)
    window.removeEventListener('resize', handleViewportResize)
    window.removeEventListener('keydown', handleWindowKeydown)

    if (typeof document !== 'undefined') {
        document.body.style.overflow = ''
    }
})
</script>

<template>
    <main ref="pageRef" class="landing-page">
        <header class="landing-header">
            <a class="brand-mark" href="/" aria-label="Audle home">
                <img src="/logo.png" alt="Audle" />
            </a>

            <nav class="landing-nav" aria-label="Primary navigation">
                <button
                    v-for="item in navigationItems"
                    :key="item.label"
                    class="landing-nav__link"
                    type="button"
                    @click="navigateTo(item.link)"
                >
                    <span>{{ item.label }}</span>
                    <svg
                        v-if="item.hasDropdown"
                        class="landing-nav__chevron"
                        viewBox="0 0 12 12"
                        aria-hidden="true"
                    >
                        <path d="M2.25 4.5 6 8.25 9.75 4.5" />
                    </svg>
                </button>

                <button class="landing-nav__link landing-nav__link--auth" type="button" @click="navigateTo('/login')">Log In</button>
                <button class="landing-nav__link landing-nav__link--auth" type="button" @click="navigateTo('/register', { authRouteName: 'register' })">Sign Up</button>
            </nav>

            <div class="landing-header__actions">
                <button class="icon-button" type="button" aria-label="Search">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <circle cx="11" cy="11" r="6.5" />
                        <path d="m16 16 4.5 4.5" />
                    </svg>
                </button>

                <button
                    class="menu-button"
                    :class="{ 'is-active': isMobileMenuOpen }"
                    type="button"
                    :aria-expanded="isMobileMenuOpen ? 'true' : 'false'"
                    aria-controls="landing-mobile-menu"
                    aria-label="Open menu"
                    @click="toggleMobileMenu"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>
        </header>

        <header class="floating-header" :class="{ 'is-visible': isFloatingHeaderVisible }">
            <a class="brand-mark brand-mark--floating" href="/" aria-label="Audle home">
                <img src="/logo.png" alt="Audle" />
            </a>

            <nav class="landing-nav landing-nav--floating" aria-label="Primary navigation">
                <button
                    v-for="item in navigationItems"
                    :key="`floating-${item.label}`"
                    class="landing-nav__link landing-nav__link--floating"
                    type="button"
                    @click="navigateTo(item.link)"
                >
                    <span>{{ item.label }}</span>
                    <svg
                        v-if="item.hasDropdown"
                        class="landing-nav__chevron"
                        viewBox="0 0 12 12"
                        aria-hidden="true"
                    >
                        <path d="M2.25 4.5 6 8.25 9.75 4.5" />
                    </svg>
                </button>

                <button class="landing-nav__link landing-nav__link--floating landing-nav__link--auth" type="button" @click="navigateTo('/login')">Log In</button>
                <button class="landing-nav__link landing-nav__link--floating landing-nav__link--auth" type="button" @click="navigateTo('/register', { authRouteName: 'register' })">Sign Up</button>
            </nav>

            <div class="landing-header__actions landing-header__actions--floating">
                <button class="icon-button" type="button" aria-label="Search">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <circle cx="11" cy="11" r="6.5" />
                        <path d="m16 16 4.5 4.5" />
                    </svg>
                </button>

                <button
                    class="menu-button"
                    :class="{ 'is-active': isMobileMenuOpen }"
                    type="button"
                    :aria-expanded="isMobileMenuOpen ? 'true' : 'false'"
                    aria-controls="landing-mobile-menu"
                    aria-label="Open menu"
                    @click="toggleMobileMenu"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>
        </header>

        <transition name="mobile-menu">
            <div
                v-if="isMobileMenuOpen"
                id="landing-mobile-menu"
                class="mobile-menu-overlay"
                @click.self="closeMobileMenu"
            >
                <div class="mobile-menu-panel" role="dialog" aria-modal="true" aria-label="Mobile navigation">
                    <div class="mobile-menu__header">
                        <img class="mobile-menu__logo" src="/logo.png" alt="Audle" />
                        <button class="mobile-menu__close" type="button" aria-label="Close menu" @click="closeMobileMenu">
                            <span></span>
                            <span></span>
                        </button>
                    </div>

                    <nav class="mobile-menu__nav" aria-label="Mobile primary navigation">
                        <button
                            v-for="item in navigationItems"
                            :key="`mobile-${item.label}`"
                            class="mobile-menu__link"
                            type="button"
                            @click="handleMobileMenuNavigate(item.link)"
                        >
                            <span>{{ item.label }}</span>
                            <svg
                                v-if="item.hasDropdown"
                                class="mobile-menu__chevron"
                                viewBox="0 0 12 12"
                                aria-hidden="true"
                            >
                                <path d="M2.25 4.5 6 8.25 9.75 4.5" />
                            </svg>
                        </button>
                    </nav>

                    <div class="mobile-menu__auth">
                        <button class="mobile-menu__action mobile-menu__action--secondary" type="button" @click="handleMobileMenuNavigate('/login')">
                            Log In
                        </button>
                        <button class="mobile-menu__action" type="button" @click="handleMobileMenuNavigate('/register', { authRouteName: 'register' })">
                            Sign Up
                        </button>
                    </div>
                </div>
            </div>
        </transition>

        <section class="hero-stage" :aria-label="heroMediaType === 'carousel' ? 'Featured carousel section' : 'Featured video section'">
            <div class="stage-frame">
                <div class="video-shell">
                    <template v-if="heroMediaType === 'carousel'">
                        <div class="hero-carousel">
                            <div
                                v-for="(image, index) in heroCarouselImages"
                                :key="`${image}-${index}`"
                                class="hero-carousel__slide"
                                :class="{ 'is-active': index === heroCarouselIndex }"
                            >
                                <img
                                    class="hero-carousel__image"
                                    :src="image"
                                    :alt="`hero-slide-${index + 1}`"
                                />
                            </div>
                        </div>
                    </template>
                    <template v-else>
                        <video
                            ref="videoRef"
                            class="hero-video"
                            :class="{ 'is-ready': !isVideoLoading }"
                            :src="heroVideoSrc"
                            :poster="heroPosterSrc || undefined"
                            autoplay
                            muted
                            loop
                            playsinline
                            preload="auto"
                            @canplay="handleVideoReady"
                            @loadeddata="handleVideoReady"
                            @playing="handleVideoReady"
                            @waiting="handleVideoWaiting"
                            @stalled="handleVideoWaiting"
                            @error="handleVideoError"
                        />

                        <div class="video-overlay" :class="{ 'is-hidden': !isVideoLoading }" aria-live="polite">
                            <span class="video-overlay__loader" aria-label="Loading video"></span>
                        </div>
                    </template>
                </div>
            </div>
        </section>

        <section id="brand" class="brand-story-section" aria-label="Brand story section">
            <div class="brand-story__content">
                <h2 class="brand-story__title" v-html="brandTitleHtml"></h2>

                <p class="brand-story__description">{{ brandDescription }}</p>

                <button class="brand-story__button" type="button" @click="navigateTo(brandButtonLink)">{{ brandButtonText }}</button>
            </div>

        </section>

        <section id="stories" class="success-stories-section" aria-label="Success stories section">
            <div class="success-stories__content">
                <h2 class="success-stories__title">{{ storiesTitle }}</h2>

                <div class="success-stories__grid">
                    <article
                        v-for="story in successStories"
                        :key="story.metric"
                        class="success-card"
                        :style="{ backgroundImage: `url(${story.image})` }"
                    >
                        <div class="success-card__overlay"></div>
                        <div class="success-card__badge" :class="story.badgeClass">{{ story.badge }}</div>

                        <div class="success-card__content">
                            <h3 class="success-card__metric">{{ story.metric }}</h3>
                            <p class="success-card__caption">{{ story.caption }}</p>
                            <span class="success-card__arrow" aria-hidden="true">&rarr;</span>
                        </div>
                    </article>
                </div>

                <button class="success-stories__button" type="button" @click="navigateTo('/login')">{{ storiesButtonText }}</button>
            </div>
        </section>

        <section id="clients" class="clients-section" aria-label="Our clients section">
            <div class="clients-section__content">
                <h2 class="clients-section__title">{{ clientsTitle }}</h2>
                <p class="clients-section__description">{{ clientsDescription }}</p>

                <div class="clients-grid">
                    <div
                        v-for="client in clientLogos"
                        :key="client.label"
                        class="client-logo"
                        :class="client.className"
                    >
                        <img v-if="client.image" :src="client.image" :alt="client.label" />
                        <span v-else>{{ client.label }}</span>
                    </div>
                </div>
            </div>
        </section>

        <section id="testimonial" class="testimonial-section" aria-label="Client testimonial section">
            <div class="testimonial-section__content">
                <div class="testimonial-copy">
                    <p class="testimonial-copy__text">{{ testimonialText }}</p>

                    <div class="testimonial-copy__author">
                        <strong>{{ testimonialName }}</strong>
                        <span>{{ testimonialRole }}</span>
                    </div>

                    <div class="testimonial-copy__pager" aria-hidden="true">
                        <span class="testimonial-copy__dot testimonial-copy__dot--active"></span>
                        <span class="testimonial-copy__dot"></span>
                        <span class="testimonial-copy__dot"></span>
                    </div>
                </div>

                <div class="testimonial-brand">
                    <img class="testimonial-brand__image" :src="multiplierTestimonialImage" alt="Multiplier" />
                </div>
            </div>
        </section>

        <section id="contact" class="contact-strip" aria-label="Get in touch section">
            <div class="contact-strip__content">
                <h2 class="contact-strip__title">{{ contactTitle }}</h2>

                <div class="contact-strip__actions">
                    <div class="contact-strip__mark" aria-hidden="true">
                        <span class="contact-strip__bar contact-strip__bar--purple"></span>
                        <span class="contact-strip__bar contact-strip__bar--green"></span>
                    </div>
                    <button class="contact-strip__button" type="button" @click="navigateTo(contactButtonLink)">{{ contactButtonText }}</button>
                </div>
            </div>
        </section>

        <footer class="site-footer" aria-label="Footer">
            <div class="site-footer__content">
                <div class="site-footer__grid">
                    <section class="site-footer__column">
                        <h3 class="site-footer__heading">USEFUL</h3>
                        <nav class="site-footer__links">
                            <a
                                v-for="item in footerUsefulLinks"
                                :key="`${item.label}-${item.link}`"
                                href="javascript:void(0)"
                                @click="navigateTo(item.link)"
                            >{{ item.label }}</a>
                        </nav>
                    </section>

                    <section class="site-footer__column">
                        <h3 class="site-footer__heading">CAPABILITIES</h3>
                        <div class="site-footer__links">
                            <a
                                v-for="item in footerCapabilities"
                                :key="`${item.label}-${item.link}`"
                                href="javascript:void(0)"
                                @click="item.link && navigateTo(item.link)"
                            >{{ item.label }}</a>
                        </div>
                    </section>

                </div>

                <div class="site-footer__bottom">
                    <p v-html="copyrightText"></p>
                </div>
            </div>
        </footer>

        <button class="scroll-top-button" type="button" aria-label="Scroll to top" @click="scrollToTop">
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 14.5 12 8.5 18 14.5" />
            </svg>
        </button>
    </main>
</template>

<style scoped>
.landing-page {
    --frame-line: rgba(255, 255, 255, 0.18);
    --frame-line-strong: rgba(255, 255, 255, 0.42);
    --text-main: #f5f5f5;
    --accent-green: #00a63c;
    --accent-red: #e00010;
    --accent-yellow: #f7cb21;
    width: 100vw;
    min-height: 100vh;
    background: #000000;
    color: var(--text-main);
    margin: 0;
    overflow-x: hidden;
}

.landing-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 24px;
    height: 92px;
    padding: 10px 72px 0 144px;
}

.floating-header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 30;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 24px;
    height: 92px;
    padding: 10px 72px 0 144px;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px);
    transform: translateY(-110%);
    opacity: 0;
    pointer-events: none;
    transition:
        transform 0.28s ease,
        opacity 0.28s ease;
}

.floating-header.is-visible {
    transform: translateY(0);
    opacity: 1;
    pointer-events: auto;
}

.brand-mark {
    flex: 0 0 auto;
    width: 62px;
    height: 74px;
}

.brand-mark img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
}

.landing-nav {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 40px;
    margin-left: auto;
    margin-right: 36px;
    padding-top: 32px;
}

.landing-nav--floating {
    padding-top: 32px;
}

.landing-nav__link {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    border: 0;
    padding: 0;
    background: transparent;
    color: var(--text-main);
    font: inherit;
    font-size: 16px;
    line-height: 1;
    font-weight: 700;
    letter-spacing: 0;
    cursor: pointer;
    transition: opacity 0.2s ease;
}

.landing-nav__link:hover {
    opacity: 0.72;
}

.landing-nav__link--floating {
    color: #111111;
}

.landing-nav__link--auth {
    margin-left: 6px;
}

.landing-nav__chevron {
    width: 12px;
    height: 12px;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.7;
    stroke-linecap: round;
    stroke-linejoin: round;
}

.landing-header__actions {
    display: flex;
    align-items: center;
    gap: 14px;
    padding-top: 24px;
}

.landing-header__actions--floating {
    color: #111111;
}

.icon-button,
.menu-button {
    appearance: none;
    border: 0;
    background: transparent;
    color: inherit;
    padding: 0;
    cursor: pointer;
}

.icon-button {
    width: 32px;
    height: 32px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.icon-button svg {
    width: 24px;
    height: 24px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2.25;
    stroke-linecap: round;
    stroke-linejoin: round;
}

.menu-button {
    display: none;
    width: 36px;
    height: 36px;
    position: relative;
}

.menu-button span {
    position: absolute;
    left: 6px;
    right: 6px;
    height: 1.5px;
    background: currentColor;
}

.menu-button span:nth-child(1) {
    top: 10px;
}

.menu-button span:nth-child(2) {
    top: 17px;
}

.menu-button span:nth-child(3) {
    top: 24px;
}

.menu-button.is-active span:nth-child(1) {
    top: 17px;
    transform: rotate(45deg);
}

.menu-button.is-active span:nth-child(2) {
    opacity: 0;
}

.menu-button.is-active span:nth-child(3) {
    top: 17px;
    transform: rotate(-45deg);
}

.mobile-menu-overlay {
    position: fixed;
    inset: 0;
    z-index: 80;
    display: flex;
    justify-content: flex-end;
    background: rgba(6, 10, 18, 0.52);
    backdrop-filter: blur(10px);
}

.mobile-menu-panel {
    width: min(420px, 86vw);
    min-height: 100vh;
    padding: 22px 18px 28px;
    background:
        radial-gradient(circle at top left, rgba(247, 203, 33, 0.18), transparent 34%),
        linear-gradient(180deg, #0d1118 0%, #121826 54%, #0b0f16 100%);
    box-shadow: -24px 0 72px rgba(0, 0, 0, 0.34);
    display: flex;
    flex-direction: column;
}

.mobile-menu__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
}

.mobile-menu__logo {
    width: 48px;
    height: 56px;
    object-fit: contain;
}

.mobile-menu__close {
    position: relative;
    width: 42px;
    height: 42px;
    border: 0;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.08);
    color: #ffffff;
    cursor: pointer;
}

.mobile-menu__close span {
    position: absolute;
    top: 20px;
    left: 11px;
    right: 11px;
    height: 1.5px;
    background: currentColor;
}

.mobile-menu__close span:first-child {
    transform: rotate(45deg);
}

.mobile-menu__close span:last-child {
    transform: rotate(-45deg);
}

.mobile-menu__nav {
    display: flex;
    flex-direction: column;
    gap: 14px;
    margin-top: 34px;
}

.mobile-menu__link {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    width: 100%;
    padding: 16px 18px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.04);
    color: #ffffff;
    text-align: left;
    font: inherit;
    font-size: 16px;
    line-height: 1.1;
    font-weight: 700;
    cursor: pointer;
}

.mobile-menu__chevron {
    width: 14px;
    height: 14px;
    flex: 0 0 auto;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.7;
    stroke-linecap: round;
    stroke-linejoin: round;
}

.mobile-menu__auth {
    display: grid;
    gap: 12px;
    margin-top: auto;
    padding-top: 28px;
}

.mobile-menu__action {
    min-height: 52px;
    border: 0;
    border-radius: 16px;
    background: #f7cb21;
    color: #111111;
    font: inherit;
    font-size: 15px;
    line-height: 1;
    font-weight: 800;
    cursor: pointer;
}

.mobile-menu__action--secondary {
    background: transparent;
    color: #ffffff;
    border: 1px solid rgba(255, 255, 255, 0.2);
}

.hero-stage {
    padding: 0;
}

.stage-frame {
    position: relative;
    min-height: calc(100vh - 92px);
}

.video-shell {
    position: relative;
    min-height: calc(100vh - 92px);
    border-top: 1px solid rgba(255, 255, 255, 0.12);
    background:
        radial-gradient(circle at 50% 48%, rgba(255, 255, 255, 0.03), transparent 14%),
        radial-gradient(circle at 50% 48%, rgba(255, 255, 255, 0.014), transparent 28%),
        #000000;
    overflow: hidden;
}

.video-shell::before {
    content: '';
    position: absolute;
    top: -106px;
    right: 0;
    width: 1px;
    height: 106px;
    background: var(--frame-line-strong);
    pointer-events: none;
}

.video-shell::after {
    content: '';
    position: absolute;
    inset: 0;
    border-right: 1px solid var(--frame-line);
    pointer-events: none;
}

.hero-video {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0;
    filter: brightness(0.6) saturate(0.9);
    transition: opacity 0.35s ease;
}

.hero-video.is-ready {
    opacity: 0.6;
}

.hero-carousel {
    position: absolute;
    inset: 0;
}

.hero-carousel__slide {
    position: absolute;
    inset: 0;
    opacity: 0;
    transition: opacity 0.45s ease;
}

.hero-carousel__slide.is-active {
    opacity: 1;
}

.hero-carousel__image {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: brightness(0.6) saturate(0.9);
}

.video-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
    pointer-events: none;
    transition: opacity 0.25s ease;
}

.video-overlay.is-hidden {
    opacity: 0;
}

.video-overlay__loader {
    position: relative;
    width: 40px;
    height: 40px;
    border-radius: 999px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    box-shadow:
        0 0 0 1px rgba(255, 255, 255, 0.06),
        0 0 16px rgba(255, 255, 255, 0.08);
    animation: spin 0.9s linear infinite;
}

.video-overlay__loader::after {
    content: '';
    position: absolute;
    inset: -2px;
    border-radius: 999px;
    border: 2px solid transparent;
    border-top-color: rgba(255, 255, 255, 0.95);
    border-right-color: rgba(255, 255, 255, 0.92);
}

.brand-story-section {
    position: relative;
    min-height: 664px;
    padding: 112px 108px 128px;
    background: #2f65ae;
    color: #ffffff;
}

.brand-story__content {
    max-width: 860px;
    margin-left: 98px;
}

.brand-story__title {
    margin: 0;
    font-size: 76px;
    line-height: 1.04;
    font-weight: 900;
    letter-spacing: -0.04em;
}

.brand-story__title span {
    display: block;
}

.brand-story__title :deep(span) {
    display: block;
}

.brand-story__title em {
    font-style: normal;
    color: #ffc816;
}

.brand-story__title :deep(em),
.brand-story__title :deep(.highlight-yellow) {
    font-style: normal;
    color: #ffc816;
}

.brand-story__description {
    max-width: 975px;
    margin: 34px 0 0;
    font-size: 22px;
    line-height: 1.36;
    font-weight: 500;
}

.brand-story__button {
    min-width: 218px;
    height: 64px;
    margin-top: 44px;
    border: 3px solid rgba(255, 255, 255, 0.95);
    border-radius: 20px;
    background: transparent;
    color: #ffffff;
    font: inherit;
    font-size: 16px;
    line-height: 1;
    font-weight: 800;
    letter-spacing: 0;
    cursor: pointer;
}

.scroll-top-button {
    position: fixed;
    right: 46px;
    bottom: 54px;
    width: 68px;
    height: 68px;
    border: 3px solid #ffffff;
    border-radius: 999px;
    background: #9f2784;
    color: #ffffff;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
}

.scroll-top-button svg {
    width: 26px;
    height: 26px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2.8;
    stroke-linecap: round;
    stroke-linejoin: round;
}

.success-stories-section {
    background: #07962d;
    color: #ffffff;
    padding: 110px 108px 132px;
}

.success-stories__content {
    max-width: 1510px;
    margin: 0 auto;
}

.success-stories__title {
    margin: 0 0 56px;
    font-size: 92px;
    line-height: 0.96;
    font-weight: 900;
    letter-spacing: -0.045em;
}

.success-stories__grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 28px 30px;
}

.success-card {
    position: relative;
    min-height: 432px;
    border-radius: 18px;
    overflow: hidden;
    background-color: #1d1d1d;
    background-position: center;
    background-size: cover;
    background-repeat: no-repeat;
}

.success-card__overlay {
    position: absolute;
    inset: 0;
    background:
        linear-gradient(180deg, rgba(0, 0, 0, 0.08) 0%, rgba(0, 0, 0, 0.06) 28%, rgba(0, 0, 0, 0.54) 100%),
        linear-gradient(90deg, rgba(0, 0, 0, 0.34), rgba(0, 0, 0, 0.02));
}

.success-card__badge {
    position: absolute;
    top: 26px;
    left: 28px;
    z-index: 1;
    color: #ffffff;
    font-size: 22px;
    line-height: 1;
    font-weight: 800;
}

.badge-nus {
    font-size: 18px;
    letter-spacing: 0.02em;
}

.badge-aia {
    width: 90px;
    height: 90px;
    border-radius: 999px;
    background: linear-gradient(135deg, #64c6ff, #fd48b2 55%, #ffd44a);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    text-align: center;
    line-height: 1.05;
}

.badge-sap {
    padding: 10px 14px;
    background: #1492ef;
    clip-path: polygon(0 0, 100% 0, 82% 100%, 0 100%);
}

.badge-multiplier {
    font-size: 20px;
    font-weight: 700;
}

.success-card__content {
    position: absolute;
    left: 38px;
    right: 38px;
    bottom: 28px;
    z-index: 1;
}

.success-card__metric {
    margin: 0;
    font-size: 58px;
    line-height: 0.98;
    font-weight: 900;
    letter-spacing: -0.04em;
}

.success-card__caption {
    margin: 10px 0 0;
    font-size: 22px;
    line-height: 1.18;
    font-weight: 700;
}

.success-card__arrow {
    display: inline-block;
    margin-top: 22px;
    font-size: 28px;
    line-height: 1;
    font-weight: 700;
}

.success-stories__button {
    display: block;
    min-width: 186px;
    height: 64px;
    margin: 58px auto 0;
    border: 3px solid rgba(255, 255, 255, 0.95);
    border-radius: 20px;
    background: transparent;
    color: #ffffff;
    font: inherit;
    font-size: 16px;
    line-height: 1;
    font-weight: 800;
    cursor: pointer;
}

.clients-section {
    background: #f7f7f7;
    color: #111111;
    padding: 108px 88px 116px;
}

.clients-section__content {
    max-width: 1540px;
    margin: 0 auto;
}

.clients-section__title {
    margin: 0;
    text-align: center;
    font-size: 92px;
    line-height: 0.95;
    font-weight: 900;
    letter-spacing: -0.05em;
}

.clients-section__description {
    margin: 28px 0 90px;
    text-align: center;
    font-size: 22px;
    line-height: 1.32;
    font-weight: 500;
}

.clients-grid {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 64px 54px;
    align-items: center;
}

.client-logo {
    min-height: 118px;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
}

.client-logo span {
    display: inline-block;
}

.client-logo--image img {
    max-width: 78%;
    max-height: 96px;
    object-fit: contain;
}

.client-logo--bmw span {
    width: 138px;
    height: 138px;
    border-radius: 999px;
    border: 8px solid #1a1a1a;
    background:
        conic-gradient(from 0deg, #ffffff 0 25%, #4aa7de 25% 50%, #ffffff 50% 75%, #4aa7de 75% 100%);
    box-shadow: inset 0 0 0 6px #d7d7d7;
    color: #ffffff;
    font-size: 24px;
    line-height: 122px;
    font-weight: 800;
    letter-spacing: 0.34em;
    text-indent: 0.34em;
}

.client-logo--amex span {
    padding: 28px 22px;
    background: linear-gradient(180deg, #3f82e3, #2f68ca);
    color: #ffffff;
    font-size: 22px;
    line-height: 1.05;
    font-weight: 800;
}

.client-logo--starbucks span {
    width: 136px;
    height: 136px;
    border-radius: 999px;
    border: 12px solid #137946;
    color: #137946;
    font-size: 18px;
    line-height: 112px;
    font-weight: 800;
}

.client-logo--tuv span {
    padding: 24px 24px;
    border: 6px solid #1f5fae;
    color: #161616;
    font-size: 28px;
    line-height: 1.02;
    font-weight: 800;
    clip-path: polygon(14% 0, 86% 0, 100% 18%, 100% 82%, 86% 100%, 14% 100%, 0 82%, 0 18%);
}

.client-logo--nus span {
    color: #1f4b99;
    font-size: 54px;
    line-height: 1;
    font-weight: 800;
}

.client-logo--sgx span {
    color: #1d338e;
    font-size: 68px;
    line-height: 1;
    font-weight: 900;
}

.client-logo--bhp span {
    color: #f26700;
    font-size: 72px;
    line-height: 1;
    font-weight: 900;
}

.client-logo--sap span {
    padding: 16px 30px;
    background: linear-gradient(135deg, #33a2ee, #4a8fe7);
    color: #ffffff;
    font-size: 54px;
    line-height: 1;
    font-weight: 900;
    clip-path: polygon(0 0, 100% 0, 82% 100%, 0 100%);
}

.client-logo--st span {
    color: #7a7a7a;
    font-size: 38px;
    line-height: 1;
    font-weight: 700;
}

.client-logo--nespresso span {
    color: #111111;
    font-size: 34px;
    line-height: 1;
    font-weight: 700;
}

.client-logo--prudential span {
    color: #ef4136;
    font-size: 32px;
    line-height: 1;
    font-weight: 700;
}

.client-logo--commscope span {
    color: #2a2a2a;
    font-size: 34px;
    line-height: 1;
    font-weight: 300;
    letter-spacing: 0.02em;
}

.client-logo--kaplan span {
    color: #313a9a;
    font-size: 52px;
    line-height: 1;
    font-weight: 500;
    letter-spacing: 0.08em;
}

.client-logo--giant span {
    color: #148457;
    font-size: 64px;
    line-height: 1;
    font-weight: 800;
    font-style: italic;
}

.client-logo--kimberly span {
    padding: 16px 18px;
    background: #3e63b6;
    color: #ffffff;
    font-size: 24px;
    line-height: 1.1;
    font-weight: 700;
    border-radius: 4px;
}

.testimonial-section {
    background: #f7f7f7;
    color: #111111;
    padding: 96px 96px 112px;
}

.testimonial-section__content {
    max-width: 1510px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: minmax(0, 1.05fr) minmax(420px, 0.95fr);
    align-items: center;
    gap: 56px;
}

.testimonial-copy {
    padding-left: 96px;
}

.testimonial-copy__text {
    max-width: 760px;
    margin: 0;
    font-size: 28px;
    line-height: 1.42;
    font-weight: 400;
}

.testimonial-copy__author {
    margin-top: 92px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    color: #111111;
}

.testimonial-copy__author strong {
    font-size: 22px;
    line-height: 1.1;
    font-weight: 800;
}

.testimonial-copy__author span {
    font-size: 18px;
    line-height: 1.2;
    font-weight: 500;
}

.testimonial-copy__pager {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 68px;
}

.testimonial-copy__dot {
    width: 18px;
    height: 18px;
    display: inline-block;
    border: 2px solid #d7d7d7;
    border-radius: 4px;
    background: #ffffff;
    transform: rotate(45deg);
}

.testimonial-copy__dot--active {
    border-color: #111111;
    background:
        linear-gradient(135deg, #ef4136 0 48%, #ffffff 48% 100%);
}

.testimonial-brand {
    display: flex;
    align-items: center;
    justify-content: center;
}

.testimonial-brand__image {
    display: block;
    width: min(520px, 100%);
    height: auto;
    object-fit: contain;
}

.contact-strip {
    background: #ffcb12;
    color: #111111;
    padding: 72px 92px 76px;
}

.contact-strip__content {
    max-width: 1510px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 32px;
}

.contact-strip__title {
    margin: 0;
    font-size: 80px;
    line-height: 0.96;
    font-weight: 900;
    letter-spacing: -0.05em;
}

.contact-strip__actions {
    display: flex;
    align-items: center;
    gap: 48px;
}

.contact-strip__mark {
    position: relative;
    width: 132px;
    height: 82px;
}

.contact-strip__bar {
    position: absolute;
    width: 92px;
    height: 34px;
    background: #ffffff;
    border: 5px solid #111111;
    border-radius: 4px;
}

.contact-strip__bar--purple {
    left: 0;
    bottom: 0;
    transform: skewY(-32deg);
    box-shadow: inset 0 -16px 0 #9f2784;
}

.contact-strip__bar--green {
    right: 0;
    top: 0;
    transform: skewY(32deg);
    box-shadow: inset 0 -16px 0 #00a63c;
}

.contact-strip__button {
    min-width: 216px;
    height: 64px;
    border: 3px solid #111111;
    border-radius: 20px;
    background: transparent;
    color: #111111;
    font: inherit;
    font-size: 16px;
    line-height: 1;
    font-weight: 800;
    cursor: pointer;
}

.site-footer {
    background: #f2f2f2;
    color: #24324a;
    padding: 64px 92px 70px;
}

.site-footer__content {
    max-width: 1510px;
    margin: 0 auto;
}

.site-footer__grid {
    display: grid;
    grid-template-columns: 1fr 1.25fr;
    gap: 48px;
}

.site-footer__heading {
    margin: 0 0 28px;
    color: #111111;
    font-size: 18px;
    line-height: 1;
    font-weight: 800;
}

.site-footer__links {
    display: flex;
    flex-direction: column;
    gap: 18px;
}

.site-footer__links a {
    color: #24324a;
    text-decoration: none;
    font-size: 17px;
    line-height: 1.2;
    font-weight: 500;
}

.site-footer__bottom {
    margin-top: 26px;
    padding-top: 12px;
    border-top: 1px solid rgba(36, 50, 74, 0.16);
}

.site-footer__bottom p {
    margin: 0;
    color: #5a6780;
    font-size: 16px;
    line-height: 1.2;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.mobile-menu-enter-active,
.mobile-menu-leave-active {
    transition: opacity 0.24s ease;
}

.mobile-menu-enter-active .mobile-menu-panel,
.mobile-menu-leave-active .mobile-menu-panel {
    transition: transform 0.24s ease;
}

.mobile-menu-enter-from,
.mobile-menu-leave-to {
    opacity: 0;
}

.mobile-menu-enter-from .mobile-menu-panel,
.mobile-menu-leave-to .mobile-menu-panel {
    transform: translateX(100%);
}

@media (max-width: 1024px) {
    .landing-header {
        height: 76px;
        padding: 10px 24px 0;
    }

    .floating-header {
        height: 76px;
        padding: 10px 24px 0;
    }

    .brand-mark {
        width: 54px;
        height: 62px;
    }

    .landing-nav {
        display: none;
    }

    .landing-header__actions {
        padding-top: 14px;
    }

    .menu-button {
        display: inline-block;
    }

    .mobile-menu-overlay {
        display: flex;
    }

    .hero-stage {
        padding: 0;
    }

    .stage-frame,
    .video-shell {
        min-height: calc(100vh - 76px);
    }

    .video-shell::before {
        top: -86px;
        height: 86px;
    }

    .brand-story-section {
        min-height: auto;
        padding: 72px 32px 96px;
    }

    .brand-story__content {
        max-width: 100%;
        margin-left: 0;
    }

    .brand-story__title {
        font-size: 54px;
    }

    .brand-story__description {
        max-width: 760px;
        font-size: 18px;
    }

    .success-stories-section {
        padding: 76px 32px 104px;
    }

    .success-stories__title {
        margin-bottom: 36px;
        font-size: 58px;
    }

    .success-stories__grid {
        grid-template-columns: 1fr;
        gap: 22px;
    }

    .success-card {
        min-height: 360px;
    }

    .success-card__metric {
        font-size: 46px;
    }

    .success-card__caption {
        font-size: 20px;
    }

    .clients-section {
        padding: 76px 32px 92px;
    }

    .clients-section__title {
        font-size: 58px;
    }

    .clients-section__description {
        margin: 18px 0 52px;
        font-size: 18px;
    }

    .clients-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 42px 28px;
    }

    .client-logo {
        min-height: 96px;
    }

    .testimonial-section {
        padding: 72px 32px 92px;
    }

    .testimonial-section__content {
        grid-template-columns: 1fr;
        gap: 42px;
    }

    .testimonial-copy {
        padding-left: 0;
    }

    .testimonial-copy__text {
        max-width: 100%;
        font-size: 22px;
    }

    .testimonial-copy__author {
        margin-top: 44px;
    }

    .testimonial-copy__pager {
        margin-top: 34px;
    }

    .testimonial-brand__image {
        width: min(420px, 72vw);
    }

    .contact-strip {
        padding: 48px 32px 52px;
    }

    .contact-strip__title {
        font-size: 56px;
    }

    .contact-strip__actions {
        gap: 28px;
    }

    .site-footer {
        padding: 48px 32px 58px;
    }

    .site-footer__grid {
        grid-template-columns: 1fr 1fr;
    }

    .scroll-top-button {
        right: 24px;
        bottom: 26px;
        width: 58px;
        height: 58px;
    }

}

@media (max-width: 640px) {
    .landing-page {
        min-height: 100dvh;
    }

    .landing-header {
        height: 66px;
        padding: 10px 14px 0;
    }

    .floating-header {
        height: 66px;
        padding: 10px 14px 0;
    }

    .brand-mark {
        width: 46px;
        height: 52px;
    }

    .landing-header__actions {
        padding-top: 8px;
    }

    .mobile-menu-panel {
        width: 100%;
        padding: 18px 14px 22px;
    }

    .mobile-menu__nav {
        margin-top: 26px;
        gap: 10px;
    }

    .mobile-menu__link {
        padding: 15px 16px;
        border-radius: 16px;
        font-size: 15px;
    }

    .mobile-menu__auth {
        gap: 10px;
        padding-top: 22px;
    }

    .mobile-menu__action {
        min-height: 48px;
        border-radius: 14px;
        font-size: 14px;
    }

    .hero-stage {
        padding: 0;
    }

    .stage-frame,
    .video-shell {
        min-height: calc(100dvh - 66px);
    }

    .video-shell::before {
        top: -76px;
        height: 76px;
    }

    .icon-button svg {
        width: 24px;
        height: 24px;
    }

    .video-overlay__loader {
        width: 34px;
        height: 34px;
    }

    .brand-story-section {
        padding: 42px 16px 86px;
    }

    .brand-story__title {
        font-size: 34px;
        line-height: 1.08;
    }

    .brand-story__description {
        margin-top: 20px;
        font-size: 16px;
        line-height: 1.5;
    }

    .brand-story__button {
        min-width: 172px;
        height: 54px;
        margin-top: 28px;
        border-width: 2px;
        border-radius: 16px;
        font-size: 15px;
    }

    .success-stories-section {
        padding: 44px 16px 88px;
    }

    .success-stories__title {
        margin-bottom: 24px;
        font-size: 38px;
        line-height: 1;
    }

    .success-card {
        min-height: 270px;
        border-radius: 14px;
    }

    .success-card__badge {
        top: 18px;
        left: 18px;
        font-size: 16px;
    }

    .badge-aia {
        width: 64px;
        height: 64px;
        font-size: 13px;
    }

    .success-card__content {
        left: 20px;
        right: 20px;
        bottom: 18px;
    }

    .success-card__metric {
        font-size: 36px;
    }

    .success-card__caption {
        font-size: 16px;
    }

    .success-card__arrow {
        margin-top: 14px;
        font-size: 22px;
    }

    .success-stories__button {
        min-width: 160px;
        height: 54px;
        margin-top: 30px;
        border-width: 2px;
        border-radius: 16px;
        font-size: 15px;
    }

    .clients-section {
        padding: 42px 16px 82px;
    }

    .clients-section__title {
        font-size: 38px;
        line-height: 1;
    }

    .clients-section__description {
        margin: 14px 0 30px;
        font-size: 16px;
        line-height: 1.4;
    }

    .clients-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 24px 16px;
    }

    .client-logo {
        min-height: 82px;
    }

    .client-logo--bmw span {
        width: 92px;
        height: 92px;
        border-width: 6px;
        box-shadow: inset 0 0 0 4px #d7d7d7;
        font-size: 16px;
        line-height: 80px;
    }

    .client-logo--amex span,
    .client-logo--sap span,
    .client-logo--kimberly span {
        font-size: 18px;
    }

    .client-logo--nus span,
    .client-logo--sgx span,
    .client-logo--bhp span,
    .client-logo--giant span {
        font-size: 42px;
    }

    .client-logo--st span,
    .client-logo--nespresso span,
    .client-logo--prudential span,
    .client-logo--commscope span {
        font-size: 24px;
    }

    .client-logo--kaplan span {
        font-size: 34px;
    }

    .testimonial-section {
        padding: 42px 16px 84px;
    }

    .testimonial-section__content {
        gap: 28px;
    }

    .testimonial-copy__text {
        font-size: 18px;
        line-height: 1.5;
    }

    .testimonial-copy__author {
        margin-top: 28px;
        gap: 8px;
    }

    .testimonial-copy__author strong {
        font-size: 18px;
    }

    .testimonial-copy__author span {
        font-size: 15px;
    }

    .testimonial-copy__pager {
        margin-top: 24px;
        gap: 8px;
    }

    .testimonial-copy__dot {
        width: 14px;
        height: 14px;
        border-radius: 3px;
    }

    .testimonial-brand__image {
        width: min(300px, 86vw);
    }

    .contact-strip {
        padding: 34px 16px 38px;
    }

    .contact-strip__content {
        flex-direction: column;
        align-items: flex-start;
    }

    .contact-strip__title {
        font-size: 42px;
    }

    .contact-strip__actions {
        width: 100%;
        justify-content: space-between;
        gap: 18px;
    }

    .contact-strip__mark {
        width: 96px;
        height: 60px;
    }

    .contact-strip__bar {
        width: 66px;
        height: 24px;
        border-width: 4px;
    }

    .contact-strip__bar--purple {
        box-shadow: inset 0 -11px 0 #9f2784;
    }

    .contact-strip__bar--green {
        box-shadow: inset 0 -11px 0 #00a63c;
    }

    .contact-strip__button {
        min-width: 156px;
        height: 52px;
        border-width: 2px;
        border-radius: 16px;
        font-size: 15px;
    }

    .site-footer {
        padding: 34px 16px 48px;
    }

    .site-footer__grid {
        grid-template-columns: 1fr;
        gap: 28px;
    }

    .site-footer__heading {
        margin-bottom: 18px;
        font-size: 16px;
    }

    .site-footer__links {
        gap: 14px;
    }

    .site-footer__links a {
        font-size: 15px;
    }

    .scroll-top-button {
        right: 14px;
        bottom: 18px;
        width: 52px;
        height: 52px;
        border-width: 2px;
    }

    .scroll-top-button svg {
        width: 22px;
        height: 22px;
    }

}
</style>
