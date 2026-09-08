<script setup>
import { inject } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import home1 from '@/assets/static/img/common/home-1.png'
import home2 from '@/assets/static/img/common/home-2.png'
import record1 from '@/assets/static/img/common/record-1.png'
import record2 from '@/assets/static/img/common/record-2.png'
import record2_1 from '@/assets/static/img/common/record-2-1.png'
import finance1 from '@/assets/static/img/common/Financial Information-1.png'
import finance2 from '@/assets/static/img/common/Financial Information-2.png'
import checkin1 from '@/assets/static/img/common/Check In Salary-1.png'
import checkin2 from '@/assets/static/img/common/Check In Salary-2.png'

const router = useRouter()
const route = useRoute()
const profileState = inject('profileState')

const navigateTo = path => {
    router.push(path)
}
</script>

<template>
    <nav v-if="!profileState.isOpen.value" class="app-tabbar mobile-frame-fixed mobile-frame-bottom">
        <div class="tab-item" :class="{ active: route.path === '/' }" @click="navigateTo('/')">
            <img :src="route.path === '/' ? home2 : home1" alt="Home" class="tab-icon" />
        </div>
        <div class="tab-item" :class="{ active: route.path === '/record' }" @click="navigateTo('/record')">
            <div class="icon-stack">
                <img :src="route.path === '/record' ? record2 : record1" alt="Doc" class="tab-icon" />
                <img v-if="route.path === '/record'" :src="record2_1" alt="Badge" class="badge-icon" />
            </div>
        </div>
        <div class="tab-center" @click="navigateTo('/process')">
            <div class="center-circle">
                <div class="center-stack">
                    <img src="@/assets/static/img/common/middle.png" alt="Main" class="center-icon" />
                </div>
            </div>
        </div>
        <div class="tab-item" :class="{ active: route.path === '/finance' }" @click="navigateTo('/finance')">
            <img :src="route.path === '/finance' ? finance2 : finance1" alt="Wallet" class="tab-icon" />
        </div>
        <div class="tab-item" :class="{ active: route.path === '/checkin' }" @click="navigateTo('/checkin')">
            <div class="icon-stack">
                <img :src="route.path === '/checkin' ? checkin2 : checkin1" alt="Calendar" class="tab-icon" />
                <img src="@/assets/static/img/common/Check In Salary-2-1.png" alt="Badge" class="badge-icon" />
            </div>
        </div>
    </nav>
</template>

<style scoped>
.app-tabbar {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 1.28rem;
    background-color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 0.16rem;
    box-shadow: 0 -2px 15px rgba(0, 0, 0, 0.03);
    z-index: 1000;
}

.tab-item {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
}

.tab-icon {
    width: 0.56rem;
    height: 0.56rem;
    object-fit: contain;
}

.icon-stack {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
}

.badge-icon {
    position: absolute;
    width: 0.32rem;
    height: 0.32rem;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    object-fit: contain;
}

.tab-center {
    flex: 1;
    display: flex;
    justify-content: center;
    position: relative;
    height: 100%;
}

.center-circle {
    position: absolute;
    top: -0.42rem;
    width: 1.18rem;
    height: 1.18rem;
    background-color: #1d58a7;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0.05rem 0.18rem rgba(29, 88, 167, 0.22);
}

.center-icon {
    width: 0.6rem;
    height: 0.6rem;
    object-fit: contain;
    filter: brightness(0) invert(1);
}

.center-stack {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>
