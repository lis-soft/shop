<script setup>
defineProps({
    text: {
        type: String,
        default: ''
    }
})
</script>

<template>
    <section class="testimonial-section">
        <div class="testimonial-card">
            <div class="quote-icon top">
                <img src="@/assets/static/img/home/icon_8.png" alt="quote" class="quote-img" />
            </div>
            <div class="testimonial-text" v-html="text || 'It took Construct just 2 weeks to rank our keyword on the top spot; and just under3 months to get us a positive return on investment. These folks are on a different level when it comes to SEO!'"></div>
            <div class="quote-icon bottom">
                <img src="@/assets/static/img/home/icon_7.png" alt="quote" class="quote-img" />
            </div>
        </div>
    </section>
</template>

<style scoped>
.testimonial-section {
    background-color: #f6f6f6;
    padding: 0.4rem 0.2rem 1.8rem;
    width: 100%;
}

.testimonial-card {
    background-color: #f6f6f6;
    padding: 0.4rem 0.6rem 0.8rem;
    position: relative;
    width: 100%;
    box-sizing: border-box;
}

.quote-icon {
    position: absolute;
}

.quote-img {
    width: 0.44rem;
    height: auto;
}

.quote-icon.top {
    top: 0.2rem;
    left: 0.2rem;
}

.quote-icon.bottom {
    bottom: 0.2rem;
    right: 0.2rem;
}

.testimonial-text {
    font-family: 'PingFang SC', sans-serif;
    font-size: 0.44rem;
    line-height: 0.72rem;
    color: #0f0f0f;
    text-align: left;
    margin: 0.4rem 0.2rem 0 0.4rem;
    font-weight: 400;
    width: 100%;
    max-width: 100%;
}

.testimonial-text :deep(p) {
    margin: 0;
}

:global(body.desktop-mobile-frame .testimonial-section) {
    padding: 56px max(40px, calc((100vw - 1040px) / 2)) 96px;
}

:global(body.desktop-mobile-frame .testimonial-card) {
    max-width: 1040px;
    margin: 0 auto;
    padding: 44px 72px 56px;
}

:global(body.desktop-mobile-frame .testimonial-text) {
    max-width: 820px;
    margin: 0 auto;
    font-size: 22px;
    line-height: 1.65;
}

:global(body.desktop-mobile-frame .quote-img) {
    width: 28px;
}

:global(body.desktop-home-page .testimonial-section) {
    width: var(--desktop-content-width);
    margin: 0 0 clamp(32px, 3vw, 48px) var(--desktop-content-left-gap);
    padding: 0 clamp(36px, 3.4vw, 56px) 0;
    background: #ffffff;
    box-sizing: border-box;
}

:global(body.desktop-home-page .testimonial-card) {
    max-width: none;
    margin: 0;
    min-height: clamp(176px, 17vw, 248px);
    padding: clamp(44px, 4.2vw, 68px) clamp(64px, 6vw, 96px) clamp(30px, 3vw, 48px) clamp(68px, 6.2vw, 104px);
    background: #f6f6f6;
    box-sizing: border-box;
}

:global(body.desktop-home-page .testimonial-text) {
    max-width: none;
    margin: 0;
    color: #202020;
    font-size: clamp(18px, 1.7vw, 26px);
    line-height: 1.72;
    font-weight: 400;
}

:global(body.desktop-home-page .quote-img) {
    width: clamp(22px, 2vw, 32px);
}

:global(body.desktop-home-page .quote-icon.top) {
    top: clamp(30px, 3vw, 48px);
    left: clamp(42px, 4vw, 66px);
}

:global(body.desktop-home-page .quote-icon.bottom) {
    right: clamp(44px, 4vw, 68px);
    bottom: clamp(14px, 1.6vw, 26px);
}

</style>
