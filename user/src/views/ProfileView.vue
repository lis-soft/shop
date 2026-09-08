<script setup>
import { computed, inject, onBeforeUnmount, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import DesktopSidebar from '@/components/DesktopSidebar.vue'
import ProfileAvatarModal from '@/components/profile/ProfileAvatarModal.vue'
import profileIcon from '@/assets/static/img/profile/profile.png'
import transactionIcon from '@/assets/static/img/profile/Transaction.png'
import aboutUsIcon from '@/assets/static/img/profile/About Us.png'
import headImg from '@/assets/static/img/profile/head.png'
import cameraImg from '@/assets/static/img/profile/camera.png'
import referralImg from '@/assets/static/img/profile/Referral Code img.png'
import { getAvailableBalance, resolveUserAvatar } from '@/utils/currentUser'
import { getVipDisplayName, getVipLevelIcon } from '@/utils/profile'
import { request } from '@/utils/request'
import { copyText } from '@/utils/clipboard'

const router = useRouter()
const authState = inject('authState', null)
const avatarInput = ref(null)
const isUploadingAvatar = ref(false)
const isAvatarModalOpen = ref(false)
const pendingAvatarFile = ref(null)
const pendingAvatarPreview = ref('')
const noticeMessage = ref('')
const isNoticeVisible = ref(false)
const displayedAvatarSrc = ref(headImg)
let noticeTimer = null

const desktopProfileGroups = [
    {
        title: 'My Profile',
        icon: profileIcon,
        items: [
            { label: 'Edit Profile', path: '/edit-profile' },
            { label: 'User Mode', path: '/user-mode' },
            { label: 'Event', path: '/event' },
            { label: 'Check In Salary', path: '/checkin' },
            { label: 'Rank', path: '/rank' }
        ]
    },
    {
        title: 'Transaction',
        icon: transactionIcon,
        items: [
            { label: 'Transaction', path: '/transaction' },
            { label: 'Financial Information', path: '/finance' }
        ]
    },
    {
        title: 'About Us',
        icon: aboutUsIcon,
        items: [
            { label: 'About Us', path: '/about-us' },
            { label: 'Certificates', path: '/certificates' },
            { label: 'Terms Conditions', path: '/terms-conditions' },
            { label: 'FAQs', path: '/faqs' },
            { label: 'Contact Us', path: '/contact-us' }
        ]
    }
]

const currentUser = computed(() => authState?.currentUser?.value || null)
const displayName = computed(() => currentUser.value?.username || 'Guest')
const displayMemberText = computed(() => getVipDisplayName(currentUser.value))
const displayBalance = computed(() => `$ ${getAvailableBalance(currentUser.value).toFixed(2)}`)
const displayScore = computed(() => {
    const score = Number(currentUser.value?.credit_score)

    if (!Number.isFinite(score)) {
        return 100
    }

    return Math.max(0, Math.min(score, 100))
})
const scoreDasharray = computed(() => `${displayScore.value}, 100`)
const displayReferralCode = computed(() => currentUser.value?.invite_code || currentUser.value?.inviteCode || '--')
const rawAvatarSrc = computed(() => resolveUserAvatar(currentUser.value?.avatar) || '')
const avatarSrc = computed(() => displayedAvatarSrc.value || headImg)
const isDefaultAvatar = computed(() => avatarSrc.value === headImg)
const levelIconSrc = computed(() => getVipLevelIcon(currentUser.value))

watch(
    rawAvatarSrc,
    source => {
        if (!source) {
            displayedAvatarSrc.value = headImg
            return
        }

        const probe = new Image()
        probe.onload = () => {
            displayedAvatarSrc.value = source
        }
        probe.onerror = () => {
            displayedAvatarSrc.value = headImg
        }
        probe.src = source
    },
    { immediate: true }
)

const showNotice = message => {
    if (!message) {
        return
    }

    noticeMessage.value = message
    isNoticeVisible.value = true

    if (noticeTimer) {
        window.clearTimeout(noticeTimer)
    }

    noticeTimer = window.setTimeout(() => {
        isNoticeVisible.value = false
    }, 2600)
}

const handleAvatarError = () => {
    displayedAvatarSrc.value = headImg
}

const openAvatarModal = () => {
    if (isUploadingAvatar.value) {
        return
    }

    isAvatarModalOpen.value = true
}

const closeAvatarModal = () => {
    if (isUploadingAvatar.value) {
        return
    }

    isAvatarModalOpen.value = false

    if (pendingAvatarPreview.value) {
        URL.revokeObjectURL(pendingAvatarPreview.value)
        pendingAvatarPreview.value = ''
    }

    pendingAvatarFile.value = null
}

const openAvatarPicker = () => {
    if (isUploadingAvatar.value) {
        return
    }

    avatarInput.value?.click()
}

const handleAvatarSelected = event => {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) {
        return
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
        showNotice('Please upload a JPG, PNG, GIF, or WEBP image')
        return
    }

    if (file.size > 5 * 1024 * 1024) {
        showNotice('Image size must be less than 5MB')
        return
    }

    if (pendingAvatarPreview.value) {
        URL.revokeObjectURL(pendingAvatarPreview.value)
    }

    pendingAvatarFile.value = file
    pendingAvatarPreview.value = URL.createObjectURL(file)
}

