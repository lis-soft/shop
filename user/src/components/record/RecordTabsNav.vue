<script setup>
defineProps({
    tabs: {
        type: Array,
        default: () => []
    },
    activeTab: {
        type: String,
        default: ''
    }
})

const emit = defineEmits(['change'])
</script>

<template>
    <nav class="record-tabs-nav" aria-label="Record filters">
        <button
            v-for="tab in tabs"
            :key="tab.id"
            type="button"
            class="record-tab-button"
            :class="{ active: activeTab === tab.id }"
            @click="emit('change', tab.id)"
        >
            {{ tab.label }}
        </button>
    </nav>
</template>

<style scoped>
.record-tabs-nav {
    display: flex;
    gap: 0.12rem;
    background-color: #ffffff;
    align-items: stretch;
    padding: 0.18rem 0.24rem 0.16rem;
    width: 100%;
    min-height: 1.06rem;
    border-bottom: 1px solid #f0f0f0;
    box-sizing: border-box;
}

.record-tab-button {
    flex: 1;
    text-align: center;
    font-size: 0.3rem;
    color: #666666;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    cursor: pointer;
    border: 0;
    background: transparent;
    border-radius: 999px;
    min-height: 0.72rem;
    padding: 0 0.16rem;
    transition: background-color 0.2s ease, color 0.2s ease;
    appearance: none;
}

.record-tab-button.active {
    background-color: rgba(29, 88, 167, 0.1);
    color: #1d58a7;
    font-weight: 600;
}

.record-tab-button:focus-visible {
    outline: 2px solid rgba(29, 88, 167, 0.35);
    outline-offset: 0.02rem;
}

:global(body.desktop-record-page .record-tabs-nav) {
    height: clamp(88px, 8vw, 116px);
    min-height: clamp(88px, 8vw, 116px);
    padding: 0 0 0 calc(var(--desktop-content-left-gap) + 133px);
    gap: clamp(66px, 6vw, 96px);
    align-items: flex-end;
    justify-content: flex-start;
    background: #ffffff;
    border-bottom: 0;
}

:global(body.desktop-record-page .record-tab-button) {
    flex: 0 0 auto;
    min-width: clamp(74px, 7vw, 106px);
    min-height: clamp(88px, 8vw, 116px);
    padding: 0 0 clamp(14px, 1.4vw, 22px);
    border-radius: 0;
    background: transparent;
    color: #6c6c6c;
    font-size: clamp(14px, 1.25vw, 18px);
    line-height: 1.3;
    font-weight: 400;
}

:global(body.desktop-record-page .record-tab-button.active) {
    background: transparent;
    color: #1d58a7;
    font-weight: 400;
}

:global(body.desktop-record-page .record-tab-button.active::after) {
    content: '';
    position: absolute;
    left: 50%;
    bottom: 0;
    width: clamp(43px, 4vw, 64px);
    height: 2px;
    border-radius: 999px;
    background: #1d58a7;
    transform: translateX(-50%);
}

</style>
