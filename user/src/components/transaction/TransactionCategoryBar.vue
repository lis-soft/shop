<script setup>
defineProps({
    categoryOptions: {
        type: Array,
        default: () => []
    },
    activeCategory: {
        type: String,
        default: 'all'
    }
})

defineEmits(['change'])
</script>

<template>
    <div class="category-bar">
        <button
            v-for="option in categoryOptions"
            :key="option.key"
            type="button"
            class="category-chip"
            :class="{ active: activeCategory === option.key }"
            @click="$emit('change', option.key)"
        >
            {{ option.label }}
        </button>
    </div>
</template>

<style scoped>
.category-bar {
    display: flex;
    gap: 0.16rem;
    overflow-x: auto;
    padding-bottom: 0.08rem;
    -webkit-overflow-scrolling: touch;
}

.category-bar::-webkit-scrollbar {
    display: none;
}

.category-chip {
    flex: 0 0 auto;
    min-height: 0.68rem;
    padding: 0 0.26rem;
    border: 1px solid #d7dfeb;
    border-radius: 999px;
    background: #ffffff;
    color: #5b6574;
    font-size: 0.24rem;
    font-weight: 600;
}

.category-chip.active {
    border-color: #2b63b0;
    background: #2b63b0;
    color: #ffffff;
}

@media (min-width: 481px) {
    :global(body.desktop-profile-related-page .category-bar) {
        gap: 10px;
        padding: 0 0 4px;
        flex-wrap: wrap;
        overflow: visible;
    }

    :global(body.desktop-profile-related-page .category-chip) {
        min-height: 38px;
        padding: 0 18px;
        font-size: 14px;
    }
}
</style>
