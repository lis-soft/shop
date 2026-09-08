<script setup>
defineProps({
    awardsCount: {
        type: String,
        default: ''
    },
    awardsTitle: {
        type: String,
        default: ''
    },
    awardsContent: {
        type: String,
        default: ''
    },
    awardsList: {
        type: Array,
        default: () => []
    },
    activeIndex: {
        type: Number,
        default: 0
    }
})

defineEmits(['scroll'])
</script>

<template>
    <section class="gray-section">
        <div class="awards-info">
            <div class="awards-count">{{ awardsCount }}</div>
            <h2 class="awards-title" v-html="awardsTitle"></h2>
            <div class="awards-desc" v-html="awardsContent"></div>
        </div>

        <div v-if="awardsList.length" class="awards-carousel" @scroll="$emit('scroll', $event)">
            <div
                v-for="(img, index) in awardsList"
                :key="index"
                class="award-card"
                :class="{ 'is-active': activeIndex === index, 'is-masked': activeIndex !== index }"
            >
                <img :src="img" alt="Award" class="award-img" />
            </div>
        </div>
    </section>
</template>

<style scoped>
.gray-section {
    background-color: #f5f5f5;
    padding: 0.8rem 0.6rem 1rem;
}

.awards-count {
    font-size: 0.48rem;
    font-weight: 700;
    color: #1a1a1a;
    margin-bottom: 0.1rem;
}

.awards-title {
    font-size: 0.44rem;
    font-weight: 700;
    color: #008731;
    line-height: 1.2;
    margin-bottom: 0.4rem;
}

.awards-desc {
    font-size: 0.24rem;
    color: #666666;
    line-height: 1.5;
    margin-bottom: 0.6rem;
}

.awards-desc :deep(p) {
    margin: 0 0 0.2rem;
}

.awards-carousel {
    display: flex;
    gap: 0.3rem;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    margin: 0 -0.6rem;
    padding: 0 0.6rem;
}

.awards-carousel::-webkit-scrollbar {
    display: none;
}

.award-card {
    flex: 0 0 80%;
    border-radius: 0.2rem;
    overflow: hidden;
    scroll-snap-align: center;
    transition: all 0.3s ease;
}

.award-card.is-masked {
    opacity: 0.4;
    transform: scale(0.92);
}

.award-card.is-active {
    opacity: 1;
    transform: scale(1);
}

.award-img {
    width: 100%;
    display: block;
}
</style>
