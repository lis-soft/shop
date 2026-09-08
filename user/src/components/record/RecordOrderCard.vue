<script setup>
defineProps({
    record: {
        type: Object,
        required: true
    },
    currentBalance: {
        type: Number,
        default: 0
    },
    isSubmitting: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['submit', 'image-error'])
</script>

<template>
    <div class="record-card">
        <div class="card-image-wrapper">
            <img :src="record.image" :alt="record.title" class="record-image" @error="emit('image-error', record.id)" />
            <div class="status-badge" :class="`status-${record.rawStatus}`">{{ record.status }}</div>
        </div>

        <div class="card-content">
            <div class="record-date">{{ record.date }}</div>
            <h3 class="record-title">{{ record.title }}</h3>

            <div class="record-info">
                <div class="info-row">
                    <span class="info-label">Value:</span>
                    <span class="info-value value-black">{{ record.valueText }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Commission:</span>
                    <span class="info-value value-green">{{ record.commissionText }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Profit:</span>
                    <span class="info-value value-green">{{ record.profitText }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Rebate:</span>
                    <span class="info-value value-green">{{ record.rebateText }}</span>
                </div>
            </div>

            <button v-if="record.canSubmit" class="record-action-btn" :disabled="isSubmitting || currentBalance < 0" @click="emit('submit', record)">
                {{ isSubmitting ? 'Submitting...' : currentBalance < 0 ? 'Insufficient Balance' : 'Submit' }}
            </button>
        </div>
    </div>
</template>

<style scoped>
.record-card {
    background-color: #ffffff;
    border-radius: 0.18rem;
    overflow: hidden;
    box-shadow: 0 0.04rem 0.2rem rgba(0, 0, 0, 0.05);
}

.card-image-wrapper {
    position: relative;
    width: 100%;
    height: 2.62rem;
    padding: 0.48rem 1.5rem 0.48rem;
    box-sizing: border-box;
}

.record-image {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: fill;
    background-color: #f3f3f3;
    border-radius: 0.12rem;
}

.status-badge {
    position: absolute;
    top: 0.22rem;
    right: 0.22rem;
    padding: 0.08rem 0.22rem;
    border-radius: 0.12rem;
    font-size: 0.24rem;
    font-weight: 700;
    letter-spacing: 0;
    color: #ffffff;
}

.status-0 {
    background-color: #1d58a7;
}

.status-1 {
    background-color: #28a745;
}

.status-2,
.status-3,
.status-4,
.status-5 {
    background-color: #8a8a8a;
}

.card-content {
    padding: 0.12rem 0.28rem 0.26rem;
}

.record-date {
    font-size: 0.24rem;
    color: #999999;
    margin-bottom: 0.08rem;
}

.record-title {
    display: -webkit-box;
    overflow: hidden;
    font-size: 0.34rem;
    font-weight: 600;
    line-height: 1.3;
    margin: 0 0 0.18rem;
    color: #333333;
    word-break: break-word;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
}

.record-info {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.14rem 0.28rem;
}

.info-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-width: 0;
    font-size: 0.27rem;
    line-height: 1.3;
    gap: 0.1rem;
}

.info-label {
    color: #666666;
    flex: 0 0 auto;
}

.info-value {
    min-width: 0;
    font-weight: 500;
    text-align: right;
    overflow-wrap: anywhere;
}

.value-black {
    color: #000000;
    font-weight: 600;
}

.value-green {
    color: #28a745;
    font-weight: 600;
}

.record-action-btn {
    width: 100%;
    height: 0.76rem;
    margin-top: 0.2rem;
    background-color: #111111;
    color: #ffffff;
    border: none;
    border-radius: 0.1rem;
    font-size: 0.3rem;
    font-weight: 600;
    cursor: pointer;
}

.record-action-btn:disabled {
    opacity: 0.65;
}

:global(body.desktop-mobile-frame .record-card) {
    border-radius: 14px;
}

:global(body.desktop-mobile-frame .card-image-wrapper) {
    height: clamp(220px, 28vw, 320px);
    padding: 20px 48px 16px;
    display: flex;
    align-items: center;
    justify-content: center;
}

:global(body.desktop-mobile-frame .record-image) {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    border-radius: 10px;
}

:global(body.desktop-record-page .record-card) {
    --record-card-height: clamp(114px, 11vw, 158px);
    --record-card-image-width: clamp(195px, 19vw, 280px);
    position: relative;
    display: grid;
    grid-template-columns: var(--record-card-image-width) minmax(0, 1fr);
    width: var(--desktop-content-width);
    height: var(--record-card-height);
    overflow: hidden;
    border-radius: 7px;
    background: #ffffff;
    box-shadow: 0 1px 8px rgba(15, 23, 42, 0.06);
}

:global(body.desktop-record-page .card-image-wrapper) {
    width: var(--record-card-image-width);
    height: var(--record-card-height);
    padding: clamp(4px, 0.45vw, 7px);
    display: block;
    box-sizing: border-box;
}

:global(body.desktop-record-page .record-image) {
    width: 100%;
    height: 100%;
    border-radius: 0;
    object-fit: cover;
    object-position: center;
}

:global(body.desktop-record-page .status-badge) {
    top: clamp(12px, 1.1vw, 18px);
    right: clamp(13px, 1.2vw, 20px);
    min-width: clamp(66px, 6vw, 92px);
    height: clamp(17px, 1.6vw, 24px);
    padding: 0 clamp(12px, 1.1vw, 18px);
    border-radius: 999px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: clamp(8px, 0.8vw, 12px);
    line-height: 1;
    font-weight: 700;
    letter-spacing: 0;
}

:global(body.desktop-record-page .card-content) {
    position: relative;
    min-width: 0;
    height: var(--record-card-height);
    padding: clamp(13px, 1.2vw, 20px) clamp(12px, 1.2vw, 20px) clamp(12px, 1.2vw, 18px) clamp(17px, 1.6vw, 26px);
    box-sizing: border-box;
}

:global(body.desktop-record-page .record-title) {
    display: block;
    margin: 0 0 clamp(14px, 1.3vw, 20px);
    padding-right: clamp(95px, 9vw, 138px);
    padding-bottom: clamp(8px, 0.8vw, 12px);
    border-bottom: 1px solid #e4e4e4;
    color: #222222;
    font-size: clamp(16px, 1.5vw, 22px);
    line-height: 1.25;
    font-weight: 400;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

:global(body.desktop-record-page .record-date) {
    position: absolute;
    right: clamp(12px, 1.2vw, 20px);
    bottom: clamp(23px, 2.2vw, 34px);
    margin: 0;
    color: #222222;
    font-size: clamp(8px, 0.78vw, 11px);
    line-height: 1.25;
    white-space: nowrap;
}

:global(body.desktop-record-page .record-info) {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: clamp(5px, 0.55vw, 8px) clamp(18px, 2vw, 32px);
    width: min(clamp(360px, 34vw, 520px), calc(100% - clamp(110px, 10vw, 160px)));
}

:global(body.desktop-record-page .info-row) {
    justify-content: flex-start;
    gap: clamp(8px, 0.75vw, 12px);
    font-size: clamp(8px, 0.78vw, 11px);
    line-height: 1.25;
}

:global(body.desktop-record-page .info-label) {
    color: #333333;
}

:global(body.desktop-record-page .info-value) {
    text-align: left;
    font-weight: 600;
}

:global(body.desktop-record-page .record-action-btn) {
    display: none;
}

</style>
