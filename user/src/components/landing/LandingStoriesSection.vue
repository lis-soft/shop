<script setup>
defineProps({
    title: {
        type: String,
        required: true
    },
    buttonText: {
        type: String,
        required: true
    },
    cards: {
        type: Array,
        default: () => []
    }
})

const emit = defineEmits(['view-all', 'open-card'])
</script>

<template>
    <section id="work" class="stories-section">
        <div class="section-heading">
            <div>
                <p class="section-tag">Work</p>
                <h2>{{ title }}</h2>
            </div>
            <button type="button" class="outline-button" @click="emit('view-all')">{{ buttonText }}</button>
        </div>

        <div class="stories-grid">
            <article
                v-for="card in cards"
                :key="`${card.metric}-${card.caption}`"
                class="story-card"
            >
                <img :src="card.image" :alt="card.caption" />
                <div class="story-card-overlay"></div>
                <div class="story-card-copy">
                    <h3>{{ card.metric }}</h3>
                    <p>{{ card.caption }}</p>
                    <button type="button" class="story-arrow" @click="emit('open-card', card)">→</button>
                </div>
            </article>
        </div>
    </section>
</template>

<style scoped>
.stories-section {
    position: relative;
    padding: 84px 70px 96px;
    background: var(--landing-green);
}

.section-heading {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 24px;
    margin-bottom: 42px;
    color: #ffffff;
    text-align: left;
}

.section-tag {
    margin: 0 0 16px;
    color: rgba(255, 255, 255, 0.74);
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
}

.section-heading h2 {
    margin: 0;
    font-family: var(--landing-headline-font);
    font-size: clamp(56px, 6vw, 92px);
    line-height: 0.95;
    letter-spacing: 0.02em;
    text-transform: uppercase;
}

.outline-button,
.story-arrow {
    border: 0;
    background: transparent;
    cursor: pointer;
    font: inherit;
}

.outline-button {
    min-width: 180px;
    padding: 18px 26px;
    border: 2px solid rgba(255, 255, 255, 0.7);
    border-radius: 18px;
    color: #ffffff;
    font-size: 18px;
    font-weight: 700;
    text-transform: uppercase;
}

.stories-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 28px;
}

.story-card {
    position: relative;
    overflow: hidden;
    min-height: 420px;
    border-radius: 22px;
    background: #0c1f15;
}

.story-card > img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.story-card-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(15, 23, 42, 0.08), rgba(15, 23, 42, 0.72));
}

.story-card-copy {
    position: absolute;
    inset: auto 0 0;
    padding: 26px 28px 24px;
    color: #ffffff;
}

.story-card-copy h3 {
    margin: 0 0 8px;
    font-family: var(--landing-headline-font);
    font-size: clamp(44px, 4.5vw, 74px);
    line-height: 0.96;
}

.story-card-copy p {
    margin: 0;
    max-width: 440px;
    font-size: clamp(22px, 1.8vw, 32px);
    font-weight: 700;
    line-height: 1.24;
}

.story-arrow {
    margin-top: 16px;
    padding: 0;
    color: #ffffff;
    font-size: 34px;
    font-weight: 700;
}

@media (max-width: 1200px) {
    .stories-section {
        padding-left: 40px;
        padding-right: 40px;
    }
}

@media (max-width: 960px) {
    .stories-grid {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 640px) {
    .stories-section {
        padding-left: 20px;
        padding-right: 20px;
    }

    .section-heading {
        flex-direction: column;
        align-items: stretch;
    }

    .outline-button {
        width: 100%;
        min-width: 0;
        font-size: 18px;
    }
}
</style>
