<script setup>
import { computed, inject, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ProfileDrawer from './ProfileDrawer.vue'

const props = defineProps({
    isSubPage: {
        type: Boolean,
        default: false
    }
})

const router = useRouter()
const route = useRoute()
const injectedProfileState = inject('profileState', null)
const fallbackProfileOpen = ref(false)
const profileState = injectedProfileState || {
    isOpen: fallbackProfileOpen,
    toggle: value => {
        fallbackProfileOpen.value = Boolean(value)
    }
}
const headerRef = ref(null)
const isDesktopHeaderHidden = ref(false)
const isDesktopMoreOpen = ref(false)
const isProfileOpen = computed(() => Boolean(profileState.isOpen?.value))
let scrollElement = null
let lastScrollTop = 0

const desktopPrimaryRoutes = [
    { label: 'Home', path: '/' },
    { label: 'Record', path: '/record' },
    { label: 'Process', path: '/process' },
    { label: 'Finance', path: '/finance' },
    { label: 'Check In', path: '/checkin' }
]

const desktopMoreRoutes = [
    { label: 'Event', path: '/event' },
    { label: 'Rank', path: '/rank' },
    { label: 'Transaction', path: '/transaction' },
    { label: 'User Mode', path: '/user-mode' },
    { label: 'About Us', path: '/about-us' },
    { label: 'Certificates', path: '/certificates' },
    { label: 'Terms', path: '/terms-conditions' },
    { label: 'FAQs', path: '/faqs' },
    { label: 'Contact Us', path: '/contact-us' }
]

/**
 * 通用头部组件，像素级还原截图。
 */

const goHome = () => {
    router.push('/')
}

const goBack = () => {
    if (profileState) {
        profileState.toggle(true)
    }
    router.back()
}

const toggleDrawer = () => {
    isDesktopMoreOpen.value = false
    profileState.toggle?.(true)
}

const isActiveRoute = path => route.path === path

const navigateDesktop = path => {
    isDesktopMoreOpen.value = false
    router.push(path)
}

const toggleDesktopMore = () => {
    isDesktopMoreOpen.value = !isDesktopMoreOpen.value
}

function isDesktopFrameMode() {
    return document.body.classList.contains('desktop-mobile-frame')
}

function getScrollTop() {
    if (scrollElement && scrollElement !== window) {
        return scrollElement.scrollTop
    }

    return window.scrollY || window.pageYOffset || 0
}

function handleDesktopScroll() {
    if (!isDesktopFrameMode()) {
        isDesktopHeaderHidden.value = false
        lastScrollTop = getScrollTop()
        return
    }

    const currentScrollTop = getScrollTop()

    if (currentScrollTop <= 8) {
        isDesktopHeaderHidden.value = false
        lastScrollTop = 0
        return
    }

    if (currentScrollTop > lastScrollTop + 6) {
        isDesktopHeaderHidden.value = true
        isDesktopMoreOpen.value = false
    } else if (currentScrollTop < lastScrollTop - 6) {
        isDesktopHeaderHidden.value = false
    }

    lastScrollTop = currentScrollTop
}

onMounted(() => {
    scrollElement = headerRef.value?.parentElement || window
    lastScrollTop = getScrollTop()
    if (typeof scrollElement?.addEventListener === 'function') {
        scrollElement.addEventListener('scroll', handleDesktopScroll, { passive: true })
    }
    window.addEventListener('resize', handleDesktopScroll, { passive: true })
})

onBeforeUnmount(() => {
    if (typeof scrollElement?.removeEventListener === 'function') {
        scrollElement.removeEventListener('scroll', handleDesktopScroll)
    }
    window.removeEventListener('resize', handleDesktopScroll)
})
</script>

<template>
    <header ref="headerRef" class="app-header mobile-frame-fixed mobile-frame-top" :class="{ 'desktop-header-hidden': isDesktopHeaderHidden }">
        <div class="header-left" @click="goHome">
            <div class="logo-box">
                <img src="@/assets/static/img/common/logo.png" alt="Logo" class="logo-img" />
            </div>
            <div class="brand-text">
                <span class="brand-line">CONSTRUCT</span>
                <span class="brand-line">DIGITAL</span>
            </div>
        </div>
        <div class="header-right">
            <div v-if="isSubPage" class="close-btn" @click="goBack">
                <i class="arrow-left"></i>
            </div>
            <div v-else class="menu-btn-wrapper" @click="toggleDrawer">
                <img src="@/assets/static/img/common/Group 38058.png" alt="Menu" class="menu-icon" />
            </div>
        </div>

        <button type="button" class="desktop-brand-mark" aria-label="Audle home" @click="goHome">
            <img src="/logo.png" alt="Audle" />
        </button>

        <nav class="desktop-route-nav" aria-label="Desktop user navigation">
            <button
                v-for="item in desktopPrimaryRoutes"
                :key="item.path"
                type="button"
                class="desktop-route-link"
                :class="{ active: isActiveRoute(item.path) }"
                @click="navigateDesktop(item.path)"
            >
                {{ item.label }}
            </button>

            <div class="desktop-more-menu">
                <button type="button" class="desktop-route-link desktop-more-toggle" :class="{ active: isDesktopMoreOpen }" @click="toggleDesktopMore">
                    More
                    <svg viewBox="0 0 12 12" aria-hidden="true">
                        <path d="M2.25 4.5 6 8.25 9.75 4.5" />
                    </svg>
                </button>
                <div v-if="isDesktopMoreOpen" class="desktop-more-panel">
                    <button
                        v-for="item in desktopMoreRoutes"
                        :key="item.path"
                        type="button"
                        class="desktop-more-link"
                        :class="{ active: isActiveRoute(item.path) }"
                        @click="navigateDesktop(item.path)"
                    >
                        {{ item.label }}
                    </button>
                </div>
            </div>
        </nav>

        <div class="desktop-landing-actions">
            <button
                class="desktop-menu-button"
                :class="{ 'is-active': isProfileOpen }"
                type="button"
                :aria-expanded="isProfileOpen ? 'true' : 'false'"
                aria-label="Open menu"
                @click="toggleDrawer"
            >
                <span></span>
                <span></span>
                <span></span>
            </button>
        </div>

        <!-- Profile Drawer -->
        <ProfileDrawer :is-open="isProfileOpen" @close="profileState.toggle?.(false)" />
    </header>
</template>

<style scoped>
.app-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 1.4rem; /* 约 70px / 50 = 1.4rem */
    padding: 0 0.4rem; /* 20px / 50 = 0.4rem */
    background-color: #1d58a7;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 1000;
    box-sizing: border-box;
}

