<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { getCountries, getCountryCallingCode } from 'libphonenumber-js'
import { useRoute, useRouter } from 'vue-router'
import AuthNoticeToast from '@/components/auth/AuthNoticeToast.vue'
import CountrySelectorModal from '@/components/auth/CountrySelectorModal.vue'
import logoImg from '@/assets/static/img/common/logo.png'
import desktopHeroImg from '@/assets/static/img/home/Rectangle 462.png'
import { request } from '@/utils/request'
import { refreshCurrentUser, setCurrentUser } from '@/utils/currentUser'

const regionNames = typeof Intl !== 'undefined' && typeof Intl.DisplayNames === 'function'
    ? new Intl.DisplayNames(['en'], { type: 'region' })
    : null

const COUNTRY_OPTIONS = getCountries()
    .map(iso => ({
        iso,
        name: regionNames?.of(iso) || iso,
        dialCode: `+${getCountryCallingCode(iso)}`
    }))
    .sort((left, right) => left.name.localeCompare(right.name))

const router = useRouter()
const route = useRoute()
const username = ref('')
const password = ref('')
const phoneNumber = ref('')
const selectedCountryIso = ref('SG')
const referralCode = ref('')
const isPasswordVisible = ref(false)
const isSubmitting = ref(false)
const noticeMessage = ref('')
const isNoticeVisible = ref(false)
const isCountrySelectorOpen = ref(false)
let noticeTimer = null

const selectedCountry = computed(() => {
    return COUNTRY_OPTIONS.find(country => country.iso === selectedCountryIso.value) || COUNTRY_OPTIONS[0]
})

onMounted(() => {
    if (typeof route.query.inviteCode === 'string' && route.query.inviteCode.trim()) {
        referralCode.value = route.query.inviteCode.trim()
    }
})

onBeforeUnmount(() => {
    if (noticeTimer) {
        window.clearTimeout(noticeTimer)
    }
})

const showNotice = message => {
    if (!message) {
        return
    }

    noticeMessage.value = message
    isNoticeVisible.value = true

    if (noticeTimer) {
        window.clearTimeout(noticeTimer)
    }

    noticeTimer = window.setTimeout(() => {
        isNoticeVisible.value = false
    }, 2600)
}

const handleSignUp = async () => {
    if (isSubmitting.value) {
        return
    }

    const normalizedUsername = username.value.trim()
    const normalizedPassword = password.value.trim()
    const normalizedPhoneNumber = phoneNumber.value.trim()
    const normalizedReferralCode = referralCode.value.trim()
    const normalizedCountry = selectedCountry.value?.name?.trim() || ''
    const normalizedPhoneCountryCode = selectedCountry.value?.dialCode?.trim() || ''

    if (!normalizedUsername) {
        showNotice('Please enter your username')
        return
    }

    if (normalizedPassword.length < 6) {
        showNotice('Password must be at least 6 characters')
        return
    }

    if (!normalizedPhoneCountryCode || !normalizedPhoneNumber) {
        showNotice('Please enter your phone number')
        return
    }

    if (!normalizedCountry) {
        showNotice('Please enter your country')
        return
    }

    if (!normalizedReferralCode) {
        showNotice('Please enter the referral code')
        return
    }

    isSubmitting.value = true

    try {
        const result = await request('/api/index/register', {
            method: 'POST',
            body: JSON.stringify({
                username: normalizedUsername,
                login_pwd: normalizedPassword,
                phone: `${normalizedPhoneCountryCode} ${normalizedPhoneNumber}`.trim(),
                country: normalizedCountry,
                inviteCode: normalizedReferralCode
            })
        })

        const token = result?.data?.token
        const userInfo = result?.data?.userInfo

        if (token) {
            localStorage.setItem('token', token)
        }

        const refreshedUserInfo = await refreshCurrentUser().catch(() => null)

        if (!refreshedUserInfo && userInfo) {
            setCurrentUser(userInfo)
        }

        const redirectPath = typeof route.query.redirect === 'string' && route.query.redirect
            ? route.query.redirect
            : '/'

        router.push(redirectPath)
    } catch (error) {
        showNotice(error.message || 'Registration failed')
    } finally {
        isSubmitting.value = false
    }
}

const goToLogin = () => {
    router.push('/login')
}

const openCountrySelector = () => {
    isCountrySelectorOpen.value = true
}

const closeCountrySelector = () => {
    isCountrySelectorOpen.value = false
}

const selectCountry = country => {
    selectedCountryIso.value = country.iso
    closeCountrySelector()
}
</script>

