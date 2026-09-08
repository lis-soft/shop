<script setup>
import { useRouter } from 'vue-router'
import { computed, inject, onBeforeUnmount, reactive, ref, watch } from 'vue'
import DesktopSidebar from '@/components/DesktopSidebar.vue'
import ProfileAvatarModal from '@/components/profile/ProfileAvatarModal.vue'
import ProfileInfoCard from '@/components/profile/ProfileInfoCard.vue'
import ProfilePasswordSection from '@/components/profile/ProfilePasswordSection.vue'
import headImg from '@/assets/static/img/profile/head.png'
import cameraImg from '@/assets/static/img/profile/camera.png'
import referralImg from '@/assets/static/img/profile/Referral Code img.png'
import { getAvailableBalance, resolveUserAvatar } from '@/utils/currentUser'
import { getVipDisplayName, getVipLevelIcon } from '@/utils/profile'
import { request } from '@/utils/request'
import { copyText } from '@/utils/clipboard'

const router = useRouter()
const profileState = inject('profileState')
const authState = inject('authState', null)
const avatarInput = ref(null)
const isUploadingAvatar = ref(false)
const isAvatarModalOpen = ref(false)
const pendingAvatarFile = ref(null)
const pendingAvatarPreview = ref('')
const noticeMessage = ref('')
const isNoticeVisible = ref(false)
const displayedAvatarSrc = ref(headImg)
const isUpdatingPayPassword = ref(false)
const isUpdatingLoginPassword = ref(false)
let noticeTimer = null

const payPasswordForm = reactive({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
})

const loginPasswordForm = reactive({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
})

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
const displayCountry = computed(() => currentUser.value?.country_code || '--')
const displayPhone = computed(() => currentUser.value?.phone || '--')
const displayEmail = computed(() => currentUser.value?.email || '--')
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

