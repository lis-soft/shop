<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import AppTabBar from '@/components/AppTabBar.vue'
import AuthNoticeToast from '@/components/auth/AuthNoticeToast.vue'
import CheckDashboard from '@/components/check/CheckDashboard.vue'
import CheckNotificationBar from '@/components/check/CheckNotificationBar.vue'
import DesktopSidebar from '@/components/DesktopSidebar.vue'
import giftImg from '@/assets/static/img/profile/gift.png'
import signIn1 from '@/assets/static/img/profile/sign-in-1.png'
import signIn2 from '@/assets/static/img/profile/sign-in-2.png'
import broadcastImg from '@/assets/static/img/profile/broadcast.png'
import { request } from '@/utils/request'
import { clearCurrentUser, refreshCurrentUser } from '@/utils/currentUser'

const router = useRouter()
const isLoading = ref(false)
const isSubmitting = ref(false)
const noticeMessage = ref('')
const isNoticeVisible = ref(false)
const checkinData = ref({
    notice: '',
    rewards: [],
    stats: {
        completedToday: '0/1',
        tasksCompleted: '0/0',
        consecutiveDays: '0'
    },
    calendar: {
        totalDays: 31,
        checkedDays: [],
        todayDay: 1
    },
    checkedToday: false,
    canCheckInToday: true
})
let noticeTimer = null

const stats = computed(() => ([
    { label: 'Completed Today', value: checkinData.value?.stats?.completedToday || '0/1' },
    { label: 'Tasks Completed', value: checkinData.value?.stats?.tasksCompleted || '0/0' },
    { label: 'Consecutive Days', value: checkinData.value?.stats?.consecutiveDays || '0' }
]))

const days = computed(() =>
    Array.from({ length: checkinData.value?.calendar?.totalDays || 31 }, (_, index) => index + 1)
)

const checkedDaySet = computed(() => new Set(checkinData.value?.calendar?.checkedDays || []))
const notificationText = computed(() => checkinData.value?.notice || 'Complete daily check-ins on time to unlock milestone rewards.')
const buttonText = computed(() => {
    if (isSubmitting.value) {
        return 'CHECKING IN...'
    }

    return checkinData.value?.checkedToday ? 'CHECKED IN TODAY' : 'CHECK IN'
})

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

const handleAuthError = error => {
    const message = String(error?.message || '')

    if (!message.includes('401') && !message.includes('未登录') && !message.includes('过期') && !message.includes('无效')) {
        return false
    }

    clearCurrentUser()
    router.push('/login')
    return true
}

const fetchCheckinInfo = async ({ silent = false } = {}) => {
    if (!silent) {
        isLoading.value = true
    }

    try {
        const result = await request('/api/user/checkin')
        checkinData.value = result?.data || checkinData.value
    } catch (error) {
        if (handleAuthError(error)) {
            return
        }

        if (!silent) {
            showNotice(error.message || 'Failed to load check-in information')
        }
    } finally {
        if (!silent) {
            isLoading.value = false
        }
    }
}

const submitCheckin = async () => {
    if (isSubmitting.value || checkinData.value?.checkedToday) {
        return
    }

    isSubmitting.value = true

    try {
        const result = await request('/api/user/checkin', {
            method: 'POST',
            body: JSON.stringify({})
        })

        checkinData.value = result?.data || checkinData.value
        await refreshCurrentUser().catch(() => null)

        const rewardAmount = Number(result?.data?.rewardAmount || 0)
        showNotice(rewardAmount > 0 ? `Check-in successful, reward $${rewardAmount.toFixed(2)} issued` : 'Check-in successful')
    } catch (error) {
        if (handleAuthError(error)) {
            return
        }

        showNotice(error.message || 'Check-in failed')
    } finally {
        isSubmitting.value = false
    }
}

onMounted(() => {
    fetchCheckinInfo()
})

onBeforeUnmount(() => {
    if (noticeTimer) {
        window.clearTimeout(noticeTimer)
    }
})
</script>

<template>
    <div class="check-container desktop-workspace-shell">
        <DesktopSidebar />
        <AppHeader />

        <CheckNotificationBar :broadcast-img="broadcastImg" :notification-text="notificationText" />

        <CheckDashboard
            :rewards="checkinData.rewards"
            :stats="stats"
            :days="days"
            :checked-day-set="checkedDaySet"
            :today-day="checkinData.calendar.todayDay"
            :gift-img="giftImg"
            :sign-in1="signIn1"
            :sign-in2="signIn2"
            :button-text="buttonText"
            :disabled="isSubmitting || checkinData.checkedToday || isLoading"
            @submit="submitCheckin"
        />

        <AppTabBar />

        <teleport to="body">
            <AuthNoticeToast :visible="isNoticeVisible" :message="noticeMessage" />
        </teleport>
    </div>
</template>

<style scoped>
.check-container {
    width: 100%;
    min-height: 100vh;
    background-color: #f8f9fa;
    padding-top: var(--mobile-header-height); /* Header height */
    padding-bottom: 1.28rem; /* TabBar height */
    box-sizing: border-box;
}

@media (min-width: 481px) {
    :global(body.desktop-checkin-page .check-container) {
        height: 100vh;
        min-height: 100vh;
        padding-top: 0 !important;
        padding-bottom: 0 !important;
        background: #ffffff;
        overflow: hidden;
    }
}
</style>
