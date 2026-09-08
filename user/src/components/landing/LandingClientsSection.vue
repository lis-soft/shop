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
    logos: {
        type: Array,
        default: () => []
    }
})
</script>

<template>
    <section id="clients" class="clients-section">
        <div class="clients-heading">
            <p class="section-tag">Clients</p>
            <h2>{{ title }}</h2>
            <p>{{ description }}</p>
        </div>

        <div class="logo-grid">
            <div
                v-for="(logo, index) in logos"
                :key="`${logo}-${index}`"
                class="logo-card"
            >
                <img :src="logo" :alt="`client-logo-${index + 1}`" />
            </div>
        </div>
    </section>
</template>

<style scoped>
.clients-section {
    position: relative;
    padding: 92px 70px 104px;
    background: #ffffff;
}

.clients-heading {
    text-align: center;
}

.section-tag {
    margin: 0 0 16px;
    color: rgba(15, 23, 42, 0.6);
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
}

.clients-heading h2 {
    margin: 0;
    font-family: var(--landing-headline-font);
    font-size: clamp(56px, 6vw, 92px);
    line-height: 0.95;
    letter-spacing: 0.02em;
    text-transform: uppercase;
}

.clients-heading p:last-child {
    max-width: 780px;
    margin: 18px auto 0;
    color: var(--landing-body);
    font-size: 20px;
}

.logo-grid {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 30px 24px;
    margin-top: 56px;
}

.logo-card {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 180px;
    padding: 18px;
    border-radius: 24px;
    background: linear-gradient(180deg, #ffffff, #f4f5f8);
    box-shadow: inset 0 0 0 1px #edf1f6;
}

.logo-card img {
    max-width: 78%;
    max-height: 92px;
    object-fit: contain;
}

@media (max-width: 1200px) {
    .clients-section {
        padding-left: 40px;
        padding-right: 40px;
    }

    .logo-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
    }
}

@media (max-width: 640px) {
    .clients-section {
        padding-left: 20px;
        padding-right: 20px;
    }

    .clients-heading p:last-child {
        font-size: 16px;
    }

    .logo-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 18px;
    }

    .logo-card {
        min-height: 120px;
    }
}
</style>
