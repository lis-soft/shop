<script setup>
import { onMounted, ref } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import AppTabBar from '@/components/AppTabBar.vue'
import DesktopSidebar from '@/components/DesktopSidebar.vue'
import HomeClientsSection from '@/components/home/HomeClientsSection.vue'
import HomeHeroSection from '@/components/home/HomeHeroSection.vue'
import HomeStoriesSection from '@/components/home/HomeStoriesSection.vue'
import HomeTestimonialSection from '@/components/home/HomeTestimonialSection.vue'
import { request } from '@/utils/request'
import { resolveFileUrl } from '@/utils/currentUser'
import defaultHeroImage from '@/assets/static/img/home/Rectangle 462.png'
import defaultStoryImage from '@/assets/static/img/home/image 102.png'

const heroImages = ref([])
const storyImages = ref([])
const homeNotice = ref('')
const homeHeroTitle = ref('')
const homeHeroDescription = ref('')
const homeStoriesTitle = ref('')
const homeStoriesButtonText = ref('')
const homeClientsTitle = ref('')
const homeClientsDescription = ref('')
const homeClientLogos = ref([])
const homeTestimonialText = ref('')

function stripHtmlTags(value) {
    const normalizedValue = String(value || '').trim()

    if (!normalizedValue) {
        return ''
    }

    return normalizedValue
        .replace(/<br\s*\/?>/gi, ' ')
        .replace(/<\/(p|div|li|h[1-6])>/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim()
}

function normalizeBannerList(rawBanners) {
    if (Array.isArray(rawBanners)) {
        return rawBanners
    }

    if (typeof rawBanners === 'string' && rawBanners.trim()) {
        try {
            const parsed = JSON.parse(rawBanners)
            return Array.isArray(parsed) ? parsed : []
        } catch {
            return rawBanners
                .split(',')
                .map(item => item.trim())
                .filter(Boolean)
        }
    }

    return []
}

function normalizeConfigText(value) {
    return String(value || '').trim()
}

async function fetchWebsiteConfig() {
    try {
        const result = await request('/api/home/websiteConfig')
        const payload = result?.data || {}
        const heroBanners = normalizeBannerList(payload.home_banners_primary || result?.home_banners_primary)
            .map(item => resolveFileUrl(item))
            .filter(Boolean)
        const banners = normalizeBannerList(payload.home_banners || result?.home_banners)
            .map(item => resolveFileUrl(item))
            .filter(Boolean)
        const clientLogos = normalizeBannerList(payload.home_clients_logos || result?.home_clients_logos)
            .map(item => resolveFileUrl(item))
            .filter(Boolean)
        const noticeText = stripHtmlTags(payload.home_notice || result?.home_notice || '')

        heroImages.value = heroBanners.length ? heroBanners : [defaultHeroImage]
        storyImages.value = banners.length ? banners : [defaultStoryImage]
        homeNotice.value = noticeText
        homeHeroTitle.value = normalizeConfigText(payload.home_hero_title || result?.home_hero_title)
        homeHeroDescription.value = normalizeConfigText(payload.home_hero_description || result?.home_hero_description)
        homeStoriesTitle.value = normalizeConfigText(payload.home_stories_title || result?.home_stories_title)
        homeStoriesButtonText.value = normalizeConfigText(payload.home_stories_button_text || result?.home_stories_button_text)
        homeClientsTitle.value = normalizeConfigText(payload.home_clients_title || result?.home_clients_title)
        homeClientsDescription.value = normalizeConfigText(payload.home_clients_description || result?.home_clients_description)
        homeClientLogos.value = clientLogos
        homeTestimonialText.value = normalizeConfigText(payload.home_testimonial_text || result?.home_testimonial_text)
    } catch {
        heroImages.value = [defaultHeroImage]
        storyImages.value = [defaultStoryImage]
        homeNotice.value = ''
        homeHeroTitle.value = ''
        homeHeroDescription.value = ''
        homeStoriesTitle.value = ''
        homeStoriesButtonText.value = ''
        homeClientsTitle.value = ''
        homeClientsDescription.value = ''
        homeClientLogos.value = []
        homeTestimonialText.value = ''
    }
}

onMounted(() => {
    fetchWebsiteConfig()
})
</script>

<template>
    <div class="home-container desktop-workspace-shell">
        <DesktopSidebar />
        <AppHeader />
        <HomeHeroSection :hero-images="heroImages" :notice-text="homeNotice" :title="homeHeroTitle" :description="homeHeroDescription" />
        <HomeStoriesSection :story-images="storyImages" :title="homeStoriesTitle" :button-text="homeStoriesButtonText" />
        <HomeClientsSection :title="homeClientsTitle" :description="homeClientsDescription" :logos="homeClientLogos" />
        <HomeTestimonialSection :text="homeTestimonialText" />

        <AppTabBar />
    </div>
</template>

<style scoped>
.home-container {
    width: 100%;
    background-color: #1d58a7;
    overflow-x: hidden;
    padding-top: var(--mobile-header-height); /* 对应 header 高度 */
    padding-bottom: 1.28rem; /* 对应 tabbar 高度 */
}

@media (min-width: 481px) {
    :global(body.desktop-home-page .home-container) {
        background: #ffffff;
        overflow-y: auto;
    }
}

</style>
