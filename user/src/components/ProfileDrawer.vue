<script setup>
import { computed, inject, onBeforeUnmount, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import headImg from '@/assets/static/img/profile/head.png'
import cameraImg from '@/assets/static/img/profile/camera.png'
import referralImg from '@/assets/static/img/profile/Referral Code img.png'
import profileIcon from '@/assets/static/img/profile/profile.png'
import transactionIcon from '@/assets/static/img/profile/Transaction.png'
import aboutUsIcon from '@/assets/static/img/profile/About Us.png'
import { request } from '@/utils/request'
import { getAvailableBalance, resolveUserAvatar } from '@/utils/currentUser'
import { getVipDisplayName, getVipLevelIcon } from '@/utils/profile'
import { copyText } from '@/utils/clipboard'

const props = defineProps({
    isOpen: Boolean
})

const emit = defineEmits(['close'])
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

onBeforeUnmount(() => {
    if (noticeTimer) {
        window.clearTimeout(noticeTimer)
    }

    if (pendingAvatarPreview.value) {
        URL.revokeObjectURL(pendingAvatarPreview.value)
    }
})

const closeDrawer = () => {
    emit('close')
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

const handleItemClick = item => {
    if (item === 'Edit Profile') {
        closeDrawer()
        router.push('/edit-profile')
    } else if (item === 'User Mode') {
        closeDrawer()
        router.push('/user-mode')
    } else if (item === 'Event') {
        closeDrawer()
        router.push('/event')
    } else if (item === 'Transaction') {
        closeDrawer()
        router.push('/transaction')
    } else if (item === 'Check In Salary') {
        closeDrawer()
        router.push('/checkin')
    } else if (item === 'Financial Information') {
        closeDrawer()
        router.push('/finance')
    } else if (item === 'Rank') {
        closeDrawer()
        router.push('/rank')
    } else if (item === 'About Us') {
        closeDrawer()
        router.push('/about-us')
    } else if (item === 'Certificates') {
        closeDrawer()
        router.push('/certificates')
    } else if (item === 'Terms Conditions') {
        closeDrawer()
        router.push('/terms-conditions')
    } else if (item === 'FAQs') {
        closeDrawer()
        router.push('/faqs')
    } else if (item === 'Contact Us') {
        closeDrawer()
        router.push('/contact-us')
    }
}

const handleLogout = async () => {
    closeDrawer()

    try {
        await request('/api/user/logout', {
            method: 'POST'
        })
    } catch {}

    authState?.clearCurrentUser?.()
    router.push('/login')
}

const menuGroups = [
    {
        title: 'My Profile',
        icon: profileIcon,
        items: ['Edit Profile', 'User Mode', 'Event', 'Check In Salary', 'Rank']
    },
    {
        title: 'Transaction',
        icon: transactionIcon,
        items: ['Transaction', 'Financial Information']
    },
    {
        title: 'About Us',
        icon: aboutUsIcon,
        items: ['About Us', 'Certificates', 'Terms Conditions', 'FAQs', 'Contact Us']
    }
]
</script>

<template>
    <div class="drawer-overlay mobile-frame-fixed mobile-frame-fullscreen" :class="{ active: isOpen }" @click="closeDrawer">
        <div class="drawer-content" :class="{ active: isOpen }" @click.stop>
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
                @action="closeDrawer"
                @open-avatar-modal="openAvatarModal"
                @avatar-error="handleAvatarError"
                @copy-referral-code="copyReferralCode"
            />

            <input ref="avatarInput" type="file" accept="image/png,image/jpeg,image/gif,image/webp" class="avatar-input" @change="handleAvatarSelected" />

            <!-- Menu Groups -->
            <div class="menu-groups">
                <div v-for="group in menuGroups" :key="group.title" class="menu-group">
                    <div class="group-header">
                        <img :src="group.icon" alt="icon" class="group-icon" />
                        <span>{{ group.title }}</span>
                    </div>
                    <div class="menu-items">
                        <div v-for="item in group.items" :key="item" class="menu-item" @click="handleItemClick(item)">
                            <span>{{ item }}</span>
                            <i class="arrow-right"></i>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Logout Button -->
            <div class="logout-section">
                <button class="logout-btn" @click="handleLogout">LOG OUT</button>
                <div class="copyright">Copyright © 2005-2026 Grey Group All rights reserved</div>
            </div>
        </div>
    </div>
    <teleport to="body">
        <div v-if="isAvatarModalOpen" class="avatar-modal-overlay mobile-frame-fixed mobile-frame-fullscreen" @click="closeAvatarModal">
            <div class="avatar-modal" @click.stop>
                <h3 class="avatar-modal-title">Upload Avatar</h3>
                <div class="avatar-modal-preview">
                    <img :src="pendingAvatarPreview || avatarSrc" alt="Avatar Preview" class="avatar-modal-image" :class="{ 'avatar-modal-image-default': !pendingAvatarPreview && isDefaultAvatar }" @error="handleAvatarError" />
                </div>
                <p class="avatar-modal-hint">JPG, PNG, GIF, WEBP. Max 5MB.</p>
                <div class="avatar-modal-actions">
                    <button type="button" class="avatar-modal-btn secondary" :disabled="isUploadingAvatar" @click="openAvatarPicker">Choose Image</button>
                    <button type="button" class="avatar-modal-btn ghost" :disabled="isUploadingAvatar" @click="closeAvatarModal">Cancel</button>
                    <button type="button" class="avatar-modal-btn primary" :disabled="!pendingAvatarFile || isUploadingAvatar" @click="uploadAvatar">
                        {{ isUploadingAvatar ? 'Uploading...' : 'Upload' }}
                    </button>
                </div>
            </div>
        </div>
        <div v-if="isNoticeVisible" class="notice-toast mobile-frame-fixed mobile-frame-fullscreen">
            <div class="notice-toast-card">{{ noticeMessage }}</div>
        </div>
    </teleport>
</template>

<style scoped>
.drawer-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 2000;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
}

.drawer-overlay.active {
    opacity: 1;
    visibility: visible;
}

.drawer-content {
    position: absolute;
    top: 0;
    right: -100%;
    width: 100%;
    height: 100%;
    background-color: #ffffff;
    transition: all 0.3s ease;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
}

.drawer-content.active {
    right: 0;
}

.avatar-input {
    display: none;
}

/* Menu Groups */
.menu-groups {
    flex: 1;
}

.menu-group {
    border-bottom: 0.16rem solid #f8f9fa;
}

.group-header {
    display: flex;
    align-items: center;
    gap: 0.2rem;
    padding: 0.35rem 0.4rem;
    font-size: 0.34rem;
    font-weight: 600;
    color: #1d58a7;
    border-bottom: 1px solid #f0f0f0;
}

.group-icon {
    width: 0.44rem;
    height: 0.44rem;
}

.menu-items {
    padding: 0 0.4rem;
}

.menu-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.35rem 0;
    font-size: 0.3rem;
    color: #333333;
    border-bottom: 1px solid #f0f0f0;
}

