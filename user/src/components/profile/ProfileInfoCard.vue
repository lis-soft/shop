<script setup>
defineProps({
    displayName: {
        type: String,
        default: 'Guest'
    },
    displayCountry: {
        type: String,
        default: '--'
    },
    displayPhone: {
        type: String,
        default: '--'
    },
    displayEmail: {
        type: String,
        default: '--'
    }
})
</script>

<template>
    <div class="info-section card">
        <h2 class="section-title">Personal Information</h2>
        <div class="info-item">
            <label>Username</label>
            <div class="value">{{ displayName }}</div>
        </div>
        <div class="info-item">
            <label>Country</label>
            <div class="value">{{ displayCountry }}</div>
        </div>
        <div class="info-item">
            <label>Phone Number</label>
            <div class="value">{{ displayPhone }}</div>
        </div>
        <div class="info-item">
            <label>Email</label>
            <div class="value" :class="{ placeholder: displayEmail === '--' }">{{ displayEmail }}</div>
        </div>
    </div>
</template>

<style scoped>
.card {
    background-color: #ffffff;
    border-radius: 0.2rem;
    margin: 0 0.3rem 0.3rem;
    padding: 0.4rem 0.3rem;
    box-shadow: 0 0.02rem 0.1rem rgba(0, 0, 0, 0.05);
}

.section-title {
    font-size: 0.32rem;
    font-weight: 600;
    color: #333333;
    margin-bottom: 0.4rem;
}

.info-item {
    margin-bottom: 0.3rem;
}

.info-item:last-child {
    margin-bottom: 0;
}

.info-item label {
    display: block;
    font-size: 0.22rem;
    color: #999999;
    margin-bottom: 0.1rem;
}

.value {
    font-size: 0.3rem;
    color: #333333;
    font-weight: 500;
    min-height: 0.4rem;
}

.value.placeholder {
    border-bottom: 1px solid #f0f0f0;
}
</style>