const handleAvatarSelected = async event => {
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

const resetPayPasswordForm = () => {
    payPasswordForm.oldPassword = ''
    payPasswordForm.newPassword = ''
    payPasswordForm.confirmPassword = ''
}

const resetLoginPasswordForm = () => {
    loginPasswordForm.oldPassword = ''
    loginPasswordForm.newPassword = ''
    loginPasswordForm.confirmPassword = ''
}

const validatePayPasswordForm = () => {
    if (!payPasswordForm.oldPassword) {
        throw new Error('Please enter your current withdrawal PIN')
    }

    if (!/^\d{6}$/.test(payPasswordForm.newPassword)) {
        throw new Error('Withdrawal PIN must be 6 digits')
    }

    if (payPasswordForm.newPassword !== payPasswordForm.confirmPassword) {
        throw new Error('The new withdrawal PIN entries do not match')
    }

    if (payPasswordForm.oldPassword === payPasswordForm.newPassword) {
        throw new Error('The new withdrawal PIN must be different')
    }
}

const validateLoginPasswordForm = () => {
    if (!loginPasswordForm.oldPassword) {
        throw new Error('Please enter your current password')
    }

    if (!loginPasswordForm.newPassword || loginPasswordForm.newPassword.length < 6) {
        throw new Error('The new password must be at least 6 characters')
    }

    if (loginPasswordForm.newPassword !== loginPasswordForm.confirmPassword) {
        throw new Error('The new password entries do not match')
    }

    if (loginPasswordForm.oldPassword === loginPasswordForm.newPassword) {
        throw new Error('The new password must be different')
    }
}

const updatePayPassword = async () => {
    if (isUpdatingPayPassword.value) {
        return
    }

    try {
        validatePayPasswordForm()
        isUpdatingPayPassword.value = true

        await request('/api/user/changePayPassword', {
            method: 'PUT',
            body: JSON.stringify({
                oldPassword: payPasswordForm.oldPassword,
                newPassword: payPasswordForm.newPassword
            })
        })

        resetPayPasswordForm()
        showNotice('Withdrawal PIN updated successfully')
    } catch (error) {
        showNotice(error.message || 'Failed to update withdrawal PIN')
    } finally {
        isUpdatingPayPassword.value = false
    }
}

const updateLoginPassword = async () => {
    if (isUpdatingLoginPassword.value) {
        return
    }

    try {
        validateLoginPasswordForm()
        isUpdatingLoginPassword.value = true

        await request('/api/user/changePassword', {
            method: 'PUT',
            body: JSON.stringify({
                oldPassword: loginPasswordForm.oldPassword,
                newPassword: loginPasswordForm.newPassword
            })
        })

        try {
            await request('/api/user/logout', {
                method: 'POST'
            })
        } catch {}

        resetLoginPasswordForm()
        authState?.clearCurrentUser?.()
        showNotice('Login password updated successfully, please sign in again')
        window.setTimeout(() => {
            router.push('/login')
        }, 300)
    } catch (error) {
        showNotice(error.message || 'Failed to update login password')
    } finally {
        isUpdatingLoginPassword.value = false
    }
}

const goBack = () => {
    if (profileState) {
        profileState.toggle(true)
    }
    router.back()
}
</script>

<template>
    <div class="edit-profile-view desktop-workspace-shell">
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
            @action="goBack"
            @open-avatar-modal="openAvatarModal"
            @avatar-error="handleAvatarError"
            @copy-referral-code="copyReferralCode"
        />

        <div class="scroll-content">
            <input ref="avatarInput" type="file" accept="image/png,image/jpeg,image/gif,image/webp" class="avatar-input" @change="handleAvatarSelected" />

            <ProfileInfoCard
                :display-name="displayName"
                :display-country="displayCountry"
                :display-phone="displayPhone"
                :display-email="displayEmail"
            />

            <ProfilePasswordSection
                :form="payPasswordForm"
                title="Withdrawal PIN"
                current-label="Current PIN"
                new-label="New PIN"
                confirm-label="Confirm New PIN"
                forgot-text="Forgot your withdrawal PIN? Reach out to user support to set up a new one."
                input-type="password"
                input-mode="numeric"
                :max-length="6"
                :is-submitting="isUpdatingPayPassword"
                @update:form="Object.assign(payPasswordForm, $event)"
                @save="updatePayPassword"
            />

            <ProfilePasswordSection
                :form="loginPasswordForm"
                title="Login Password"
                current-label="Current Password"
                new-label="New Password"
                confirm-label="Confirm New Password"
                forgot-text="Forgot your password? Reach out to user support to set up a new one."
                input-type="password"
                :is-submitting="isUpdatingLoginPassword"
                @update:form="Object.assign(loginPasswordForm, $event)"
                @save="updateLoginPassword"
            />
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
.edit-profile-view {
    background-color: #f8f9fa;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}

.avatar-input {
    display: none;
}

.scroll-content {
    flex: 1;
    overflow-y: auto;
    padding-bottom: 0.6rem;
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
    :global(body.desktop-profile-related-page .edit-profile-view) {
        width: 100vw;
        height: 100vh;
        min-height: 100vh;
        padding-left: var(--desktop-sidebar-width) !important;
        background: #f7f7f7;
        display: block;
        overflow-y: auto;
        overflow-x: hidden;
        box-sizing: border-box;
    }

    :global(body.desktop-profile-related-page .edit-profile-view > .profile-overview) {
        width: var(--desktop-content-width);
        margin-left: var(--desktop-content-left-gap);
        margin-top: clamp(30px, 4.2vh, 48px);
    }

    :global(body.desktop-profile-related-page .edit-profile-view .scroll-content) {
        width: var(--desktop-content-width);
        margin-left: var(--desktop-content-left-gap);
        margin-top: clamp(22px, 3.2vh, 34px);
        padding-bottom: clamp(42px, 6vh, 72px);
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: clamp(16px, 1.8vw, 24px);
        overflow: visible;
    }

    :global(body.desktop-profile-related-page .edit-profile-view .scroll-content .card) {
        min-width: 0;
        margin: 0;
        padding: clamp(22px, 2.2vw, 30px);
        border-radius: 12px;
        background: #ffffff;
        box-shadow: 0 10px 28px rgba(15, 23, 42, 0.08);
        border: 1px solid rgba(226, 232, 240, 0.9);
    }

    :global(body.desktop-profile-related-page .edit-profile-view .scroll-content .section-title) {
        margin: 0 0 22px;
        color: #1f2937;
        font-size: 20px;
        line-height: 1.25;
        font-weight: 600;
    }

    :global(body.desktop-profile-related-page .edit-profile-view .scroll-content .info-item),
    :global(body.desktop-profile-related-page .edit-profile-view .scroll-content .form-item) {
        margin-bottom: 18px;
    }

    :global(body.desktop-profile-related-page .edit-profile-view .scroll-content .info-item label),
    :global(body.desktop-profile-related-page .edit-profile-view .scroll-content .form-item label) {
        margin-bottom: 8px;
        color: #8a94a6;
        font-size: 13px;
        line-height: 1.2;
    }

    :global(body.desktop-profile-related-page .edit-profile-view .scroll-content .value) {
        min-height: 24px;
        color: #1f2937;
        font-size: 16px;
        line-height: 1.4;
        font-weight: 500;
    }

    :global(body.desktop-profile-related-page .edit-profile-view .scroll-content .form-item input) {
        height: 44px;
        margin-top: 0;
        padding: 0 14px;
        border-radius: 8px;
        border-color: #d9dee8;
        color: #1f2937;
        font-size: 15px;
        background: #ffffff;
    }

    :global(body.desktop-profile-related-page .edit-profile-view .scroll-content .forgot-text) {
        margin: 20px 0;
        color: #667085;
        font-size: 13px;
        line-height: 1.45;
    }

    :global(body.desktop-profile-related-page .edit-profile-view .scroll-content .save-btn) {
        height: 46px;
        border-radius: 999px;
        background: #2b65b3;
        color: #ffffff;
        font-size: 15px;
        font-weight: 600;
    }
}

</style>
