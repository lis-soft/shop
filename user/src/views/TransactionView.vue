<script setup>
import { computed, onActivated, onBeforeUnmount, onMounted, ref } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import DesktopSidebar from '@/components/DesktopSidebar.vue'
import TransactionCategoryBar from '@/components/transaction/TransactionCategoryBar.vue'
import TransactionList from '@/components/transaction/TransactionList.vue'
import { request } from '@/utils/request'

const transactionResult = ref({
    data: [],
    total: 0
})
const isLoading = ref(false)
const activeCategory = ref('all')

const CATEGORY_LABELS = {
    all: 'All',
    deposit: 'Deposit',
    withdraw: 'Withdrawal',
    commission: 'Commission',
    rebate: 'Rebate',
    vip: 'VIP',
    adjustment: 'Adjustment',
    deduction: 'Deduction',
    activity_gift: 'Activity Gift',
    transaction: 'Transaction'
}

const normalizeTransactionResult = payload => {
    if (Array.isArray(payload)) {
        return {
            data: payload,
            total: payload.length
        }
    }

    const result = payload && typeof payload === 'object' ? payload : {}
    const list = Array.isArray(result.data)
        ? result.data
        : Array.isArray(result.list)
            ? result.list
            : []

    return {
        ...result,
        data: list,
        total: Number(result.total || list.length || 0)
    }
}

const formatTransactionDate = value => {
    if (!value) {
        return '--'
    }

    const date = new Date(value)
    if (Number.isNaN(date.getTime())) {
        return '--'
    }

    return new Intl.DateTimeFormat('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    }).format(date)
}

const transactions = computed(() =>
    (transactionResult.value?.data || []).map(item => {
        const amount = Number(item.amount || 0)

        return {
            id: item.id,
            title: item.title || 'Transaction',
            description: item.description || '',
            date: formatTransactionDate(item.created_at),
            amount: `${amount >= 0 ? '+' : '-'}$${Math.abs(amount).toFixed(2)}`,
            isPositive: amount >= 0,
            category: item.category || 'transaction',
            statusText: item.withdraw_status_label || ''
        }
    })
)

const categoryOptions = computed(() => {
    const usedCategories = new Set(transactions.value.map(item => item.category || 'transaction'))
    const dynamicCategories = Object.keys(CATEGORY_LABELS).filter(key => key !== 'all' && usedCategories.has(key))

    return ['all', ...dynamicCategories].map(key => ({
        key,
        label: CATEGORY_LABELS[key] || key
    }))
})

const filteredTransactions = computed(() => {
    if (activeCategory.value === 'all') {
        return transactions.value
    }

    return transactions.value.filter(item => item.category === activeCategory.value)
})

const fetchTransactions = async () => {
    isLoading.value = true

    try {
        const result = await request('/api/user/transactions?limit=100')
        transactionResult.value = normalizeTransactionResult(result?.data)
    } catch {
        transactionResult.value = { data: [], total: 0 }
    } finally {
        isLoading.value = false
    }
}

const handleWindowFocus = () => {
    fetchTransactions()
}

onMounted(() => {
    fetchTransactions()
    window.addEventListener('focus', handleWindowFocus)
    document.addEventListener('visibilitychange', handleWindowFocus)
})

onActivated(() => {
    fetchTransactions()
})

onBeforeUnmount(() => {
    window.removeEventListener('focus', handleWindowFocus)
    document.removeEventListener('visibilitychange', handleWindowFocus)
})
</script>

<template>
    <div class="transaction-page desktop-workspace-shell">
        <DesktopSidebar />
        <AppHeader />

        <main class="content">
            <div class="transaction-list">
                <TransactionCategoryBar
                    :category-options="categoryOptions"
                    :active-category="activeCategory"
                    @change="activeCategory = $event"
                />

                <TransactionList
                    :is-loading="isLoading"
                    :items="filteredTransactions"
                    :active-category="activeCategory"
                />
            </div>
        </main>
    </div>
</template>

<style scoped>
.transaction-page {
    width: 100%;
    min-height: 100vh;
    background-color: #f5f5f5;
    padding-top: var(--mobile-header-height);
    box-sizing: border-box;
}

.content {
    padding: 0.32rem 0.36rem;
}

.transaction-list {
    display: flex;
    flex-direction: column;
    gap: 0.24rem;
}

@media (min-width: 481px) {
    :global(body.desktop-profile-related-page .transaction-page) {
        width: 100vw;
        height: 100vh;
        min-height: 100vh;
        padding-top: 0 !important;
        padding-left: var(--desktop-sidebar-width) !important;
        background: #f7f7f7;
        overflow-y: auto;
        overflow-x: hidden;
        box-sizing: border-box;
    }

    :global(body.desktop-profile-related-page .transaction-page .content) {
        width: var(--desktop-content-width);
        margin-left: var(--desktop-content-left-gap);
        padding: clamp(30px, 4vh, 48px) 0 clamp(42px, 6vh, 72px);
    }

    :global(body.desktop-profile-related-page .transaction-page .transaction-list) {
        gap: clamp(16px, 2vh, 24px);
    }
}
</style>
