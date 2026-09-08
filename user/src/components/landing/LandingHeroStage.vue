<script setup>
defineProps({
    heroGalleryCards: {
        type: Array,
        default: () => []
    },
    heroImage: {
        type: String,
        required: true
    }
})
</script>

<template>
    <section class="hero-stage">
        <div class="hero-gallery" aria-hidden="true">
            <article
                v-for="card in heroGalleryCards"
                :key="card.className"
                :class="card.className"
            >
                <img :src="card.image" :alt="card.label" />
                <span>{{ card.label }}</span>
            </article>
        </div>

        <div class="hero-device">
            <div class="hero-device-screen">
                <img :src="heroImage" alt="Featured work" />
                <div class="hero-device-overlay">
                    <p class="eyebrow">Numbers-driven creative systems</p>
                    <h2>See the possibility</h2>
                </div>
            </div>
            <div class="hero-device-base"></div>
        </div>
    </section>
</template>

<style scoped>
.hero-stage {
    position: relative;
    min-height: 820px;
    margin-top: -92px;
    overflow: hidden;
    background:
        radial-gradient(circle at center, rgba(255, 255, 255, 0.42), rgba(255, 255, 255, 0) 34%),
        linear-gradient(180deg, #ece9e4 0%, #ffffff 52%, #f8f7f2 100%);
}

.hero-gallery {
    position: absolute;
    inset: 0;
}

.hero-gallery :deep(.gallery-card) {
    position: absolute;
    overflow: hidden;
    border-radius: 26px;
    background: rgba(255, 255, 255, 0.68);
    box-shadow: 0 28px 70px rgba(15, 23, 42, 0.16);
}

.hero-gallery :deep(.gallery-card img) {
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: saturate(0.95);
}

.hero-gallery :deep(.gallery-card span) {
    position: absolute;
    left: 18px;
    bottom: 16px;
    padding: 7px 12px;
    border-radius: 999px;
    background: rgba(15, 23, 42, 0.7);
    color: #ffffff;
    font-size: 12px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
}

.hero-gallery :deep(.gallery-card-1) {
    top: 110px;
    left: -40px;
    width: 320px;
    height: 220px;
    transform: rotate(-4deg);
}

.hero-gallery :deep(.gallery-card-2) {
    top: 80px;
    left: 280px;
    width: 420px;
    height: 230px;
}

.hero-gallery :deep(.gallery-card-3) {
    top: 70px;
    right: 290px;
    width: 360px;
    height: 200px;
    transform: rotate(-2deg);
}

.hero-gallery :deep(.gallery-card-4) {
    top: 120px;
    right: -36px;
    width: 360px;
    height: 260px;
}

.hero-gallery :deep(.gallery-card-5) {
    bottom: 185px;
    left: 140px;
    width: 370px;
    height: 240px;
}

.hero-gallery :deep(.gallery-card-6) {
    bottom: 160px;
    right: 150px;
    width: 420px;
    height: 300px;
}

.hero-device {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    min-height: 820px;
    padding: 180px 24px 42px;
}

.hero-device-screen {
    position: relative;
    width: min(620px, 82vw);
    overflow: hidden;
    border: 8px solid #d8d8e0;
    border-bottom-width: 14px;
    border-radius: 28px 28px 16px 16px;
    background: #d9dde7;
    box-shadow: 0 35px 90px rgba(73, 70, 96, 0.28);
}

.hero-device-screen img {
    width: 100%;
    aspect-ratio: 16 / 10;
    object-fit: cover;
}

.hero-device-overlay {
    position: absolute;
    inset: auto 0 0;
    padding: 34px;
    background: linear-gradient(180deg, rgba(8, 15, 28, 0), rgba(8, 15, 28, 0.72));
    color: #ffffff;
    text-align: center;
}

.eyebrow {
    margin: 0 0 8px;
    font-size: 13px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
}

.hero-device-overlay h2 {
    margin: 0;
    font-family: var(--landing-headline-font);
    font-size: clamp(38px, 4vw, 56px);
    line-height: 1;
    letter-spacing: 0.03em;
    text-transform: uppercase;
}

.hero-device-base {
    width: min(760px, 92vw);
    height: 34px;
    margin-top: -2px;
    border-radius: 0 0 999px 999px;
    background: linear-gradient(180deg, #f4f4f7, #cfd2dc);
    box-shadow: 0 30px 70px rgba(173, 178, 191, 0.46);
}

@media (max-width: 960px) {
    .hero-stage {
        min-height: 680px;
    }

    .hero-gallery :deep(.gallery-card-1),
    .hero-gallery :deep(.gallery-card-3),
    .hero-gallery :deep(.gallery-card-5),
    .hero-gallery :deep(.gallery-card-6) {
        display: none;
    }

    .hero-gallery :deep(.gallery-card-2) {
        left: 20px;
        right: 20px;
        width: auto;
        height: 200px;
    }

    .hero-gallery :deep(.gallery-card-4) {
        right: 20px;
        width: 260px;
        height: 180px;
    }
}

@media (max-width: 640px) {
    .hero-stage {
        min-height: 580px;
    }

    .hero-gallery :deep(.gallery-card) {
        border-radius: 18px;
    }

    .hero-gallery :deep(.gallery-card-2) {
        top: 82px;
        height: 160px;
    }

    .hero-gallery :deep(.gallery-card-4) {
        top: 282px;
        width: 180px;
        height: 140px;
    }

    .hero-device {
        min-height: 580px;
        padding-top: 190px;
    }
}
</style>
