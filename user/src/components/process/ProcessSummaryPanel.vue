<script setup>
defineProps({
    processVideoSrc: {
        type: String,
        required: true
    },
    noticeText: {
        type: String,
        default: ''
    },
    processCountText: {
        type: String,
        default: '0/0'
    },
    processPercentWidth: {
        type: String,
        default: '0%'
    },
    processPercentText: {
        type: String,
        default: '0%'
    },
    totalBalanceText: {
        type: String,
        default: '$0.00'
    },
    dailyProfitText: {
        type: String,
        default: '$0.00'
    },
    inProcessBalanceText: {
        type: String,
        default: '$0.00'
    }
})

const emit = defineEmits(['review'])
</script>

<template>
    <div class="notification-bar">
        <div class="notification-content">
            <img src="@/assets/static/img/home/icon_8.png" alt="icon" class="notif-icon" />
            <div class="notif-marquee" aria-label="Process announcements">
                <div class="notif-track">
                    <span class="notif-text">{{ noticeText }}</span>
                    <span class="notif-text" aria-hidden="true">{{ noticeText }}</span>
                </div>
            </div>
        </div>
    </div>

    <div class="main-content">
        <div class="banner-wrapper">
            <video
                :src="processVideoSrc"
                class="banner-video"
                autoplay
                muted
                loop
                playsinline
                webkit-playsinline
                preload="auto"
            ></video>
        </div>

        <div class="process-card">
            <div class="card-header">
                <span class="process-title">Process New</span>
                <span class="process-count">{{ processCountText }}</span>
            </div>
            <div class="progress-bar-container">
                <div class="progress-bar-bg">
                    <div class="progress-fill" :style="{ width: processPercentWidth }">
                        <span class="progress-percent">{{ processPercentText }}</span>
                    </div>
                </div>
            </div>
            <button class="review-btn" @click="emit('review')">REVIEW</button>
        </div>

        <div class="secondary-progress">
            <span class="secondary-label">Process New</span>
            <div class="secondary-bar-bg">
                <div class="secondary-fill" :style="{ width: processPercentWidth }">
                    <span class="secondary-percent">{{ processPercentText }}</span>
                </div>
            </div>
        </div>

        <div class="info-cards-list">
            <div class="info-card">
                <div class="info-card-title">Total Balance</div>
                <div class="info-card-value">{{ totalBalanceText }}</div>
                <div class="info-card-desc">Total balance shows the funds currently available for use.</div>
            </div>

            <div class="info-card">
                <div class="info-card-title">Daily Profit</div>
                <div class="info-card-value">{{ dailyProfitText }}</div>
                <div class="info-card-desc">Displayed figures reflect the profit currently accumulated by this account.</div>
            </div>

            <div class="info-card">
                <div class="info-card-title">In Process</div>
                <div class="info-card-value">{{ inProcessBalanceText }}</div>
                <div class="info-card-desc">In process shows the funds currently frozen in active orders.</div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.notification-bar {
    height: 0.8rem;
    background-color: #ffffff;
    display: flex;
    align-items: center;
    padding: 0 0.4rem;
    border-bottom: 1px solid #f0f0f0;
}

.notification-content {
    display: flex;
    align-items: center;
    gap: 0.2rem;
    width: 100%;
}

.notif-icon {
    flex: 0 0 auto;
    width: 0.32rem;
    height: auto;
    opacity: 0.5;
}

