<script setup>
defineProps({
    rewards: {
        type: Array,
        default: () => []
    },
    stats: {
        type: Array,
        default: () => []
    },
    days: {
        type: Array,
        default: () => []
    },
    checkedDaySet: {
        type: Object,
        required: true
    },
    todayDay: {
        type: Number,
        default: 1
    },
    giftImg: {
        type: String,
        required: true
    },
    signIn1: {
        type: String,
        required: true
    },
    signIn2: {
        type: String,
        required: true
    },
    buttonText: {
        type: String,
        default: 'CHECK IN'
    },
    disabled: {
        type: Boolean,
        default: false
    }
})

defineEmits(['submit'])
</script>

<template>
    <div class="content">
        <div class="reward-cards">
            <div v-for="reward in rewards" :key="reward.id" class="reward-card blue-card">
                <div class="reward-info">
                    <div class="reward-amount">${{ Number(reward.amount || 0).toFixed(2) }}</div>
                    <div class="reward-day">
                        Day {{ reward.day }} Check-in
                        <span v-if="reward.claimed" class="reward-status">Claimed</span>
                        <span v-else-if="reward.unlocked" class="reward-status">Unlocked</span>
                    </div>
                </div>
                <img :src="giftImg" alt="Gift" class="gift-icon" />
            </div>
        </div>

        <div class="stats-row">
            <div v-for="stat in stats" :key="stat.label" class="stat-card">
                <div class="stat-label">{{ stat.label }}</div>
                <div class="stat-value">{{ stat.value }}</div>
            </div>
        </div>

        <div class="calendar-section">
            <div class="calendar-grid">
                <div v-for="day in days" :key="day" class="day-item">
                    <div
                        class="day-icon-wrapper"
                        :class="{
                            'active-day': checkedDaySet.has(day),
                            'today-day': day === todayDay
                        }"
                    >
                        <img :src="checkedDaySet.has(day) ? signIn2 : signIn1" alt="icon" class="day-icon" />
                    </div>
                    <span class="day-text">Day {{ day }}</span>
                </div>
            </div>
        </div>

        <button class="check-in-btn" :disabled="disabled" @click="$emit('submit')">
            {{ buttonText }}
        </button>
    </div>
</template>

<style scoped>
.content {
    padding: 0.3rem;
}

.reward-cards {
    display: flex;
    gap: 0.2rem;
    margin-bottom: 0.3rem;
}

.reward-card {
    flex: 1;
    height: 2rem;
    border-radius: 0.2rem;
    padding: 0.3rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #ffffff;
    background: #1d58a7;
}

.reward-card:nth-child(2n) {
    background: #143e7c;
}

.reward-amount {
    font-size: 0.48rem;
    font-weight: 700;
    margin-bottom: 0.1rem;
}

.reward-day {
    font-size: 0.24rem;
    opacity: 0.9;
}

.reward-status {
    margin-left: 0.12rem;
    font-size: 0.22rem;
    opacity: 0.85;
}

.gift-icon {
    width: 1.2rem;
    height: 1.2rem;
    object-fit: contain;
}

.stats-row {
    display: flex;
    gap: 0.2rem;
    margin-bottom: 0.3rem;
}

.stat-card {
    flex: 1;
    background-color: #ffffff;
    border-radius: 0.16rem;
    padding: 0.2rem;
    text-align: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
}

.stat-label {
    font-size: 0.24rem;
    color: #999999;
    margin-bottom: 0.1rem;
}

.stat-value {
    font-size: 0.4rem;
    font-weight: 700;
    color: #333333;
}

.calendar-section {
    background-color: #ffffff;
    border-radius: 0.24rem;
    padding: 0.3rem;
    margin-bottom: 0.4rem;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.03);
}

.calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 0.2rem 0.1rem;
}

.day-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.08rem;
}

.day-icon-wrapper {
    width: 0.8rem;
    height: 0.8rem;
    background-color: #f0f0f0;
    border-radius: 0.16rem;
    display: flex;
    align-items: center;
    justify-content: center;
}

.active-day {
    background-color: #fff9e6;
}

.today-day {
    box-shadow: inset 0 0 0 1px rgba(29, 88, 167, 0.18);
}

.day-icon {
    width: 0.48rem;
    height: 0.48rem;
    object-fit: contain;
}

.day-text {
    font-size: 0.18rem;
    color: #999999;
}

.check-in-btn {
    width: 100%;
    height: 1.1rem;
    background-color: #1d58a7;
    color: #ffffff;
    border: none;
    border-radius: 0.55rem;
    font-size: 0.36rem;
    font-weight: 600;
    letter-spacing: 0.02em;
    margin-top: 0.2rem;
    box-shadow: 0 4px 12px rgba(29, 88, 167, 0.3);
    cursor: pointer;
}

.check-in-btn:disabled {
    opacity: 0.75;
    cursor: not-allowed;
}

