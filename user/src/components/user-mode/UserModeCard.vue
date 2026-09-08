<script setup>
import basicImg from '@/assets/static/img/profile/basic.png'
import { computed } from 'vue'

const props = defineProps({
    mode: {
        type: Object,
        required: true
    }
})

const cardIcon = computed(() => props.mode.image || basicImg)
</script>

<template>
    <div class="mode-card">
        <div class="card-header">
            <img :src="cardIcon" alt="icon" class="mode-icon" />
            <span class="mode-name">{{ mode.name }}</span>
        </div>
        <div class="card-body">
            <div class="info-item">
                <div class="info-label">Profit</div>
                <div class="info-value">{{ mode.profit }}</div>
            </div>
            <div class="divider"></div>
            <div class="info-item">
                <div class="info-label">No.Brands</div>
                <div class="info-value">{{ mode.brands }}</div>
            </div>
            <div class="divider"></div>
            <div class="info-item">
                <div class="info-label">Reset Time</div>
                <div class="info-value">{{ mode.resetTime }}</div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.mode-card {
    background-color: #ffffff;
    border-radius: 0.36rem;
    padding: 0.48rem 0.4rem;
    margin-bottom: 0.44rem;
    box-shadow: none;
}

.card-header {
    display: flex;
    align-items: center;
    margin-bottom: 0.44rem;
}

.mode-icon {
    width: 0.48rem;
    height: 0.48rem;
    margin-right: 0.2rem;
}

.mode-name {
    font-size: 0.28rem;
    font-weight: 600;
    color: #333333;
}

.card-body {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.info-item {
    flex: 1;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.info-label {
    font-size: 0.36rem;
    font-weight: 600;
    color: #000000;
    margin-bottom: 0.12rem;
    line-height: 1.2;
}

.info-value {
    font-size: 0.32rem;
    color: #999999;
    font-weight: 500;
    line-height: 1;
}

.divider {
    width: 1px;
    height: 1.1rem;
    background-color: #349b6d;
    opacity: 0.4;
    align-self: center;
}

@media (min-width: 481px) {
    :global(body.desktop-profile-related-page .mode-card) {
        margin-bottom: 0;
        padding: 28px 26px;
        border-radius: 14px;
    }

    :global(body.desktop-profile-related-page .mode-card .card-header) {
        margin-bottom: 24px;
    }

    :global(body.desktop-profile-related-page .mode-card .mode-icon) {
        width: 34px;
        height: 34px;
        margin-right: 12px;
    }

    :global(body.desktop-profile-related-page .mode-card .mode-name) {
        font-size: 18px;
        line-height: 1.3;
    }

    :global(body.desktop-profile-related-page .mode-card .info-label) {
        font-size: 17px;
    }

    :global(body.desktop-profile-related-page .mode-card .info-value) {
        font-size: 15px;
    }

    :global(body.desktop-profile-related-page .mode-card .divider) {
        height: 58px;
    }
}
</style>
