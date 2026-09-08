const MOBILE_FRAME_WIDTH = 375
const DESKTOP_FRAME_WIDTH = Math.round(MOBILE_FRAME_WIDTH * 2)
const DESKTOP_FRAME_SCALE_WIDTH = Math.round(MOBILE_FRAME_WIDTH * 5 / 3)
const DESKTOP_FRAME_CONTENT_SCALE = 0.7
const DESKTOP_FRAME_THRESHOLD = 480
const DESKTOP_FRAME_HORIZONTAL_GAP = 24
const DESKTOP_FRAME_VERTICAL_GAP = 0
let hasBoundHorizontalWheel = false
let hasBoundViewportObserver = false

function getNormalizedPathname() {
    return window.location.pathname.replace(/\/+$/, '') || '/'
}

function isDesktopWidePage() {
    const pathname = getNormalizedPathname()
    return pathname === '/landing' || document.querySelector('.app-shell.desktop-wide-page') !== null
}

function isAuthScreenshotPage() {
    const pathname = getNormalizedPathname()
    return pathname === '/login' || pathname === '/register'
}

function isHomePage() {
    return getNormalizedPathname() === '/'
}

function isRecordPage() {
    return getNormalizedPathname() === '/record'
}

function isProcessPage() {
    return getNormalizedPathname() === '/process'
}

function isFinancePage() {
    return getNormalizedPathname() === '/finance'
}

function isCheckinPage() {
    return getNormalizedPathname() === '/checkin'
}

function isProfilePage() {
    return getNormalizedPathname() === '/profile'
}

function isDesktopProfileRelatedPage() {
    const pathname = getNormalizedPathname()
    return [
        '/profile',
        '/edit-profile',
        '/user-mode',
        '/event',
        '/rank',
        '/transaction',
        '/about-us',
        '/certificates',
        '/terms-conditions',
        '/faqs',
        '/contact-us'
    ].includes(pathname)
}

function matchesDesktopWorkspacePage() {
    const pathname = getNormalizedPathname()
    return pathname === '/' || pathname === '/record' || pathname === '/process' || pathname === '/finance' || pathname === '/checkin' || isDesktopProfileRelatedPage() || document.querySelector('.desktop-workspace-shell') !== null
}

function isHorizontallyScrollable(element) {
    if (!(element instanceof HTMLElement)) {
        return false
    }

    if (element.scrollWidth <= element.clientWidth + 1) {
        return false
    }

    const style = window.getComputedStyle(element)
    return style.overflowX === 'auto' || style.overflowX === 'scroll'
}

function canScrollHorizontally(element, delta) {
    if (delta < 0) {
        return element.scrollLeft > 0
    }

    if (delta > 0) {
        return element.scrollLeft + element.clientWidth < element.scrollWidth - 1
    }

    return false
}

function findHorizontalScrollParent(startNode) {
    let current = startNode instanceof HTMLElement ? startNode : startNode?.parentElement || null

    while (current && current !== document.body) {
        if (isHorizontallyScrollable(current)) {
            return current
        }

        current = current.parentElement
    }

    return null
}