@media (min-width: 481px) {
    :global(body.desktop-checkin-page .content) {
        width: var(--desktop-content-width);
        height: calc(100vh - clamp(18px, 3vh, 24px) - clamp(32px, 4.5vh, 36px) - clamp(16px, 2.4vh, 22px) - clamp(22px, 4vh, 36px));
        min-height: 0;
        margin-left: var(--desktop-content-left-gap);
        margin-top: clamp(16px, 2.4vh, 22px);
        padding: 8px 8px 10px;
        display: grid;
        grid-template-columns: minmax(340px, 1.08fr) minmax(240px, 0.78fr);
        grid-template-rows: auto 1fr auto;
        column-gap: 8px;
        row-gap: 8px;
        border-radius: 6px;
        background: #f2f2f2;
        box-sizing: border-box;
        overflow: hidden;
    }

    :global(body.desktop-checkin-page .stats-row) {
        grid-column: 1;
        grid-row: 1;
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 8px;
        margin: 0;
        min-height: 64px;
    }

    :global(body.desktop-checkin-page .stat-card) {
        min-width: 0;
        min-height: 64px;
        padding: 13px 8px 10px;
        border-radius: 6px;
        background: #ffffff;
        box-shadow: none;
    }

    :global(body.desktop-checkin-page .stat-label) {
        margin-bottom: 6px;
        color: #666666;
        font-size: 10px;
        line-height: 13px;
        font-weight: 400;
    }

    :global(body.desktop-checkin-page .stat-value) {
        color: #111111;
        font-size: 18px;
        line-height: 22px;
        font-weight: 600;
    }

    :global(body.desktop-checkin-page .calendar-section) {
        grid-column: 1;
        grid-row: 2;
        min-height: 0;
        margin: 0;
        padding: clamp(14px, 2vh, 18px) clamp(14px, 1.8vw, 18px) clamp(12px, 1.8vh, 16px);
        border-radius: 6px;
        background: #ffffff;
        box-shadow: none;
        overflow: hidden;
        box-sizing: border-box;
    }

    :global(body.desktop-checkin-page .calendar-grid) {
        height: 100%;
        display: grid;
        grid-template-columns: repeat(7, minmax(0, 1fr));
        grid-auto-rows: 1fr;
        gap: clamp(8px, 1.7vh, 14px) clamp(8px, 1.1vw, 14px);
        align-items: stretch;
    }

    :global(body.desktop-checkin-page .day-item) {
        min-width: 0;
        gap: clamp(2px, 0.5vh, 5px);
        justify-content: center;
    }

    :global(body.desktop-checkin-page .day-icon-wrapper) {
        width: clamp(31px, 5.4vh, 42px);
        height: clamp(31px, 5.4vh, 42px);
        border-radius: 8px;
        background: #f0f0f0;
    }

    :global(body.desktop-checkin-page .active-day) {
        background: #fff7df;
    }

    :global(body.desktop-checkin-page .today-day) {
        box-shadow: inset 0 0 0 1px rgba(29, 88, 167, 0.2);
    }

    :global(body.desktop-checkin-page .day-icon) {
        width: clamp(18px, 3vh, 24px);
        height: clamp(18px, 3vh, 24px);
    }

    :global(body.desktop-checkin-page .day-text) {
        color: #8b8b8b;
        font-size: clamp(8px, 1.35vh, 10px);
        line-height: 1.15;
        white-space: nowrap;
    }

    :global(body.desktop-checkin-page .check-in-btn) {
        grid-column: 1;
        grid-row: 3;
        width: calc(100% - 28px);
        height: clamp(34px, 5.7vh, 42px);
        margin: 4px auto 0;
        border-radius: 999px;
        background: #2561af;
        color: #ffffff;
        font-size: 12px;
        line-height: 1;
        font-weight: 400;
        letter-spacing: 0;
        box-shadow: none;
    }

    :global(body.desktop-checkin-page .reward-cards) {
        grid-column: 2;
        grid-row: 1 / span 3;
        min-height: 0;
        margin: 0;
        padding: 8px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        border-radius: 6px;
        background: #f2f2f2;
        box-sizing: border-box;
        overflow: hidden;
    }

    :global(body.desktop-checkin-page .reward-card) {
        flex: 0 0 clamp(68px, 11.8vh, 88px);
        width: 100%;
        height: clamp(68px, 11.8vh, 88px);
        border-radius: 6px;
        padding: 13px 18px;
        background: #2561af;
        box-sizing: border-box;
    }

    :global(body.desktop-checkin-page .reward-card:nth-child(2n)) {
        background: #2561af;
    }

    :global(body.desktop-checkin-page .reward-amount) {
        margin-bottom: 5px;
        color: #ffffff;
        font-size: 16px;
        line-height: 20px;
        font-weight: 400;
    }

    :global(body.desktop-checkin-page .reward-day) {
        color: rgba(255, 255, 255, 0.92);
        font-size: 9px;
        line-height: 12px;
        opacity: 1;
    }

    :global(body.desktop-checkin-page .reward-status) {
        margin-left: 5px;
        font-size: 9px;
    }

    :global(body.desktop-checkin-page .gift-icon) {
        width: clamp(50px, 8.2vh, 68px);
        height: clamp(50px, 8.2vh, 68px);
        flex: 0 0 auto;
    }
}
</style>
