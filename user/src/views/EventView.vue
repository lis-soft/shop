<script setup>
import { computed, onMounted, ref } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import DesktopSidebar from '@/components/DesktopSidebar.vue'
import EventConditionsList from '@/components/event/EventConditionsList.vue'
import EventOfferCard from '@/components/event/EventOfferCard.vue'
import { request } from '@/utils/request'
const eventConfig = ref({
    events: [],
    conditions: []
})

const events = computed(() => eventConfig.value?.events || [])
const conditions = computed(() => eventConfig.value?.conditions || [])

const fetchEventConfig = async () => {
    try {
        const result = await request('/api/home/eventConfig')
        eventConfig.value = result?.data || { events: [], conditions: [] }
    } catch {
        eventConfig.value = { events: [], conditions: [] }
    }
}

onMounted(() => {
    fetchEventConfig()
})
</script>

<template>
    <div class="event-page desktop-workspace-shell">
        <DesktopSidebar />
        <AppHeader :is-sub-page="false" />

        <main class="content">
            <div class="event-list">
                <EventOfferCard v-for="event in events" :key="event.id" :event="event" />
            </div>

            <EventConditionsList :conditions="conditions" />
        </main>
    </div>
</template>

<style scoped>
.event-page {
    width: 100%;
    min-height: 100vh;
    background-color: #f5f5f5;
    padding-top: var(--mobile-header-height); /* Header height */
    box-sizing: border-box;
}

.content {
    padding: 0.4rem;
}

.event-list {
    margin-bottom: 0.6rem;
}

@media (min-width: 481px) {
    :global(body.desktop-profile-related-page .event-page) {
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

    :global(body.desktop-profile-related-page .event-page .content) {
        width: var(--desktop-content-width);
        margin-left: var(--desktop-content-left-gap);
        padding: clamp(30px, 4vh, 48px) 0 clamp(42px, 6vh, 72px);
    }

    :global(body.desktop-profile-related-page .event-page .event-list) {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: clamp(18px, 2vw, 28px);
        margin-bottom: clamp(24px, 3vh, 40px);
    }
}
</style>
