<script setup>
const props = defineProps({
    memberLabel: {
        type: String,
        default: ''
    },
    balanceText: {
        type: String,
        default: '--'
    },
    pin: {
        type: Array,
        default: () => ['', '', '', '', '', '']
    },
    canSubmitWithdraw: {
        type: Boolean,
        default: false
    },
    isVerifyingPin: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['update:pin', 'submit'])

const updatePinAt = (index, value) => {
    const nextPin = [...props.pin]
    nextPin[index] = value
    emit('update:pin', nextPin)
}

const focusSiblingInput = (input, direction) => {
    const group = input?.closest('.pin-input-group')
    if (!group) {
        return
    }

    const inputs = [...group.querySelectorAll('.pin-input')]
    const currentIndex = inputs.indexOf(input)
    const target = inputs[currentIndex + direction]
    target?.focus()
}

const handleInput = (index, event) => {
    const value = String(event.target.value || '').replace(/\D/g, '').slice(-1)
    updatePinAt(index, value)
    event.target.value = value

    if (value && index < 5) {
        focusSiblingInput(event.target, 1)
    }
}

const handleKeyDown = (index, event) => {
    if (event.key === 'Backspace' && !props.pin[index] && index > 0) {
        focusSiblingInput(event.target, -1)
    }
}
</script>

<template>
    <main class="financial-content">
        <section class="balance-card">
            <div class="member-type">{{ memberLabel }}</div>
            <div class="balance-label">Available Balance</div>
            <div class="balance-amount">{{ balanceText }}</div>
        </section>

        <section class="pin-panel">
            <h2 class="pin-title">Please enter the withdrawal PIN</h2>
            <p class="pin-hint">New accounts use 000000 as the default withdrawal PIN.</p>

            <div class="pin-input-group">
                <input
                    v-for="(_, index) in 6"
                    :key="index"
                    :value="pin[index]"
                    type="password"
                    maxlength="1"
                    inputmode="numeric"
                    class="pin-input"
                    @input="handleInput(index, $event)"
                    @keydown="handleKeyDown(index, $event)"
                />
            </div>

            <button class="submit-btn" :disabled="!canSubmitWithdraw" @click="emit('submit')">
                {{ isVerifyingPin ? 'CHECKING...' : 'SUBMIT' }}
            </button>
        </section>
    </main>
</template>

<style scoped>
.financial-content {
    min-height: calc(100vh - 2.68rem);
    width: 100%;
    max-width: 540px;
    margin: 0 auto;
    padding: 12px 15px 0;
}

.balance-card {
    width: 100%;
    height: 102px;
    border-radius: 14px;
    background: #078f2b;
    color: #ffffff;
    text-align: center;
    padding: 14px 20px 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.member-type {
    font-size: 18px;
    line-height: 1.15;
    font-weight: 400;
}

.balance-label {
    margin-top: 8px;
    font-size: 12px;
    line-height: 1.2;
    opacity: 0.86;
    letter-spacing: 0.04em;
    text-transform: uppercase;
}

.balance-amount {
    margin-top: 8px;
    font-size: 27px;
    line-height: 1;
    font-weight: 500;
}

.pin-panel {
    padding-top: 33px;
}

.pin-title {
    margin: 0;
    text-align: center;
    color: #1b1b1b;
    font-size: 24px;
    font-weight: 400;
    line-height: 1.25;
}

.pin-hint {
    margin: 10px 0 0;
    text-align: center;
    color: #5f6670;
    font-size: 13px;
    line-height: 1.5;
}

.pin-input-group {
    margin-top: 23px;
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 12px;
}

.pin-input {
    width: 100%;
    height: 59px;
    border: 1px solid #bdbdbd;
    background: transparent;
    border-radius: 0;
    text-align: center;
    font-size: 28px;
    color: #1f2937;
    padding: 0;
    -webkit-text-security: disc;
}

.pin-input:focus {
    outline: none;
    border-color: #1d58a7;
    background: #ffffff;
}

.submit-btn {
    display: block;
    width: calc(100% - 8px);
    height: 44px;
    margin: 67px auto 0;
    border: 0;
    border-radius: 6px;
    background: #2b63b0;
    color: #ffffff;
    font-size: 18px;
    font-weight: 400;
    letter-spacing: 0;
}

.submit-btn:disabled {
    opacity: 0.55;
}

@media (min-width: 481px) {
    :global(body.desktop-finance-page .financial-content) {
        width: var(--desktop-content-width);
        max-width: none;
        height: 100vh;
        min-height: 100vh;
        margin-left: var(--desktop-content-left-gap);
        margin-right: 0;
        padding: clamp(20px, 4vh, 38px) 0 clamp(22px, 4vh, 42px);
        display: flex;
        flex-direction: column;
        overflow-y: hidden;
        overflow-x: hidden;
        background: #f7f7f7;
        box-sizing: border-box;
    }

    :global(body.desktop-finance-page .balance-card) {
        width: 100%;
        height: clamp(118px, 18vh, 168px);
        flex: 0 0 clamp(118px, 18vh, 168px);
        border-radius: 8px;
        padding: clamp(18px, 3vh, 30px);
        background: #078f2b;
        box-shadow: none;
    }

    :global(body.desktop-finance-page .member-type) {
        font-size: clamp(21px, 3.2vh, 28px);
        line-height: 1.15;
        font-weight: 400;
    }

    :global(body.desktop-finance-page .balance-label) {
        margin-top: clamp(8px, 1.7vh, 14px);
        font-size: clamp(12px, 1vw, 15px);
        line-height: 1.2;
        letter-spacing: 0.04em;
    }

    :global(body.desktop-finance-page .balance-amount) {
        margin-top: clamp(8px, 1.8vh, 15px);
        font-size: clamp(31px, 5vh, 42px);
        line-height: 1;
        font-weight: 500;
    }

    :global(body.desktop-finance-page .pin-panel) {
        width: 100%;
        min-height: 0;
        flex: 1 1 auto;
        margin-top: clamp(18px, 3.4vh, 32px);
        padding: clamp(24px, 4.4vh, 42px) clamp(34px, 4.4vw, 70px) clamp(24px, 4.4vh, 42px);
        border-radius: 8px;
        background: #ffffff;
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
    }

    :global(body.desktop-finance-page .pin-title) {
        color: #1b1b1b;
        font-size: clamp(24px, 4.4vh, 34px);
        line-height: 1.22;
        font-weight: 400;
    }

    :global(body.desktop-finance-page .pin-hint) {
        max-width: 760px;
        margin: 12px auto 0;
        color: #5f6670;
        font-size: clamp(13px, 1.1vw, 16px);
        line-height: 1.5;
    }

    :global(body.desktop-finance-page .pin-input-group) {
        width: min(100%, 820px);
        margin: clamp(20px, 3.8vh, 32px) auto 0;
        grid-template-columns: repeat(6, minmax(0, 1fr));
        gap: clamp(14px, 1.8vw, 26px);
    }

    :global(body.desktop-finance-page .pin-input) {
        height: clamp(54px, 9vh, 78px);
        border: 1px solid #bdbdbd;
        background: #ffffff;
        color: #1f2937;
        font-size: clamp(28px, 4.8vh, 40px);
    }

    :global(body.desktop-finance-page .pin-input:focus) {
        border-color: #1d58a7;
        box-shadow: 0 0 0 3px rgba(29, 88, 167, 0.12);
    }

    :global(body.desktop-finance-page .submit-btn) {
        width: min(100%, 820px);
        height: clamp(46px, 7vh, 58px);
        margin: auto auto 0;
        border-radius: 6px;
        background: #2b63b0;
        color: #ffffff;
        font-size: clamp(18px, 1.6vw, 24px);
        font-weight: 400;
    }
}
</style>
