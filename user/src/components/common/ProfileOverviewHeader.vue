<script setup>
defineProps({
    avatarSrc: {
        type: String,
        default: ''
    },
    isDefaultAvatar: {
        type: Boolean,
        default: false
    },
    isUploadingAvatar: {
        type: Boolean,
        default: false
    },
    displayName: {
        type: String,
        default: 'Guest'
    },
    displayMemberText: {
        type: String,
        default: ''
    },
    levelIconSrc: {
        type: String,
        default: ''
    },
    displayBalance: {
        type: String,
        default: '$ 0.00'
    },
    scoreDasharray: {
        type: String,
        default: '100, 100'
    },
    displayScore: {
        type: Number,
        default: 100
    },
    referralImg: {
        type: String,
        required: true
    },
    cameraImg: {
        type: String,
        required: true
    },
    displayReferralCode: {
        type: String,
        default: '--'
    },
    showScoreReferral: {
        type: Boolean,
        default: true
    }
})

defineEmits(['action', 'openAvatarModal', 'avatarError', 'copyReferralCode'])
</script>

<template>
    <div class="profile-overview">
        <div class="user-header">
            <div class="action-btn" @click="$emit('action')">
                <i class="arrow-left"></i>
            </div>
            <div class="header-main">
                <div class="user-left">
                    <div class="avatar-wrapper">
                        <button type="button" class="avatar-button" :disabled="isUploadingAvatar" @click="$emit('openAvatarModal')">
                            <img :src="avatarSrc" alt="Avatar" class="avatar" :class="{ 'avatar-default': isDefaultAvatar }" @error="$emit('avatarError')" />
                        </button>
                        <button type="button" class="camera-badge" :disabled="isUploadingAvatar" @click="$emit('openAvatarModal')">
                            <img :src="cameraImg" alt="Camera" />
                        </button>
                    </div>
                    <div class="username">{{ displayName }}</div>
                </div>
                <div class="user-right">
                    <div class="member-status">
                        <span class="member-text">{{ displayMemberText }}</span>
                        <img :src="levelIconSrc" alt="Level" class="level-icon" />
                    </div>
                    <div class="balance-pill">
                        <span class="balance-label">Available Balance</span>
                        <span class="balance-value">{{ displayBalance }}</span>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="showScoreReferral" class="score-referral-section">
            <div class="score-card">
                <div class="score-label">Credibility Score</div>
                <div class="score-circle">
                    <svg viewBox="0 0 36 36" class="circular-chart">
                        <path class="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <path class="circle" :stroke-dasharray="scoreDasharray" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                    <div class="score-text">{{ displayScore }}%</div>
                </div>
            </div>
            <div class="referral-card">
                <img :src="referralImg" alt="Referral" class="referral-bg" />
                <div class="referral-content">
                    <div class="referral-title">Referral Code</div>
                    <div class="referral-desc">Referral codes can only be used by users who have reached Mentor status to invite new members and earn. For further information, please visit the FAQ section or get in touch with user support.</div>
                    <div class="referral-code-row">
                        <span class="code">{{ displayReferralCode }}</span>
                        <button type="button" class="copy-button" aria-label="Copy referral code" @click="$emit('copyReferralCode')">
                            <i class="copy-icon"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.user-header {
    background-color: #1d58a7;
    padding: 1.02rem 0.4rem 0.8rem;
    color: #ffffff;
    position: relative;
    border-bottom-left-radius: 0.3rem;
    border-bottom-right-radius: 0.3rem;
}

.action-btn {
    position: absolute;
    top: 0.26rem;
    right: 0.4rem;
    width: 0.88rem;
    height: 0.88rem;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
}

.arrow-left {
    display: inline-block;
    width: 0.48rem;
    height: 0.48rem;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='white' viewBox='0 0 24 24'%3E%3Cpath d='M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z'/%3E%3C/svg%3E");
    background-size: contain;
    background-repeat: no-repeat;
}

