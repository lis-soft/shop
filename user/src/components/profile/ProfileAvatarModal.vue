<script setup>
defineProps({
    visible: {
        type: Boolean,
        default: false
    },
    pendingAvatarPreview: {
        type: String,
        default: ''
    },
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
    hasPendingAvatarFile: {
        type: Boolean,
        default: false
    }
})

defineEmits(['close', 'choose', 'upload', 'avatarError'])
</script>

<template>
    <div
        v-if="visible"
        class="avatar-modal-overlay mobile-frame-fixed mobile-frame-fullscreen"
        @click="$emit('close')"
    >
        <div class="avatar-modal" @click.stop>
            <h3 class="avatar-modal-title">Upload Avatar</h3>
            <div class="avatar-modal-preview">
                <img
                    :src="pendingAvatarPreview || avatarSrc"
                    alt="Avatar Preview"
                    class="avatar-modal-image"
                    :class="{ 'avatar-modal-image-default': !pendingAvatarPreview && isDefaultAvatar }"
                    @error="$emit('avatarError')"
                />
            </div>
            <p class="avatar-modal-hint">JPG, PNG, GIF, WEBP. Max 5MB.</p>
            <div class="avatar-modal-actions">
                <button type="button" class="avatar-modal-btn secondary" :disabled="isUploadingAvatar" @click="$emit('choose')">Choose Image</button>
                <button type="button" class="avatar-modal-btn ghost" :disabled="isUploadingAvatar" @click="$emit('close')">Cancel</button>
                <button type="button" class="avatar-modal-btn primary" :disabled="!hasPendingAvatarFile || isUploadingAvatar" @click="$emit('upload')">
                    {{ isUploadingAvatar ? 'Uploading...' : 'Upload' }}
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.avatar-modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 1150;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem;
    background: rgba(15, 23, 42, 0.45);
    box-sizing: border-box;
}

.avatar-modal {
    width: min(100%, 6.4rem);
    background: #ffffff;
    border-radius: 0.28rem;
    padding: 0.42rem 0.34rem 0.34rem;
    box-shadow: 0 0.2rem 0.6rem rgba(15, 23, 42, 0.25);
    text-align: center;
}

.avatar-modal-title {
    margin: 0 0 0.28rem;
    font-size: 0.34rem;
    color: #1f2937;
}

.avatar-modal-preview {
    width: 2.2rem;
    height: 2.2rem;
    margin: 0 auto 0.24rem;
    border-radius: 50%;
    overflow: hidden;
    border: 0.04rem solid #e5e7eb;
    background: #f8fafc;
}

.avatar-modal-image {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
}

.avatar-modal-image-default {
    transform: translate(7%, 4%);
}

.avatar-modal-hint {
    margin: 0 0 0.3rem;
    font-size: 0.24rem;
    line-height: 1.5;
    color: #6b7280;
}

.avatar-modal-actions {
    display: flex;
    flex-direction: column;
    gap: 0.16rem;
}

.avatar-modal-btn {
    width: 100%;
    min-height: 0.86rem;
    border-radius: 0.2rem;
    border: 0;
    font-size: 0.28rem;
    font-weight: 600;
}

.avatar-modal-btn.primary {
    background: #245fa8;
    color: #ffffff;
}

.avatar-modal-btn.secondary {
    background: #30946b;
    color: #ffffff;
}

.avatar-modal-btn.ghost {
    background: #eef2f7;
    color: #334155;
}

.avatar-modal-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}
</style>
