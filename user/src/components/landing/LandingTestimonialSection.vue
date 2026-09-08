<script setup>
defineProps({
    text: {
        type: String,
        required: true
    },
    name: {
        type: String,
        default: ''
    },
    role: {
        type: String,
        default: ''
    },
    brand: {
        type: String,
        default: ''
    }
})
</script>

<template>
    <section class="testimonial-section">
        <div class="testimonial-copy">
            <p class="section-tag">Impact</p>
            <blockquote>{{ text }}</blockquote>
            <div class="testimonial-meta">
                <strong>{{ name }}</strong>
                <span>{{ role }}</span>
            </div>
        </div>

        <div class="testimonial-mark" aria-hidden="true">
            <div class="hex-outline">
                <span>{{ brand }}</span>
            </div>
        </div>
    </section>
</template>

<style scoped>
.testimonial-section {
    position: relative;
    display: grid;
    grid-template-columns: minmax(0, 1fr) 420px;
    gap: 48px;
    align-items: center;
    padding: 90px 70px 110px;
    background:
        linear-gradient(180deg, #ffffff 0%, #ffffff 76%, var(--landing-yellow) 76%, var(--landing-yellow) 100%);
}

.section-tag {
    margin: 0 0 16px;
    color: rgba(15, 23, 42, 0.6);
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
}

.testimonial-copy blockquote {
    max-width: 820px;
    margin: 0;
    color: #000000;
    font-size: clamp(30px, 2.6vw, 46px);
    line-height: 1.45;
}

.testimonial-meta {
    margin-top: 54px;
    color: #000000;
    font-size: 22px;
}

.testimonial-meta strong,
.testimonial-meta span {
    display: block;
}

.testimonial-meta span {
    margin-top: 10px;
}

.testimonial-mark {
    display: flex;
    justify-content: center;
}

.hex-outline {
    display: flex;
    align-items: center;
    justify-content: center;
    width: min(420px, 100%);
    aspect-ratio: 1 / 0.9;
    clip-path: polygon(25% 4%, 75% 4%, 96% 50%, 75% 96%, 25% 96%, 4% 50%);
    background: #000000;
}

.hex-outline span {
    display: flex;
    align-items: center;
    justify-content: center;
    width: calc(100% - 20px);
    height: calc(100% - 20px);
    clip-path: inherit;
    background: #ffffff;
    color: #1f2a8a;
    font-family: var(--landing-headline-font);
    font-size: clamp(52px, 5vw, 96px);
    line-height: 0.95;
}

@media (max-width: 1200px) {
    .testimonial-section {
        padding-left: 40px;
        padding-right: 40px;
    }
}

@media (max-width: 960px) {
    .testimonial-section {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 640px) {
    .testimonial-section {
        padding-left: 20px;
        padding-right: 20px;
    }

    .testimonial-copy blockquote {
        font-size: 22px;
    }
}
</style>
