<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import AppTabBar from '@/components/AppTabBar.vue'
import DesktopSidebar from '@/components/DesktopSidebar.vue'
import FinancialAccountModal from '@/components/financial/FinancialAccountModal.vue'
import FinancialWithdrawPanel from '@/components/financial/FinancialWithdrawPanel.vue'
import { request } from '@/utils/request'
import { clearCurrentUser, currentUser, getAvailableBalance, refreshCurrentUser } from '@/utils/currentUser'
import { getVipDisplayName } from '@/utils/profile'

const router = useRouter()
const pin = ref(['', '', '', '', '', ''])
const isLoading = ref(false)
const isSubmittingWithdraw = ref(false)
const isVerifyingPin = ref(false)
const isNoticeVisible = ref(false)
const isAccountModalVisible = ref(false)
const noticeMessage = ref('')
const walletAddress = ref('')
let noticeTimer = null

const withdrawPin = computed(() => pin.value.join(''))
const rawBalance = computed(() => (currentUser.value ? getAvailableBalance(currentUser.value) : null))
const withdrawAmount = computed(() => {
    const value = Number(rawBalance.value)
    return Number.isFinite(value) ? value : 0
})
const memberLabel = computed(() => getVipDisplayName(currentUser.value))
const balanceText = computed(() => {
    if (rawBalance.value === null || rawBalance.value === undefined || rawBalance.value === '') {
        return '--'
    }

    return formatMoney(withdrawAmount.value)
})
const canSubmitWithdraw = computed(() => {
    return (
        withdrawPin.value.length === 6 &&
        !isLoading.value &&
        !isVerifyingPin.value &&
        !isSubmittingWithdraw.value
    )
})
const canSubmitWithdrawRequest = computed(() => {
    return Boolean(walletAddress.value.trim()) && !isSubmittingWithdraw.value
})

const formatMoney = value => {
    const amountValue = Number(value || 0)
    return `$${amountValue.toFixed(2)}`
}

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

const resetPin = () => {
    pin.value = ['', '', '', '', '', '']
}

const closeAccountModal = () => {
    isAccountModalVisible.value = false
    walletAddress.value = ''
}

const fetchWithdrawalData = async () => {
    isLoading.value = true

    try {
        const userInfo = await refreshCurrentUser()

        if (userInfo?.is_withdraw === false) {
            showNotice('Withdrawal is currently unavailable for this account')
        }
    } catch (error) {
        if (handleAuthError(error)) {
            return
        }

        showNotice(error.message || 'Failed to load withdrawal information')
    } finally {
        isLoading.value = false
    }
}

const openAccountSelector = async () => {
    if (withdrawPin.value.length !== 6) {
        showNotice('Please enter your 6-digit withdrawal PIN. New accounts use 000000 by default.')
        return
    }

    isVerifyingPin.value = true

    try {
        await request('/api/user/verifyPayPassword', {
            method: 'POST',
            body: JSON.stringify({
                password: withdrawPin.value
            })
        })

        walletAddress.value = ''
        isAccountModalVisible.value = true
    } catch (error) {
        if (handleAuthError(error)) {
            return
        }

        showNotice(error.message || 'Invalid withdrawal PIN')
    } finally {
        isVerifyingPin.value = false
    }
}

const submitWithdraw = async () => {
    if (!walletAddress.value.trim()) {
        showNotice('Please enter the wallet address')
        return
    }

    if (withdrawAmount.value <= 0) {
        showNotice('Insufficient balance')
        return
    }

    isSubmittingWithdraw.value = true

    try {
        await request('/api/user/withdraw', {
            method: 'POST',
            body: JSON.stringify({
                account_number: walletAddress.value.trim(),
                amount: withdrawAmount.value,
                password: withdrawPin.value
            })
        })

        closeAccountModal()
        resetPin()
        await refreshCurrentUser().catch(() => null)
        showNotice('Withdrawal request submitted successfully')
    } catch (error) {
        if (handleAuthError(error)) {
            return
        }

        showNotice(error.message || 'Failed to submit withdrawal request')
    } finally {
        isSubmittingWithdraw.value = false
    }
}

onMounted(() => {
    fetchWithdrawalData()
})

onBeforeUnmount(() => {
    if (noticeTimer) {
        window.clearTimeout(noticeTimer)
    }
})
</script>

<template>
    <div class="financial-container desktop-workspace-shell">
        <DesktopSidebar />
        <AppHeader />

        <FinancialWithdrawPanel
            v-model:pin="pin"
            :member-label="memberLabel"
            :balance-text="balanceText"
            :can-submit-withdraw="canSubmitWithdraw"
            :is-verifying-pin="isVerifyingPin"
            @submit="openAccountSelector"
        />

        <FinancialAccountModal
            :visible="isAccountModalVisible"
            :wallet-address="walletAddress"
            :can-submit-withdraw="canSubmitWithdrawRequest"
            :is-submitting-withdraw="isSubmittingWithdraw"
            @close="closeAccountModal"
            @submit-withdraw="submitWithdraw"
            @update:wallet-address="walletAddress = $event"
        />

        <div v-if="isNoticeVisible" class="notice-toast mobile-frame-fixed mobile-frame-fullscreen">
            <div class="notice-toast-card">{{ noticeMessage }}</div>
        </div>

        <AppTabBar />
    </div>
</template>

<style scoped>
.financial-container {
    width: 100%;
    min-height: 100vh;
    background: #f3f3f3;
    padding-top: var(--mobile-header-height);
    padding-bottom: 1.28rem;
}

.notice-toast {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1500;
    pointer-events: none;
    padding: 0.32rem;
}

.notice-toast-card {
    max-width: 5.8rem;
    background: rgba(17, 17, 17, 0.9);
    color: #ffffff;
    font-size: 0.28rem;
    line-height: 1.45;
    padding: 0.24rem 0.34rem;
    border-radius: 0.18rem;
    text-align: center;
    box-shadow: 0 0.08rem 0.28rem rgba(0, 0, 0, 0.18);
}

@media (min-width: 481px) {
    :global(body.desktop-finance-page .financial-container) {
        height: 100vh;
        min-height: 100vh;
        padding-top: 0 !important;
        padding-bottom: 0 !important;
        background: #f7f7f7;
        overflow: hidden;
    }

    :global(body.desktop-finance-page .notice-toast) {
        left: var(--desktop-sidebar-width);
        width: calc(100vw - var(--desktop-sidebar-width));
        padding: 40px var(--desktop-content-right-gap) 40px var(--desktop-content-left-gap);
    }

    :global(body.desktop-finance-page .notice-toast-card) {
        max-width: min(560px, var(--desktop-content-width));
        border-radius: 10px;
        padding: 14px 20px;
        font-size: 14px;
        line-height: 1.45;
        box-shadow: 0 10px 28px rgba(0, 0, 0, 0.18);
    }
}
</style>
