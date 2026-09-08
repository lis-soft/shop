<script setup>
import { computed, onMounted, provide, ref } from 'vue'
import { RouterView } from 'vue-router'
import { useRoute } from 'vue-router'
import { clearCurrentUser, currentUser, isCurrentUserLoading, refreshCurrentUser, resolveFileUrl } from '@/utils/currentUser'
import { request } from '@/utils/request'
import AppHeader from '@/components/AppHeader.vue'

const isProfileOpen = ref(false)
const route = useRoute()
const desktopFrameBackgroundType = ref('none')
const desktopFrameBackgroundImage = ref('')
const desktopFrameBackgroundVideo = ref('')
const siteMaintenanceEnabled = ref(false)
const siteMaintenancePageContent = ref('<h1>Website Under Maintenance</h1><p>The website is currently under maintenance. Please check back later.</p>')
const websiteShellReady = ref(true)

const showDesktopPersistentHeader = computed(() => {
    const publicPageNames = new Set(['landing', 'login', 'register'])

    return !publicPageNames.has(String(route.name || ''))
})
const appShellClass = computed(() => ({
    'has-tabbar': Boolean(route.meta?.hasTabBar),
    'desktop-wide-page': Boolean(route.meta?.desktopWidePage),
    'desktop-no-persistent-header': !showDesktopPersistentHeader.value
}))

const desktopFrameMedia = computed(() => {
    const normalizedType = String(desktopFrameBackgroundType.value || 'none').trim().toLowerCase()

    if (normalizedType === 'video' && desktopFrameBackgroundVideo.value) {
        return {
            type: 'video',
            url: desktopFrameBackgroundVideo.value
        }
    }

    if (normalizedType === 'image' && desktopFrameBackgroundImage.value) {
        return {
            type: 'image',
            url: desktopFrameBackgroundImage.value
        }
    }

    if (desktopFrameBackgroundImage.value) {
        return {
            type: 'image',
            url: desktopFrameBackgroundImage.value
        }
    }

    if (desktopFrameBackgroundVideo.value) {
        return {
            type: 'video',
            url: desktopFrameBackgroundVideo.value
        }
    }

    return {
        type: 'none',
        url: ''
    }
})

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

function renderRichText(content) {
    const normalizedContent = String(content || '').trim()
    if (!normalizedContent) {
        return ''
    }

    if (/<[a-z][\s\S]*>/i.test(normalizedContent)) {
        return normalizedContent
    }

    return normalizedContent
        .split(/\n{2,}/)
        .map(paragraph => `<p>${paragraph.replace(/\n/g, '<br />')}</p>`)
        .join('')
}

function normalizeRichHtmlContent(content) {
    const normalizedContent = String(content || '').trim()
    if (!normalizedContent) {
        return ''
    }

    const baseHtml = /<[a-z][\s\S]*>/i.test(normalizedContent)
        ? normalizedContent
        : renderRichText(normalizedContent)

    if (typeof document === 'undefined') {
        return baseHtml
    }

    const container = document.createElement('div')
    container.innerHTML = baseHtml

    container.querySelectorAll('img, source, video').forEach(node => {
        const currentSrc = node.getAttribute('src')
        if (
            currentSrc
            && !/^(https?:)?\/\//i.test(currentSrc)
            && !currentSrc.startsWith('data:')
            && !currentSrc.startsWith('blob:')
            && !currentSrc.startsWith('/assets/')
            && !currentSrc.startsWith('assets/')
        ) {
            node.setAttribute('src', resolveFileUrl(currentSrc))
        }
    })

    return container.innerHTML
}

function buildMaintenancePageContent(pageContent, legacyTitle, legacyMessage) {
    const normalizedPageContent = String(pageContent || '').trim()
    if (normalizedPageContent) {
        return normalizeRichHtmlContent(normalizedPageContent)
    }

    const title = String(legacyTitle || '').trim() || 'Website Under Maintenance'
    const messageHtml = renderRichText(legacyMessage || 'The website is currently under maintenance. Please check back later.')
    return normalizeRichHtmlContent(`<h1>${title}</h1>${messageHtml}`)
}