<template>
    <div class="register-page">
        <div class="desktop-register-card" aria-hidden="true">
            <div class="desktop-register-visual">
                <img :src="desktopHeroImg" alt="" class="desktop-register-hero" />
                <div class="desktop-register-brand">
                    <img :src="logoImg" alt="" class="desktop-register-logo" />
                    <div class="desktop-register-brand-copy">
                        <span>CONSTRUCT</span>
                        <span>DIGITAL</span>
                    </div>
                </div>
            </div>
        </div>

        <header class="register-header">
            <h1 class="welcome-text">Welcome To Explore</h1>
            <p class="subtitle">Sign up to access exclusive content</p>
        </header>

        <main class="register-panel">
            <div class="register-card">
                <div class="field-block">
                    <label class="field-label" for="register-username">Username</label>
                    <div class="field-shell">
                        <input
                            id="register-username"
                            v-model="username"
                            type="text"
                            class="field-input"
                            placeholder="Type Here"
                            autocomplete="username"
                            @keyup.enter="handleSignUp"
                        />
                    </div>
                </div>

                <div class="field-block">
                    <label class="field-label" for="register-password">Account Password</label>
                    <div class="field-shell with-icon">
                        <input
                            id="register-password"
                            v-model="password"
                            :type="isPasswordVisible ? 'text' : 'password'"
                            class="field-input"
                            placeholder="Type Here"
                            autocomplete="new-password"
                            @keyup.enter="handleSignUp"
                        />
                        <button type="button" class="field-eye-btn" @click="isPasswordVisible = !isPasswordVisible">
                            <span class="field-eye" :class="{ active: isPasswordVisible }"></span>
                        </button>
                    </div>
                </div>

                <div class="field-block">
                    <label class="field-label">Phone Number</label>
                    <div class="phone-row">
                        <button type="button" class="field-shell select-shell phone-code-shell" @click="openCountrySelector">
                            <span class="phone-country-name">{{ selectedCountry?.name }}</span>
                            <span class="phone-country-code">{{ selectedCountry?.dialCode }}</span>
                            <span class="select-arrow"></span>
                        </button>
                        <div class="field-shell phone-number-shell">
                            <input
                                v-model="phoneNumber"
                                type="text"
                                class="field-input"
                                placeholder="Type Here"
                                inputmode="numeric"
                            />
                        </div>
                    </div>
                </div>

                <div class="field-block">
                    <label class="field-label" for="register-referral">Referral Code</label>
                    <div class="field-shell">
                        <input
                            id="register-referral"
                            v-model="referralCode"
                            type="text"
                            class="field-input"
                            placeholder="Type Here"
                        />
                    </div>
                </div>

                <button class="signup-btn" :disabled="isSubmitting" @click="handleSignUp">
                    {{ isSubmitting ? 'SIGNING UP...' : 'SIGN UP' }}
                </button>

                <p class="login-prompt">
                    Already have an account?
                    <button type="button" class="login-link" @click="goToLogin">Log in now</button>
                </p>
            </div>
        </main>

        <footer class="register-footer">@ 2015 Construct Digital International Pte. Ltd.</footer>

        <teleport to="body">
            <AuthNoticeToast :visible="isNoticeVisible" :message="noticeMessage" />
        </teleport>

        <CountrySelectorModal
            :visible="isCountrySelectorOpen"
            :countries="COUNTRY_OPTIONS"
            :selected-iso="selectedCountryIso"
            @close="closeCountrySelector"
            @select="selectCountry"
        />
    </div>
</template>

