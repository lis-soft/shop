<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import defaultHeroImage from '@/assets/static/img/home/Rectangle 462.png'

const AUTOPLAY_INTERVAL = 4500
const SWIPE_THRESHOLD = 36

const props = defineProps({
    heroImages: {
        type: Array,
        default: () => []
    },
    noticeText: {
        type: String,
        default: ''
    },
    title: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        default: ''
    }
})

const activeHeroIndex = ref(0)
const pointerStartX = ref(null)
let heroTimer = null

const normalizedNoticeText = computed(() => String(props.noticeText || '').trim())
const normalizedTitle = computed(() => String(props.title || '').trim() || 'WE TELL <span class="highlight-yellow">BRAND<br />STORIES</span> WITH<br />NUMBERS')
const normalizedDescription = computed(
    () =>
        String(props.description || '').trim() ||
        "The tours featured throughout our website are intended to give you ideas for what's possible when you travel with us. Treat them simply as inspiration, because your trip will be created individually by one of our specialists to match your tastes and budget."
)

const normalizedImages = computed(() => {
    const images = props.heroImages.filter(Boolean)
    return images.length ? images : [defaultHeroImage]
})
const hasMultipleHeroes = computed(() => normalizedImages.value.length > 1)
const trackStyle = computed(() => ({
    transform: `translate3d(-${activeHeroIndex.value * 100}%, 0, 0)`
}))

function stopHeroAutoplay() {
    if (heroTimer) {
        window.clearInterval(heroTimer)
        heroTimer = null
    }
}

function setActiveHero(index) {
    const total = normalizedImages.value.length

    if (!total) {
        activeHeroIndex.value = 0
        return
    }

    activeHeroIndex.value = (index + total) % total
}

function startHeroAutoplay() {
    stopHeroAutoplay()

    if (!hasMultipleHeroes.value) {
        return
    }

    heroTimer = window.setInterval(() => {
        setActiveHero(activeHeroIndex.value + 1)
    }, AUTOPLAY_INTERVAL)
}

function onPointerStart(event) {
    pointerStartX.value = event.clientX
    stopHeroAutoplay()
}

function onPointerEnd(event) {
    if (pointerStartX.value === null) {
        return
    }

    const deltaX = event.clientX - pointerStartX.value
    pointerStartX.value = null

    if (Math.abs(deltaX) < SWIPE_THRESHOLD) {
        startHeroAutoplay()
        return
    }

    setActiveHero(activeHeroIndex.value + (deltaX > 0 ? -1 : 1))
    startHeroAutoplay()
}

function onPointerCancel() {
    pointerStartX.value = null
    startHeroAutoplay()
}

watch(
    normalizedImages,
    images => {
        if (!images.length) {
            activeHeroIndex.value = 0
            stopHeroAutoplay()
            return
        }

        activeHeroIndex.value = Math.min(activeHeroIndex.value, images.length - 1)
        startHeroAutoplay()
    },
    { immediate: true }
)

onBeforeUnmount(() => {
    stopHeroAutoplay()
})
</script>

<template>
    <section class="hero-section">
        <div v-if="normalizedNoticeText" class="notice-bar" aria-label="Website announcements">
            <div class="notice-label">NOTICE</div>
            <div class="notice-marquee">
                <div class="notice-track">
                    <span class="notice-text">{{ normalizedNoticeText }}</span>
                    <span class="notice-text" aria-hidden="true">{{ normalizedNoticeText }}</span>
                </div>
            </div>
        </div>
        <div class="banner-box" @pointerdown="onPointerStart" @pointerup="onPointerEnd" @pointercancel="onPointerCancel" @pointerleave="onPointerCancel" @mouseenter="stopHeroAutoplay" @mouseleave="startHeroAutoplay">
            <div class="banner-track" :style="trackStyle">
                <div v-for="(image, index) in normalizedImages" :key="`${image}-${index}`" class="banner-slide" :aria-hidden="activeHeroIndex !== index">
                    <img :src="image" :alt="`Home hero banner ${index + 1}`" class="banner-img" />
                </div>
            </div>

            <div v-if="hasMultipleHeroes" class="banner-dots">
                <button v-for="(image, index) in normalizedImages" :key="`dot-${image}-${index}`" type="button" class="banner-dot" :class="{ active: activeHeroIndex === index }" :aria-label="`Go to banner ${index + 1}`" @click="setActiveHero(index)"></button>
            </div>
        </div>
        <div class="hero-content">
            <h1 class="hero-title" v-html="normalizedTitle"></h1>
            <div class="hero-desc" v-html="normalizedDescription"></div>
        </div>
    </section>
</template>

<style scoped>
.hero-section {
    background-color: #1d58a7;
    width: 100%;
}

