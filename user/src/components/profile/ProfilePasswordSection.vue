<script setup>
const props = defineProps({
    title: {
        type: String,
        required: true
    },
    currentLabel: {
        type: String,
        required: true
    },
    newLabel: {
        type: String,
        required: true
    },
    confirmLabel: {
        type: String,
        required: true
    },
    forgotText: {
        type: String,
        required: true
    },
    submitText: {
        type: String,
        default: 'SAVE'
    },
    loadingText: {
        type: String,
        default: 'SAVING...'
    },
    isSubmitting: {
        type: Boolean,
        default: false
    },
    form: {
        type: Object,
        default: () => ({
            oldPassword: '',
            newPassword: '',
            confirmPassword: ''
        })
    },
    inputType: {
        type: String,
        default: 'password'
    },
    inputMode: {
        type: String,
        default: ''
    },
    maxLength: {
        type: [Number, String],
        default: undefined
    }
})

const emit = defineEmits(['update:form', 'save'])

const updateField = (field, value) => {
    emit('update:form', {
        ...props.form,
        [field]: value
    })
}
</script>

<template>
    <div class="form-section card">
        <h2 class="section-title">{{ title }}</h2>
        <div class="form-item">
            <label>{{ currentLabel }}</label>
            <input
                :value="form.oldPassword"
                :type="inputType"
                :inputmode="inputMode || undefined"
                :maxlength="maxLength"
                placeholder="Type Here"
                @input="updateField('oldPassword', $event.target.value)"
            />
        </div>
        <div class="form-item">
            <label>{{ newLabel }}</label>
            <input
                :value="form.newPassword"
                :type="inputType"
                :inputmode="inputMode || undefined"
                :maxlength="maxLength"
                placeholder="Type Here"
                @input="updateField('newPassword', $event.target.value)"
            />
        </div>
        <div class="form-item">
            <label>{{ confirmLabel }}</label>
            <input
                :value="form.confirmPassword"
                :type="inputType"
                :inputmode="inputMode || undefined"
                :maxlength="maxLength"
                placeholder="Type Here"
                @input="updateField('confirmPassword', $event.target.value)"
            />
        </div>
        <p class="forgot-text">{{ forgotText }}</p>
        <button class="save-btn" :disabled="isSubmitting" @click="emit('save')">
            {{ isSubmitting ? loadingText : submitText }}
        </button>
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

.form-item {
    margin-bottom: 0.3rem;
}

.form-item label {
    display: block;
    font-size: 0.22rem;
    color: #999999;
    line-height: 1;
    margin-bottom: 0;
}

.form-item input {
    width: 100%;
    height: 0.8rem;
    border: 1px solid #e0e0e0;
    border-radius: 0.1rem;
    padding: 0 0.2rem;
    font-size: 0.28rem;
    box-sizing: border-box;
    margin-top: 0.02rem;
}

.form-item input::placeholder {
    color: #cccccc;
}

.forgot-text {
    font-size: 0.22rem;
    color: #666666;
    text-align: center;
    margin: 0.4rem 0;
}

.save-btn {
    width: 100%;
    height: 0.9rem;
    background-color: #2b65b3;
    color: #ffffff;
    border: none;
    border-radius: 0.45rem;
    font-size: 0.3rem;
    font-weight: 600;
}
</style>