function bindDesktopHorizontalWheelSupport() {
    if (hasBoundHorizontalWheel) {
        return
    }

    const handleWheel = event => {
        if (!document.body.classList.contains('desktop-mobile-frame')) {
            return
        }

        const scrollParent = findHorizontalScrollParent(event.target)
        if (!scrollParent) {
            return
        }

        const dominantDelta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY
        if (!dominantDelta || !canScrollHorizontally(scrollParent, dominantDelta)) {
            return
        }

        event.preventDefault()
        scrollParent.scrollLeft += dominantDelta
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    hasBoundHorizontalWheel = true
}

function syncMobileViewport() {
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth || MOBILE_FRAME_WIDTH
    const isDesktopFrame = viewportWidth > DESKTOP_FRAME_THRESHOLD
    const isWidePage = isDesktopWidePage()
    const isAuthPage = isAuthScreenshotPage()
    const isDesktopHomePage = isDesktopFrame && isHomePage()
    const isDesktopRecordPage = isDesktopFrame && isRecordPage()
    const isDesktopProcessPage = isDesktopFrame && isProcessPage()
    const isDesktopFinancePage = isDesktopFrame && isFinancePage()
    const isDesktopCheckinPage = isDesktopFrame && isCheckinPage()
    const isDesktopProfilePage = isDesktopFrame && isProfilePage()
    const isDesktopProfileRelated = isDesktopFrame && isDesktopProfileRelatedPage()
    const isDesktopWorkspacePage = isDesktopFrame && matchesDesktopWorkspacePage()
    const isAuthDesktopPage = isDesktopFrame && isAuthPage
    const shouldUseDesktopFrame = isDesktopFrame && !isWidePage && !isAuthPage && !isDesktopWorkspacePage
    const shouldUseFullWidthDesktopFrame = false
    const maxDesktopFrameWidth = Math.max(viewportWidth - DESKTOP_FRAME_HORIZONTAL_GAP * 2, MOBILE_FRAME_WIDTH)
    const desktopFrameWidth = Math.min(DESKTOP_FRAME_WIDTH, maxDesktopFrameWidth)
    const frameWidth = shouldUseFullWidthDesktopFrame ? viewportWidth : shouldUseDesktopFrame ? desktopFrameWidth : viewportWidth
    const desktopScaleWidth = Math.min(frameWidth, DESKTOP_FRAME_SCALE_WIDTH)
    const rootFontSize = shouldUseDesktopFrame
        ? desktopScaleWidth / 10 * DESKTOP_FRAME_CONTENT_SCALE
        : isDesktopFrame && (isWidePage || isAuthPage || isDesktopWorkspacePage)
            ? MOBILE_FRAME_WIDTH / 10
            : frameWidth / 10
    const frameGap = shouldUseDesktopFrame && !shouldUseFullWidthDesktopFrame ? DESKTOP_FRAME_HORIZONTAL_GAP : 0
    const frameLeft = shouldUseDesktopFrame && !shouldUseFullWidthDesktopFrame ? `${Math.max((viewportWidth - frameWidth) / 2, DESKTOP_FRAME_HORIZONTAL_GAP)}px` : '0px'
    const frameVerticalGap = shouldUseDesktopFrame && !shouldUseFullWidthDesktopFrame ? DESKTOP_FRAME_VERTICAL_GAP : 0

    document.documentElement.style.fontSize = `${rootFontSize}px`
    document.documentElement.style.setProperty('--app-frame-width', `${frameWidth}px`)
    document.documentElement.style.setProperty('--app-frame-gap', `${frameGap}px`)
    document.documentElement.style.setProperty('--app-frame-horizontal-gap', `${frameGap}px`)
    document.documentElement.style.setProperty('--app-frame-vertical-gap', `${frameVerticalGap}px`)
    document.documentElement.style.setProperty('--app-frame-left', frameLeft)
    document.documentElement.classList.toggle('desktop-mobile-frame', shouldUseDesktopFrame && !isDesktopWorkspacePage)
    document.documentElement.classList.toggle('desktop-wide-page', isWidePage)
    document.documentElement.classList.toggle('desktop-auth-screenshot-page', isAuthDesktopPage)
    document.documentElement.classList.toggle('desktop-home-page', isDesktopHomePage)
    document.documentElement.classList.toggle('desktop-record-page', isDesktopRecordPage)
    document.documentElement.classList.toggle('desktop-process-page', isDesktopProcessPage)
    document.documentElement.classList.toggle('desktop-finance-page', isDesktopFinancePage)
    document.documentElement.classList.toggle('desktop-checkin-page', isDesktopCheckinPage)
    document.documentElement.classList.toggle('desktop-profile-page', isDesktopProfilePage)
    document.documentElement.classList.toggle('desktop-profile-related-page', isDesktopProfileRelated)
    document.documentElement.classList.toggle('desktop-workspace-page', isDesktopWorkspacePage)
    document.body.classList.toggle('desktop-mobile-frame', shouldUseDesktopFrame && !isDesktopWorkspacePage)
    document.body.classList.toggle('desktop-wide-page', isWidePage)
    document.body.classList.toggle('desktop-auth-screenshot-page', isAuthDesktopPage)
    document.body.classList.toggle('desktop-home-page', isDesktopHomePage)
    document.body.classList.toggle('desktop-record-page', isDesktopRecordPage)
    document.body.classList.toggle('desktop-process-page', isDesktopProcessPage)
    document.body.classList.toggle('desktop-finance-page', isDesktopFinancePage)
    document.body.classList.toggle('desktop-checkin-page', isDesktopCheckinPage)
    document.body.classList.toggle('desktop-profile-page', isDesktopProfilePage)
    document.body.classList.toggle('desktop-profile-related-page', isDesktopProfileRelated)
    document.body.classList.toggle('desktop-workspace-page', isDesktopWorkspacePage)
}

function bindViewportObserver() {
    if (hasBoundViewportObserver || typeof MutationObserver === 'undefined') {
        return
    }

    const appRoot = document.getElementById('app')
    if (!appRoot) {
        return
    }

    let pending = false
    const scheduleSync = () => {
        if (pending) {
            return
        }

        pending = true
        window.requestAnimationFrame(() => {
            pending = false
            syncMobileViewport()
        })
    }

    const observer = new MutationObserver(scheduleSync)
    observer.observe(appRoot, {
        attributes: true,
        attributeFilter: ['class'],
        childList: true,
        subtree: true
    })

    hasBoundViewportObserver = true
}

export function initMobileViewport() {
    const handleResize = () => {
        window.requestAnimationFrame(syncMobileViewport)
    }

    bindDesktopHorizontalWheelSupport()
    syncMobileViewport()
    bindViewportObserver()
    window.requestAnimationFrame(syncMobileViewport)
    window.addEventListener('resize', handleResize, { passive: true })
    window.addEventListener('orientationchange', handleResize, { passive: true })
}
