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
    }
})

defineEmits(['back', 'openAvatarModal', 'avatarError', 'copyReferralCode'])
</script>

<template>
    <ProfileOverviewHeader
        :avatar-src="avatarSrc"
        :is-default-avatar="isDefaultAvatar"
        :is-uploading-avatar="isUploadingAvatar"
        :display-name="displayName"
        :display-member-text="displayMemberText"
        :level-icon-src="levelIconSrc"
        :display-balance="displayBalance"
        :score-dasharray="scoreDasharray"
        :display-score="displayScore"
        :referral-img="referralImg"
        :camera-img="cameraImg"
        :display-referral-code="displayReferralCode"
        @action="$emit('back')"
        @open-avatar-modal="$emit('openAvatarModal')"
        @avatar-error="$emit('avatarError')"
        @copy-referral-code="$emit('copyReferralCode')" />
</template>
