<script setup>
import { computed, onMounted, ref } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import DesktopSidebar from '@/components/DesktopSidebar.vue'
import PartnerRankingList from '@/components/rank/PartnerRankingList.vue'
import { request } from '@/utils/request'
import { resolveFileUrl } from '@/utils/currentUser'

const partnerRankings = ref([])

const rankingList = computed(() =>
    partnerRankings.value.map((item, index) => ({
        id: item.id || index + 1,
        text: `${index + 1}. ${item.name || ''}`,
        logo: resolveFileUrl(item.logo)
    }))
)

const fetchPartnerRankings = async () => {
    try {
        const result = await request('/api/home/partnerConfig')
        partnerRankings.value = Array.isArray(result?.data) ? result.data : []
    } catch {
        partnerRankings.value = []
    }
}

const handleLogoError = event => {
    const image = event?.target
    if (!image) {
        return
    }

    image.style.visibility = 'hidden'
}

onMounted(() => {
    fetchPartnerRankings()
})
</script>

<template>
    <div class="rank-page desktop-workspace-shell">
        <DesktopSidebar />
        <AppHeader :is-sub-page="false" />

        <main class="content">
            <PartnerRankingList :items="rankingList" @logo-error="handleLogoError" />
        </main>
    </div>
</template>

<style scoped>
.rank-page {
    width: 100%;
    min-height: 100vh;
    background-color: #f5f5f5;
    padding-top: var(--mobile-header-height);
    box-sizing: border-box;
}

.content {
    padding: 0.32rem 0.36rem;
}

@media (min-width: 481px) {
    :global(body.desktop-profile-related-page .rank-page) {
        width: 100vw;
        height: 100vh;
        min-height: 100vh;
        padding-top: 0 !important;
        padding-left: var(--desktop-sidebar-width) !important;
        background: #f7f7f7;
        overflow-y: auto;
        overflow-x: hidden;
        box-sizing: border-box;
    }

    :global(body.desktop-profile-related-page .rank-page .content) {
        width: var(--desktop-content-width);
        margin-left: var(--desktop-content-left-gap);
        padding: clamp(30px, 4vh, 48px) 0 clamp(42px, 6vh, 72px);
    }
}
</style>

