<script setup>
defineProps({
    navItems: {
        type: Array,
        default: () => []
    },
    logoSrc: {
        type: String,
        default: '/logo.png'
    }
})

const emit = defineEmits(['navigate'])

function handleNavigate(item) {
    emit('navigate', item)
}
</script>

<template>
    <header class="landing-header">
        <button type="button" class="brand-mark" @click="handleNavigate({ link: '/' })">
            <img :src="logoSrc" alt="Audle" />
        </button>

        <nav v-if="navItems.length" class="landing-nav" aria-label="Landing navigation">
            <button v-for="item in navItems" :key="`${item.label}-${item.link}`" type="button" class="landing-nav__link" @click="handleNavigate(item)">
                {{ item.label }}
            </button>
        </nav>
    </header>
</template>

<style scoped>
.landing-header {
    position: sticky;
    top: 0;
    z-index: 40;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    padding: 18px 32px;
    backdrop-filter: blur(18px);
    background: rgba(255, 255, 255, 0.9);
    border-bottom: 1px solid rgba(15, 23, 42, 0.08);
}

.brand-mark {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 58px;
    height: 58px;
    padding: 0;
    border: 0;
    background: transparent;
    cursor: pointer;
}

.brand-mark img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
}

.landing-nav {
    display: flex;
    align-items: center;
    gap: 14px;
    flex-wrap: wrap;
    justify-content: flex-end;
}

.landing-nav__link {
    padding: 10px 16px;
    border: 0;
    border-radius: 999px;
    background: transparent;
    color: #0f172a;
    cursor: pointer;
    font: inherit;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    transition:
        background-color 0.2s ease,
        color 0.2s ease;
}

.landing-nav__link:hover {
    background: #0f172a;
    color: #ffffff;
}

@media (max-width: 640px) {
    .landing-header {
        flex-direction: column;
        align-items: stretch;
        padding: 14px 16px;
    }

    .landing-nav {
        justify-content: flex-start;
        gap: 10px;
    }

    .landing-nav__link {
        padding: 8px 12px;
        font-size: 12px;
    }
}
</style>
