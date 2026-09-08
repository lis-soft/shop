<script setup>
defineProps({
    usefulLinks: {
        type: Array,
        default: () => []
    },
    capabilities: {
        type: Array,
        default: () => []
    },
    socialLinks: {
        type: Array,
        default: () => []
    },
    copyrightText: {
        type: String,
        default: ''
    }
})

const emit = defineEmits(['navigate'])
</script>

<template>
    <footer class="landing-footer">
        <div class="footer-column">
            <h3>Useful</h3>
            <button
                v-for="item in usefulLinks"
                :key="`${item.label}-${item.link}`"
                type="button"
                class="footer-link"
                @click="emit('navigate', item)"
            >
                {{ item.label }}
            </button>
        </div>

        <div class="footer-column">
            <h3>Capabilities</h3>
            <p v-for="item in capabilities" :key="item">{{ item }}</p>
        </div>

        <div v-if="copyrightText" class="footer-bottom">
            {{ copyrightText }}
        </div>
    </footer>
</template>

<style scoped>
.landing-footer {
    position: relative;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 36px;
    padding: 60px 70px 88px;
    background: #eef0f4;
    border-top: 1px solid rgba(15, 23, 42, 0.08);
}

.footer-column h3 {
    margin: 0 0 20px;
    color: #000000;
    font-size: 24px;
    text-transform: uppercase;
}

.footer-link,
.footer-column p {
    display: block;
    margin: 0 0 14px;
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--landing-body);
    cursor: pointer;
    font: inherit;
    font-size: 19px;
    text-align: left;
}

.footer-bottom {
    grid-column: 1 / -1;
    padding-top: 6px;
    color: #64748b;
    font-size: 14px;
    border-top: 1px solid rgba(15, 23, 42, 0.08);
}

@media (max-width: 1200px) {
    .landing-footer {
        padding-left: 40px;
        padding-right: 40px;
    }
}

@media (max-width: 960px) {
    .landing-footer {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 640px) {
    .landing-footer {
        padding-left: 20px;
        padding-right: 20px;
    }

    .footer-link,
    .footer-column p {
        font-size: 16px;
    }
}
</style>
