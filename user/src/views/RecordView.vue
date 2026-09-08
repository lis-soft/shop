<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import AppTabBar from '@/components/AppTabBar.vue'
import DesktopSidebar from '@/components/DesktopSidebar.vue'
import ProcessReviewModal from '@/components/process/ProcessReviewModal.vue'
import RecordOrderCard from '@/components/record/RecordOrderCard.vue'
import RecordTabsNav from '@/components/record/RecordTabsNav.vue'
import processNewImg from '@/assets/static/img/record/process new.png'
import { request } from '@/utils/request'
import { clearCurrentUser, currentUser, getAvailableBalance, refreshCurrentUser, resolveFileUrl } from '@/utils/currentUser'

const DEFAULT_REVIEW_RATING = 5
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
const activeTab = ref('all')
const records = ref([])
const isLoading = ref(false)
const submittingOrderId = ref('')
const isReviewModalVisible = ref(false)
const isReviewLoading = ref(false)
const isConfirmingReview = ref(false)
const isReviewSuccess = ref(false)
const reviewLoadingStage = ref('step1')
const isNoticeVisible = ref(false)
const noticeMessage = ref('')
const imageFallbackMap = ref({})
const selectedComment = ref('')
const reviewMessage = ref('')
const activeOrder = ref(null)
const reviewQuestionBank = ref(DEFAULT_REVIEW_QUESTION_BANK)
const activeReviewQuestion = ref(DEFAULT_REVIEW_QUESTION_BANK[0])
let noticeTimer = null

const tabs = [
    { id: 'all', label: 'All' },
    { id: 'pending', label: 'Pending' },
    { id: 'completed', label: 'Completed' },
    { id: 'on-hold', label: 'On-hold' }
]

const pendingStatuses = new Set([0])
const onHoldStatuses = new Set([2, 3, 4, 5])
const availableBalance = computed(() => getAvailableBalance(currentUser.value))
const filteredRecords = computed(() => {
    if (activeTab.value === 'pending') {
        return records.value.filter(record => pendingStatuses.has(record.rawStatus))
    }

    if (activeTab.value === 'completed') {
        return records.value.filter(record => record.rawStatus === 1)
    }

    if (activeTab.value === 'on-hold') {
        return records.value.filter(record => onHoldStatuses.has(record.rawStatus))
    }

    return records.value
})
const reviewProductImage = computed(() => resolveFileUrl(activeOrder.value?.product_pic) || processNewImg)
const reviewProductTitle = computed(() => String(activeOrder.value?.product_title || ''))
const reviewProductInfo = computed(() => String(activeOrder.value?.product_info || '').trim())
const reviewProductPriceText = computed(() => formatMoney(activeOrder.value?.order_price ?? activeOrder.value?.product_price))
const reviewCommissionText = computed(() => formatMoney(activeOrder.value?.order_commission))
const reviewCommissionRateText = computed(() => {
    const total = Number(activeOrder.value?.order_price ?? activeOrder.value?.product_price ?? 0)
    const commission = Number(activeOrder.value?.order_commission ?? 0)

    if (!total) {
        return '0.00'
    }

    return ((commission / total) * 100).toFixed(2)
})
const reviewQuestionText = computed(() => String(activeReviewQuestion.value?.question || 'Evaluate this brand'))
const reviewAnswerOptions = computed(() => {
    const answers = Array.isArray(activeReviewQuestion.value?.answers) ? activeReviewQuestion.value.answers : []
    return answers.length ? answers : DEFAULT_REVIEW_QUESTION_BANK[0].answers
})
const reviewLoadingText = computed(() => (reviewLoadingStage.value === 'step1' ? 'Searching Product...' : 'Assigning Booking...'))
const reviewBalanceText = computed(() => formatMoney(getReviewAvailableBalanceValue()))
const canConfirmReview = computed(() => !isReviewLoading.value && !isConfirmingReview.value)
const canCloseReviewModalByOverlay = computed(() => Boolean(
    isReviewModalVisible.value
    && activeOrder.value
    && !isReviewLoading.value
    && !isConfirmingReview.value
    && !isReviewSuccess.value
))

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

const formatMoney = value => {
    const amount = Number(value || 0)
    return `$${amount.toFixed(2)}`
}

const resolveNumericValue = (...values) => {
    for (const value of values) {
        if (value === '' || value === null || value === undefined) {
            continue
        }

        const amount = Number(value)
        if (Number.isFinite(amount)) {
            return amount
        }
    }

    return 0
}

