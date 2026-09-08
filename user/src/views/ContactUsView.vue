<script setup>
import { onMounted, ref } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import DesktopSidebar from '@/components/DesktopSidebar.vue'
import ContactSupportCard from '@/components/contact/ContactSupportCard.vue'
import contactHeadImg from '@/assets/static/img/profile/contact-us-head.png'
import contactIcon from '@/assets/static/img/profile/contact-us.png'
import { request } from '@/utils/request'
import { resolveFileUrl } from '@/utils/currentUser'

const contactTitle = ref('')
const contactDescription = ref('')
const contactButtonText = ref('')
const contactHeadImage = ref(contactHeadImg)
const contactIconImage = ref(contactIcon)

function normalizeConfigImages(raw) {
    if (Array.isArray(raw)) {
        return raw
    }

    if (typeof raw === 'string' && raw.trim()) {
        try {
            const parsed = JSON.parse(raw)
            return Array.isArray(parsed) ? parsed : []
        } catch {
            return raw
                .split(',')
                .map(item => item.trim())
                .filter(Boolean)
        }
    }

    return []
}

async function fetchContactConfig() {
    try {
        const result = await request('/api/home/websiteConfig')
        const payload = result?.data || {}
        const headImage = normalizeConfigImages(payload.contact_us_head_image || result?.contact_us_head_image)
            .map(item => resolveFileUrl(item))
            .find(Boolean)
        const iconImage = normalizeConfigImages(payload.contact_us_icon_image || result?.contact_us_icon_image)
            .map(item => resolveFileUrl(item))
            .find(Boolean)

        contactTitle.value = String(payload.contact_us_title || result?.contact_us_title || '').trim()
        contactDescription.value = String(payload.contact_us_description || result?.contact_us_description || '').trim()
        contactButtonText.value = String(payload.contact_us_button_text || result?.contact_us_button_text || '').trim()
        contactHeadImage.value = headImage || contactHeadImg
        contactIconImage.value = iconImage || contactIcon
    } catch {
        contactTitle.value = ''
        contactDescription.value = ''
        contactButtonText.value = ''
        contactHeadImage.value = contactHeadImg
        contactIconImage.value = contactIcon
    }
}

onMounted(() => {
    fetchContactConfig()
})
</script>

<template>
    <div class="contact-us-view desktop-workspace-shell">
        <DesktopSidebar />
        <AppHeader :is-sub-page="false" />

        <main class="content-area">
            <ContactSupportCard :head-image="contactHeadImage" :icon-image="contactIconImage" :title="contactTitle" :description="contactDescription" :button-text="contactButtonText" />
        </main>
    </div>
</template>

<style scoped>
.contact-us-view {
    min-height: 100vh;
    background-color: #f8f9fa;
    padding-top: var(--mobile-header-height); /* Match AppHeader height */
}

.content-area {
    padding: 0.4rem;
    display: flex;
    justify-content: center;
}

@media (min-width: 481px) {
    :global(body.desktop-profile-related-page .contact-us-view) {
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

    :global(body.desktop-profile-related-page .contact-us-view .content-area) {
        width: var(--desktop-content-width);
        min-height: 100vh;
        margin-left: var(--desktop-content-left-gap);
        padding: clamp(30px, 4vh, 48px) 0 clamp(42px, 6vh, 72px);
        justify-content: center;
        align-items: flex-start;
        box-sizing: border-box;
    }
}
</style>
