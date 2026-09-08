<script setup>
defineProps({
    label: {
        type: String,
        required: true
    },
    modelValue: {
        type: String,
        default: ''
    },
    type: {
        type: String,
        default: 'text'
    },
    placeholder: {
        type: String,
        default: 'Type Here'
    },
    inputClass: {
        type: String,
        default: 'auth-input'
    },
    inputMode: {
        type: String,
        default: ''
    },
    maxLength: {
        type: [String, Number],
        default: undefined
    },
    showRefreshIcon: {
        type: Boolean,
        default: false
    },
    showToggle: {
        type: Boolean,
        default: false
    },
    isVisible: {
        type: Boolean,
        default: false
    }
})

defineEmits(['update:modelValue', 'toggle', 'enter'])
</script>

<template>
    <div class="form-group">
        <label class="input-label">{{ label }}</label>
        <div class="input-wrapper">
            <input
                :type="showToggle ? (isVisible ? 'text' : type) : type"
                :value="modelValue"
                :placeholder="placeholder"
                :class="inputClass"
                :inputmode="inputMode || undefined"
                :maxlength="maxLength"
                @input="$emit('update:modelValue', $event.target.value)"
                @keyup.enter="$emit('enter')"
            />
            <i v-if="showRefreshIcon" class="refresh-icon"></i>
            <button v-if="showToggle" type="button" class="eye-btn" @click="$emit('toggle')">
                <i class="eye-icon" :class="{ active: isVisible }"></i>
            </button>
        </div>
    </div>
</template>

<style scoped>
.form-group {
    margin-bottom: 0.44rem;
}

.input-label {
    display: block;
    font-size: 0.34rem;
    color: #333333;
    margin-bottom: 0.2rem;
    font-weight: 500;
    padding-left: 0.1rem;
}

.input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
}

.auth-input {
    width: 100%;
    height: 1.04rem;
    border: 1px solid #d9d9d9;
    border-radius: 0.16rem;
    padding: 0 0.34rem;
    font-size: 0.3rem;
    color: #333;
    outline: none;
    box-sizing: border-box;
}

.auth-input::placeholder {
    color: #cccccc;
}

.refresh-icon {
    position: absolute;
    right: 0.3rem;
    width: 0.44rem;
    height: 0.44rem;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2330946b'%3E%3Cpath d='M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z'/%3E%3C/svg%3E");
    background-size: contain;
    background-repeat: no-repeat;
    opacity: 0.5;
}

.eye-btn {
    position: absolute;
    right: 0.34rem;
    width: 0.48rem;
    height: 0.48rem;
    border: none;
    background: transparent;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
}

.eye-icon {
    display: inline-block;
    width: 100%;
    height: 100%;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23d9d9d9'%3E%3Cpath d='M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z'/%3E%3C/svg%3E");
    background-size: contain;
    background-repeat: no-repeat;
}

.eye-icon.active {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23245fa8'%3E%3Cpath d='M12 6a9.77 9.77 0 0 1 8.82 5.5A9.77 9.77 0 0 1 12 17a9.77 9.77 0 0 1-8.82-5.5A9.77 9.77 0 0 1 12 6m0-2C7 4 2.73 7.11 1 11.5 2.73 15.89 7 19 12 19s9.27-3.11 11-7.5C21.27 7.11 17 4 12 4zm0 5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5z'/%3E%3C/svg%3E");
}
</style>
