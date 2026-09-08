<script setup>
defineProps({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    buttonText: {
        type: String,
        default: 'LEARN MORE'
    }
})

const emit = defineEmits(['learn-more'])
</script>

<template>
    <section id="about" class="brand-section">
        <div class="brand-copy">
            <p class="section-tag">About</p>
            <h1 v-html="title"></h1>
            <p>{{ description }}</p>
            <button type="button" class="outline-button" @click="emit('learn-more')">{{ buttonText }}</button>
        </div>

        <div class="brand-shape" aria-hidden="true">
            <span class="shape-block shape-block-top"></span>
            <span class="shape-block shape-block-middle"></span>
            <span class="shape-block shape-block-bottom"></span>
        </div>
    </section>
</template>

<style scoped>
.brand-section {
    position: relative;
    display: grid;
    grid-template-columns: minmax(0, 1fr) 380px;
    gap: 48px;
    align-items: center;
    padding: 88px 70px 94px;
    background: var(--landing-blue);
    color: #ffffff;
    overflow: hidden;
}

.section-tag {
    margin: 0 0 16px;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
}

.brand-copy h1 {
    margin: 0;
    max-width: 700px;
    font-family: var(--landing-headline-font);
    font-size: clamp(62px, 7vw, 112px);
    line-height: 0.95;
    letter-spacing: 0.02em;
    text-transform: uppercase;
}

.brand-copy :deep(.highlight-yellow) {
    color: var(--landing-yellow);
}

.brand-copy p:last-of-type {
    max-width: 820px;
    margin: 28px 0 0;
    font-size: clamp(22px, 2vw, 28px);
    line-height: 1.52;
}

.outline-button {
    min-width: 180px;
    margin-top: 34px;
    padding: 18px 26px;
    border: 2px solid rgba(255, 255, 255, 0.9);
    border-radius: 18px;
    background: transparent;
    color: #ffffff;
    cursor: pointer;
    font: inherit;
    font-size: 18px;
    font-weight: 700;
    text-transform: uppercase;
}

.brand-shape {
    position: relative;
    width: 100%;
    height: 420px;
}

.shape-block {
    position: absolute;
    right: 0;
    display: block;
    width: 220px;
    height: 84px;
    border: 10px solid #000000;
    border-radius: 10px;
    background: #ffffff;
    transform-origin: center;
}

.shape-block-top {
    top: 10px;
    background: #ffffff;
    transform: rotate(30deg);
}

.shape-block-middle {
    top: 138px;
    right: 36px;
    background: #a52695;
    transform: rotate(-30deg);
}

.shape-block-bottom {
    top: 36px;
    right: 120px;
    background: #069331;
    transform: rotate(30deg);
}

@media (max-width: 1200px) {
    .brand-section {
        padding-left: 40px;
        padding-right: 40px;
    }
}

@media (max-width: 960px) {
    .brand-section {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 640px) {
    .brand-section {
        gap: 24px;
        padding: 60px 20px 64px;
    }

    .brand-copy p:last-of-type {
        font-size: 16px;
    }

    .shape-block {
        width: 140px;
        height: 54px;
        border-width: 6px;
    }

    .brand-shape {
        height: 220px;
    }

    .outline-button {
        width: 100%;
        min-width: 0;
        font-size: 18px;
    }
}
</style>