.header-left {
    display: flex;
    align-items: center;
}

.logo-box {
    height: 0.88rem; /* 约 44px */
    margin-right: 0.16rem; /* 8px */
    display: flex;
    align-items: center;
}

.logo-img {
    height: 100%;
    width: auto;
    display: block;
}

.brand-text {
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.brand-line {
    color: #ffffff;
    font-size: 0.3rem; /* 15px */
    font-weight: 700;
    line-height: 1.1;
    letter-spacing: 0.01rem;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    white-space: nowrap;
}

.header-right {
    display: flex;
    align-items: center;
}

.menu-btn-wrapper {
    width: 0.88rem; /* 44px */
    height: 0.88rem; /* 44px */
    display: flex;
    align-items: center;
    justify-content: center;
}

.menu-icon {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
}

.close-btn {
    width: 0.88rem;
    height: 0.88rem;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
}

.arrow-left {
    display: inline-block;
    width: 0.48rem;
    height: 0.48rem;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='white' viewBox='0 0 24 24'%3E%3Cpath d='M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z'/%3E%3C/svg%3E");
    background-size: contain;
    background-repeat: no-repeat;
}

.desktop-brand-mark,
.desktop-route-nav,
.desktop-landing-actions {
    display: none;
}

:global(body.desktop-mobile-frame .app-header) {
    left: 0 !important;
    right: 0 !important;
    width: 100vw !important;
    max-width: 100vw !important;
    align-items: center;
    gap: 24px;
    height: 72px;
    padding: 0 18px;
    background: rgba(255, 255, 255, 0.94);
    border-bottom: 1px solid rgba(15, 23, 42, 0.08);
    backdrop-filter: blur(16px);
    transition: transform 0.24s ease, opacity 0.24s ease;
}

:global(body.desktop-mobile-frame .app-header > .header-left),
:global(body.desktop-mobile-frame .app-header > .header-right) {
    display: none;
}

:global(body.desktop-mobile-frame .desktop-brand-mark) {
    display: inline-flex;
    flex: 0 0 auto;
    width: 50px;
    height: 54px;
    align-items: center;
    justify-content: center;
    padding: 0;
    border: 0;
    background: transparent;
    cursor: pointer;
}

:global(body.desktop-mobile-frame .desktop-brand-mark img) {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
}

:global(body.desktop-mobile-frame .desktop-route-nav) {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 6px;
    flex: 1 1 auto;
    min-width: 0;
    margin-left: 2px;
}

:global(body.desktop-mobile-frame .desktop-route-link) {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    min-height: 34px;
    padding: 0 9px;
    border: 0;
    border-radius: 999px;
    background: transparent;
    color: #0f172a;
    font: inherit;
    font-size: 12px;
    line-height: 1;
    font-weight: 800;
    white-space: nowrap;
    cursor: pointer;
    transition: background-color 0.18s ease, color 0.18s ease;
}

:global(body.desktop-mobile-frame .desktop-route-link:hover),
:global(body.desktop-mobile-frame .desktop-route-link.active) {
    background: #0f172a;
    color: #ffffff;
}

:global(body.desktop-mobile-frame .desktop-more-menu) {
    position: relative;
    flex: 0 0 auto;
}

:global(body.desktop-mobile-frame .desktop-more-toggle svg) {
    width: 12px;
    height: 12px;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.7;
    stroke-linecap: round;
    stroke-linejoin: round;
}

:global(body.desktop-mobile-frame .desktop-more-panel) {
    position: absolute;
    top: calc(100% + 12px);
    right: 0;
    z-index: 1002;
    display: grid;
    grid-template-columns: repeat(2, minmax(120px, 1fr));
    gap: 6px;
    width: 280px;
    padding: 12px;
    border: 1px solid rgba(15, 23, 42, 0.08);
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.98);
    box-shadow: 0 18px 48px rgba(15, 23, 42, 0.16);
}

