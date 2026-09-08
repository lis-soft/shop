<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import defaultStoryImage from '@/assets/static/img/home/image 102.png'

const AUTOPLAY_INTERVAL = 4000
const SWIPE_THRESHOLD = 36

const props = defineProps({
    storyImages: {
        type: Array,
        default: () => []
    },
    title: {
        type: String,
        default: ''
    },
    buttonText: {
        type: String,
        default: ''
    }
})

const activeStoryIndex = ref(0)
const pointerStartX = ref(null)
let storyTimer = null

const normalizedTitle = computed(() => String(props.title || '').trim() || 'SUCCESS STORIES')
const normalizedButtonText = computed(() => String(props.buttonText || '').trim() || 'VIEW ALL')

const normalizedImages = computed(() => {
    const images = props.storyImages.filter(Boolean)
    return images.length ? images : [defaultStoryImage]
})
const hasMultipleStories = computed(() => normalizedImages.value.length > 1)
const trackStyle = computed(() => ({
    transform: `translate3d(-${activeStoryIndex.value * 100}%, 0, 0)`
}))

function stopStoryAutoplay() {
    if (storyTimer) {
        window.clearInterval(storyTimer)
        storyTimer = null
    }
}

function setActiveStory(index) {
    const total = normalizedImages.value.length

    if (!total) {
        activeStoryIndex.value = 0
        return
    }

    activeStoryIndex.value = (index + total) % total
}

function startStoryAutoplay() {
    stopStoryAutoplay()

    if (!hasMultipleStories.value) {
        return
    }

    storyTimer = window.setInterval(() => {
        setActiveStory(activeStoryIndex.value + 1)
    }, AUTOPLAY_INTERVAL)
}

function showPreviousStory() {
    setActiveStory(activeStoryIndex.value - 1)
    startStoryAutoplay()
}

function showNextStory() {
    setActiveStory(activeStoryIndex.value + 1)
    startStoryAutoplay()
}

function onPointerStart(event) {
    pointerStartX.value = event.clientX
    stopStoryAutoplay()
}

function onPointerEnd(event) {
    if (pointerStartX.value === null) {
        return
    }

    const deltaX = event.clientX - pointerStartX.value
    pointerStartX.value = null

    if (Math.abs(deltaX) < SWIPE_THRESHOLD) {
        startStoryAutoplay()
        return
    }

    if (deltaX > 0) {
        showPreviousStory()
        return
    }

    showNextStory()
}

function onPointerCancel() {
    pointerStartX.value = null
    startStoryAutoplay()
}

watch(
    normalizedImages,
    images => {
        if (!images.length) {
            activeStoryIndex.value = 0
            stopStoryAutoplay()
            return
        }

        activeStoryIndex.value = Math.min(activeStoryIndex.value, images.length - 1)
        startStoryAutoplay()
    },
    { immediate: true }
)

onBeforeUnmount(() => {
    stopStoryAutoplay()
})
</script>

<template>
    <section class="stories-section">
        <div class="stories-inner">
            <h2 class="section-title">{{ normalizedTitle }}</h2>

            <div class="stories-stage" @pointerdown="onPointerStart" @pointerup="onPointerEnd" @pointercancel="onPointerCancel" @pointerleave="onPointerCancel" @mouseenter="stopStoryAutoplay" @mouseleave="startStoryAutoplay">
                <div class="stories-track" :style="trackStyle">
                    <article v-for="(image, index) in normalizedImages" :key="`${image}-${index}`" class="story-slide" :aria-hidden="activeStoryIndex !== index">
                        <div class="story-frame">
                            <img :src="image" :alt="`Story ${index + 1}`" class="story-main-img" />
                        </div>
                    </article>
                </div>
            </div>

            <div class="desktop-stories-grid" aria-label="Desktop success stories">
                <article v-for="(image, index) in normalizedImages.slice(0, 3)" :key="`desktop-${image}-${index}`" class="desktop-story-card">
                    <img :src="image" :alt="`Story ${index + 1}`" class="desktop-story-img" />
                </article>
            </div>

            <div class="stories-footer">
                <button class="view-all-btn" type="button">
                    {{ normalizedButtonText }}
                    <img src="@/assets/static/img/home/view-all.png" alt="" class="view-all-icon" />
                </button>

                <div class="stories-nav-group">
                    <button class="story-nav" type="button" aria-label="Previous story" :disabled="!hasMultipleStories" @click="showPreviousStory">
                        <img src="@/assets/static/img/home/Union.png" alt="" class="nav-icon" />
                    </button>

                    <button class="story-nav" type="button" aria-label="Next story" :disabled="!hasMultipleStories" @click="showNextStory">
                        <img src="@/assets/static/img/home/Union(1).png" alt="" class="nav-icon" />
                    </button>
                </div>
            </div>
        </div>
    </section>
</template>

<style scoped>
.stories-section {
    width: 100%;
    padding: 0.58rem 0.32rem 0.7rem;
    background: #068b2f;
    box-sizing: border-box;
}

.stories-inner {
    width: 100%;
    max-width: 100%;
}

