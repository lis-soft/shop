<script setup>
defineProps({
    isLoading: {
        type: Boolean,
        default: false
    },
    items: {
        type: Array,
        default: () => []
    },
    activeCategory: {
        type: String,
        default: 'all'
    }
})
</script>

<template>
    <div>
        <div v-if="isLoading" class="empty-state">
            Loading transactions...
        </div>

        <div v-for="item in items" :key="item.id" class="transaction-card">
            <div class="card-left">
                <div class="title-row">
                    <div class="title">{{ item.title }}</div>
                    <span v-if="item.statusText" class="status-chip">{{ item.statusText }}</span>
                </div>
                <div v-if="item.description" class="description">{{ item.description }}</div>
                <div class="date">{{ item.date }}</div>
            </div>
            <div class="card-right" :class="{ positive: item.isPositive, negative: !item.isPositive }">
                <span class="amount">{{ item.amount }}</span>
            </div>
        </div>

        <div v-if="!isLoading && !items.length" class="empty-state">
            {{ activeCategory === 'all' ? 'No transaction records yet' : 'No records in this category' }}
        </div>
    </div>
</template>

<style scoped>
.transaction-card {
    background-color: #ffffff;
    border-radius: 0.32rem;
    padding: 0.44rem 0.48rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: none;
}

.transaction-card + .transaction-card {
    margin-top: 0.24rem;
}

.card-left {
    display: flex;
    flex-direction: column;
    gap: 0.08rem;
    min-width: 0;
    flex: 1;
}

.title-row {
    display: flex;
    align-items: center;
    gap: 0.16rem;
    min-width: 0;
    flex-wrap: wrap;
}

.title {
    font-size: 0.32rem;
    font-weight: 600;
    color: #333333;
}

.status-chip {
    display: inline-flex;
    align-items: center;
    min-height: 0.42rem;
    padding: 0 0.16rem;
    border-radius: 999px;
    background: #eef4ff;
    color: #2b63b0;
    font-size: 0.2rem;
    font-weight: 600;
}

.description {
    font-size: 0.24rem;
    color: #666666;
    line-height: 1.45;
    word-break: break-word;
}

.date {
    font-size: 0.28rem;
    color: #999999;
}

.card-right {
    font-size: 0.32rem;
    font-weight: 600;
    display: flex;
    gap: 0.1rem;
}

.card-right.positive {
    color: #2e9d62;
}

.card-right.negative {
    color: #d64545;
}

.amount {
    font-weight: 700;
}

.empty-state {
    padding: 0.8rem 0.4rem;
    text-align: center;
    font-size: 0.28rem;
    color: #999999;
}

@media (min-width: 481px) {
    :global(body.desktop-profile-related-page .transaction-card) {
        padding: 24px 28px;
        border-radius: 14px;
        box-shadow: 0 10px 28px rgba(15, 23, 42, 0.08);
    }

    :global(body.desktop-profile-related-page .transaction-card + .transaction-card) {
        margin-top: 16px;
    }

    :global(body.desktop-profile-related-page .transaction-card .title) {
        font-size: 18px;
    }

    :global(body.desktop-profile-related-page .transaction-card .description) {
        font-size: 14px;
    }

    :global(body.desktop-profile-related-page .transaction-card .date) {
        font-size: 14px;
    }

    :global(body.desktop-profile-related-page .transaction-card .card-right) {
        font-size: 18px;
    }

    :global(body.desktop-profile-related-page .transaction-card .status-chip) {
        min-height: 22px;
        padding: 0 10px;
        font-size: 12px;
    }

    :global(body.desktop-profile-related-page .empty-state) {
        padding: 48px 24px;
        font-size: 15px;
    }
}
</style>
