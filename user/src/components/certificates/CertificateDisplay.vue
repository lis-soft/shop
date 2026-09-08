<script setup>
import { computed } from 'vue'

const props = defineProps({
    title: {
        type: String,
        default: 'Certificates'
    },
    titleAlign: {
        type: String,
        default: 'center'
    },
    titleMarginTop: {
        type: Number,
        default: 0
    },
    imageSrc: {
        type: String,
        required: true
    }
})

const titleStyle = computed(() => {
    const allowedAlignments = ['left', 'center', 'right']
    const normalizedAlign = allowedAlignments.includes(props.titleAlign) ? props.titleAlign : 'center'
    const normalizedMarginTop = Number.isFinite(props.titleMarginTop) ? Math.max(0, props.titleMarginTop) : 0

    return {
        textAlign: normalizedAlign,
        marginTop: `${normalizedMarginTop}rem`
    }
})
</script>

<template>
    <main class="content-area">
        <h1 class="page-title" :style="titleStyle">{{ title }}</h1>

        <div class="certificate-card">
            <img :src="imageSrc" alt="ACRA Business Profile" class="cert-image" />
        </div>
    </main>
</template>

<style scoped>
.content-area {
    padding: 0 0.4rem 0.4rem;
}

.page-title {
    font-size: 0.48rem;
    font-weight: 700;
    color: #000000;
    margin: 0 0 0.56rem;
    text-align: center;
}

.certificate-card {
    background: #ffffff;
    overflow: hidden;
    margin-bottom: 0.4rem;
}

.cert-image {
    width: 100%;
    height: auto;
    display: block;
}
</style>
