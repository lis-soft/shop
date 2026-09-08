<script setup>
defineProps({
    title: {
        type: String,
        required: true
    },
    buttonText: {
        type: String,
        required: true
    }
})

const emit = defineEmits(['contact'])
</script>

<template>
    <section id="contact" class="contact-strip">
        <div class="contact-strip-copy">
            <p class="section-tag">Start a Conversation</p>
            <h2>{{ title }}</h2>
        </div>

        <div class="contact-strip-actions">
            <div class="mini-shape" aria-hidden="true">
                <span class="mini-shape-block mini-shape-block-top"></span>
                <span class="mini-shape-block mini-shape-block-bottom"></span>
            </div>
            <button type="button" class="contact-button" @click="emit('contact')">{{ buttonText }}</button>
        </div>
    </section>
</template>

<style scoped>
.contact-strip {
    position: relative;
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 32px;
    align-items: center;
    padding: 58px 70px;
    background: var(--landing-yellow);
}

.section-tag {
    margin: 0 0 16px;
    color: rgba(15, 23, 42, 0.6);
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
}

.contact-strip h2 {
    margin: 0;
    font-family: var(--landing-headline-font);
    font-size: clamp(56px, 6vw, 92px);
    line-height: 0.95;
    letter-spacing: 0.02em;
    text-transform: uppercase;
}

.contact-strip-actions {
    display: inline-flex;
    align-items: center;
    gap: 24px;
}

.mini-shape {
    position: relative;
    width: 120px;
    height: 96px;
}

.mini-shape-block {
    position: absolute;
    display: block;
    width: 78px;
    height: 34px;
    border: 4px solid #000000;
    border-radius: 6px;
    background: #ffffff;
}

.mini-shape-block-top {
    top: 8px;
    right: 12px;
    background: #069331;
    transform: rotate(30deg);
}

.mini-shape-block-bottom {
    bottom: 16px;
    left: 18px;
    background: #a52695;
    transform: rotate(-30deg);
}

.contact-button {
    min-width: 240px;
    padding: 20px 34px;
    border: 2px solid rgba(0, 0, 0, 0.72);
    border-radius: 24px;
    background: transparent;
    color: #000000;
    cursor: pointer;
    font: inherit;
    font-size: 26px;
    font-weight: 800;
    text-transform: uppercase;
}

@media (max-width: 1200px) {
    .contact-strip {
        padding-left: 40px;
        padding-right: 40px;
    }
}

@media (max-width: 960px) {
    .contact-strip {
        grid-template-columns: 1fr;
    }

    .contact-strip-actions {
        justify-content: space-between;
    }
}

@media (max-width: 640px) {
    .contact-strip {
        padding-left: 20px;
        padding-right: 20px;
    }

    .contact-strip-actions {
        flex-direction: column;
        align-items: stretch;
    }

    .mini-shape {
        display: none;
    }

    .contact-button {
        width: 100%;
        min-width: 0;
        font-size: 18px;
    }
}
</style>
