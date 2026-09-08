<script setup>
import { useRoute, useRouter } from 'vue-router'
import logoImg from '@/assets/static/img/common/logo.png'
import homeIcon from '@/assets/static/img/common/home-1.png'
import homeActiveIcon from '@/assets/static/img/common/home-2.png'
import ordersIcon from '@/assets/static/img/common/record-1.png'
import ordersActiveIcon from '@/assets/static/img/common/record-2.png'
import missionIcon from '@/assets/static/img/common/middle.png'
import walletIcon from '@/assets/static/img/common/Financial Information-1.png'
import walletActiveIcon from '@/assets/static/img/common/Financial Information-2.png'
import checkinIcon from '@/assets/static/img/common/Check In Salary-1.png'
import checkinActiveIcon from '@/assets/static/img/common/Check In Salary-2.png'
import profileIcon from '@/assets/static/img/profile/profile.png'

const router = useRouter()
const route = useRoute()

const sidebarItems = [
    { label: 'Home', icon: homeIcon, activeIcon: homeActiveIcon, path: '/' },
    { label: 'Orders', icon: ordersIcon, activeIcon: ordersActiveIcon, path: '/record' },
    { label: 'Mission', icon: missionIcon, activeIcon: missionIcon, path: '/process' },
    { label: 'Wallet', icon: walletIcon, activeIcon: walletActiveIcon, path: '/finance' },
    { label: 'Check-in', icon: checkinIcon, activeIcon: checkinActiveIcon, path: '/checkin' },
    { label: 'Profile', icon: profileIcon, path: '/profile' }
]

const profileRelatedPaths = new Set([
    '/profile',
    '/edit-profile',
    '/user-mode',
    '/event',
    '/rank',
    '/transaction',
    '/about-us',
    '/certificates',
    '/terms-conditions',
    '/faqs',
    '/contact-us'
])

function isActive(item) {
    if (item.path === '/profile') {
        return profileRelatedPaths.has(route.path)
    }

    return route.path === item.path
}

function getIcon(item) {
    return isActive(item) ? (item.activeIcon || item.icon) : item.icon
}

function navigateTo(item) {
    if (!item?.path || route.path === item.path) {
        return
    }

    router.push(item.path)
}
</script>

<template>
    <aside class="desktop-sidebar" aria-label="Desktop navigation">
        <div class="desktop-sidebar__brand">
            <img :src="logoImg" alt="Construct Digital" class="desktop-sidebar__logo" />
            <div class="desktop-sidebar__brand-copy">
                <span>CONSTRUCT</span>
                <span>DIGITAL</span>
            </div>
        </div>

        <nav class="desktop-sidebar__nav">
            <button
                v-for="item in sidebarItems"
                :key="item.label"
                type="button"
                class="desktop-sidebar__item"
                :class="{ active: isActive(item) }"
                @click="navigateTo(item)"
            >
                <img :src="getIcon(item)" alt="" class="desktop-sidebar__icon" />
                <span>{{ item.label }}</span>
            </button>
        </nav>
    </aside>
</template>

<style scoped>
.desktop-sidebar {
    display: none;
}

@media (min-width: 481px) {
    :global(body.desktop-workspace-page .desktop-sidebar) {
        position: fixed;
        inset: 0 auto 0 0;
        z-index: 20;
        display: block;
        width: var(--desktop-sidebar-width);
        background: #f2f5fa;
        border-right: 1px solid rgba(225, 230, 238, 0.95);
    }

    :global(body.desktop-workspace-page .desktop-sidebar__brand) {
        position: absolute;
        top: 58px;
        left: 50%;
        display: flex;
        align-items: center;
        gap: 8px;
        transform: translateX(-50%);
    }

    :global(body.desktop-workspace-page .desktop-sidebar__logo) {
        width: 45px;
        height: 45px;
        object-fit: contain;
        flex: 0 0 auto;
    }

    :global(body.desktop-workspace-page .desktop-sidebar__brand-copy) {
        display: flex;
        flex-direction: column;
        color: #050505;
        font-size: 18px;
        line-height: 21px;
        font-weight: 500;
        letter-spacing: -0.02em;
        white-space: nowrap;
    }

    :global(body.desktop-workspace-page .desktop-sidebar__nav) {
        position: absolute;
        top: 186px;
        left: 50%;
        width: 131px;
        display: flex;
        flex-direction: column;
        gap: 45px;
        transform: translateX(-50%);
    }

    :global(body.desktop-workspace-page .desktop-sidebar__item) {
        width: 131px;
        height: 46px;
        border: 0;
        border-radius: 999px;
        background: transparent;
        color: #a8abb0;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        gap: 16px;
        padding: 0 28px;
        font: inherit;
        font-size: 13px;
        line-height: 1;
        font-weight: 400;
        cursor: pointer;
    }

    :global(body.desktop-workspace-page .desktop-sidebar__item.active) {
        background: #2262b6;
        color: #ffffff;
    }

    :global(body.desktop-workspace-page .desktop-sidebar__icon) {
        width: 20px;
        height: 20px;
        object-fit: contain;
        opacity: 1;
        filter: grayscale(1) brightness(0) opacity(0.28);
    }

    :global(body.desktop-workspace-page .desktop-sidebar__item.active .desktop-sidebar__icon) {
        opacity: 1;
        filter: brightness(0) invert(1);
    }
}
</style>
