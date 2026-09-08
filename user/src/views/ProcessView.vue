<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import AppTabBar from '@/components/AppTabBar.vue'
import DesktopSidebar from '@/components/DesktopSidebar.vue'
import ProcessReviewModal from '@/components/process/ProcessReviewModal.vue'
import ProcessSummaryPanel from '@/components/process/ProcessSummaryPanel.vue'
import processVideo from '@/assets/static/video/process.mp4'
import processNewImg from '@/assets/static/img/record/process new.png'
import { request } from '@/utils/request'
import { clearCurrentUser, currentUser, getAvailableBalance, refreshCurrentUser, resolveFileUrl } from '@/utils/currentUser'

const DEFAULT_REVIEW_RATING = 5
const DEFAULT_PROCESS_SUMMARY_NOTICE = 'Welcome to the Process page. Please follow the task instructions carefully and complete the current step in time.'
const DEFAULT_REVIEW_QUESTION_BANK = [
    {
        id: 'default-review-question',
        question: 'How would you evaluate this brand?',
        answers: [
            'Excellent room and great service',
            'Very comfortable and worth recommending',
            'Clean room and smooth booking experience',
            'Great location and reasonable price',
            'Overall satisfied with this product'
        ]
    }
]

const router = useRouter()
const isReviewModalVisible = ref(false)
const isReviewLoading = ref(false)
const isConfirmingReview = ref(false)
const isReviewSuccess = ref(false)
const reviewLoadingStage = ref('step1')
const isNoticeVisible = ref(false)
const noticeMessage = ref('')
const selectedComment = ref('')
const reviewMessage = ref('')
const activeOrder = ref(null)
const orderStats = ref(null)
const reviewQuestionBank = ref(DEFAULT_REVIEW_QUESTION_BANK)
const activeReviewQuestion = ref(DEFAULT_REVIEW_QUESTION_BANK[0])
const processNoticeText = ref(DEFAULT_PROCESS_SUMMARY_NOTICE)
let noticeTimer = null

