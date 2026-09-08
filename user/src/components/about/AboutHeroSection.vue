<script setup>
defineProps({
    title: {
        type: String,
        default: ''
    }
})
</script>

<template>
    <section class="hero-section">
        <h1 class="hero-title" v-html="title"></h1>
    </section>
</template>

<style scoped>
.hero-section {
    background-color: #008731;
    padding: 1.2rem 0.6rem;
}

.hero-title {
    color: #ffffff;
    font-size: 0.64rem;
    font-weight: 700;
    line-height: 1.2;
    margin: 0;
}

.hero-title :deep(.highlight-yellow) {
    color: #ffcc00;
}
</style>