.menu-item:last-child {
    border-bottom: none;
}

.arrow-right {
    width: 0.28rem;
    height: 0.28rem;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23ccc' viewBox='0 0 24 24'%3E%3Cpath d='M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z'/%3E%3C/svg%3E");
    background-size: contain;
    background-repeat: no-repeat;
}

/* Logout Section */
.logout-section {
    padding: 0.6rem 0.4rem 0.4rem;
    text-align: center;
}

.logout-btn {
    width: 100%;
    height: 1rem;
    background-color: #1d58a7;
    color: #ffffff;
    border: none;
    border-radius: 0.5rem;
    font-size: 0.34rem;
    font-weight: 600;
    margin-bottom: 0.4rem;
}

.copyright {
    font-size: 0.2rem;
    color: #999999;
}

.avatar-modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 2300;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem;
    background: rgba(15, 23, 42, 0.45);
    box-sizing: border-box;
}

.avatar-modal {
    width: min(100%, 6.4rem);
    background: #ffffff;
    border-radius: 0.28rem;
    padding: 0.42rem 0.34rem 0.34rem;
    box-shadow: 0 0.2rem 0.6rem rgba(15, 23, 42, 0.25);
    text-align: center;
}

.avatar-modal-title {
    margin: 0 0 0.28rem;
    font-size: 0.34rem;
    color: #1f2937;
}

.avatar-modal-preview {
    width: 2.2rem;
    height: 2.2rem;
    margin: 0 auto 0.24rem;
    border-radius: 50%;
    overflow: hidden;
    border: 0.04rem solid #e5e7eb;
    background: #f8fafc;
}

.avatar-modal-image {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
}

.avatar-modal-image-default {
    transform: translate(7%, 4%);
}

.avatar-modal-hint {
    margin: 0 0 0.3rem;
    font-size: 0.24rem;
    line-height: 1.5;
    color: #6b7280;
}

.avatar-modal-actions {
    display: flex;
    flex-direction: column;
    gap: 0.16rem;
}

.avatar-modal-btn {
    width: 100%;
    min-height: 0.86rem;
    border-radius: 0.2rem;
    border: 0;
    font-size: 0.28rem;
    font-weight: 600;
}

.avatar-modal-btn.primary {
    background: #245fa8;
    color: #ffffff;
}

.avatar-modal-btn.secondary {
    background: #30946b;
    color: #ffffff;
}

.avatar-modal-btn.ghost {
    background: #eef2f7;
    color: #334155;
}

.avatar-modal-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.notice-toast {
    position: fixed;
    inset: 0;
    z-index: 2400;
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

:global(body.desktop-mobile-frame .drawer-overlay) {
    top: 72px !important;
    left: 0 !important;
    right: 0 !important;
    bottom: auto !important;
    width: 100vw !important;
    max-width: 100vw !important;
    height: calc(100vh - 72px) !important;
    z-index: 900;
}

:global(body.desktop-mobile-frame .drawer-content) {
    top: 0;
    right: 0;
    width: min(420px, 100vw);
    height: 100%;
    transform: translateX(100%);
    transition: transform 0.3s ease;
}

:global(body.desktop-mobile-frame .drawer-content.active) {
    right: 0;
    transform: translateX(0);
}
</style>
