<script setup>
defineProps({
    title: {
        type: String,
        default: 'Rank'
    },
    items: {
        type: Array,
        default: () => []
    }
})

defineEmits(['logoError'])
</script>

<template>
    <h1 class="page-title">{{ title }}</h1>

    <div class="ranking-container">
        <div class="ranking-header">Ranking</div>
        <div class="ranking-list">
            <div v-for="item in items" :key="item.id" class="ranking-item">
                <div class="rank-info">
                    <span class="rank-text">{{ item.text }}</span>
                </div>
                <div class="rank-logo-wrapper">
                    <img
                        v-if="item.logo"
                        :src="item.logo"
                        alt="logo"
                        class="rank-logo"
                        @error="$emit('logoError', $event)"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.page-title {
    font-size: 0.6rem;
    font-weight: 500;
    color: #000000;
    margin-bottom: 0.44rem;
    padding-left: 0.1rem;
}

.ranking-container {
    background-color: #ffffff;
    border-radius: 0.28rem;
    overflow: hidden;
    padding: 0.4rem 0 0;
}

.ranking-header {
    font-size: 0.32rem;
    font-weight: 500;
    color: #000000;
    padding: 0 0.44rem 0.36rem;
}

.ranking-list {
    display: flex;
    flex-direction: column;
}

.ranking-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 1.32rem;
    border-top: 1px solid #eee;
    gap: 0.24rem;
    padding: 0 0.44rem;
    box-sizing: border-box;
}

.rank-info {
    display: flex;
    align-items: center;
    flex: 1;
    min-width: 0;
}

.rank-text {
    font-family: 'PingFang SC', -apple-system, BlinkMacSystemFont, sans-serif;
    font-size: 0.28rem;
    color: #040404;
    font-weight: 400;
    line-height: 1.32rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.rank-logo-wrapper {
    width: 2.8rem;
    height: 1.32rem;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex-shrink: 0;
}

.rank-logo {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
}
</style>
