<script setup>
const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    },
    walletAddress: {
        type: String,
        default: ''
    },
    canSubmitWithdraw: {
        type: Boolean,
        default: false
    },
    isSubmittingWithdraw: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits([
    'close',
    'submitWithdraw',
    'update:walletAddress'
])
</script>

<template>
    <div
        v-if="visible"
        class="account-modal-overlay mobile-frame-fixed mobile-frame-fullscreen"
        @click="emit('close')"
    >
        <div class="account-modal" @click.stop>
            <div class="account-modal-title">Withdrawal Wallet</div>

            <div class="wallet-form">
                <label class="wallet-field">
                    <span class="wallet-label">Wallet Address</span>
                    <textarea
                        :value="walletAddress"
                        class="wallet-textarea"
                        placeholder="Enter wallet address."
                        @input="emit('update:walletAddress', $event.target.value.trim())"
                    ></textarea>
                </label>
            </div>

            <div class="account-modal-actions">
                <button
                    type="button"
                    class="account-cancel-btn"
                    @click="emit('close')"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    class="account-confirm-btn"
                    :disabled="!canSubmitWithdraw"
                    @click="emit('submitWithdraw')"
                >
                    {{ isSubmittingWithdraw ? 'Submitting...' : 'Confirm Submit' }}
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.account-modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 1450;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background: rgba(0, 0, 0, 0.36);
}

.account-modal {
    width: 100%;
    max-width: 520px;
    background: #ffffff;
    border-radius: 16px;
    padding: 22px 18px 18px;
    box-shadow: 0 18px 50px rgba(0, 0, 0, 0.18);
}

.account-modal-title {
    font-size: 20px;
    line-height: 1.3;
    font-weight: 500;
    color: #1b1b1b;
    text-align: center;
}

.wallet-form {
    margin-top: 16px;
}

.wallet-field {
    display: block;
}

.wallet-label {
    display: block;
    margin-bottom: 6px;
    color: #3d3d3d;
    font-size: 14px;
    line-height: 1.3;
}

.wallet-textarea {
    width: 100%;
    min-height: 128px;
    border: 1px solid #d5d5d5;
    border-radius: 10px;
    padding: 12px 14px;
    font-size: 14px;
    color: #1f2937;
    background: #ffffff;
    resize: none;
    line-height: 1.45;
}

.wallet-textarea:focus {
    outline: none;
    border-color: #2b63b0;
}

.wallet-hint {
    margin: 10px 0 0;
    font-size: 14px;
    line-height: 1.45;
    color: #7a7a7a;
}

.account-modal-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-top: 18px;
}

.account-cancel-btn,
.account-confirm-btn {
    height: 44px;
    border-radius: 8px;
    font-size: 16px;
    border: 0;
}

.account-cancel-btn {
    background: #ebebeb;
    color: #333333;
}

.account-confirm-btn {
    background: #2b63b0;
    color: #ffffff;
}

.account-confirm-btn:disabled {
    opacity: 0.55;
}

@media (min-width: 481px) {
    :global(body.desktop-finance-page .account-modal-overlay) {
        left: var(--desktop-sidebar-width);
        right: auto;
        width: calc(100vw - var(--desktop-sidebar-width));
        padding: 40px var(--desktop-content-right-gap) 40px var(--desktop-content-left-gap);
        background: rgba(15, 23, 42, 0.32);
        box-sizing: border-box;
    }

    :global(body.desktop-finance-page .account-modal) {
        width: min(620px, var(--desktop-content-width));
        max-width: var(--desktop-content-width);
        border-radius: 12px;
        padding: 30px 30px 26px;
        box-shadow: 0 22px 70px rgba(15, 23, 42, 0.22);
    }

    :global(body.desktop-finance-page .account-modal-title) {
        font-size: 24px;
        line-height: 1.3;
        font-weight: 500;
    }

    :global(body.desktop-finance-page .wallet-form) {
        margin-top: 22px;
    }

    :global(body.desktop-finance-page .wallet-label) {
        margin-bottom: 8px;
        font-size: 15px;
        line-height: 1.3;
    }

    :global(body.desktop-finance-page .wallet-textarea) {
        min-height: 154px;
        border-radius: 10px;
        padding: 14px 16px;
        font-size: 15px;
        line-height: 1.5;
    }

    :global(body.desktop-finance-page .account-modal-actions) {
        gap: 14px;
        margin-top: 22px;
    }

    :global(body.desktop-finance-page .account-cancel-btn),
    :global(body.desktop-finance-page .account-confirm-btn) {
        height: 48px;
        border-radius: 8px;
        font-size: 16px;
    }
}
</style>