const inProcessBalance = computed(() => {
    const pendingAmount = Number(orderStats.value?.pending)

    if (Number.isFinite(pendingAmount) && pendingAmount >= 0) {
        return pendingAmount
    }

    const frozenBalance = Number(currentUser.value?.frozen_balance)
    return Number.isFinite(frozenBalance) && frozenBalance >= 0 ? frozenBalance : 0
})
const availableBalance = computed(() => getAvailableBalance(currentUser.value))
const totalBalance = computed(() => {
    return availableBalance.value
})
const dailyProfit = computed(() => {
    const todayEarnings = Number(orderStats.value?.todayEarnings)
    if (Number.isFinite(todayEarnings)) {
        return Math.max(0, todayEarnings)
    }

    const todayProfit = Number(orderStats.value?.current_round_earnings ?? orderStats.value?.roundProfit)
    return Number.isFinite(todayProfit) ? Math.max(0, todayProfit) : 0
})
const totalBalanceText = computed(() => formatMoney(totalBalance.value))
const dailyProfitText = computed(() => formatMoney(dailyProfit.value))
const inProcessBalanceText = computed(() => formatMoney(inProcessBalance.value))
const reviewProductImage = computed(() => resolveFileUrl(activeOrder.value?.product_pic) || processNewImg)
const reviewProductTitle = computed(() => String(activeOrder.value?.product_title || ''))
const reviewProductInfo = computed(() => String(activeOrder.value?.product_info || '').trim())
const reviewProductPriceText = computed(() => formatMoney(activeOrder.value?.order_price ?? activeOrder.value?.product_price))
const reviewCommissionText = computed(() => formatMoney(activeOrder.value?.order_commission))
const totalTaskCount = computed(() => {
    const taskTotal = Number(orderStats.value?.task_total)

    if (Number.isFinite(taskTotal) && taskTotal >= 0) {
        return taskTotal
    }

    const vipTaskCount = Number(currentUser.value?.vip?.task_count)
    return Number.isFinite(vipTaskCount) && vipTaskCount >= 0 ? vipTaskCount : 0
})
const completedTaskCount = computed(() => {
    const completedTasks = Number(orderStats.value?.completed_tasks)
    return Number.isFinite(completedTasks) && completedTasks >= 0 ? completedTasks : 0
})
const processCountText = computed(() => `${completedTaskCount.value}/${totalTaskCount.value}`)
const processPercent = computed(() => {
    if (totalTaskCount.value <= 0) {
        return 0
    }

    return Math.min(100, Math.max(0, (completedTaskCount.value / totalTaskCount.value) * 100))
})
const processPercentWidth = computed(() => `${processPercent.value.toFixed(2)}%`)
const processPercentText = computed(() => `${Math.round(processPercent.value)}%`)
const reviewCommissionRateText = computed(() => {
    const activeOrderData = activeOrder.value || {}
    const normalizedDisplayRate = Number(activeOrderData.display_reward_rate)
    if (Number.isFinite(normalizedDisplayRate) && normalizedDisplayRate > 0) {
        return normalizedDisplayRate.toFixed(2)
    }

    const normalizedRewardRate = Number(activeOrderData.reward_rate)
    const normalizedCardRewardRate = Number(activeOrderData.card_reward_rate)
    const vipRewardRate = Number(currentUser.value?.vip?.reward_rate)
    const vipCardRewardRate = Number(currentUser.value?.vip?.card_reward_rate)
    const isLuckyOrder = Number(activeOrderData.is_lucky) === 1

    if (isLuckyOrder) {
        if (Number.isFinite(normalizedCardRewardRate) && normalizedCardRewardRate > 0) {
            return normalizedCardRewardRate.toFixed(2)
        }

        if (Number.isFinite(vipCardRewardRate) && vipCardRewardRate > 0) {
            return vipCardRewardRate.toFixed(2)
        }
    }

    if (Number.isFinite(normalizedRewardRate) && normalizedRewardRate > 0) {
        return normalizedRewardRate.toFixed(2)
    }

    if (Number.isFinite(vipRewardRate) && vipRewardRate > 0) {
        return vipRewardRate.toFixed(2)
    }

    return '0.00'
})
const reviewQuestionText = computed(() => String(activeReviewQuestion.value?.question || 'Evaluate this brand'))
const reviewAnswerOptions = computed(() => {
    const answers = Array.isArray(activeReviewQuestion.value?.answers) ? activeReviewQuestion.value.answers : []
    return answers.length ? answers : DEFAULT_REVIEW_QUESTION_BANK[0].answers
})
const reviewLoadingText = computed(() => (reviewLoadingStage.value === 'step1' ? 'Searching Product...' : 'Assigning Booking...'))
const isReviewBlockedByBalance = computed(() => Boolean(activeOrder.value && availableBalance.value < -1e-8))
const reviewBlockedBalanceGapText = computed(() => formatMoney(Math.abs(Math.min(0, availableBalance.value))))
const reviewBlockedMessage = computed(() => {
    if (!isReviewBlockedByBalance.value) {
        return ''
    }

    return `Insufficient available balance. ${reviewBlockedBalanceGapText.value}`
})
const canConfirmReview = computed(() => !isReviewLoading.value && !isConfirmingReview.value && !isReviewBlockedByBalance.value)
const canCloseReviewModalByOverlay = computed(() => Boolean(isReviewModalVisible.value && activeOrder.value && !isReviewLoading.value && !isConfirmingReview.value && !isReviewSuccess.value))
const normalizedProcessNoticeText = computed(() => String(processNoticeText.value || '').trim())

const formatMoney = value => {
    const amount = Number(value || 0)
    return `$${amount.toFixed(2)}`
}

const getReviewAvailableBalanceValue = () => {
    return getAvailableBalance(currentUser.value)
}

const reviewBalanceText = computed(() => formatMoney(getReviewAvailableBalanceValue()))

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

const normalizeReviewQuestionItem = (item, index = 0) => {
    const question = String(item?.question || '').trim()
    const answers = (Array.isArray(item?.answers) ? item.answers : [])
        .map(answer => String(answer || '').trim())
        .filter(Boolean)

    if (!question || !answers.length) {
        return null
    }

    return {
        id: item?.id || `review-question-${index}`,
        question,
        answers
    }
}

