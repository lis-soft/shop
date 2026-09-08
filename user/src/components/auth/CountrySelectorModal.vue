<script setup>
import { computed, nextTick, ref, watch } from 'vue'

const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    },
    countries: {
        type: Array,
        default: () => []
    },
    selectedIso: {
        type: String,
        default: ''
    }
})

const emit = defineEmits(['close', 'select'])

const searchKeyword = ref('')
const searchInput = ref(null)

const filteredCountries = computed(() => {
    const keyword = searchKeyword.value.trim().toLowerCase()

    if (!keyword) {
        return props.countries
    }

    return props.countries.filter(country => {
        return (
            country.name.toLowerCase().includes(keyword) ||
            country.iso.toLowerCase().includes(keyword) ||
            country.dialCode.toLowerCase().includes(keyword)
        )
    })
})

watch(
    () => props.visible,
    async visible => {
        if (!visible) {
            searchKeyword.value = ''
            return
        }

        await nextTick()
        searchInput.value?.focus()
    }
)

const handleSelect = country => {
    emit('select', country)
}
</script>

<template>
    <teleport to="body">
        <div v-if="visible" class="country-modal-backdrop" @click.self="emit('close')">
            <div class="country-modal">
                <div class="country-modal-header">
                    <h2 class="country-modal-title">Select Country</h2>
                    <button type="button" class="country-modal-close" @click="emit('close')">Close</button>
                </div>

                <div class="country-search-shell">
                    <input
                        ref="searchInput"
                        v-model="searchKeyword"
                        type="text"
                        class="country-search-input"
                        placeholder="Search country or code"
                    />
                </div>

                <div class="country-list">
                    <button
                        v-for="country in filteredCountries"
                        :key="country.iso"
                        type="button"
                        class="country-option"
                        :class="{ active: country.iso === selectedIso }"
                        @click="handleSelect(country)"
                    >
                        <span class="country-option-name">{{ country.name }}</span>
                        <span class="country-option-meta">{{ country.dialCode }}</span>
                    </button>

                    <p v-if="!filteredCountries.length" class="country-empty">No matching countries</p>
                </div>
            </div>
        </div>
    </teleport>
</template>

<style scoped>
.country-modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 2200;
    background: rgba(18, 23, 31, 0.46);
    display: flex;
    align-items: flex-end;
    justify-content: center;
    padding: 0 0 0.22rem;
    box-sizing: border-box;
}

.country-modal {
    width: min(100%, 420px);
    max-height: min(78vh, 680px);
    background: #ffffff;
    border-radius: 22px 22px 0 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-shadow: 0 -8px 30px rgba(15, 23, 42, 0.18);
}

.country-modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 18px 14px;
    border-bottom: 1px solid #edf1f4;
}

.country-modal-title {
    margin: 0;
    font-size: 17px;
    line-height: 1.2;
    font-weight: 600;
    color: #1f2937;
}

.country-modal-close {
    border: 0;
    background: transparent;
    padding: 0;
    color: #2a61ad;
    font-size: 13px;
    line-height: 1.2;
}

.country-search-shell {
    padding: 14px 18px 12px;
}

.country-search-input {
    width: 100%;
    height: 40px;
    border: 1px solid #d9dee3;
    border-radius: 10px;
    padding: 0 14px;
    box-sizing: border-box;
    outline: none;
    font-size: 13px;
    color: #1f2937;
    background: #f8fafb;
}

.country-search-input:focus {
    border-color: #2a61ad;
    background: #ffffff;
}

.country-list {
    flex: 1;
    overflow-y: auto;
    padding: 0 10px 14px;
}

.country-option {
    width: 100%;
    border: 0;
    background: transparent;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 13px 12px;
    border-radius: 12px;
    text-align: left;
}

.country-option.active {
    background: #eef5ff;
}

.country-option-name {
    color: #1f2937;
    font-size: 14px;
    line-height: 1.35;
}

.country-option-meta {
    flex-shrink: 0;
    color: #6b7280;
    font-size: 13px;
    line-height: 1.2;
}

.country-empty {
    margin: 26px 0 12px;
    text-align: center;
    color: #8a93a1;
    font-size: 13px;
}
</style>
