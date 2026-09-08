<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AuthNoticeToast from '@/components/auth/AuthNoticeToast.vue'
import logoImg from '@/assets/static/img/common/logo.png'
import desktopHeroImg from '@/assets/static/img/home/Rectangle 462.png'
import { request } from '@/utils/request'
import { refreshCurrentUser, setCurrentUser } from '@/utils/currentUser'

const REMEMBERED_USERNAME_KEY = 'rememberedUsername'
const REMEMBERED_PASSWORD_KEY = 'rememberedPassword'
const router = useRouter()
const route = useRoute()
const username = ref('')
const password = ref('')
const rememberMe = ref(false)
const isSubmitting = ref(false)
const noticeMessage = ref('')
const isNoticeVisible = ref(false)
let noticeTimer = null

onMounted(() => {
    const rememberedUsername = localStorage.getItem(REMEMBERED_USERNAME_KEY)
    const rememberedPassword = localStorage.getItem(REMEMBERED_PASSWORD_KEY)

    if (rememberedUsername && rememberedPassword) {
        username.value = rememberedUsername
        password.value = rememberedPassword
        rememberMe.value = true
    }
})

watch(rememberMe, isRemembered => {
    if (isRemembered) {
        return
    }

    localStorage.removeItem(REMEMBERED_USERNAME_KEY)
    localStorage.removeItem(REMEMBERED_PASSWORD_KEY)
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

const handleLogin = async () => {
    if (isSubmitting.value) {
        return
    }

    const normalizedUsername = username.value.trim()
    const normalizedPassword = password.value.trim()

    if (!normalizedUsername) {
        showNotice('Please enter your username')
        return
    }

    if (!normalizedPassword) {
        showNotice('Please enter your password')
        return
    }

    isSubmitting.value = true

    try {
        const result = await request('/api/index/login', {
            method: 'POST',
            body: JSON.stringify({
                username: normalizedUsername,
                password: normalizedPassword
            })
        })

        const token = result?.data?.token
        const userInfo = result?.data?.userInfo

        if (!token) {
            throw new Error('Login failed')
        }

        localStorage.setItem('token', token)

        const refreshedUserInfo = await refreshCurrentUser().catch(() => null)

        if (!refreshedUserInfo && userInfo) {
            setCurrentUser(userInfo)
        }

        if (rememberMe.value) {
            localStorage.setItem(REMEMBERED_USERNAME_KEY, normalizedUsername)
            localStorage.setItem(REMEMBERED_PASSWORD_KEY, normalizedPassword)
        } else {
            localStorage.removeItem(REMEMBERED_USERNAME_KEY)
            localStorage.removeItem(REMEMBERED_PASSWORD_KEY)
        }

        const redirectPath = typeof route.query.redirect === 'string' && route.query.redirect
            ? route.query.redirect
            : '/'

        router.push(redirectPath)
    } catch (error) {
        showNotice(error.message || 'Login failed')
    } finally {
        isSubmitting.value = false
    }
}

const goToSignUp = () => {
    router.push('/register')
}

const goToContactUs = () => {
    router.push('/contact-us')
}
</script>

<template>
    <div class="login-page">
        <div class="desktop-login-card" aria-hidden="true">
            <div class="desktop-login-visual">
                <img :src="desktopHeroImg" alt="" class="desktop-login-hero" />
                <div class="desktop-login-brand">
                    <img :src="logoImg" alt="" class="desktop-login-logo" />
                    <div class="desktop-login-brand-copy">
                        <span>CONSTRUCT</span>
                        <span>DIGITAL</span>
                    </div>
                </div>
            </div>
        </div>

        <header class="login-header">
            <div class="brand-lockup">
                <img :src="logoImg" alt="Construct Digital" class="brand-logo" />
                <div class="brand-copy">
                    <span class="brand-line">CONSTRUCT</span>
                    <span class="brand-line">DIGITAL</span>
                </div>
            </div>
            <h1 class="welcome-text">Welcome to Construct Digital</h1>
        </header>

        <main class="login-panel">
            <div class="login-card">
                <div class="field-block">
                    <label class="field-label" for="login-username">Username</label>
                    <div class="field-shell with-badge">
                        <input
                            id="login-username"
                            v-model="username"
                            type="text"
                            class="field-input"
                            placeholder="Type Here"
                            autocomplete="username"
                            @keyup.enter="handleLogin"
                        />
                        <span class="field-badge" aria-hidden="true"></span>
                    </div>
                </div>

                <div class="field-block">
                    <label class="field-label" for="login-password">Password</label>
                    <div class="field-shell">
                        <input
                            id="login-password"
                            v-model="password"
                            type="password"
                            class="field-input"
                            placeholder="Type Here"
                            autocomplete="current-password"
                            @keyup.enter="handleLogin"
                        />
                    </div>
                </div>

                <div class="meta-row">
                    <label class="remember-toggle">
                        <input type="checkbox" v-model="rememberMe" class="remember-input" />
                        <span class="remember-mark"></span>
                        <span class="remember-text">Remember me</span>
                    </label>
                    <button type="button" class="forgot-link" @click="goToContactUs">Forgot Password?</button>
                </div>

                <button class="login-btn" :disabled="isSubmitting" @click="handleLogin">
                    {{ isSubmitting ? 'LOGGING IN...' : 'LOG IN' }}
                </button>

                <p class="signup-prompt">
                    Don’t have an account?
                    <button type="button" class="signup-link" @click="goToSignUp">Sign Up</button>
                </p>
            </div>
        </main>

        <footer class="login-footer">@ 2015 Construct Digital International Pte. Ltd.</footer>

        <teleport to="body">
            <AuthNoticeToast :visible="isNoticeVisible" :message="noticeMessage" />
        </teleport>
    </div>
</template>

<style scoped>
.login-page {
    min-height: 100vh;
    background: linear-gradient(180deg, #31a86d 0%, #6fa4c5 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding: 62px 16px 24px;
    box-sizing: border-box;
}

.login-header {
    width: 100%;
    max-width: 336px;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.brand-lockup {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
}

.brand-logo {
    width: 46px;
    height: 46px;
    object-fit: contain;
}

.brand-copy {
    display: flex;
    flex-direction: column;
    text-align: left;
}

.brand-line {
    color: #ffffff;
    font-size: 14px;
    font-weight: 500;
    line-height: 1.1;
    letter-spacing: 0;
    text-transform: uppercase;
}

.welcome-text {
    color: #ffffff;
    font-size: 16px;
    font-weight: 500;
    line-height: 1.25;
    margin: 94px 0 0;
    text-align: center;
}

.login-panel {
    width: 100%;
    max-width: 336px;
    margin-top: 44px;
}

.login-card {
    width: 100%;
    background: #ffffff;
    border-radius: 23px;
    padding: 17px 16px 19px;
    box-sizing: border-box;
    box-shadow: none;
}

.field-block + .field-block {
    margin-top: 14px;
}

.field-label {
    display: block;
    color: #1d1d1d;
    font-size: 13px;
    line-height: 1.2;
    margin-bottom: 8px;
}

.field-shell {
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
    min-height: 36px;
    border: 1px solid #ccd1d6;
    border-radius: 5px;
    background: #ffffff;
}

.field-shell.with-badge {
    padding-right: 36px;
}

.field-input {
    width: 100%;
    height: 34px;
    border: 0;
    outline: none;
    background: transparent;
    padding: 0 12px;
    font-size: 12px;
    color: #2f2f2f;
    box-sizing: border-box;
}

.field-input::placeholder {
    color: #b9bec4;
}

.field-badge {
    position: absolute;
    right: 8px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background-color: #f2f4f3;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2331a86d'%3E%3Cpath d='M17.65 6.35A7.95 7.95 0 0 0 12 4V1L7 6l5 5V7a5 5 0 1 1-5 5H5a7 7 0 1 0 12.65-5.65z'/%3E%3C/svg%3E");
    background-position: center;
    background-repeat: no-repeat;
    background-size: 12px 12px;
}

.meta-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-top: 10px;
    margin-bottom: 34px;
}

.remember-toggle {
    display: inline-flex;
    align-items: center;
    color: #555c62;
    cursor: pointer;
}

.remember-input {
    display: none;
}

.remember-mark {
    width: 12px;
    height: 12px;
    border: 1px solid #c8ced4;
    border-radius: 50%;
    background: #ffffff;
    margin-right: 7px;
    box-sizing: border-box;
    position: relative;
}

.remember-input:checked + .remember-mark::after {
    content: '';
    position: absolute;
    inset: 2px;
    border-radius: 50%;
    background: #31a86d;
}

.remember-text,
.forgot-link {
    font-size: 12px;
    line-height: 1.2;
}

.forgot-link {
    color: #555c62;
    background: transparent;
    border: 0;
    padding: 0;
    font: inherit;
    cursor: pointer;
}

.login-btn {
    width: 100%;
    height: 34px;
    background-color: #2a61ad;
    color: #ffffff;
    border: none;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    letter-spacing: 0.02em;
}

.login-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.signup-prompt {
    text-align: center;
    font-size: 13px;
    color: #23272b;
    margin: 12px 0 0;
}

.signup-link {
    color: #2eb06e;
    background: transparent;
    border: 0;
    padding: 0;
    font: inherit;
    font-weight: 600;
    cursor: pointer;
}

.login-footer {
    margin-top: 20px;
    color: #ffffff;
    font-size: 12px;
    opacity: 0.78;
    text-align: center;
    padding-bottom: 0;
}

.desktop-login-card {
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

    .login-page {
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

    .desktop-login-card {
        display: block;
        width: 306px;
        height: 315px;
        overflow: hidden;
        border-radius: 24px 0 0 24px;
        position: relative;
    }

    .desktop-login-visual {
        position: relative;
        width: 100%;
        height: 100%;
    }

    .desktop-login-hero {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center;
    }

    .desktop-login-brand {
        position: absolute;
        left: 20px;
        top: 21px;
        display: flex;
        align-items: center;
        gap: 9px;
        color: #ffffff;
    }

    .desktop-login-logo {
        width: 42px;
        height: 42px;
        object-fit: contain;
    }

    .desktop-login-brand-copy {
        display: flex;
        flex-direction: column;
        font-size: 16px;
        line-height: 1.18;
        font-weight: 500;
        letter-spacing: -0.01em;
    }

    .login-header,
    .login-footer {
        display: none;
    }

    .login-panel {
        width: 329px;
        max-width: none;
        height: 315px;
        margin: 0;
        display: flex;
    }

    .login-card {
        width: 329px;
        height: 315px;
        border-radius: 0 24px 24px 0;
        padding: 20px 18px 20px;
        box-shadow: none;
    }

    .field-block + .field-block {
        margin-top: 15px;
    }

    .field-label {
        font-size: 13px;
        line-height: 16px;
        margin-bottom: 6px;
        color: #111111;
    }

    .field-shell {
        min-height: 38px;
        border-color: #c6c8cb;
        border-radius: 5px;
    }

    .field-input {
        height: 36px;
        padding: 0 10px;
        font-size: 12px;
    }

    .field-badge {
        right: 8px;
        width: 20px;
        height: 20px;
        background-size: 12px 12px;
    }

    .meta-row {
        margin-top: 11px;
        margin-bottom: 42px;
        gap: 10px;
    }

    .remember-mark {
        width: 13px;
        height: 13px;
        margin-right: 7px;
    }

    .remember-text,
    .forgot-link {
        font-size: 12px;
        line-height: 14px;
        color: #4f5359;
    }

    .login-btn {
        height: 37px;
        border-radius: 5px;
        background: #2763b3;
        font-size: 12px;
        font-weight: 500;
        letter-spacing: 0;
    }

    .signup-prompt {
        margin-top: 16px;
        font-size: 13px;
        line-height: 16px;
        color: #111111;
    }

    .signup-link {
        color: #18a857;
        font-weight: 400;
    }
}

</style>