<style scoped>
.register-page {
    min-height: 100vh;
    background: linear-gradient(180deg, #31a86d 0%, #6fa4c5 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding: 54px 16px 24px;
    box-sizing: border-box;
}

.register-header {
    width: 100%;
    max-width: 339px;
    text-align: center;
}

.welcome-text {
    margin: 0;
    color: #ffffff;
    font-size: 17px;
    line-height: 1.25;
    font-weight: 600;
}

.subtitle {
    margin: 18px 0 0;
    color: rgba(255, 255, 255, 0.92);
    font-size: 12px;
    line-height: 1.25;
}

.register-panel {
    width: 100%;
    max-width: 339px;
    margin-top: 36px;
}

.register-card {
    width: 100%;
    background: #ffffff;
    border-radius: 24px;
    padding: 16px 16px 18px;
    box-sizing: border-box;
}

.field-block + .field-block {
    margin-top: 12px;
}

.field-label {
    display: block;
    margin-bottom: 8px;
    color: #1f1f1f;
    font-size: 13px;
    line-height: 1.2;
}

.field-shell {
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
    min-height: 35px;
    border: 1px solid #cfd4d9;
    border-radius: 5px;
    background: #ffffff;
    overflow: hidden;
}

.select-shell {
    justify-content: flex-start;
    gap: 8px;
    padding: 0 12px;
    cursor: pointer;
    text-align: left;
}

.field-shell.with-icon {
    padding-right: 34px;
}

.field-input {
    width: 100%;
    height: 33px;
    border: 0;
    background: transparent;
    outline: none;
    padding: 0 12px;
    font-size: 12px;
    color: #2b2b2b;
    box-sizing: border-box;
}

.field-input::placeholder {
    color: #b8bcc2;
}

.select-value {
    min-width: 0;
    color: #2b2b2b;
    font-size: 12px;
    line-height: 1.2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.select-arrow {
    position: absolute;
    right: 12px;
    top: 50%;
    width: 8px;
    height: 8px;
    margin-top: -5px;
    border-right: 1.5px solid #8791a1;
    border-bottom: 1.5px solid #8791a1;
    transform: rotate(45deg);
}

.field-eye-btn {
    position: absolute;
    right: 8px;
    width: 18px;
    height: 18px;
    border: 0;
    background: transparent;
    padding: 0;
}

.field-eye {
    display: block;
    width: 18px;
    height: 18px;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23d7d7d7'%3E%3Cpath d='M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zm0 10a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: center;
    background-size: contain;
}

.field-eye.active {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%232a61ad'%3E%3Cpath d='M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zm0 10a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z'/%3E%3C/svg%3E");
}

.phone-row {
    display: grid;
    gap: 8px;
}

.phone-row {
    grid-template-columns: 156px minmax(0, 1fr);
}

.phone-code-shell {
    justify-content: flex-start;
    gap: 4px;
}

.phone-code-shell .select-value,
.phone-country-name,
.phone-country-code {
    padding-right: 16px;
}

.phone-country-name {
    min-width: 0;
    flex: 1;
    color: #2b2b2b;
    font-size: 12px;
    line-height: 1.2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.phone-country-code {
    flex-shrink: 0;
    color: #6b7280;
    font-size: 12px;
    line-height: 1.2;
    white-space: nowrap;
}

.signup-btn {
    width: 100%;
    height: 35px;
    margin-top: 34px;
    border: 0;
    border-radius: 6px;
    background: #2a61ad;
    color: #ffffff;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.02em;
}

.signup-btn:disabled {
    opacity: 0.7;
}

.login-prompt {
    margin: 16px 0 0;
    text-align: center;
    color: #22272b;
    font-size: 13px;
    line-height: 1.25;
}

.login-link {
    border: 0;
    background: transparent;
    padding: 0;
    color: #2eb06e;
    font: inherit;
}

.register-footer {
    margin-top: 32px;
    color: rgba(255, 255, 255, 0.86);
    font-size: 12px;
    line-height: 1.25;
    text-align: center;
}

.desktop-register-card {
    display: none;
}

@media (min-width: 481px) {
    :global(body.desktop-auth-screenshot-page) {
        background: linear-gradient(180deg, #35a46d 0%, #5a9cb6 100%);
        overflow: hidden;
    }

    :global(body.desktop-auth-screenshot-page #app),
    :global(body.desktop-auth-screenshot-page .app-shell) {
        width: 100vw;
        height: 100vh;
        min-height: 100vh;
        overflow: hidden;
        background: transparent;
    }

    .register-page {
        width: 100vw;
        height: 100vh;
        min-height: 100vh;
        display: grid;
        grid-template-columns: 306px 329px;
        align-content: center;
        justify-content: center;
        align-items: stretch;
        padding: 0 !important;
        background: linear-gradient(180deg, #35a46d 0%, #5a9cb6 100%);
        overflow: hidden;
    }

    .desktop-register-card {
        display: block;
        width: 306px;
        height: 315px;
        overflow: hidden;
        border-radius: 24px 0 0 24px;
        position: relative;
    }

    .desktop-register-visual {
        position: relative;
        width: 100%;
        height: 100%;
    }

    .desktop-register-hero {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center;
    }

    .desktop-register-brand {
        position: absolute;
        left: 20px;
        top: 21px;
        display: flex;
        align-items: center;
        gap: 9px;
        color: #ffffff;
    }

    .desktop-register-logo {
        width: 42px;
        height: 42px;
        object-fit: contain;
    }

    .desktop-register-brand-copy {
        display: flex;
        flex-direction: column;
        font-size: 16px;
        line-height: 1.18;
        font-weight: 500;
        letter-spacing: -0.01em;
    }

    .register-header,
    .register-footer {
        display: none;
    }

    .register-panel {
        width: 329px;
        max-width: none;
        height: 315px;
        margin: 0;
        display: flex;
    }

    .register-card {
        width: 329px;
        height: 315px;
        border-radius: 0 24px 24px 0;
        padding: 15px 18px 16px;
        overflow: hidden;
    }

    .field-block + .field-block {
        margin-top: 8px;
    }

    .field-label {
        margin-bottom: 5px;
        font-size: 12px;
        line-height: 14px;
        color: #111111;
    }

    .field-shell {
        min-height: 31px;
        border-color: #c6c8cb;
        border-radius: 5px;
    }

    .field-input {
        height: 29px;
        padding: 0 10px;
        font-size: 12px;
    }

    .field-shell.with-icon {
        padding-right: 32px;
    }

    .phone-row {
        grid-template-columns: 139px minmax(0, 1fr);
        gap: 7px;
    }

    .select-shell {
        padding: 0 10px;
        gap: 4px;
    }

    .phone-country-name,
    .phone-country-code {
        font-size: 12px;
    }

    .signup-btn {
        height: 34px;
        margin-top: 16px;
        border-radius: 5px;
        background: #2763b3;
        font-size: 12px;
        font-weight: 500;
        letter-spacing: 0;
    }

    .login-prompt {
        margin-top: 11px;
        font-size: 13px;
        line-height: 16px;
        color: #111111;
    }

    .login-link {
        color: #18a857;
    }
}

</style>
