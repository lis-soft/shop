<script setup>
defineProps({
    theme: {
        type: String,
        default: 'light'
    },
    title: {
        type: String,
        default: ''
    },
    content: {
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
    <section :class="theme === 'blue' ? 'blue-section' : 'white-section'">
        <h2 :class="theme === 'blue' ? 'section-title-light' : 'section-title-dark'" v-html="title"></h2>
        <div :class="theme === 'blue' ? 'section-text-light' : 'section-text-dark'" v-html="content"></div>
        <button
            v-if="buttonText"
            :class="theme === 'blue' ? 'outline-btn-light' : 'outline-btn-dark'"
            @click="$emit('navigate')"
        >
            {{ buttonText }}
        </button>
    </section>
</template>

<style scoped>
section {
    padding: 0.8rem 0.6rem;
}

.white-section {
    background-color: #ffffff;
}

.blue-section {
    background-color: #1d58a7;
    color: #ffffff;
}

.section-title-dark,
.section-title-light {
    font-size: 0.48rem;
    font-weight: 700;
    line-height: 1.3;
    margin-bottom: 0.5rem;
}

.section-title-dark {
    color: #1a1a1a;
}

.section-text-dark {
    font-size: 0.24rem;
    color: #666666;
    line-height: 1.6;
    margin-bottom: 0.6rem;
}

.section-text-dark :deep(p) {
    margin: 0 0 0.2rem;
}

.section-text-light {
    font-size: 0.24rem;
    line-height: 1.6;
    opacity: 0.9;
}

.section-text-light :deep(p) {
    margin-bottom: 0.4rem;
}

.outline-btn-dark,
.outline-btn-light {
    background: transparent;
    border-radius: 0.5rem;
    font-size: 0.28rem;
    font-weight: 600;
}

.outline-btn-dark {
    border: 1.5px solid #1a1a1a;
    padding: 0.25rem 0.6rem;
    color: #1a1a1a;
}

.outline-btn-light {
    border: 1.5px solid #ffffff;
    padding: 0.25rem 0.8rem;
    color: #ffffff;
}
</style>
