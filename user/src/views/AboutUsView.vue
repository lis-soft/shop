<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import DesktopSidebar from '@/components/DesktopSidebar.vue'
import AboutAwardsSection from '@/components/about/AboutAwardsSection.vue'
import AboutContentSection from '@/components/about/AboutContentSection.vue'
import AboutHeroSection from '@/components/about/AboutHeroSection.vue'
import AboutJoinSection from '@/components/about/AboutJoinSection.vue'
import { request } from '@/utils/request'
import { resolveFileUrl } from '@/utils/currentUser'

const router = useRouter()
const activeIndex = ref(0)
const aboutConfig = ref({
    heroTitle: '',
    brandTitle: '',
    brandContent: '',
    brandButtonText: '',
    brandButtonLink: '',
    approachTitle: '',
    approachContent: '',
    peopleTitle: '',
    peopleContent: '',
    peopleButtonText: '',
    peopleButtonLink: '',
    awardsCount: '',
    awardsTitle: '',
    awardsContent: '',
    awardsImages: [],
    joinTitle: '',
    joinButtonText: '',
    joinButtonLink: ''
})

const awardsList = computed(() =>
    (aboutConfig.value?.awardsImages || []).map(image => resolveFileUrl(image)).filter(Boolean)
)

const onScroll = e => {
    const scrollLeft = e.target.scrollLeft
    const cardWidth = e.target.offsetWidth * 0.8
    activeIndex.value = Math.round(scrollLeft / (cardWidth + 10))
}

const navigateToLink = link => {
    const normalizedLink = String(link || '').trim()

    if (!normalizedLink) {
        return
    }

    if (/^https?:\/\//i.test(normalizedLink)) {
        window.open(normalizedLink, '_blank', 'noopener,noreferrer')
        return
    }

    router.push(normalizedLink)
}

const fetchAboutConfig = async () => {
    try {
        const result = await request('/api/home/aboutConfig')
        aboutConfig.value = result?.data || aboutConfig.value
    } catch {
        aboutConfig.value = {
            heroTitle: '',
            brandTitle: '',
            brandContent: '',
            brandButtonText: '',
            brandButtonLink: '',
            approachTitle: '',
            approachContent: '',
            peopleTitle: '',
            peopleContent: '',
            peopleButtonText: '',
            peopleButtonLink: '',
            awardsCount: '',
            awardsTitle: '',
            awardsContent: '',
            awardsImages: [],
            joinTitle: '',
            joinButtonText: '',
            joinButtonLink: ''
        }
    }
}

onMounted(() => {
    fetchAboutConfig()
})
</script>

<template>
    <div class="about-us-page desktop-workspace-shell">
        <DesktopSidebar />
        <AppHeader :is-sub-page="false" />

        <main class="content">
            <AboutHeroSection :title="aboutConfig.heroTitle" />

            <AboutContentSection
                :title="aboutConfig.brandTitle"
                :content="aboutConfig.brandContent"
                :button-text="aboutConfig.brandButtonText"
                @navigate="navigateToLink(aboutConfig.brandButtonLink)"
            />

            <AboutContentSection
                theme="blue"
                :title="aboutConfig.approachTitle"
                :content="aboutConfig.approachContent"
            />

            <AboutContentSection
                :title="aboutConfig.peopleTitle"
                :content="aboutConfig.peopleContent"
                :button-text="aboutConfig.peopleButtonText"
                @navigate="navigateToLink(aboutConfig.peopleButtonLink)"
            />

            <AboutAwardsSection
                :awards-count="aboutConfig.awardsCount"
                :awards-title="aboutConfig.awardsTitle"
                :awards-content="aboutConfig.awardsContent"
                :awards-list="awardsList"
                :active-index="activeIndex"
                @scroll="onScroll"
            />

            <AboutJoinSection
                :title="aboutConfig.joinTitle"
                :button-text="aboutConfig.joinButtonText"
                @navigate="navigateToLink(aboutConfig.joinButtonLink)"
            />
        </main>
    </div>
</template>

<style scoped>
.about-us-page {
    width: 100%;
    min-height: 100vh;
    background-color: #ffffff;
    padding-top: var(--mobile-header-height);
    box-sizing: border-box;
}

@media (min-width: 481px) {
    :global(body.desktop-profile-related-page .about-us-page) {
        width: 100vw;
        height: 100vh;
        min-height: 100vh;
        padding-top: 0 !important;
        padding-left: var(--desktop-sidebar-width) !important;
        background: #ffffff;
        overflow-y: auto;
        overflow-x: hidden;
        box-sizing: border-box;
    }

    :global(body.desktop-profile-related-page .about-us-page .content) {
        width: var(--desktop-content-width);
        margin-left: var(--desktop-content-left-gap);
        padding: clamp(30px, 4vh, 48px) 0 clamp(42px, 6vh, 72px);
    }
}
</style>
