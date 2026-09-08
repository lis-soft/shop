import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import RecordView from '@/views/RecordView.vue'
import ProcessView from '@/views/ProcessView.vue'
import FinancialView from '@/views/FinancialView.vue'
import CheckView from '@/views/CheckView.vue'
import ProfileView from '@/views/ProfileView.vue'
import EditProfileView from '@/views/EditProfileView.vue'
import UserModeView from '@/views/UserModeView.vue'
import EventView from '@/views/EventView.vue'
import RankView from '@/views/RankView.vue'
import TransactionView from '@/views/TransactionView.vue'
import AboutUsView from '@/views/AboutUsView.vue'
import CertificatesView from '@/views/CertificatesView.vue'
import TermsConditionsView from '@/views/TermsConditionsView.vue'
import ContactUsView from '@/views/ContactUsView.vue'
import FAQView from '@/views/FAQView.vue'
import PcLandingView from '@/views/PcLandingView.vue'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import { clearCurrentUser, currentUser, refreshCurrentUser } from '@/utils/currentUser'

const PUBLIC_ROUTE_NAMES = new Set(['login', 'register', 'contact-us', 'landing'])
let validatedToken = ''

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
    },
    {
      path: '/landing',
      name: 'landing',
      component: PcLandingView,
      meta: { desktopWidePage: true }
    },
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { hasTabBar: true }
    },
    {
      path: '/record',
      name: 'record',
      component: RecordView,
      meta: { hasTabBar: true }
    },
    {
      path: '/process',
      name: 'process',
      component: ProcessView,
      meta: { hasTabBar: true }
    },
    {
      path: '/finance',
      name: 'finance',
      component: FinancialView,
      meta: { hasTabBar: true }
    },
    {
      path: '/checkin',
      name: 'checkin',
      component: CheckView,
      meta: { hasTabBar: true }
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
    },
    {
      path: '/edit-profile',
      name: 'edit-profile',
      component: EditProfileView,
    },
    {
      path: '/user-mode',
      name: 'user-mode',
      component: UserModeView,
    },
    {
      path: '/event',
      name: 'event',
      component: EventView,
    },
    {
      path: '/rank',
      name: 'rank',
      component: RankView,
    },
    {
      path: '/transaction',
      name: 'transaction',
      component: TransactionView,
    },
    {
      path: '/about-us',
      name: 'about-us',
      component: AboutUsView,
    },
    {
      path: '/certificates',
      name: 'certificates',
      component: CertificatesView,
    },
    {
      path: '/terms-conditions',
      name: 'terms-conditions',
      component: TermsConditionsView,
    },
    {
      path: '/faqs',
      name: 'faqs',
      component: FAQView,
    },
    {
      path: '/contact-us',
      name: 'contact-us',
      component: ContactUsView,
    },
  ],
})

async function validateSession() {
  const token = localStorage.getItem('token')

  if (!token) {
    validatedToken = ''
    clearCurrentUser()
    return false
  }

  if (validatedToken === token && currentUser.value) {
    return true
  }

  try {
    await refreshCurrentUser()
    validatedToken = token
    return true
  } catch (error) {
    const message = String(error?.message || '')
    const isAuthError = message.includes('401') || message.includes('未登录') || message.includes('过期') || message.includes('无效')

    if (isAuthError) {
      validatedToken = ''
      clearCurrentUser()
      return false
    }

    // Safari/iOS can fail a credentialed fetch because of transient network,
    // CORS, or Cloudflare checks. Do not turn that into a forced logout.
    validatedToken = token
    return true
  }
}

router.beforeEach(async to => {
  const isPublicRoute = PUBLIC_ROUTE_NAMES.has(String(to.name || ''))
  const token = localStorage.getItem('token')

  if (!token) {
    validatedToken = ''
    clearCurrentUser()

    if (isPublicRoute) {
      return true
    }

    return {
      name: 'landing',
      query: { redirect: to.fullPath }
    }
  }

  const isValidSession = await validateSession()

  if (!isValidSession) {
    if (isPublicRoute) {
      return true
    }

    return {
      name: 'landing',
      query: { redirect: to.fullPath }
    }
  }

  if (to.name === 'login' || to.name === 'register' || to.name === 'landing') {
    return { name: 'home' }
  }

  return true
})

export default router