.section-title {
    margin: 0;
    color: #ffffff;
    text-align: center;
    font-size: 0.72rem;
    line-height: 1.08;
    font-weight: 500;
    letter-spacing: 0.02em;
    margin-bottom: 0.28rem;
}

.stories-stage {
    position: relative;
    width: 100%;
    height: 8.8rem;
    overflow: hidden;
    background: #068b2f;
    touch-action: pan-y;
    user-select: none;
}

.stories-track {
    display: flex;
    height: 100%;
    transition: transform 0.45s ease;
    will-change: transform;
}

.story-slide {
    flex: 0 0 100%;
    min-width: 0;
}

.story-frame {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background: #068b2f;
}

.story-main-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    display: block;
}


.desktop-stories-grid {
    display: none;
}

.story-overlay {
    position: absolute;
    inset: auto 0 0;
    padding: 1.35rem 0.26rem 0.2rem;
    background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.82) 72%);
    color: #ffffff;
    text-align: left;
}

.story-metric {
    font-size: 0.76rem;
    line-height: 1;
    font-weight: 700;
    margin-bottom: 0.12rem;
}

.story-copy {
    font-size: 0.26rem;
    line-height: 1.2;
    font-weight: 600;
    margin-bottom: 0.28rem;
}

.read-more-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.12rem;
    border: 0;
    padding: 0;
    background: transparent;
    color: #ffffff;
    font-size: 0.24rem;
    font-weight: 700;
    letter-spacing: 0.01em;
    cursor: pointer;
}

.read-more-arrow {
    font-size: 0.28rem;
    line-height: 1;
}

.stories-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.24rem;
    margin-top: 0.4rem;
}

.view-all-btn {
    height: 0.72rem;
    min-width: 1.86rem;
    padding: 0 0.34rem;
    border: 1px solid rgba(255, 255, 255, 0.92);
    border-radius: 0.24rem;
    background: transparent;
    color: #ffffff;
    font-size: 0.28rem;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.14rem;
    cursor: pointer;
}

.view-all-icon {
    width: 0.14rem;
    height: 0.2rem;
    object-fit: contain;
}

.stories-nav-group {
    display: flex;
    align-items: center;
    gap: 0.3rem;
}

.story-nav {
    width: 0.72rem;
    height: 0.72rem;
    border: 0;
    border-radius: 999px;
    background: #d8d8d8;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
}

.story-nav:disabled {
    opacity: 0.45;
    cursor: not-allowed;
}

.nav-icon {
    width: 0.18rem;
    height: 0.24rem;
    object-fit: contain;
}

@media (max-width: 480px) {
    .stories-section {
        padding-left: 0.24rem;
        padding-right: 0.24rem;
    }

    .section-title {
        font-size: 0.68rem;
    }

    .stories-stage {
        height: 8.2rem;
    }

    .story-nav {
        width: 0.72rem;
        height: 0.72rem;
    }
}

:global(body.desktop-mobile-frame .stories-section) {
    padding: 64px max(32px, calc((100vw - 1040px) / 2)) 76px;
}

:global(body.desktop-mobile-frame .stories-inner) {
    max-width: 1040px;
    margin: 0 auto;
}

:global(body.desktop-mobile-frame .section-title) {
    font-size: 40px;
    margin-bottom: 32px;
}

:global(body.desktop-mobile-frame .stories-stage) {
    height: clamp(460px, 54vh, 620px);
    border-radius: 18px;
}

:global(body.desktop-mobile-frame .story-main-img) {
    object-fit: cover;
}

:global(body.desktop-mobile-frame .stories-footer) {
    margin-top: 32px;
}

:global(body.desktop-home-page .stories-section) {
    width: var(--desktop-content-width);
    margin: 0 0 0 var(--desktop-content-left-gap);
    padding: clamp(24px, 2.4vw, 36px) clamp(24px, 2.4vw, 38px) clamp(30px, 3vw, 48px);
    background: #078c31;
    box-sizing: border-box;
}

:global(body.desktop-home-page .stories-inner) {
    width: 100%;
    max-width: none;
    margin: 0;
}

:global(body.desktop-home-page .section-title) {
    margin: 0 0 clamp(18px, 1.8vw, 28px);
    color: #ffffff;
    text-align: left;
    font-size: clamp(30px, 3vw, 44px);
    line-height: 1.18;
    font-weight: 500;
    letter-spacing: 0;
}

:global(body.desktop-home-page .stories-stage) {
    width: 100%;
    height: 205px;
    border-radius: 5px;
    background: #078c31;
}

:global(body.desktop-home-page .story-main-img) {
    object-fit: cover;
    object-position: center;
}

:global(body.desktop-home-page .stories-footer) {
    display: none;
}


:global(body.desktop-home-page .stories-stage) {
    display: none;
}

:global(body.desktop-home-page .desktop-stories-grid) {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: clamp(20px, 2vw, 32px);
    width: 100%;
}

:global(body.desktop-home-page .desktop-story-card) {
    overflow: hidden;
    aspect-ratio: 1 / 1.06;
    border-radius: 8px;
    background: rgba(0, 0, 0, 0.12);
}

:global(body.desktop-home-page .desktop-story-img) {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
}

</style>
