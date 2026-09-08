<script setup>
defineProps({
    visible: {
        type: Boolean,
        default: false
    },
    message: {
        type: String,
        default: ''
    }
})
</script>

<template>
    <div v-if="visible" class="notice-toast mobile-frame-fixed mobile-frame-fullscreen">
        <div class="notice-toast-card">{{ message }}</div>
    </div>
</template>

<style scoped>
.notice-toast {
    position: fixed;
    inset: 0;
    z-index: 1200;
    display: flex;
    justify-content: center;
    align-items: center;
    pointer-events: none;
    padding: 0.5rem;
    box-sizing: border-box;
}

.notice-toast-card {
    max-width: 6.4rem;
    width: max-content;
    min-width: 4.8rem;
    padding: 0.26rem 0.34rem;
    border-radius: 0.24rem;
    background: rgba(15, 23, 42, 0.92);
    color: #ffffff;
    font-size: 0.28rem;
    line-height: 1.45;
    box-shadow: 0 0.14rem 0.32rem rgba(15, 23, 42, 0.22);
    text-align: center;
    border: 1px solid rgba(255, 255, 255, 0.14);
    backdrop-filter: blur(0.08rem);
}
</style>