.notice-bar {
    display: flex;
    align-items: center;
    gap: 0.18rem;
    padding: 0.22rem 0.28rem;
    background: linear-gradient(90deg, #0f3972 0%, #154c92 100%);
    border-bottom: 1px solid rgba(255, 255, 255, 0.14);
}

.notice-label {
    flex: 0 0 auto;
    padding: 0.08rem 0.18rem;
    border-radius: 999px;
    background: #ffc600;
    color: #12386d;
    font-size: 0.22rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
}

.notice-marquee {
    position: relative;
    flex: 1;
    overflow: hidden;
    mask-image: linear-gradient(90deg, transparent 0, #000 6%, #000 94%, transparent 100%);
}

.notice-track {
    display: flex;
    width: max-content;
    min-width: 100%;
    align-items: center;
    gap: 0.48rem;
    animation: notice-scroll 18s linear infinite;
}

.notice-text {
    flex: 0 0 auto;
    font-size: 0.26rem;
    line-height: 1.5;
    color: rgba(255, 255, 255, 0.92);
    white-space: nowrap;
}

.banner-box {
    position: relative;
    width: 100%;
    height: 5.4rem;
    overflow: hidden;
    touch-action: pan-y;
    user-select: none;
}

.banner-track {
    display: flex;
    width: 100%;
    height: 100%;
    transition: transform 0.45s ease;
    will-change: transform;
}

.banner-slide {
    flex: 0 0 100%;
    min-width: 0;
}

.banner-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}

.banner-dots {
    position: absolute;
    left: 50%;
    bottom: 0.24rem;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 0.12rem;
    z-index: 2;
}

.banner-dot {
    width: 0.14rem;
    height: 0.14rem;
    border: 0;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.45);
    padding: 0;
}

.banner-dot.active {
    width: 0.38rem;
    background: #ffffff;
}

.hero-content {
    padding: 0.6rem 0.4rem 0.6rem;
    text-align: left;
}

.hero-title {
    font-size: 0.8rem;
    font-weight: 700;
    color: #ffffff;
    line-height: 1.1;
    margin-bottom: 0.2rem;
    letter-spacing: -0.02em;
    text-transform: uppercase;
}

.hero-title :deep(.highlight-yellow) {
    color: #ffc600;
}

.hero-desc {
    font-family: 'PingFang SC', sans-serif;
    font-size: 0.44rem;
    font-weight: 500;
    line-height: 0.8rem;
    letter-spacing: 0;
    text-align: center;
    color: rgba(255, 255, 255, 0.85);
    margin: 0 auto;
    max-width: 90%;
}

.hero-desc :deep(p) {
    margin: 0;
}

@keyframes notice-scroll {
    from {
        transform: translate3d(0, 0, 0);
    }

    to {
        transform: translate3d(calc(-50% - 0.24rem), 0, 0);
    }
}

:global(body.desktop-mobile-frame .notice-bar) {
    width: 100%;
    padding: 10px 16px;
    box-sizing: border-box;
}

:global(body.desktop-mobile-frame .banner-box) {
    width: min(100%, 1040px);
    height: clamp(360px, 38vh, 460px);
    margin: 0 auto;
}

:global(body.desktop-mobile-frame .hero-content) {
    width: min(100%, 920px);
    margin: 0 auto;
    padding: 48px 32px 56px;
}

:global(body.desktop-mobile-frame .hero-title) {
    font-size: 42px;
    line-height: 1.08;
}

:global(body.desktop-mobile-frame .hero-desc) {
    max-width: 760px;
    font-size: 22px;
    line-height: 1.55;
}

:global(body.desktop-home-page .hero-section) {
    width: var(--desktop-content-width);
    margin: 30px 0 0 var(--desktop-content-left-gap);
    background: #1f63b9;
    border-radius: 18px 18px 0 0;
    overflow: hidden;
}

:global(body.desktop-home-page .notice-bar) {
    display: none;
}

:global(body.desktop-home-page .banner-box) {
    width: var(--desktop-content-width);
    height: clamp(280px, 28vw, 400px);
    margin: 0;
    border-radius: 18px 18px 0 0;
}

:global(body.desktop-home-page .banner-img) {
    object-fit: cover;
    object-position: center 43%;
}

:global(body.desktop-home-page .banner-dots) {
    display: none;
}

:global(body.desktop-home-page .hero-content) {
    width: var(--desktop-content-width);
    margin: 0;
    padding: clamp(20px, 2vw, 30px) clamp(26px, 2.6vw, 42px) clamp(22px, 2.2vw, 34px);
    box-sizing: border-box;
}

:global(body.desktop-home-page .hero-title) {
    margin: 0 0 clamp(14px, 1.3vw, 20px);
    color: #ffffff;
    font-size: clamp(30px, 3vw, 44px);
    line-height: 1.12;
    font-weight: 500;
    letter-spacing: -0.02em;
}

:global(body.desktop-home-page .hero-title .highlight-yellow) {
    color: #ffcf00;
}

:global(body.desktop-home-page .hero-desc) {
    max-width: none;
    margin: 0;
    color: rgba(255, 255, 255, 0.78);
    text-align: left;
    font-size: clamp(10px, 1vw, 14px);
    line-height: 1.8;
    font-weight: 400;
}

</style>
