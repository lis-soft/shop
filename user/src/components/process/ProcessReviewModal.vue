<script setup>
defineProps({
    visible: {
        type: Boolean,
        default: false
    },
    isReviewLoading: {
        type: Boolean,
        default: false
    },
    isConfirmingReview: {
        type: Boolean,
        default: false
    },
    isReviewSuccess: {
        type: Boolean,
        default: false
    },
    reviewLoadingStage: {
        type: String,
        default: 'step1'
    },
    activeOrder: {
        type: Object,
        default: null
    },
    reviewLoadingText: {
        type: String,
        default: ''
    },
    reviewBalanceText: {
        type: String,
        default: '$0.00'
    },
    reviewProductImage: {
        type: String,
        default: ''
    },
    reviewProductTitle: {
        type: String,
        default: ''
    },
    reviewProductInfo: {
        type: String,
        default: ''
    },
    reviewCommissionText: {
        type: String,
        default: '$0.00'
    },
    reviewCommissionRateText: {
        type: String,
        default: '0.00'
    },
    reviewProductPriceText: {
        type: String,
        default: '$0.00'
    },
    reviewQuestionText: {
        type: String,
        default: 'Evaluate this brand'
    },
    reviewAnswerOptions: {
        type: Array,
        default: () => []
    },
    reviewBlockedMessage: {
        type: String,
        default: ''
    },
    selectedComment: {
        type: String,
        default: ''
    },
    reviewMessage: {
        type: String,
        default: ''
    },
    canConfirmReview: {
        type: Boolean,
        default: false
    },
    canCloseReviewModalByOverlay: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits([
    'overlay',
    'close',
    'update:selectedComment',
    'update:reviewMessage',
    'submit',
    'continue'
])
</script>

<template>
    <div
        v-if="visible"
        class="review-modal-overlay mobile-frame-fixed mobile-frame-fullscreen"
        @click="canCloseReviewModalByOverlay && emit('overlay')"
    >
        <div class="review-modal" @click.stop>
            <button
                type="button"
                class="review-modal-close"
                aria-label="Close"
                :disabled="isReviewLoading || isConfirmingReview"
                @click="emit('close')"
            >
                X
            </button>

            <div class="review-steps">
                <div class="review-step">
                    <div class="review-step-label">Step 1</div>
                    <div
                        class="review-step-icon"
                        :class="isReviewLoading && reviewLoadingStage === 'step1'
                            ? 'review-step-icon-active'
                            : 'review-step-icon-muted'"
                    >
                        <div class="search-icon"></div>
                    </div>
                </div>

                <div class="review-step-line review-step-line-active"></div>

                <div class="review-step">
                    <div class="review-step-label">Step 2</div>
                    <div
                        class="review-step-icon"
                        :class="isReviewSuccess
                            ? 'review-step-icon-muted'
                            : (isReviewLoading && reviewLoadingStage === 'step1'
                                ? 'review-step-icon-muted'
                                : 'review-step-icon-active')"
                    >
                        <div class="document-icon">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                </div>

                <div class="review-step-line"></div>

                <div class="review-step">
                    <div class="review-step-label">Step 3</div>
                    <div class="review-step-icon" :class="isReviewSuccess ? 'review-step-icon-active' : 'review-step-icon-muted'">
                        <div class="check-icon"></div>
                    </div>
                </div>
            </div>

            <div v-if="isReviewLoading" class="review-modal-loading">
                <div class="review-modal-text">{{ reviewLoadingText }}</div>
            </div>

            <template v-else-if="activeOrder">
                <div class="review-balance-label">Available Balance</div>
                <div class="review-balance-value">{{ reviewBalanceText }}</div>
                <div v-if="reviewBlockedMessage" class="review-balance-warning">{{ reviewBlockedMessage }}</div>

                <div class="review-product-card">
                    <img :src="reviewProductImage" :alt="reviewProductTitle" class="review-product-image" />

                    <div class="review-product-body">
                        <div class="review-product-title">{{ reviewProductTitle }}</div>
                        <div v-if="reviewProductInfo" class="review-product-info">{{ reviewProductInfo }}</div>

                        <div class="review-product-row">
                            <span class="review-product-label">Commission:</span>
                            <span class="review-product-commission">
                                {{ reviewCommissionText }} ({{ reviewCommissionRateText }}%)
                            </span>
                        </div>

                        <div class="review-product-row">
                            <span class="review-product-label">Brand Value:</span>
                            <span class="review-product-price">{{ reviewProductPriceText }}</span>
                        </div>
                    </div>
                </div>

                <div class="review-section-title">{{ reviewQuestionText }}</div>

                <div class="comment-select-wrapper">
                    <select
                        :value="selectedComment"
                        class="comment-select"
                        @change="emit('update:selectedComment', $event.target.value)"
                    >
                        <option value="" disabled>Please Select Answer</option>
                        <option v-for="answer in reviewAnswerOptions" :key="answer" :value="answer">
                            {{ answer }}
                        </option>
                    </select>
                </div>

                <div class="review-message-wrapper">
                    <textarea
                        :value="reviewMessage"
                        class="review-message-input"
                        placeholder="Leave a message (optional)"
                        rows="4"
                        @input="emit('update:reviewMessage', $event.target.value)"
                    ></textarea>
                </div>

                <button class="confirm-btn" :disabled="!canConfirmReview" @click="emit('submit')">
                    {{ isConfirmingReview ? 'Confirming...' : 'Confirm' }}
                </button>
            </template>

            <template v-else-if="isReviewSuccess">
                <div class="review-success-state">
                    <div class="success-illustration">
                        <div class="success-pin">
                            <div class="success-pin-circle">
                                <div class="success-building">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        </div>
                        <div class="success-badge">
                            <div class="success-badge-check"></div>
                        </div>
                    </div>

                    <div class="success-message">Your evaluating was successful.</div>

                    <button class="confirm-btn success-continue-btn" @click="emit('continue')">
                        Continue
                    </button>
                </div>
            </template>
        </div>
    </div>
</template>

<style scoped>
.review-modal-overlay {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.35);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1200;
    padding: 0.4rem;
    box-sizing: border-box;
}

.review-modal {
    width: 100%;
    max-width: 7.5rem;
    max-height: 92vh;
    background-color: #ffffff;
    border-radius: 0.04rem;
    position: relative;
    padding: 0.52rem 0.3rem 0.8rem;
    box-sizing: border-box;
    overflow-y: auto;
}

.review-modal-close {
    position: absolute;
    top: 0.18rem;
    left: 0.18rem;
    width: 0.36rem;
    height: 0.36rem;
    border: none;
    border-radius: 0.04rem;
    background-color: transparent;
    color: #111111;
    font-size: 0.24rem;
    font-weight: 600;
    line-height: 0.36rem;
    text-align: center;
    padding: 0;
}

.review-modal-close:disabled {
    opacity: 0.35;
}

.review-steps {
    display: flex;
    align-items: flex-start;
    justify-content: center;
    margin: 0.05rem 0 1.05rem;
}

.review-step {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 1.62rem;
}

.review-step-label {
    font-size: 0.4rem;
    font-weight: 600;
    color: #111111;
    margin-bottom: 0.18rem;
}

.review-step-icon {
    width: 1rem;
    height: 1rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
}

.review-step-icon-active {
    background-color: #bfa04f;
}

.review-step-icon-active::before {
    content: '';
    position: absolute;
    inset: -0.16rem;
    border-radius: 50%;
    border: 1px dashed #d0b46d;
}

.review-step-icon-muted {
    background-color: #d9d9d9;
}

.review-step-line {
    width: 0.8rem;
    border-top: 1px dashed #d8d8d8;
    margin-top: 1rem;
}

.review-step-line-active {
    border-top-color: #d0b46d;
}

.search-icon {
    width: 0.34rem;
    height: 0.34rem;
    border: 0.07rem solid #ffffff;
    border-radius: 50%;
    position: relative;
}

.search-icon::after {
    content: '';
    position: absolute;
    width: 0.24rem;
    height: 0.08rem;
    background-color: #ffffff;
    border-radius: 999px;
    right: -0.16rem;
    bottom: -0.06rem;
    transform: rotate(45deg);
    transform-origin: center;
}

.document-icon {
    width: 0.34rem;
    height: 0.44rem;
    border: 0.06rem solid #ffffff;
    border-radius: 0.04rem;
    position: relative;
    box-sizing: border-box;
}

.document-icon::after {
    content: '';
    position: absolute;
    width: 0.22rem;
    height: 0.24rem;
    border: 0.05rem solid #ffffff;
    border-radius: 0.04rem;
    right: -0.12rem;
    bottom: -0.16rem;
    background-color: transparent;
}

.document-icon span {
    position: absolute;
    left: 0.06rem;
    right: 0.06rem;
    height: 0.03rem;
    background-color: #ffffff;
    border-radius: 999px;
}

.document-icon span:nth-child(1) {
    top: 0.09rem;
}

.document-icon span:nth-child(2) {
    top: 0.18rem;
}

.document-icon span:nth-child(3) {
    top: 0.27rem;
}

.check-icon {
    width: 0.38rem;
    height: 0.2rem;
    border-left: 0.08rem solid #ffffff;
    border-bottom: 0.08rem solid #ffffff;
    transform: rotate(-45deg) translateY(-0.03rem);
}

.review-modal-loading {
    min-height: 6.8rem;
    display: flex;
    align-items: center;
    justify-content: center;
}

.review-balance-label {
    font-size: 0.26rem;
    color: #111111;
    margin: 0.18rem 0 0.08rem;
}

.review-balance-value {
    font-size: 0.52rem;
    font-weight: 700;
    color: #111111;
    margin-bottom: 0.36rem;
}

.review-balance-warning {
    margin: -0.18rem 0 0.32rem;
    padding: 0.16rem 0.2rem;
    border-radius: 0.12rem;
    background-color: #fff4e8;
    color: #ad4e00;
    font-size: 0.24rem;
    line-height: 1.5;
}

.review-product-card {
    background-color: #ffffff;
    border-radius: 0.22rem;
    box-shadow: 0 0.08rem 0.28rem rgba(0, 0, 0, 0.08);
    overflow: hidden;
    margin-bottom: 0.44rem;
}

.review-product-image {
    width: 100%;
    height: 3.12rem;
    display: block;
    object-fit: cover;
    background-color: #f5f5f5;
}

.review-product-body {
    padding: 0.32rem 0.28rem 0.34rem;
}

.review-product-title {
    font-size: 0.26rem;
    font-weight: 500;
    color: #111111;
    line-height: 1.35;
    margin-bottom: 0.06rem;
}

.review-product-info {
    font-size: 0.24rem;
    color: #111111;
    line-height: 1.35;
    margin-bottom: 0.2rem;
}

.review-product-row {
    display: flex;
    align-items: baseline;
    gap: 0.08rem;
    font-size: 0.24rem;
    line-height: 1.4;
}

.review-product-row + .review-product-row {
    margin-top: 0.12rem;
}

.review-product-label {
    color: #111111;
}

.review-product-commission {
    color: #2fc95a;
    font-weight: 600;
}

.review-product-price {
    color: #111111;
    font-weight: 600;
}

.review-section-title {
    font-size: 0.3rem;
    font-weight: 500;
    color: #111111;
    margin-bottom: 0.24rem;
}

.comment-select-wrapper {
    position: relative;
    margin-bottom: 0.24rem;
}

.comment-select-wrapper::after {
    content: '';
    position: absolute;
    top: 50%;
    right: 0.26rem;
    width: 0;
    height: 0;
    border-left: 0.1rem solid transparent;
    border-right: 0.1rem solid transparent;
    border-top: 0.12rem solid #7f7f7f;
    transform: translateY(-20%);
    pointer-events: none;
}

.comment-select {
    width: 100%;
    height: 0.86rem;
    border: 1px solid #707070;
    border-radius: 0.1rem;
    padding: 0 0.7rem 0 0.28rem;
    font-size: 0.24rem;
    color: #111111;
    background-color: #ffffff;
    appearance: none;
}

.review-message-wrapper {
    margin-bottom: 0.24rem;
}

.review-message-input {
    width: 100%;
    min-height: 1.64rem;
    border: 1px solid #707070;
    border-radius: 0.1rem;
    padding: 0.22rem 0.28rem;
    font-size: 0.24rem;
    line-height: 1.5;
    color: #111111;
    background-color: #ffffff;
    resize: none;
    box-sizing: border-box;
}

.review-message-input::placeholder {
    color: #8f8f8f;
}

.confirm-btn {
    width: 100%;
    height: 0.96rem;
    background-color: #111111;
    color: #ffffff;
    border: none;
    border-radius: 0.1rem;
    font-size: 0.34rem;
    font-weight: 600;
}

.confirm-btn:disabled {
    opacity: 0.7;
}

.review-modal-text {
    text-align: center;
    font-size: 0.54rem;
    font-weight: 700;
    color: #101010;
    line-height: 1.2;
}

.review-success-state {
    padding-top: 0.5rem;
}

.success-illustration {
    position: relative;
    width: 3.4rem;
    height: 3.2rem;
    margin: 0 auto 0.44rem;
}

.success-pin {
    position: absolute;
    left: 50%;
    top: 0;
    width: 2.42rem;
    height: 2.92rem;
    transform: translateX(-50%);
    background-color: #567c77;
    border-radius: 1.3rem 1.3rem 1rem 1rem;
    clip-path: path('M77 0C34.5 0 0 34.5 0 77c0 57.3 77 156 77 156s77-98.7 77-156C154 34.5 119.5 0 77 0Z');
}

.success-pin-circle {
    position: absolute;
    left: 50%;
    top: 0.34rem;
    width: 1.56rem;
    height: 1.56rem;
    border-radius: 50%;
    background-color: #ffffff;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    justify-content: center;
}

.success-building {
    position: relative;
    width: 0.82rem;
    height: 0.9rem;
    background-color: #567c77;
    border-radius: 0.04rem;
}

.success-building::before {
    content: '';
    position: absolute;
    left: -0.28rem;
    bottom: 0;
    width: 0.22rem;
    height: 0.62rem;
    background-color: #567c77;
    border-radius: 0.04rem;
}

.success-building span {
    position: absolute;
    width: 0.08rem;
    height: 0.08rem;
    background-color: #ffffff;
    border-radius: 50%;
}

.success-building span:nth-child(1) { left: 0.16rem; top: 0.16rem; }
.success-building span:nth-child(2) { left: 0.38rem; top: 0.16rem; }
.success-building span:nth-child(3) { left: 0.16rem; top: 0.34rem; }
.success-building span:nth-child(4) { left: 0.38rem; top: 0.34rem; }
.success-building span:nth-child(5) { left: -0.18rem; top: 0.16rem; }
.success-building span:nth-child(6) { left: -0.18rem; top: 0.38rem; }

.success-badge {
    position: absolute;
    right: 0.28rem;
    bottom: 0.28rem;
    width: 1.24rem;
    height: 1.24rem;
    border-radius: 50%;
    background-color: #4fca2a;
    display: flex;
    align-items: center;
    justify-content: center;
}

.success-badge-check {
    width: 0.44rem;
    height: 0.22rem;
    border-left: 0.1rem solid #ffffff;
    border-bottom: 0.1rem solid #ffffff;
    transform: rotate(-45deg) translateY(-0.03rem);
}

.success-message {
    text-align: center;
    font-size: 0.32rem;
    color: #111111;
    line-height: 1.45;
    margin-bottom: 0.42rem;
}

.success-continue-btn {
    margin-top: 0;
}

@media (min-width: 481px) {
    :global(body.desktop-process-page .review-modal-overlay) {
        left: var(--desktop-sidebar-width) !important;
        right: 0 !important;
        top: 0 !important;
        bottom: 0 !important;
        width: calc(100vw - var(--desktop-sidebar-width)) !important;
        height: 100vh !important;
        max-width: none !important;
        padding: 40px var(--desktop-content-right-gap) 40px var(--desktop-content-left-gap) !important;
        align-items: center;
        justify-content: center;
        background: rgba(15, 23, 42, 0.34);
        box-sizing: border-box;
    }

    :global(body.desktop-process-page .review-modal) {
        width: min(760px, var(--desktop-content-width));
        max-width: var(--desktop-content-width);
        max-height: calc(100vh - 80px);
        padding: 28px 32px 34px;
        border-radius: 12px;
        box-shadow: 0 22px 70px rgba(15, 23, 42, 0.24);
    }

    :global(body.desktop-process-page .review-modal-close) {
        top: 14px;
        left: 14px;
        width: 26px;
        height: 26px;
        border-radius: 6px;
        font-size: 13px;
        line-height: 26px;
    }

    :global(body.desktop-process-page .review-steps) {
        margin: 4px 0 34px;
    }

    :global(body.desktop-process-page .review-step) {
        min-width: 120px;
    }

    :global(body.desktop-process-page .review-step-label) {
        margin-bottom: 10px;
        font-size: 16px;
        line-height: 20px;
    }

    :global(body.desktop-process-page .review-step-icon) {
        width: 48px;
        height: 48px;
    }

    :global(body.desktop-process-page .review-step-icon-active::before) {
        inset: -7px;
    }

    :global(body.desktop-process-page .review-step-line) {
        width: 72px;
        margin-top: 48px;
    }

    :global(body.desktop-process-page .search-icon) {
        width: 17px;
        height: 17px;
        border-width: 3px;
    }

    :global(body.desktop-process-page .search-icon::after) {
        width: 11px;
        height: 4px;
        right: -8px;
        bottom: -3px;
    }

    :global(body.desktop-process-page .document-icon) {
        width: 17px;
        height: 22px;
        border-width: 3px;
        border-radius: 3px;
    }

    :global(body.desktop-process-page .document-icon::after) {
        width: 11px;
        height: 12px;
        border-width: 3px;
        right: -7px;
        bottom: -9px;
        border-radius: 3px;
    }

    :global(body.desktop-process-page .document-icon span) {
        left: 3px;
        right: 3px;
        height: 2px;
    }

    :global(body.desktop-process-page .document-icon span:nth-child(1)) {
        top: 5px;
    }

    :global(body.desktop-process-page .document-icon span:nth-child(2)) {
        top: 10px;
    }

    :global(body.desktop-process-page .document-icon span:nth-child(3)) {
        top: 15px;
    }

    :global(body.desktop-process-page .check-icon) {
        width: 19px;
        height: 10px;
        border-left-width: 4px;
        border-bottom-width: 4px;
    }

    :global(body.desktop-process-page .review-modal-loading) {
        min-height: 260px;
    }

    :global(body.desktop-process-page .review-modal-text) {
        font-size: 28px;
        line-height: 34px;
    }

    :global(body.desktop-process-page .review-balance-label) {
        margin: 0 0 4px;
        font-size: 13px;
        line-height: 16px;
    }

    :global(body.desktop-process-page .review-balance-value) {
        margin-bottom: 18px;
        font-size: 26px;
        line-height: 32px;
    }

    :global(body.desktop-process-page .review-balance-warning) {
        margin: -8px 0 18px;
        padding: 8px 12px;
        border-radius: 8px;
        font-size: 12px;
        line-height: 18px;
    }

    :global(body.desktop-process-page .review-product-card) {
        display: grid;
        grid-template-columns: 210px minmax(0, 1fr);
        min-height: 150px;
        margin-bottom: 24px;
        border-radius: 10px;
        box-shadow: 0 8px 26px rgba(15, 23, 42, 0.1);
    }

    :global(body.desktop-process-page .review-product-image) {
        width: 210px;
        height: 150px;
        object-fit: cover;
    }

    :global(body.desktop-process-page .review-product-body) {
        min-width: 0;
        padding: 16px 18px;
    }

    :global(body.desktop-process-page .review-product-title) {
        margin-bottom: 6px;
        font-size: 14px;
        line-height: 19px;
    }

    :global(body.desktop-process-page .review-product-info) {
        margin-bottom: 10px;
        font-size: 12px;
        line-height: 17px;
    }

    :global(body.desktop-process-page .review-product-row) {
        gap: 6px;
        font-size: 12px;
        line-height: 18px;
    }

    :global(body.desktop-process-page .review-product-row + .review-product-row) {
        margin-top: 6px;
    }

    :global(body.desktop-process-page .review-section-title) {
        margin-bottom: 12px;
        font-size: 15px;
        line-height: 20px;
    }

    :global(body.desktop-process-page .comment-select-wrapper) {
        margin-bottom: 14px;
    }

    :global(body.desktop-process-page .comment-select-wrapper::after) {
        right: 14px;
        border-left-width: 5px;
        border-right-width: 5px;
        border-top-width: 6px;
    }

    :global(body.desktop-process-page .comment-select) {
        height: 42px;
        padding: 0 40px 0 14px;
        border-radius: 7px;
        font-size: 13px;
    }

    :global(body.desktop-process-page .review-message-wrapper) {
        margin-bottom: 16px;
    }

    :global(body.desktop-process-page .review-message-input) {
        min-height: 92px;
        padding: 12px 14px;
        border-radius: 7px;
        font-size: 13px;
        line-height: 19px;
    }

    :global(body.desktop-process-page .confirm-btn) {
        height: 44px;
        border-radius: 7px;
        font-size: 15px;
        line-height: 1;
    }

    :global(body.desktop-process-page .review-success-state) {
        padding-top: 18px;
    }

    :global(body.desktop-process-page .success-illustration) {
        width: 170px;
        height: 160px;
        margin-bottom: 22px;
    }

    :global(body.desktop-process-page .success-message) {
        margin-bottom: 24px;
        font-size: 15px;
        line-height: 22px;
    }

    :global(body.desktop-record-page .review-modal-overlay) {
        left: var(--desktop-sidebar-width) !important;
        right: 0 !important;
        top: 0 !important;
        bottom: 0 !important;
        width: calc(100vw - var(--desktop-sidebar-width)) !important;
        height: 100vh !important;
        max-width: none !important;
        padding: 40px var(--desktop-content-right-gap) 40px var(--desktop-content-left-gap) !important;
        align-items: center;
        justify-content: center;
        background: rgba(15, 23, 42, 0.34);
        box-sizing: border-box;
    }

    :global(body.desktop-record-page .review-modal) {
        width: min(760px, var(--desktop-content-width));
        max-width: var(--desktop-content-width);
        max-height: calc(100vh - 80px);
        padding: 28px 32px 34px;
        border-radius: 12px;
        box-shadow: 0 22px 70px rgba(15, 23, 42, 0.24);
    }

    :global(body.desktop-record-page .review-modal-close) {
        top: 14px;
        left: 14px;
        width: 26px;
        height: 26px;
        border-radius: 6px;
        font-size: 13px;
        line-height: 26px;
    }

    :global(body.desktop-record-page .review-steps) {
        margin: 4px 0 34px;
    }

    :global(body.desktop-record-page .review-step) {
        min-width: 120px;
    }

    :global(body.desktop-record-page .review-step-label) {
        margin-bottom: 10px;
        font-size: 16px;
        line-height: 20px;
    }

    :global(body.desktop-record-page .review-step-icon) {
        width: 48px;
        height: 48px;
    }

    :global(body.desktop-record-page .review-step-icon-active::before) {
        inset: -7px;
    }

    :global(body.desktop-record-page .review-step-line) {
        width: 72px;
        margin-top: 48px;
    }

    :global(body.desktop-record-page .search-icon) {
        width: 17px;
        height: 17px;
        border-width: 3px;
    }

    :global(body.desktop-record-page .search-icon::after) {
        width: 11px;
        height: 4px;
        right: -8px;
        bottom: -3px;
    }

    :global(body.desktop-record-page .document-icon) {
        width: 17px;
        height: 22px;
        border-width: 3px;
        border-radius: 3px;
    }

    :global(body.desktop-record-page .document-icon::after) {
        width: 11px;
        height: 12px;
        border-width: 3px;
        right: -7px;
        bottom: -9px;
        border-radius: 3px;
    }

    :global(body.desktop-record-page .document-icon span) {
        left: 3px;
        right: 3px;
        height: 2px;
    }

    :global(body.desktop-record-page .document-icon span:nth-child(1)) {
        top: 5px;
    }

    :global(body.desktop-record-page .document-icon span:nth-child(2)) {
        top: 10px;
    }

    :global(body.desktop-record-page .document-icon span:nth-child(3)) {
        top: 15px;
    }

    :global(body.desktop-record-page .check-icon) {
        width: 19px;
        height: 10px;
        border-left-width: 4px;
        border-bottom-width: 4px;
    }

    :global(body.desktop-record-page .review-modal-loading) {
        min-height: 260px;
    }

    :global(body.desktop-record-page .review-modal-text) {
        font-size: 28px;
        line-height: 34px;
    }

    :global(body.desktop-record-page .review-balance-label) {
        margin: 0 0 4px;
        font-size: 13px;
        line-height: 16px;
    }

    :global(body.desktop-record-page .review-balance-value) {
        margin-bottom: 18px;
        font-size: 26px;
        line-height: 32px;
    }

    :global(body.desktop-record-page .review-balance-warning) {
        margin: -8px 0 18px;
        padding: 8px 12px;
        border-radius: 8px;
        font-size: 12px;
        line-height: 18px;
    }

    :global(body.desktop-record-page .review-product-card) {
        display: grid;
        grid-template-columns: 210px minmax(0, 1fr);
        min-height: 150px;
        margin-bottom: 24px;
        border-radius: 10px;
        box-shadow: 0 8px 26px rgba(15, 23, 42, 0.1);
    }

    :global(body.desktop-record-page .review-product-image) {
        width: 210px;
        height: 150px;
        object-fit: cover;
    }

    :global(body.desktop-record-page .review-product-body) {
        min-width: 0;
        padding: 16px 18px;
    }

    :global(body.desktop-record-page .review-product-title) {
        margin-bottom: 6px;
        font-size: 14px;
        line-height: 19px;
    }

    :global(body.desktop-record-page .review-product-info) {
        margin-bottom: 10px;
        font-size: 12px;
        line-height: 17px;
    }

    :global(body.desktop-record-page .review-product-row) {
        gap: 6px;
        font-size: 12px;
        line-height: 18px;
    }

    :global(body.desktop-record-page .review-product-row + .review-product-row) {
        margin-top: 6px;
    }

    :global(body.desktop-record-page .review-section-title) {
        margin-bottom: 12px;
        font-size: 15px;
        line-height: 20px;
    }

    :global(body.desktop-record-page .comment-select-wrapper) {
        margin-bottom: 14px;
    }

    :global(body.desktop-record-page .comment-select-wrapper::after) {
        right: 14px;
        border-left-width: 5px;
        border-right-width: 5px;
        border-top-width: 6px;
    }

    :global(body.desktop-record-page .comment-select) {
        height: 42px;
        padding: 0 40px 0 14px;
        border-radius: 7px;
        font-size: 13px;
    }

    :global(body.desktop-record-page .review-message-wrapper) {
        margin-bottom: 16px;
    }

    :global(body.desktop-record-page .review-message-input) {
        min-height: 92px;
        padding: 12px 14px;
        border-radius: 7px;
        font-size: 13px;
        line-height: 19px;
    }

    :global(body.desktop-record-page .confirm-btn) {
        height: 44px;
        border-radius: 7px;
        font-size: 15px;
        line-height: 1;
    }

    :global(body.desktop-record-page .review-success-state) {
        padding-top: 18px;
    }

    :global(body.desktop-record-page .success-illustration) {
        width: 170px;
        height: 160px;
        margin-bottom: 22px;
    }

    :global(body.desktop-record-page .success-message) {
        margin-bottom: 24px;
        font-size: 15px;
        line-height: 22px;
    }
}
</style>
