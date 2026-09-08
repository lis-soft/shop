<script setup>
import { onMounted, ref } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import DesktopSidebar from '@/components/DesktopSidebar.vue'
import UserModeCard from '@/components/user-mode/UserModeCard.vue'
import { request } from '@/utils/request'
import { resolveFileUrl } from '@/utils/currentUser'

const modes = ref([])

function formatVipMode(item) {
    return {
        id: item.id || item.vip_level,
        name: item.vip_name || `VIP ${item.vip_level || ''}`.trim(),
        image: resolveFileUrl(item.vip_image),
        profit: `${Number(item.reward_rate || 0).toFixed(2)}%`,
        brands: String(item.task_count ?? '--'),
        resetTime: String(item.daily_sets ?? '--')
    }
}

async function fetchVipModes() {
    try {
        const result = await request('/api/home/vipLevels')
        const vipLevels = Array.isArray(result?.data) ? result.data : []
        modes.value = vipLevels.map(formatVipMode)
    } catch {
        modes.value = []
    }
}

onMounted(() => {
    fetchVipModes()
})
</script>

<template>
    <div class="user-mode-container desktop-workspace-shell">
        <DesktopSidebar />
        <AppHeader :is-sub-page="false" />

        <main class="content-wrapper">
            <div class="side-bar"></div>
            <div class="green-side-stripe"></div>
            <div class="green-bg-container">
                <UserModeCard v-for="mode in modes" :key="mode.id" :mode="mode" />
            </div>
        </main>
    </div>
</template>

<style scoped>
.user-mode-container {
    width: 100%;
    height: 100vh;
    background-color: #ffffff;
    padding-top: var(--mobile-header-height); /* Header height */
    box-sizing: border-box;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
}

.content-wrapper {
    display: flex;
    background-color: #ffffff;
    padding: 0.24rem 0 0.8rem 0; /* Vertical padding */
    min-height: calc(100vh - 1.4rem);
    box-sizing: border-box;
}

.side-bar {
    width: 0.24rem;
    background-color: #ffffff; /* Page edge */
}

.green-side-stripe {
    width: 0.16rem;
    background-color: #f1f8f6; /* Light green stripe */
}

.green-bg-container {
    flex: 1;
    background-color: #349b6d;
    padding: 0.44rem 0.38rem;
    margin-right: 0.24rem; /* Right margin to match screenshot */
    border-radius: 0.2rem;
    min-height: auto; /* Ensure it doesn't stretch unnecessarily */
}

@media (min-width: 481px) {
    :global(body.desktop-profile-related-page .user-mode-container) {
        height: 100vh;
        min-height: 100vh;
        padding-top: 0 !important;
        padding-left: var(--desktop-sidebar-width) !important;
        background: #f7f7f7;
        overflow-y: auto;
        overflow-x: hidden;
        box-sizing: border-box;
    }

    :global(body.desktop-profile-related-page .user-mode-container .content-wrapper) {
        width: var(--desktop-content-width);
        min-height: 100vh;
        margin-left: var(--desktop-content-left-gap);
        padding: clamp(30px, 4vh, 48px) 0 clamp(42px, 6vh, 72px);
        display: block;
        background: #f7f7f7;
    }

    :global(body.desktop-profile-related-page .user-mode-container .side-bar),
    :global(body.desktop-profile-related-page .user-mode-container .green-side-stripe) {
        display: none;
    }

    :global(body.desktop-profile-related-page .user-mode-container .green-bg-container) {
        width: 100%;
        margin: 0;
        padding: clamp(24px, 2.6vw, 36px);
        border-radius: 12px;
        background: #349b6d;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        gap: clamp(18px, 2vw, 28px);
        box-sizing: border-box;
    }
}

</style>