const normalizeReviewQuestionBank = rawValue => {
    const parsed = typeof rawValue === 'string'
        ? (() => {
            try {
                return JSON.parse(rawValue)
            } catch {
                return []
            }
        })()
        : rawValue

    if (!Array.isArray(parsed)) {
        return DEFAULT_REVIEW_QUESTION_BANK
    }

    const normalized = parsed
        .map((item, index) => normalizeReviewQuestionItem(item, index))
        .filter(Boolean)

    return normalized.length ? normalized : DEFAULT_REVIEW_QUESTION_BANK
}

const selectRandomReviewQuestion = () => {
    const questions = reviewQuestionBank.value.length ? reviewQuestionBank.value : DEFAULT_REVIEW_QUESTION_BANK
    activeReviewQuestion.value = questions[Math.floor(Math.random() * questions.length)]
}

const loadProcessPageConfig = async () => {
    try {
        const result = await request('/api/home/websiteConfig')
        reviewQuestionBank.value = normalizeReviewQuestionBank(result?.data?.process_review_questions)
        processNoticeText.value = String(result?.data?.process_summary_notice || result?.data?.process_notice || '').trim() || DEFAULT_PROCESS_SUMMARY_NOTICE
    } catch {
        reviewQuestionBank.value = DEFAULT_REVIEW_QUESTION_BANK
        processNoticeText.value = DEFAULT_PROCESS_SUMMARY_NOTICE
    }
}

const resetReviewState = () => {
    activeOrder.value = null
    selectedComment.value = ''
    reviewMessage.value = ''
    isReviewSuccess.value = false
    reviewLoadingStage.value = 'step1'
}

const closeReviewModal = ({ force = false } = {}) => {
    if (!force && (isReviewLoading.value || isConfirmingReview.value)) {
        return
    }

    isReviewModalVisible.value = false
    isReviewLoading.value = false
    isConfirmingReview.value = false
    resetReviewState()
}

const handleReviewOverlayClick = () => {
    if (!canCloseReviewModalByOverlay.value) {
        return
    }

    closeReviewModal({ force: true })
}

const loadCurrentOrder = async () => {
    const result = await request('/api/order/current')
    return result?.data || null
}

const loadOrderStats = async ({ silent = false } = {}) => {
    try {
        const result = await request('/api/order/orderStats')
        orderStats.value = result?.data || null
        return orderStats.value
    } catch (error) {
        if (handleAuthError(error)) {
            return null
        }

        const message = String(error?.message || '')
        orderStats.value = null

        if (!silent && message && !message.includes('请先升级VIP等级')) {
            showNotice(message)
        }

        return null
    }
}

const openReviewModal = async () => {
    if (isReviewLoading.value || isConfirmingReview.value) {
        return
    }

    isReviewModalVisible.value = true
    isReviewLoading.value = true
    resetReviewState()

    try {
        await loadProcessPageConfig()
        selectRandomReviewQuestion()

        await new Promise(resolve => {
            window.setTimeout(resolve, 500)
        })

        reviewLoadingStage.value = 'step2'
        const currentOrder = await loadCurrentOrder()

        if (currentOrder) {
            activeOrder.value = currentOrder
        } else {
            const result = await request('/api/order/create', {
                method: 'POST',
                body: JSON.stringify({})
            })

            activeOrder.value = result?.data || null
        }

        await refreshCurrentUser().catch(() => null)
        await loadOrderStats({ silent: true })
    } catch (error) {
        closeReviewModal({ force: true })

        if (handleAuthError(error)) {
            return
        }

        showNotice(error.message || 'Failed to create order')
    } finally {
        isReviewLoading.value = false
    }
}

const submitReview = async () => {
    if (isConfirmingReview.value || !activeOrder.value?.order_id) {
        return
    }

    if (!selectedComment.value) {
        showNotice('Please select an answer')
        return
    }

    if (isReviewBlockedByBalance.value) {
        showNotice(reviewBlockedMessage.value)
        return
    }

    isConfirmingReview.value = true

    try {
        await request('/api/order/submit', {
            method: 'POST',
            body: JSON.stringify({
                order_id: activeOrder.value.order_id,
                rating: DEFAULT_REVIEW_RATING,
                comment: selectedComment.value
            })
        })

        await refreshCurrentUser().catch(() => null)
        await loadOrderStats({ silent: true })
        activeOrder.value = null
        isReviewSuccess.value = true
    } catch (error) {
        if (handleAuthError(error)) {
            return
        }

        showNotice(error.message || 'Failed to submit order')
    } finally {
        isConfirmingReview.value = false
    }
}

