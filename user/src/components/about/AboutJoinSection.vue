<script setup>
defineProps({
    title: {
        type: String,
        default: ''
    },
    buttonText: {
        type: String,
        default: ''
    }
})

defineEmits(['navigate'])
</script>

<template>
    <section class="join-section">
        <h2 class="join-title" v-html="title"></h2>
        <button v-if="buttonText" class="outline-btn-light" @click="$emit('navigate')">
            {{ buttonText }}
        </button>
    </section>
</template>

<style scoped>
.join-section {
    background-color: #1d58a7;
    text-align: left;
    padding: 1rem 0.6rem;
}

.join-title {
    color: #ffffff;
    font-size: 0.48rem;
    font-weight: 700;
    line-height: 1.3;
    margin-bottom: 0.6rem;
}

.outline-btn-light {
    background: transparent;
    border: 1.5px solid #ffffff;
    border-radius: 0.5rem;
    padding: 0.25rem 0.8rem;
    font-size: 0.32rem;
    font-weight: 600;
    color: #ffffff;
}
</style>
