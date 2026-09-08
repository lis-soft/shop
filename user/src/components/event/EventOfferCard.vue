<script setup>
import basicImg from '@/assets/static/img/profile/basic.png'

defineProps({
    event: {
        type: Object,
        required: true
    }
})
</script>

<template>
    <div class="event-card">
        <div class="card-left">
            <img :src="basicImg" alt="icon" class="event-icon" />
        </div>
        <div class="card-right">
            <div class="member-type">{{ event.type }}</div>
            <div class="deposit-info">
                Deposit SGD <span class="amount">{{ event.deposit }}</span>
            </div>
            <div class="bonus-info">Get an extra SGD {{ event.bonus }} bonus</div>
        </div>
    </div>
</template>

<style scoped>
.event-card {
    background-color: #ffffff;
    border-radius: 0.32rem;
    padding: 0.4rem;
    margin-bottom: 0.32rem;
    display: flex;
    align-items: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}

.card-left {
    margin-right: 0.36rem;
    display: flex;
    align-items: center;
}

.event-icon {
    width: 0.64rem;
    height: 0.64rem;
    object-fit: contain;
}

.card-right {
    flex: 1;
}

.member-type {
    font-size: 0.3rem;
    font-weight: 600;
    color: #333333;
    margin-bottom: 0.08rem;
}

.deposit-info {
    font-size: 0.32rem;
    color: #333333;
    margin-bottom: 0.04rem;
}

.deposit-info .amount {
    font-weight: 700;
    font-size: 0.36rem;
}

.bonus-info {
    font-size: 0.28rem;
    color: #999999;
}

@media (min-width: 481px) {
    :global(body.desktop-profile-related-page .event-card) {
        margin-bottom: 0;
        padding: 26px;
        border-radius: 14px;
        box-shadow: 0 10px 28px rgba(15, 23, 42, 0.08);
    }

    :global(body.desktop-profile-related-page .event-card .event-icon) {
        width: 42px;
        height: 42px;
    }

    :global(body.desktop-profile-related-page .event-card .member-type) {
        font-size: 18px;
    }

    :global(body.desktop-profile-related-page .event-card .deposit-info) {
        font-size: 17px;
    }

    :global(body.desktop-profile-related-page .event-card .deposit-info .amount) {
        font-size: 22px;
    }

    :global(body.desktop-profile-related-page .event-card .bonus-info) {
        font-size: 14px;
    }
}
</style>
