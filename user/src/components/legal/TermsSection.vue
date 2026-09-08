<script setup>
defineProps({
    title: {
        type: String,
        default: ''
    },
    paragraphs: {
        type: Array,
        default: () => []
    },
    updatedAt: {
        type: String,
        default: ''
    },
    isIntro: {
        type: Boolean,
        default: false
    }
})
</script>

<template>
    <section :class="isIntro ? 'intro-section' : 'clause-section'">
        <template v-if="isIntro">
            <h2 class="sub-title">{{ title }}</h2>
            <div v-if="updatedAt" class="last-updated">{{ updatedAt }}</div>
        </template>
        <h3 v-else class="clause-title">{{ title }}</h3>

        <p v-for="(paragraph, index) in paragraphs" :key="index" class="text-content">
            {{ paragraph }}
        </p>
    </section>
</template>

<style scoped>
.sub-title {
    font-size: 0.48rem;
    font-weight: 600;
    margin-bottom: 0.6rem;
}

.last-updated {
    font-size: 0.4rem;
    font-weight: 600;
    margin-bottom: 0.6rem;
}

.text-content {
    font-size: 0.28rem;
    line-height: 1.6;
    color: #666666;
    margin-bottom: 0.3rem;
}

.clause-title {
    font-size: 0.4rem;
    font-weight: 600;
    margin-bottom: 0.4rem;
}

.clause-section {
    padding-bottom: 0.2rem;
}
</style>