:global(body.desktop-mobile-frame .desktop-more-link) {
    min-height: 34px;
    padding: 0 10px;
    border: 0;
    border-radius: 12px;
    background: transparent;
    color: #0f172a;
    font: inherit;
    font-size: 12px;
    font-weight: 700;
    text-align: left;
    cursor: pointer;
}

:global(body.desktop-mobile-frame .desktop-more-link:hover),
:global(body.desktop-mobile-frame .desktop-more-link.active) {
    background: #eff6ff;
    color: #1d58a7;
}

:global(body.desktop-mobile-frame .desktop-landing-actions) {
    display: flex;
    align-items: center;
    flex: 0 0 auto;
    gap: 10px;
    padding-top: 0;
    color: #0f172a;
}

:global(body.desktop-mobile-frame .desktop-menu-button) {
    width: 36px;
    height: 36px;
}

:global(body.desktop-mobile-frame .desktop-header-hidden) {
    opacity: 0;
    pointer-events: none;
    transform: translateY(-110%) !important;
}

.desktop-icon-button,
.desktop-menu-button {
    appearance: none;
    border: 0;
    background: transparent;
    color: inherit;
    padding: 0;
    cursor: pointer;
}

.desktop-icon-button {
    width: 32px;
    height: 32px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.desktop-icon-button svg {
    width: 24px;
    height: 24px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2.25;
    stroke-linecap: round;
    stroke-linejoin: round;
}

.desktop-menu-button {
    display: inline-block;
    width: 36px;
    height: 36px;
    position: relative;
}

.desktop-menu-button span {
    position: absolute;
    left: 6px;
    right: 6px;
    height: 1.5px;
    background: currentColor;
    transition:
        top 0.2s ease,
        transform 0.2s ease,
        opacity 0.2s ease;
}

.desktop-menu-button span:nth-child(1) {
    top: 10px;
}

.desktop-menu-button span:nth-child(2) {
    top: 17px;
}

.desktop-menu-button span:nth-child(3) {
    top: 24px;
}

.desktop-menu-button.is-active span:nth-child(1) {
    top: 17px;
    transform: rotate(45deg);
}

.desktop-menu-button.is-active span:nth-child(2) {
    opacity: 0;
}

.desktop-menu-button.is-active span:nth-child(3) {
    top: 17px;
    transform: rotate(-45deg);
}
</style>