.header-main {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: -0.08rem;
}

.user-left {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.avatar-wrapper {
    position: relative;
    width: 2.16rem;
    height: 2.16rem;
}

.avatar-button {
    width: 100%;
    height: 100%;
    padding: 0;
    border: 0;
    background: transparent;
    border-radius: 50%;
    cursor: pointer;
}

.avatar {
    width: 100%;
    height: 100%;
    display: block;
    border-radius: 50%;
    border: 0.04rem solid #ffffff;
    background-color: #fff;
    object-fit: cover;
}

.avatar-default {
    transform: translate(7%, 4%);
}

.camera-badge {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 0.56rem;
    height: 0.56rem;
    background-color: #ffffff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.12rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    border: 0;
    cursor: pointer;
}

.camera-badge img {
    width: 100%;
    height: 100%;
}

.camera-badge:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.username {
    font-size: 0.34rem;
    font-weight: 500;
    margin-top: 0.24rem;
    letter-spacing: 0.02rem;
}

.user-right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    padding-top: 0.18rem;
    max-width: calc(100% - 2.6rem);
}

.member-status {
    display: flex;
    align-items: center;
    gap: 0.2rem;
    margin-bottom: 0.18rem;
}

.member-text {
    font-size: 0.34rem;
    font-weight: 400;
}

.level-icon {
    width: 1.2rem;
    height: auto;
}

.balance-pill {
    background-color: #ffcc00;
    border-radius: 0.7rem;
    width: fit-content;
    max-width: 54vw;
    min-width: 3.6rem;
    padding: 0.22rem 0.36rem 0.24rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.08rem;
    color: #000000;
    box-shadow: 0 0.04rem 0.12rem rgba(0, 0, 0, 0.15);
    box-sizing: border-box;
    text-align: center;
}

.balance-label {
    font-size: 0.34rem;
    font-weight: 400;
    line-height: 1.2;
    white-space: normal;
}

.balance-value {
    max-width: 100%;
    font-size: 0.34rem;
    font-weight: 700;
    line-height: 1.1;
    text-align: center;
    align-self: center;
    white-space: normal;
    overflow-wrap: anywhere;
}

.score-referral-section {
    display: flex;
    padding: 0.3rem;
    gap: 0.2rem;
    background-color: #f8f9fa;
}

.score-card {
    width: 2.8rem;
    background-color: #ffffff;
    border-radius: 0.2rem;
    padding: 0.3rem 0.2rem;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-shadow: 0 0.02rem 0.1rem rgba(0, 0, 0, 0.02);
}

.score-label {
    font-size: 0.34rem;
    color: #999999;
    margin-bottom: 0.3rem;
}

.score-circle {
    position: relative;
    width: 1.8rem;
    height: 1.8rem;
}

.circular-chart {
    display: block;
    margin: 0 auto;
    max-width: 100%;
    max-height: 100%;
}

.circle-bg {
    fill: none;
    stroke: #eee;
    stroke-width: 2.8;
}

.circle {
    fill: none;
    stroke: #1d58a7;
    stroke-width: 2.8;
    stroke-linecap: round;
}

.score-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 0.34rem;
    font-weight: 700;
    color: #333333;
}

.referral-card {
    flex: 1;
    position: relative;
    border-radius: 0.2rem;
    overflow: hidden;
    color: #ffffff;
}

.referral-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.referral-content {
    position: relative;
    padding: 0.3rem 0.2rem;
    z-index: 1;
}

.referral-title {
    font-size: 0.34rem;
    font-weight: 700;
    margin-bottom: 0.15rem;
}

.referral-desc {
    font-size: 0.34rem;
    line-height: 1.4;
    opacity: 0.9;
    margin-bottom: 0.2rem;
    display: -webkit-box;
    -webkit-line-clamp: 4;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.referral-code-row {
    display: flex;
    align-items: center;
    gap: 0.15rem;
}

.code {
    font-size: 0.34rem;
    font-weight: 700;
}

.copy-icon {
    width: 0.3rem;
    height: 0.3rem;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='white' viewBox='0 0 24 24'%3E%3Cpath d='M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z'/%3E%3C/svg%3E");
    background-size: contain;
    background-repeat: no-repeat;
}

.copy-button {
    width: 0.54rem;
    height: 0.54rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    border: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.16);
}