const uploadAvatar = async () => {
    if (!pendingAvatarFile.value || isUploadingAvatar.value) {
        return
    }

    isUploadingAvatar.value = true

    try {
        const formData = new FormData()
        formData.append('file', pendingAvatarFile.value)

        const uploadResult = await request('/api/user/upload/image', {
            method: 'POST',
            body: formData
        })

        const avatarUrl = uploadResult?.data?.url
        if (!avatarUrl) {
            throw new Error('Avatar upload failed')
        }

        await request('/api/user/info', {
            method: 'PUT',
            body: JSON.stringify({
                avatar: avatarUrl
            })
        })

        await authState?.refreshCurrentUser?.()
        closeAvatarModal()
        showNotice('Avatar updated successfully')
    } catch (error) {
        showNotice(error.message || 'Avatar upload failed')
    } finally {
        isUploadingAvatar.value = false
    }
}

const copyReferralCode = async () => {
    const inviteCode = displayReferralCode.value

    if (!inviteCode || inviteCode === '--') {
        showNotice('Referral code is unavailable')
        return
    }

    try {
        await copyText(inviteCode)
        showNotice('Referral code copied')
    } catch (error) {
        showNotice(error.message || 'Copy failed')
    }
}

const navigateProfileItem = item => {
    if (!item?.path) {
        return
    }

    router.push(item.path)
}

const handleLogout = async () => {
    try {
        await request('/api/user/logout', {
            method: 'POST'
        })
    } catch {}

    authState?.clearCurrentUser?.()
    router.push('/login')
}

onBeforeUnmount(() => {
    if (noticeTimer) {
        window.clearTimeout(noticeTimer)
    }

    if (pendingAvatarPreview.value) {
        URL.revokeObjectURL(pendingAvatarPreview.value)
    }
})
</script>

<template>
    <div class="profile-page desktop-workspace-shell">
        <DesktopSidebar />
        <ProfileOverviewHeader
            :avatar-src="avatarSrc"
            :is-default-avatar="isDefaultAvatar"
            :is-uploading-avatar="isUploadingAvatar"
            :display-name="displayName"
            :display-member-text="displayMemberText"
            :level-icon-src="levelIconSrc"
            :display-balance="displayBalance"
            :score-dasharray="scoreDasharray"
            :display-score="displayScore"
            :referral-img="referralImg"
            :camera-img="cameraImg"
            :display-referral-code="displayReferralCode"
            @action="router.back()"
            @open-avatar-modal="openAvatarModal"
            @avatar-error="handleAvatarError"
            @copy-referral-code="copyReferralCode"
        />

        <input ref="avatarInput" type="file" accept="image/png,image/jpeg,image/gif,image/webp" class="avatar-input" @change="handleAvatarSelected" />

        <section class="desktop-profile-tabs" aria-label="Profile tabs">
            <div
                v-for="group in desktopProfileGroups"
                :key="group.title"
                class="desktop-profile-tabs__group"
            >
                <div class="desktop-profile-tabs__header">
                    <img :src="group.icon" alt="" class="desktop-profile-tabs__icon" />
                    <span>{{ group.title }}</span>
                </div>
                <button
                    v-for="item in group.items"
                    :key="item.label"
                    type="button"
                    class="desktop-profile-tabs__item"
                    @click="navigateProfileItem(item)"
                >
                    {{ item.label }}
                </button>
            </div>
        </section>

        <div class="desktop-profile-logout">
            <button type="button" class="desktop-profile-logout__btn" @click="handleLogout">LOG OUT</button>
        </div>

        <teleport to="body">
            <ProfileAvatarModal
                :visible="isAvatarModalOpen"
                :pending-avatar-preview="pendingAvatarPreview"
                :avatar-src="avatarSrc"
                :is-default-avatar="isDefaultAvatar"
                :is-uploading-avatar="isUploadingAvatar"
                :has-pending-avatar-file="Boolean(pendingAvatarFile)"
                @close="closeAvatarModal"
                @choose="openAvatarPicker"
                @upload="uploadAvatar"
                @avatar-error="handleAvatarError"
            />
            <div v-if="isNoticeVisible" class="notice-toast mobile-frame-fixed mobile-frame-fullscreen">
                <div class="notice-toast-card">{{ noticeMessage }}</div>
            </div>
        </teleport>
    </div>
