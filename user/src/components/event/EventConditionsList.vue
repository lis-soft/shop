<script setup>
defineProps({
    conditions: {
        type: Array,
        default: () => []
    }
})
</script>

<template>
    <div class="conditions-section">
        <h3 class="conditions-title">Conditions:</h3>
        <ol class="conditions-list">
            <li v-for="(condition, index) in conditions" :key="`${index}-${condition}`">{{ condition }}</li>
        </ol>
    </div>
</template>

<style scoped>
.conditions-section {
    margin-top: 0.4rem;
    padding: 0 0.1rem;
    counter-reset: item;
}

.conditions-title {
    font-size: 0.32rem;
    font-weight: 700;
    color: #333333;
    margin-bottom: 0.24rem;
}

.conditions-list {
    padding: 0;
    margin: 0;
    list-style: none;
}

.conditions-list li {
    font-size: 0.26rem;
    color: #a0a0a0;
    line-height: 1.4;
    margin-bottom: 0.08rem;
    position: relative;
    padding-left: 0.4rem;
}

.conditions-list li::before {
    content: counter(item) ".";
    counter-increment: item;
    position: absolute;
    left: 0;
    color: #a0a0a0;
}

@media (min-width: 481px) {
    :global(body.desktop-profile-related-page .conditions-section) {
        margin-top: 0;
        padding: 26px 28px;
        border-radius: 14px;
        background: #ffffff;
        box-shadow: 0 10px 28px rgba(15, 23, 42, 0.08);
    }

    :global(body.desktop-profile-related-page .conditions-title) {
        margin-bottom: 16px;
        font-size: 20px;
    }

    :global(body.desktop-profile-related-page .conditions-list li) {
        padding-left: 24px;
        margin-bottom: 9px;
        font-size: 15px;
        line-height: 1.6;
    }
}
</style>