async function fetchWebsiteShellConfig() {
    try {
        const result = await request('/api/home/websiteConfig')
        const payload = result?.data || {}
        const image = normalizeConfigImages(payload.desktop_frame_background_image || result?.desktop_frame_background_image)
            .map(item => resolveFileUrl(item))
            .find(Boolean)
        const video = resolveFileUrl(payload.desktop_frame_background_video || result?.desktop_frame_background_video || '')

        siteMaintenanceEnabled.value = Boolean(payload.site_maintenance_enabled ?? result?.site_maintenance_enabled)
        siteMaintenancePageContent.value = buildMaintenancePageContent(
            payload.site_maintenance_page_content || result?.site_maintenance_page_content || '',
            payload.site_maintenance_title || result?.site_maintenance_title || '',
            payload.site_maintenance_message || result?.site_maintenance_message || ''
        )
        desktopFrameBackgroundType.value = String(payload.desktop_frame_background_type || result?.desktop_frame_background_type || 'none').trim().toLowerCase()
        desktopFrameBackgroundImage.value = image || ''
        desktopFrameBackgroundVideo.value = video || ''
    } catch {
        siteMaintenanceEnabled.value = false
        siteMaintenancePageContent.value = '<h1>Website Under Maintenance</h1><p>The website is currently under maintenance. Please check back later.</p>'
        desktopFrameBackgroundType.value = 'none'
        desktopFrameBackgroundImage.value = ''
        desktopFrameBackgroundVideo.value = ''
    }
}

provide('profileState', {
    isOpen: isProfileOpen,
    toggle: val => (isProfileOpen.value = val)
})

provide('authState', {
    currentUser,
    isCurrentUserLoading,
    refreshCurrentUser,
    clearCurrentUser
})

onMounted(() => {
    fetchWebsiteShellConfig()

    if (!localStorage.getItem('token')) {
        clearCurrentUser()
        return
    }

    refreshCurrentUser().catch(() => {})
})
</script>

<template>
    <div v-if="!route.meta?.desktopWidePage" class="desktop-frame-backdrop" aria-hidden="true">
        <video
            v-if="desktopFrameMedia.type === 'video'"
            class="desktop-frame-media"
            :src="desktopFrameMedia.url"
            autoplay
            muted
            loop
            playsinline
            preload="auto"
        />
        <img v-else-if="desktopFrameMedia.type === 'image'" class="desktop-frame-media" :src="desktopFrameMedia.url" alt="" />
    </div>
    <AppHeader v-if="showDesktopPersistentHeader" class="desktop-persistent-header" />
    <div class="app-shell" :class="appShellClass">
        <div v-if="websiteShellReady && siteMaintenanceEnabled" class="maintenance-screen">
            <div class="maintenance-card">
                <div class="maintenance-rich-content" v-html="siteMaintenancePageContent"></div>
            </div>
        </div>
        <RouterView v-else-if="websiteShellReady" />
    </div>
</template>

<style scoped>
.maintenance-screen {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.4rem;
    background: #ffffff;
}

.maintenance-card {
    width: 100%;
    max-width: 7.2rem;
    padding: 0.72rem 0.48rem;
    border-radius: 0.28rem;
    background: #ffffff;
    box-shadow: inset 0 0 0 1px #e5e7eb;
}

.maintenance-rich-content {
    color: #4b5563;
    font-size: 0.28rem;
    line-height: 1.6;
    text-align: center;
}

.maintenance-rich-content :deep(h1) {
    margin: 0 0 0.18rem;
    color: #111827;
    font-size: 0.42rem;
    line-height: 1.3;
    font-weight: 700;
}

.maintenance-rich-content :deep(h2) {
    margin: 0 0 0.16rem;
    color: #111827;
    font-size: 0.32rem;
    line-height: 1.4;
    font-weight: 600;
}

.maintenance-rich-content :deep(p) {
    margin: 0 0 0.16rem;
}

.maintenance-rich-content :deep(p:last-child) {
    margin-bottom: 0;
}

.maintenance-rich-content :deep(img) {
    display: block;
    max-width: 100%;
    height: auto;
    margin: 0.24rem auto;
}

.maintenance-rich-content :deep(a) {
    color: #1d58a7;
    word-break: break-word;
}

.maintenance-rich-content :deep(ul),
.maintenance-rich-content :deep(ol) {
    margin: 0 0 0.16rem;
    padding-left: 0.34rem;
    text-align: left;
}

.maintenance-rich-content :deep(hr) {
    border: 0;
    border-top: 1px solid #e5e7eb;
    margin: 0.28rem 0;
}
</style>
