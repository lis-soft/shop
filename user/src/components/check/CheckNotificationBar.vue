<script setup>
defineProps({
    broadcastImg: {
        type: String,
        required: true
    },
    notificationText: {
        type: String,
        default: ''
    }
})
</script>

<template>
    <div class="notification-bar">
        <div class="notification-content">
            <img :src="broadcastImg" alt="icon" class="notif-icon" />
            <span class="notif-text">{{ notificationText }}</span>
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
    overflow: hidden;
}

.notif-icon {
    width: 0.32rem;
    height: auto;
    opacity: 0.5;
}

.notif-text {
    font-size: 0.28rem;
    color: #666666;
    white-space: nowrap;
}

@media (min-width: 481px) {
    :global(body.desktop-checkin-page .notification-bar) {
        width: var(--desktop-content-width);
        height: clamp(32px, 4.5vh, 36px);
        margin-left: var(--desktop-content-left-gap);
        margin-top: clamp(18px, 3vh, 24px);
        padding: 0 10px;
        border-bottom: 0;
        background: linear-gradient(90deg, #34a56f 0%, #448eba 100%);
        box-sizing: border-box;
    }

    :global(body.desktop-checkin-page .notification-content) {
        gap: 7px;
        height: 100%;
    }

    :global(body.desktop-checkin-page .notif-icon) {
        width: 13px;
        height: 13px;
        opacity: 0.9;
        filter: brightness(0) invert(1);
    }

    :global(body.desktop-checkin-page .notif-text) {
        color: rgba(255, 255, 255, 0.92);
        font-size: 10px;
        line-height: 1;
    }
}
</style>