.notif-marquee {
    position: relative;
    flex: 1;
    overflow: hidden;
    mask-image: linear-gradient(90deg, transparent 0, #000 6%, #000 94%, transparent 100%);
}

.notif-track {
    display: flex;
    width: max-content;
    min-width: 100%;
    align-items: center;
    gap: 0.48rem;
    animation: process-summary-notice-scroll 18s linear infinite;
}

.notif-text {
    flex: 0 0 auto;
    font-size: 0.28rem;
    color: #666666;
    white-space: nowrap;
}

.main-content {
    background-color: #34a853;
    padding: 0.4rem;
    min-height: calc(100vh - 1.4rem - 1.28rem - 0.8rem);
}

.banner-wrapper {
    width: 100%;
    border-radius: 0.2rem;
    overflow: hidden;
    margin-bottom: 0.4rem;
    background-color: #ffffff;
}

.banner-video {
    width: 100%;
    height: auto;
    display: block;
    background-color: #ffffff;
}

.process-card {
    background-color: #ffffff;
    border-radius: 0.24rem;
    padding: 0.4rem;
    margin-bottom: 0.4rem;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.3rem;
}

.process-title,
.process-count {
    font-size: 0.36rem;
    color: #333333;
}

.process-title {
    font-weight: 600;
}

.progress-bar-container {
    margin-bottom: 0.4rem;
}

.progress-bar-bg {
    height: 0.12rem;
    background-color: #f0f0f0;
    border-radius: 0.06rem;
    position: relative;
}

.progress-fill {
    height: 100%;
    background-color: #34a853;
    border-radius: 0.06rem;
    position: relative;
}

.progress-percent {
    position: absolute;
    top: -0.2rem;
    left: 0;
    background-color: #34a853;
    color: #ffffff;
    font-size: 0.2rem;
    padding: 0.02rem 0.1rem;
    border-radius: 0.2rem;
}

.review-btn {
    width: 100%;
    height: 0.9rem;
    background-color: #1d58a7;
    color: #ffffff;
    border: none;
    border-radius: 0.12rem;
    font-size: 0.32rem;
    font-weight: 600;
    letter-spacing: 0.02em;
}

.review-btn:disabled {
    opacity: 0.7;
}

.secondary-progress {
    display: flex;
    align-items: center;
    gap: 0.2rem;
    margin-bottom: 0.4rem;
}

.secondary-label {
    color: #ffffff;
    font-size: 0.32rem;
    white-space: nowrap;
}

.secondary-bar-bg {
    flex: 1;
    height: 0.12rem;
    background-color: rgba(255, 255, 255, 0.3);
    border-radius: 0.06rem;
    position: relative;
}

.secondary-fill {
    height: 100%;
    background-color: #ffffff;
    border-radius: 0.06rem;
    position: relative;
}

.secondary-percent {
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    background-color: #1d58a7;
    color: #ffffff;
    font-size: 0.18rem;
    padding: 0.02rem 0.08rem;
    border-radius: 0.2rem;
}

.info-cards-list {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
}

.info-card {
    background-color: #ffffff;
    border-radius: 0.24rem;
    padding: 0.5rem 0.4rem;
    text-align: center;
}

.info-card-title {
    font-size: 0.32rem;
    color: #333333;
    margin-bottom: 0.2rem;
}

.info-card-value {
    font-size: 0.56rem;
    font-weight: 700;
    color: #000000;
    margin-bottom: 0.2rem;
}

.info-card-desc {
    font-size: 0.28rem;
    color: #999999;
    line-height: 1.4;
    max-width: 85%;
    margin: 0 auto;
}

@keyframes process-summary-notice-scroll {
    0% {
        transform: translate3d(0, 0, 0);
    }

    100% {
        transform: translate3d(calc(-50% - 0.24rem), 0, 0);
    }
}

:global(body.desktop-process-page .notification-bar) {
    display: none;
}

:global(body.desktop-process-page .main-content) {
    --process-top-panel-height: clamp(202px, 20vw, 286px);
    --process-banner-height: calc(var(--process-top-panel-height) - 30px);
    --process-card-height: clamp(108px, 10vw, 142px);
    --process-row-gap: clamp(18px, 1.7vw, 24px);
    --process-info-panel-height: clamp(184px, 18vw, 256px);
    --process-info-card-height: calc(var(--process-info-panel-height) - 58px);
    position: relative;
    display: grid;
    grid-template-columns: minmax(280px, 1fr) minmax(300px, 1.04fr);
    grid-template-rows:
        var(--process-card-height)
        calc(var(--process-banner-height) - var(--process-card-height) - var(--process-row-gap))
        var(--process-info-panel-height);
    column-gap: 20px;
    row-gap: var(--process-row-gap);
    align-items: start;
    width: var(--desktop-content-width);
    height: 100vh;
    min-height: 100vh;
    margin-left: var(--desktop-content-left-gap);
    padding: 24px 0 0 0;
    background: #ffffff;
    box-sizing: border-box;
    overflow-y: auto;
    overflow-x: hidden;
}

:global(body.desktop-process-page .main-content::before) {
    content: '';
    position: absolute;
    left: 0;
    top: 15px;
    width: 100%;
    height: var(--process-top-panel-height);
    border-radius: 8px;
    background: #f7f7f7;
    z-index: 0;
}

:global(body.desktop-process-page .banner-wrapper),
:global(body.desktop-process-page .process-card),
:global(body.desktop-process-page .secondary-progress),
:global(body.desktop-process-page .info-cards-list) {
    position: relative;
    z-index: 1;
}

:global(body.desktop-process-page .banner-wrapper) {
    grid-column: 1;
    grid-row: 1 / span 2;
    width: 100%;
    height: var(--process-banner-height);
    margin: 0;
    border-radius: 8px;
    background: #ffffff;
    overflow: hidden;
}

:global(body.desktop-process-page .process-card) {
    grid-column: 2;
    grid-row: 1;
    width: 100%;
    height: var(--process-card-height);
    margin: 6px 0 0 0;
    padding: 11px 10px 15px;
    border-radius: 10px;
    background: #ffffff;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
}

:global(body.desktop-process-page .secondary-progress) {
    grid-column: 2;
    grid-row: 2;
    width: 100%;
    min-height: 42px;
    margin: 0;
    display: block;
}

:global(body.desktop-process-page .banner-video) {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
}

:global(body.desktop-process-page .card-header) {
    margin-bottom: 10px;
}

:global(body.desktop-process-page .process-title),
:global(body.desktop-process-page .process-count) {
    color: #222222;
    font-size: 13px;
    line-height: 16px;
    font-weight: 400;
}

:global(body.desktop-process-page .progress-bar-container) {
    margin-bottom: 14px;
}

:global(body.desktop-process-page .progress-bar-bg) {
    height: 6px;
    border-radius: 999px;
    background: #e5e5e5;
}

:global(body.desktop-process-page .progress-fill) {
    min-width: 25px;
    border-radius: 999px;
    background: #16983a;
}

:global(body.desktop-process-page .progress-percent) {
    top: -1px;
    left: 0;
    min-width: 25px;
    height: 10px;
    padding: 0 4px;
    border-radius: 999px;
    background: #16983a;
    color: #ffffff;
    font-size: 7px;
    line-height: 10px;
    text-align: center;
}

:global(body.desktop-process-page .review-btn) {
    height: 32px;
    margin-top: auto;
    border-radius: 4px;
    background: #2464b7;
    color: #ffffff;
    font-size: 10px;
    line-height: 1;
    font-weight: 700;
}

:global(body.desktop-process-page .secondary-label) {
    display: block;
    margin-bottom: 9px;
    color: #222222;
    font-size: 13px;
    line-height: 16px;
}

:global(body.desktop-process-page .secondary-bar-bg) {
    width: 100%;
    height: 6px;
    border-radius: 999px;
    background: #e5e5e5;
}

:global(body.desktop-process-page .secondary-fill) {
    min-width: 29px;
    background: #2464b7;
    border-radius: 999px;
}

:global(body.desktop-process-page .secondary-percent) {
    right: 0;
    top: 50%;
    min-width: 29px;
    height: 11px;
    padding: 0 4px;
    border-radius: 999px;
    background: #4d8bd3;
    color: #ffffff;
    font-size: 7px;
    line-height: 11px;
    text-align: center;
}

:global(body.desktop-process-page .info-cards-list) {
    grid-column: 1 / span 2;
    grid-row: 3;
    width: 100%;
    min-height: var(--process-info-panel-height);
    margin: 0;
    padding: 23px 13px 34px;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 13px;
    border-radius: 6px;
    background: linear-gradient(180deg, #35a46c 0%, #559bb1 100%);
    box-sizing: border-box;
}

:global(body.desktop-process-page .info-card) {
    min-width: 0;
    height: var(--process-info-card-height);
    min-height: 126px;
    padding: 17px 18px 14px;
    border-radius: 8px;
    background: #ffffff;
    box-sizing: border-box;
}

:global(body.desktop-process-page .info-card-title) {
    margin-bottom: 6px;
    color: #333333;
    font-size: 11px;
    line-height: 14px;
}

:global(body.desktop-process-page .info-card-value) {
    margin-bottom: 11px;
    color: #111111;
    font-size: 17px;
    line-height: 21px;
    font-weight: 500;
}

:global(body.desktop-process-page .info-card-desc) {
    max-width: none;
    color: #a7a7a7;
    font-size: 10px;
    line-height: 14px;
}

</style>
