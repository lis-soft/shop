<script setup>
defineProps({
    headImage: {
        type: String,
        required: true
    },
    iconImage: {
        type: String,
        required: true
    },
    title: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        default: ''
    },
    buttonText: {
        type: String,
        default: ''
    }
})
</script>

<template>
    <div class="contact-card">
        <div class="header-image">
            <img :src="headImage" alt="Customer Support" class="head-img" />
        </div>

        <h1 class="card-title">{{ title || "Let's Connect" }}</h1>
        <div class="card-desc" v-html="description || 'If you have any inquiries, please contact our customer support team.'"></div>

        <div class="contact-button-box">
            <div class="icon-wrapper">
                <img :src="iconImage" alt="Contact Us" class="contact-icon" />
            </div>
            <span class="btn-text">{{ buttonText || 'Contact Us' }}</span>
        </div>
    </div>
</template>

<style scoped>
.contact-card {
    width: 100%;
    background: #ffffff;
    border-radius: 0.3rem;
    padding: 1.2rem 0.6rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    box-shadow: 0 0.04rem 0.2rem rgba(0, 0, 0, 0.02);
}

.header-image {
    width: 3rem;
    height: 3rem;
    margin-bottom: 0.6rem;
}

.head-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
}

.card-title {
    font-size: 0.48rem;
    font-weight: 600;
    color: #000000;
    margin-bottom: 0.3rem;
}

.card-desc {
    font-size: 0.26rem;
    color: #999999;
    line-height: 1.5;
    margin-bottom: 0.8rem;
}

.card-desc :deep(p) {
    margin: 0;
}

.contact-button-box {
    width: 2.4rem;
    height: 2.4rem;
    background-color: #f5f5f5;
    border-radius: 0.4rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.2rem;
}

.icon-wrapper {
    width: 0.8rem;
    height: 0.8rem;
}

.contact-icon {
    width: 100%;
    height: 100%;
    object-fit: contain;
}

.btn-text {
    font-size: 0.24rem;
    color: #999999;
}
</style>