@media (min-width: 481px) {
    :global(body.desktop-profile-page .profile-overview) {
        min-width: 0;
        max-width: var(--desktop-content-width);
        background: transparent;
        overflow: hidden;
    }

    :global(body.desktop-profile-page .profile-overview .user-header) {
        height: clamp(104px, 14vh, 128px);
        max-width: 100%;
        padding: 0;
        border-radius: 10px;
        background: linear-gradient(105deg, #36a56b 0%, #4a93bd 100%);
        overflow: hidden;
    }

    :global(body.desktop-profile-page .profile-overview .action-btn) {
        display: none;
    }

    :global(body.desktop-profile-page .profile-overview .header-main) {
        position: relative;
        height: 100%;
        margin: 0;
        padding: 0 clamp(34px, 4vw, 58px);
        display: grid;
        grid-template-columns: clamp(72px, 8vw, 94px) minmax(0, 1fr) 1px minmax(0, 1.05fr);
        grid-template-rows: 1fr 1fr;
        column-gap: clamp(24px, 3vw, 44px);
        align-items: center;
        justify-content: initial;
        box-sizing: border-box;
        min-width: 0;
        overflow: hidden;
    }

    :global(body.desktop-profile-page .profile-overview .header-main::before) {
        content: '';
        grid-column: 3;
        grid-row: 1 / span 2;
        width: 1px;
        height: 58px;
        background: rgba(255, 255, 255, 0.58);
        align-self: center;
    }

    :global(body.desktop-profile-page .profile-overview .user-left) {
        display: contents;
    }

    :global(body.desktop-profile-page .profile-overview .avatar-wrapper) {
        grid-column: 1;
        grid-row: 1 / span 2;
        width: clamp(58px, 7vw, 78px);
        height: clamp(58px, 7vw, 78px);
        align-self: center;
        justify-self: center;
    }

    :global(body.desktop-profile-page .profile-overview .avatar) {
        border-width: 0;
    }

    :global(body.desktop-profile-page .profile-overview .camera-badge) {
        width: 23px;
        height: 23px;
        padding: 5px;
        box-shadow: none;
    }

    :global(body.desktop-profile-page .profile-overview .username) {
        grid-column: 2;
        grid-row: 1;
        align-self: end;
        margin: 0 0 5px;
        color: #ffffff;
        font-size: 21px;
        line-height: 25px;
        font-weight: 500;
        letter-spacing: 0;
        text-align: left;
        min-width: 0;
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    :global(body.desktop-profile-page .profile-overview .user-right) {
        display: contents;
    }

    :global(body.desktop-profile-page .profile-overview .member-status) {
        grid-column: 2;
        grid-row: 2;
        align-self: start;
        justify-self: start;
        margin: 0;
        min-width: 102px;
        height: 27px;
        padding: 0 12px;
        gap: 6px;
        border-radius: 999px;
        background: #ffd236;
        color: #111111;
        box-sizing: border-box;
        max-width: 100%;
        overflow: hidden;
    }

    :global(body.desktop-profile-page .profile-overview .member-text) {
        order: 2;
        min-width: 0;
        font-size: 13px;
        line-height: 27px;
        font-weight: 400;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    :global(body.desktop-profile-page .profile-overview .level-icon) {
        order: 1;
        width: 19px;
        height: 19px;
        object-fit: contain;
    }

    :global(body.desktop-profile-page .profile-overview .balance-pill) {
        grid-column: 4;
        grid-row: 1 / span 2;
        align-self: center;
        justify-self: start;
        min-width: 0;
        max-width: none;
        padding: 0;
        gap: 2px;
        border-radius: 0;
        background: transparent;
        color: #ffffff;
        box-shadow: none;
        text-align: left;
        min-width: 0;
        max-width: 100%;
        overflow: hidden;
    }

    :global(body.desktop-profile-page .profile-overview .balance-label) {
        color: rgba(255, 255, 255, 0.88);
        font-size: 13px;
        line-height: 17px;
        white-space: nowrap;
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    :global(body.desktop-profile-page .profile-overview .balance-value) {
        color: #ffffff;
        font-size: 21px;
        line-height: 25px;
        font-weight: 400;
        white-space: nowrap;
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    :global(body.desktop-profile-page .profile-overview .score-referral-section) {
        min-height: clamp(178px, 23vh, 216px);
        height: auto;
        margin-top: clamp(16px, 2.4vh, 22px);
        padding: 0;
        gap: 8px;
        background: transparent;
        box-sizing: border-box;
        min-width: 0;
        max-width: 100%;
        overflow: visible;
        align-items: stretch;
    }

    :global(body.desktop-profile-page .profile-overview .score-card) {
        width: clamp(150px, 18vw, 220px);
        min-height: clamp(178px, 23vh, 216px);
        height: auto;
        flex: 0 1 clamp(150px, 18vw, 220px);
        padding: 22px 16px 20px;
        border-radius: 8px;
        background: #f3f3f3;
        box-shadow: none;
        box-sizing: border-box;
        min-width: 0;
        overflow: visible;
    }

    :global(body.desktop-profile-page .profile-overview .score-label) {
        margin-bottom: 12px;
        color: #888888;
        font-size: 14px;
        line-height: 18px;
        font-weight: 400;
    }

    :global(body.desktop-profile-page .profile-overview .score-circle) {
        width: clamp(104px, 11vw, 128px);
        height: clamp(104px, 11vw, 128px);
    }

    :global(body.desktop-profile-page .profile-overview .circle-bg) {
        stroke: #f6f6f6;
        stroke-width: 1.9;
    }

    :global(body.desktop-profile-page .profile-overview .circle) {
        stroke: #2561af;
        stroke-width: 1.9;
    }

    :global(body.desktop-profile-page .profile-overview .score-text) {
        color: #000000;
        font-size: 20px;
        line-height: 24px;
        font-weight: 400;
    }

    :global(body.desktop-profile-page .profile-overview .referral-card) {
        min-height: clamp(178px, 23vh, 216px);
        height: auto;
        min-width: 0;
        flex: 1 1 0;
        border-radius: 8px;
        background: #1767e9;
    }

    :global(body.desktop-profile-page .profile-overview .referral-bg) {
        max-width: none;
    }

    :global(body.desktop-profile-page .profile-overview .referral-content) {
        width: min(58%, 520px);
        min-width: 0;
        max-width: calc(100% - 120px);
        padding: 24px 28px 20px;
        box-sizing: border-box;
    }

    :global(body.desktop-profile-page .profile-overview .referral-title) {
        margin-bottom: 9px;
        font-size: 16px;
        line-height: 20px;
        font-weight: 500;
    }

    :global(body.desktop-profile-page .profile-overview .referral-desc) {
        margin-bottom: 14px;
        font-size: 10px;
        line-height: 14px;
        -webkit-line-clamp: 4;
        overflow-wrap: anywhere;
    }

    :global(body.desktop-profile-page .profile-overview .referral-code-row) {
        gap: 8px;
        min-width: 0;
        max-width: 100%;
    }

    :global(body.desktop-profile-page .profile-overview .code) {
        min-width: 0;
        font-size: 16px;
        line-height: 20px;
        font-weight: 500;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    :global(body.desktop-profile-page .profile-overview .copy-button) {
        width: 22px;
        height: 22px;
        flex: 0 0 22px;
        background: transparent;
    }

    :global(body.desktop-profile-page .profile-overview .copy-icon) {
        width: 17px;
        height: 17px;
    }
}
</style>