const continueAfterSuccess = () => {
    closeReviewModal({ force: true })
}

onMounted(() => {
    loadProcessPageConfig().then(() => {
        selectRandomReviewQuestion()
    }).catch(() => {
        reviewQuestionBank.value = DEFAULT_REVIEW_QUESTION_BANK
        processNoticeText.value = DEFAULT_PROCESS_SUMMARY_NOTICE
        selectRandomReviewQuestion()
    })
    refreshCurrentUser().catch(() => null)
    loadOrderStats({ silent: true })
})

onBeforeUnmount(() => {
    if (noticeTimer) {
        window.clearTimeout(noticeTimer)
    }
})
</script>

<template>
    <div class="record-detail-container desktop-workspace-shell">
        <DesktopSidebar />
        <AppHeader />

        <ProcessSummaryPanel
            :process-video-src="processVideo"
            :notice-text="normalizedProcessNoticeText"
            :process-count-text="processCountText"
            :process-percent-width="processPercentWidth"
            :process-percent-text="processPercentText"
            :total-balance-text="totalBalanceText"
            :daily-profit-text="dailyProfitText"
            :in-process-balance-text="inProcessBalanceText"
            @review="openReviewModal" />

        <ProcessReviewModal
            :visible="isReviewModalVisible"
            :is-review-loading="isReviewLoading"
            :is-confirming-review="isConfirmingReview"
            :is-review-success="isReviewSuccess"
            :review-loading-stage="reviewLoadingStage"
            :active-order="activeOrder"
            :review-loading-text="reviewLoadingText"
            :review-balance-text="reviewBalanceText"
            :review-product-image="reviewProductImage"
            :review-product-title="reviewProductTitle"
            :review-product-info="reviewProductInfo"
            :review-commission-text="reviewCommissionText"
            :review-commission-rate-text="reviewCommissionRateText"
            :review-product-price-text="reviewProductPriceText"
            :review-question-text="reviewQuestionText"
            :review-answer-options="reviewAnswerOptions"
            :review-blocked-message="reviewBlockedMessage"
            :selected-comment="selectedComment"
            :review-message="reviewMessage"
            :can-confirm-review="canConfirmReview"
            :can-close-review-modal-by-overlay="canCloseReviewModalByOverlay"
            @overlay="handleReviewOverlayClick"
            @close="closeReviewModal"
            @update:selected-comment="selectedComment = $event"
            @update:review-message="reviewMessage = $event"
            @submit="submitReview"
            @continue="continueAfterSuccess" />

        <div v-if="isNoticeVisible" class="notice-toast mobile-frame-fixed mobile-frame-fullscreen">
            <div class="notice-toast-card">{{ noticeMessage }}</div>
        </div>

        <AppTabBar />
    </div>
</template>

<style scoped>
.record-detail-container {
    width: 100%;
    min-height: 100vh;
    background-color: #ffffff;
    padding-top: var(--mobile-header-height); /* Header height */
    padding-bottom: 1.28rem; /* TabBar height */
    box-sizing: border-box;
}

.notice-toast {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1500;
    pointer-events: none;
}

.notice-toast-card {
    max-width: 5.8rem;
    background-color: rgba(17, 17, 17, 0.9);
    color: #ffffff;
    font-size: 0.28rem;
    line-height: 1.45;
    padding: 0.24rem 0.34rem;
    border-radius: 0.18rem;
    text-align: center;
    box-shadow: 0 0.08rem 0.28rem rgba(0, 0, 0, 0.18);
}


@media (min-width: 481px) {
    :global(body.desktop-process-page .record-detail-container) {
        background: #ffffff;
        display: block;
        overflow: hidden;
    }
}

</style>
