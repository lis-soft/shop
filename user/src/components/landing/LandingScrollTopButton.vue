<script setup>
defineProps({
    visible: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['click'])
</script>

<template>
    <button
        v-if="visible"
        type="button"
        class="scroll-top-button"
        @click="emit('click')"
    >
        ↑
    </button>
</template>

<style scoped>
.scroll-top-button {
    position: fixed;
    right: 28px;
    bottom: 28px;
    z-index: 24;
    width: 64px;
    height: 64px;
    border: 0;
    border-radius: 999px;
    background: #a52695;
    color: #ffffff;
    cursor: pointer;
    font: inherit;
    font-size: 34px;
    font-weight: 700;
    box-shadow: 0 18px 40px rgba(165, 38, 149, 0.28);
}

@media (max-width: 640px) {
    .scroll-top-button {
        right: 16px;
        bottom: 16px;
        width: 52px;
        height: 52px;
        font-size: 26px;
    }
}
</style>