</template>

<style scoped>
.profile-page {
    width: 100%;
    min-height: 100vh;
    background: #ffffff;
}

.avatar-input {
    display: none;
}

.desktop-profile-tabs {
    display: none;
}

.desktop-profile-logout {
    display: none;
}

.notice-toast {
    position: fixed;
    inset: 0;
    z-index: 1200;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    padding: 0.5rem;
    box-sizing: border-box;
}

.notice-toast-card {
    min-width: 4.8rem;
    max-width: 100%;
    padding: 0.26rem 0.34rem;
    border-radius: 0.24rem;
    background: rgba(21, 36, 58, 0.92);
    color: #ffffff;
    font-size: 0.28rem;
    line-height: 1.45;
    text-align: center;
    box-shadow: 0 0.14rem 0.32rem rgba(15, 23, 42, 0.22);
    border: 1px solid rgba(255, 255, 255, 0.14);
    backdrop-filter: blur(0.08rem);
}

@media (min-width: 481px) {
    :global(body.desktop-profile-page .profile-page) {
        width: 100vw;
        height: 100vh;
        min-height: 100vh;
        padding-left: var(--desktop-sidebar-width) !important;
        background: #ffffff;
        display: block;
        overflow-y: auto;
        overflow-x: hidden;
        box-sizing: border-box;
    }

    :global(body.desktop-profile-page .profile-page > .profile-overview) {
        width: var(--desktop-content-width);
        margin-left: var(--desktop-content-left-gap);
        margin-top: clamp(30px, 4.2vh, 48px);
    }

    :global(body.desktop-profile-page .desktop-profile-tabs) {
        width: var(--desktop-content-width);
        margin-left: var(--desktop-content-left-gap);
        margin-top: clamp(24px, 3.8vh, 36px);
        padding-bottom: clamp(40px, 6vh, 72px);
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: clamp(18px, 2vw, 28px);
        align-items: start;
    }

    :global(body.desktop-profile-page .desktop-profile-tabs__group) {
        min-width: 0;
        border-radius: 10px;
        background: #ffffff;
    }

    :global(body.desktop-profile-page .desktop-profile-tabs__header) {
        height: 40px;
        display: flex;
        align-items: center;
        gap: 9px;
        color: #111111;
        font-size: 16px;
        line-height: 1;
        font-weight: 400;
        border-bottom: 1px solid #f0f0f0;
    }

    :global(body.desktop-profile-page .desktop-profile-tabs__icon) {
        width: 20px;
        height: 20px;
        object-fit: contain;
        filter: brightness(0) saturate(100%) invert(30%) sepia(90%) saturate(1187%) hue-rotate(194deg) brightness(92%) contrast(91%);
    }

    :global(body.desktop-profile-page .desktop-profile-tabs__item) {
        width: 100%;
        min-height: 38px;
        display: block;
        padding: 0 12px;
        border: 0;
        border-bottom: 1px solid #f0f0f0;
        background: transparent;
        color: #c6c6c6;
        font: inherit;
        font-size: 14px;
        line-height: 37px;
        text-align: left;
        cursor: pointer;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    :global(body.desktop-profile-page .desktop-profile-tabs__item:last-child) {
        border-bottom: 0;
    }

    :global(body.desktop-profile-page .desktop-profile-logout) {
        width: var(--desktop-content-width);
        margin-left: var(--desktop-content-left-gap);
        margin-top: clamp(4px, 1vh, 12px);
        padding-bottom: clamp(40px, 6vh, 72px);
        display: flex;
        justify-content: center;
    }

    :global(body.desktop-profile-page .desktop-profile-logout__btn) {
        width: min(100%, 360px);
        height: 46px;
        border: 0;
        border-radius: 23px;
        background: #1d58a7;
        color: #ffffff;
        font-size: 16px;
        font-weight: 600;
        line-height: 46px;
        text-align: center;
        cursor: pointer;
    }

    :global(body.desktop-profile-page .desktop-profile-logout__btn:hover) {
        background: #164989;
    }

    :global(body.desktop-profile-page .notice-toast) {
        left: var(--desktop-sidebar-width);
        width: calc(100vw - var(--desktop-sidebar-width));
    }

    :global(body.desktop-profile-page .notice-toast-card) {
        min-width: 240px;
        max-width: min(560px, var(--desktop-content-width));
        border-radius: 10px;
        padding: 14px 20px;
        font-size: 14px;
    }
}

@media (min-width: 481px) and (max-width: 1180px) {
    :global(body.desktop-profile-page .desktop-profile-tabs) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}

@media (min-width: 481px) and (max-width: 860px) {
    :global(body.desktop-profile-page .desktop-profile-tabs) {
        grid-template-columns: 1fr;
    }
}
</style>
