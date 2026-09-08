<script setup>
defineProps({
    title: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        default: ''
    },
    logos: {
        type: Array,
        default: () => []
    }
})
</script>

<template>
    <section class="clients-section">
        <div class="clients-content">
            <h2 class="clients-title">{{ title || 'Our Clients' }}</h2>
            <p class="clients-desc">{{ description || 'Maximising brand health and business outcomes for leading brands' }}</p>

            <div v-if="logos.length" class="clients-grid">
                <div v-for="(logo, index) in logos" :key="`${logo}-${index}`" class="client-logo-item">
                    <img :src="logo" :alt="`Client ${index + 1}`" />
                </div>
            </div>

            <div v-else class="clients-grid">
                <div class="client-logo-item"><img src="@/assets/static/img/home/image 103.png" alt="Client 1" /></div>
                <div class="client-logo-item"><img src="@/assets/static/img/home/image 104.png" alt="Client 2" /></div>
                <div class="client-logo-item"><img src="@/assets/static/img/home/image 111.png" alt="Client 3" /></div>
                <div class="client-logo-item"><img src="@/assets/static/img/home/image 105.png" alt="Client 4" /></div>
                <div class="client-logo-item"><img src="@/assets/static/img/home/image 106.png" alt="Client 5" /></div>
                <div class="client-logo-item"><img src="@/assets/static/img/home/image 110.png" alt="Client 6" /></div>
                <div class="client-logo-item"><img src="@/assets/static/img/home/image 113.png" alt="Client 7" /></div>
                <div class="client-logo-item"><img src="@/assets/static/img/home/image 107.png" alt="Client 8" /></div>
                <div class="client-logo-item"><img src="@/assets/static/img/home/image 108.png" alt="Client 9" /></div>
                <div class="client-logo-item"><img src="@/assets/static/img/home/image 109.png" alt="Client 10" /></div>
                <div class="client-logo-item"><img src="@/assets/static/img/home/image 114.png" alt="Client 11" /></div>
                <div class="client-logo-item"><img src="@/assets/static/img/home/image 115.png" alt="Client 12" /></div>
            </div>
        </div>
    </section>
</template>

<style scoped>
.clients-section {
    background-color: #ffffff;
    padding: 0.8rem 0.6rem 1rem;
    width: 100%;
}

.clients-content {
    max-width: 100%;
    margin: 0 auto;
    padding-top: 0;
}

.clients-title {
    font-family: 'PingFang SC', sans-serif;
    font-size: 1rem;
    font-weight: 400;
    line-height: 1.22rem;
    color: #0a0a0a;
    margin-top: 0;
    margin-bottom: 0.2rem;
    text-align: left;
    letter-spacing: 0;
}

.clients-desc {
    font-family: 'PingFang SC', sans-serif;
    font-size: 0.44rem;
    font-weight: 400;
    line-height: 0.8rem;
    color: #5d5d5d;
    margin-bottom: 1rem;
    text-align: left;
    max-width: 100%;
}

.clients-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.2rem 0.4rem;
    align-items: center;
}

.client-logo-item {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 2.2rem;
}

.client-logo-item img {
    width: 115%;
    height: 115%;
    object-fit: contain;
}

:global(body.desktop-mobile-frame .clients-section) {
    padding: 72px max(40px, calc((100vw - 1040px) / 2)) 88px;
}

:global(body.desktop-mobile-frame .clients-content) {
    max-width: 1040px;
}

:global(body.desktop-mobile-frame .clients-title) {
    font-size: 46px;
    line-height: 1.16;
}

:global(body.desktop-mobile-frame .clients-desc) {
    max-width: 760px;
    margin-bottom: 52px;
    font-size: 22px;
    line-height: 1.55;
}

:global(body.desktop-mobile-frame .clients-grid) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 42px 34px;
}

:global(body.desktop-mobile-frame .client-logo-item) {
    height: 128px;
}

:global(body.desktop-mobile-frame .client-logo-item img) {
    width: 100%;
    height: 100%;
}

:global(body.desktop-home-page .clients-section) {
    width: var(--desktop-content-width);
    margin: 0 0 0 var(--desktop-content-left-gap);
    padding: clamp(42px, 4vw, 64px) clamp(46px, 4.4vw, 72px) clamp(34px, 3.4vw, 56px);
    background: #ffffff;
    box-sizing: border-box;
}

:global(body.desktop-home-page .clients-content) {
    max-width: none;
    margin: 0;
}

:global(body.desktop-home-page .clients-title) {
    margin: 0 0 8px;
    color: #121212;
    font-size: clamp(30px, 3vw, 44px);
    line-height: 1.2;
    font-weight: 400;
}

:global(body.desktop-home-page .clients-desc) {
    max-width: none;
    margin: 0 0 clamp(38px, 3.6vw, 58px);
    color: #6e7075;
    font-size: clamp(10px, 1vw, 14px);
    line-height: 1.5;
}

:global(body.desktop-home-page .clients-grid) {
    grid-template-columns: repeat(6, 1fr);
    gap: clamp(34px, 3.2vw, 52px) clamp(38px, 3.6vw, 60px);
}

:global(body.desktop-home-page .client-logo-item) {
    height: clamp(62px, 6vw, 92px);
}

:global(body.desktop-home-page .client-logo-item img) {
    width: 100%;
    height: 100%;
    object-fit: contain;
}

</style>