const formatRate = (commission, total) => {
    const amount = Number(total || 0)
    const profit = Number(commission || 0)

    if (!amount) {
        return '0.00'
    }

    return ((profit / amount) * 100).toFixed(2)
}

const formatDate = value => {
    if (!value) {
        return '--'
    }

    const date = new Date(value)
    if (Number.isNaN(date.getTime())) {
        return String(value)
    }

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

const getStatusText = status => {
    const statusMap = {
        0: 'PENDING',
        1: 'COMPLETED',
        2: 'ON HOLD',
        3: 'ON HOLD',
        4: 'ON HOLD',
        5: 'ON HOLD'
    }

    return statusMap[status] || 'UNKNOWN'
}

const getReviewAvailableBalanceValue = () => {
    return getAvailableBalance(currentUser.value)
}

const getRecordImage = record => {
    if (!record) {
        return processNewImg
    }

    return imageFallbackMap.value[record.id] || record.image || processNewImg
}

const handleRecordImageError = recordId => {
    if (!recordId) {
        return
    }

    imageFallbackMap.value = {
        ...imageFallbackMap.value,
        [recordId]: processNewImg
    }
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

const loadReviewConfig = async () => {
    try {
        const result = await request('/api/home/websiteConfig')
        reviewQuestionBank.value = normalizeReviewQuestionBank(result?.data?.process_review_questions)
    } catch {
        reviewQuestionBank.value = DEFAULT_REVIEW_QUESTION_BANK
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
    submittingOrderId.value = ''
    resetReviewState()
}

const handleReviewOverlayClick = () => {
    if (!canCloseReviewModalByOverlay.value) {
        return
    }

    closeReviewModal({ force: true })
}

const mapRecord = item => {
    const orderPrice = Number(item?.order_price || item?.product_price || 0)
    const orderCommission = Number(item?.order_commission || 0)
    const rawStatus = Number(item?.status ?? -1)
    const commission = resolveNumericValue(item?.Profit, item?.profit, item?.order_commission)
    const rebate = +(orderPrice + commission).toFixed(2)

    return {
        id: item?.order_id || item?.id,
        orderId: item?.order_id || '',
        order_id: item?.order_id || '',
        image: resolveFileUrl(item?.product_pic) || '',
        product_pic: item?.product_pic || '',
        product_title: String(item?.product_title || ''),
        product_info: String(item?.product_info || ''),
        order_price: item?.order_price,
        product_price: item?.product_price,
        order_commission: item?.order_commission,
        status: getStatusText(rawStatus),
        rawStatus,
        date: formatDate(item?.created_at),
        created_at: item?.created_at,
        title: String(item?.product_title || ''),
        valueText: formatMoney(orderPrice),
        commissionText: formatMoney(commission),
        profitText: `${formatRate(orderCommission, orderPrice)}%`,
        rebateText: formatMoney(rebate),
        canSubmit: rawStatus === 0
    }
}

const fetchRecords = async () => {
    isLoading.value = true

    try {
        const result = await request('/api/order/orderList?limit=100')
        const rows = Array.isArray(result?.data?.data) ? result.data.data : []
        imageFallbackMap.value = {}
        records.value = rows.map(mapRecord)
    } catch (error) {
        if (handleAuthError(error)) {
            return
        }

        showNotice(error.message || 'Failed to load orders')
    } finally {
        isLoading.value = false
    }
}

const openSubmitReviewModal = async record => {
    if (!record?.orderId || submittingOrderId.value || isReviewLoading.value || isConfirmingReview.value) {
        return
    }

    if (availableBalance.value < 0) {
        showNotice('Insufficient balance, unable to submit this order')
        return
    }

    submittingOrderId.value = record.orderId
    isReviewModalVisible.value = true
    isReviewLoading.value = true
    resetReviewState()

    try {
        selectRandomReviewQuestion()

        await new Promise(resolve => {
            window.setTimeout(resolve, 500)
        })

        reviewLoadingStage.value = 'step2'
        activeOrder.value = {
            ...record,
            order_id: record.orderId
        }
        await refreshCurrentUser().catch(() => null)
    } catch (error) {
        closeReviewModal({ force: true })

        if (handleAuthError(error)) {
            return
        }

        showNotice(error.message || 'Failed to open order review')
    } finally {
        isReviewLoading.value = false
    }
}

const submitPendingOrder = async () => {
    if (isConfirmingReview.value || !activeOrder.value?.order_id) {
        return
    }

    if (!selectedComment.value) {
        showNotice('Please select an answer')
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
        await fetchRecords()
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
    loadReviewConfig().then(() => {
        selectRandomReviewQuestion()
    }).catch(() => {
        reviewQuestionBank.value = DEFAULT_REVIEW_QUESTION_BANK
        selectRandomReviewQuestion()
    })
    refreshCurrentUser().catch(() => null)
    fetchRecords()
})

onBeforeUnmount(() => {
    if (noticeTimer) {
        window.clearTimeout(noticeTimer)
    }
})
</script>

<template>
    <div class="record-page desktop-workspace-shell">
        <DesktopSidebar />
        <AppHeader />
        <main class="record-shell">
            <section class="record-content">
                <div class="record-filter-bar">
                    <RecordTabsNav :tabs="tabs" :active-tab="activeTab" @change="activeTab = $event" />
                </div>

                <div class="record-results">
                    <div v-if="isLoading" class="empty-state">Loading...</div>

                    <template v-else-if="filteredRecords.length">
                        <RecordOrderCard
                            v-for="record in filteredRecords"
                            :key="record.id"
                            :record="{ ...record, image: getRecordImage(record) }"
                            :current-balance="availableBalance"
                            :is-submitting="submittingOrderId === record.orderId"
                            @submit="openSubmitReviewModal"
                            @image-error="handleRecordImageError" />
                    </template>

                    <div v-else class="empty-state">No orders yet</div>
                </div>
            </section>
        </main>

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
            :selected-comment="selectedComment"
            :review-message="reviewMessage"
            :can-confirm-review="canConfirmReview"
            :can-close-review-modal-by-overlay="canCloseReviewModalByOverlay"
            @overlay="handleReviewOverlayClick"
            @close="closeReviewModal"
            @update:selected-comment="selectedComment = $event"
            @update:review-message="reviewMessage = $event"
            @submit="submitPendingOrder"
            @continue="continueAfterSuccess" />

        <div v-if="isNoticeVisible" class="notice-toast mobile-frame-fixed mobile-frame-fullscreen">
            <div class="notice-toast-card">{{ noticeMessage }}</div>
        </div>

        <AppTabBar />
    </div>
</template>

<style scoped>
.record-page {
    width: 100%;
    height: 100vh;
    height: 100dvh;
    background-color: #f8f9fa;
    padding-top: var(--mobile-header-height);
    padding-bottom: var(--mobile-tabbar-height);
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    overflow: hidden;
}

.record-shell {
    flex: 1;
    min-height: 0;
    overflow: hidden;
}

.record-content {
    height: 100%;
    min-height: 0;
    overflow-y: auto;
    overflow-x: hidden;
    overscroll-behavior-y: contain;
    touch-action: pan-y;
    -webkit-overflow-scrolling: touch;
}

.record-filter-bar {
    position: sticky;
    top: 0;
    z-index: 20;
    background-color: #ffffff;
}

.record-results {
    display: flex;
    flex-direction: column;
    gap: 0.24rem;
    padding: 0.24rem 0.32rem 0.32rem;
    box-sizing: border-box;
}

:global(body.desktop-mobile-frame .record-page) {
    height: 100%;
    min-height: 100%;
    overflow: hidden;
}

.empty-state {
    padding: 1.2rem 0.2rem;
    text-align: center;
    font-size: 0.3rem;
    color: #888888;
    background-color: #ffffff;
    border-radius: 0.24rem;
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
    :global(body.desktop-record-page .record-page) {
        background: #f7f7f7;
        display: block;
        overflow: hidden;
    }

    .record-shell {
        width: calc(100vw - var(--desktop-sidebar-width));
        height: 100vh;
        min-height: 100vh;
        overflow: hidden;
        background: #f7f7f7;
    }

    .record-content {
        width: 100%;
        height: 100%;
        overflow-y: auto;
        overflow-x: hidden;
        background: #f7f7f7;
    }

    .record-filter-bar {
        position: sticky;
        top: 0;
        height: clamp(88px, 8vw, 116px);
        background: #ffffff;
        border-bottom: 0;
        z-index: 10;
    }

    .record-results {
        width: var(--desktop-content-width);
        margin-left: var(--desktop-content-left-gap);
        padding: clamp(30px, 3vw, 46px) 0 clamp(40px, 4vw, 64px);
        gap: clamp(18px, 1.8vw, 28px);
    }

    .empty-state {
        width: var(--desktop-content-width);
        border-radius: 8px;
        font-size: 14px;
        padding: 40px 0;
    }
}

</style>
