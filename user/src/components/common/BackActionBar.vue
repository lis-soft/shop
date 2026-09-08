<script setup>
defineEmits(['back'])
</script>

<template>
    <div class="top-action">
        <div class="back-btn" @click="$emit('back')">
            <i class="arrow-icon"></i>
        </div>
    </div>
</template>

<style scoped>
.top-action {
    display: flex;
    justify-content: flex-end;
    padding: 0.3rem 0.4rem;
}

.back-btn {
    width: 0.88rem;
    height: 0.88rem;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
}

.arrow-icon {
    display: inline-block;
    width: 0.6rem;
    height: 0.6rem;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%231d58a7' viewBox='0 0 24 24'%3E%3Cpath d='M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z'/%3E%3C/svg%3E");
    background-size: contain;
    background-repeat: no-repeat;
}
</style>
