<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import BackActionBar from '@/components/common/BackActionBar.vue'
import DesktopSidebar from '@/components/DesktopSidebar.vue'
import { resolveFileUrl } from '@/utils/currentUser'

const router = useRouter()

const props = defineProps({
    htmlContent: {
        type: String,
        default: ''
    }
})

const goBack = () => {
    router.back()
}

const renderParagraphHtml = content => {
    return String(content || '')
        .split(/\n{2,}/)
        .map(paragraph => `<p>${paragraph.replace(/\n/g, '<br />')}</p>`)
        .join('')
}

const normalizedHtmlContent = computed(() => {
    const content = String(props.htmlContent || '').trim()
    if (!content) {
        return ''
    }

    const baseHtml = /<[a-z][\s\S]*>/i.test(content) ? content : renderParagraphHtml(content)

    if (typeof document === 'undefined') {
        return baseHtml
    }

    const container = document.createElement('div')
    container.innerHTML = baseHtml

    container.querySelectorAll('img, source, video').forEach(node => {
        const currentSrc = node.getAttribute('src')
        if (
            currentSrc
            && !/^(https?:)?\/\//i.test(currentSrc)
            && !currentSrc.startsWith('data:')
            && !currentSrc.startsWith('blob:')
            && !currentSrc.startsWith('/assets/')
            && !currentSrc.startsWith('assets/')
        ) {
            node.setAttribute('src', resolveFileUrl(currentSrc))
        }
    })

    return container.innerHTML
})
</script>

<template>
    <div class="static-rich-page desktop-workspace-shell">
        <DesktopSidebar />
        <BackActionBar @back="goBack" />

        <main class="content-area">
            <div class="rich-content" v-html="normalizedHtmlContent"></div>
        </main>
    </div>
</template>

<style scoped>
.static-rich-page {
    min-height: 100vh;
    background: #ffffff;
    color: #000000;
    position: relative;
}

.content-area {
    padding: 0.24rem 0.24rem 0.8rem;
}

.static-rich-page :deep(.top-action) {
    position: absolute;
    top: 0.24rem;
    right: 0.24rem;
    z-index: 2;
    padding: 0;
}

.rich-content {
    color: #000000;
}

.rich-content :deep(h1) {
    margin: 0 0 0.42rem;
    color: #000000;
    font-size: 0.5rem;
    line-height: 1.35;
    font-weight: 700;
}

.rich-content :deep(h2) {
    margin: 0.34rem 0 0.24rem;
    color: #000000;
    font-size: 0.28rem;
    line-height: 1.42;
    font-weight: 600;
}

.rich-content :deep(h3) {
    margin: 0.28rem 0 0.18rem;
    color: #000000;
    font-size: 0.26rem;
    line-height: 1.45;
    font-weight: 600;
}

.rich-content :deep(p) {
    margin: 0 0 0.18rem;
    color: #000000;
    font-size: 0.26rem;
    line-height: 1.55;
}

.rich-content :deep(hr) {
    border: 0;
    border-top: 1px solid #111111;
    margin: 0.34rem 0;
}

.rich-content :deep(ul),
.rich-content :deep(ol) {
    margin: 0 0 0.18rem;
    padding-left: 0.34rem;
    color: #000000;
    font-size: 0.26rem;
    line-height: 1.55;
}

.rich-content :deep(li) {
    margin-bottom: 0.12rem;
}

.rich-content :deep(img) {
    display: block;
    max-width: 100%;
    height: auto;
    margin: 0.24rem auto;
}

.rich-content :deep(a) {
    color: #1d58a7;
    word-break: break-word;
}

@media (min-width: 481px) {
    :global(body.desktop-profile-related-page .static-rich-page) {
        width: 100vw;
        height: 100vh;
        min-height: 100vh;
        padding-left: var(--desktop-sidebar-width) !important;
        background: #ffffff;
        overflow-y: auto;
        overflow-x: hidden;
        box-sizing: border-box;
    }

    :global(body.desktop-profile-related-page .static-rich-page .top-action) {
        display: none;
    }

    :global(body.desktop-profile-related-page .static-rich-page .content-area) {
        width: var(--desktop-content-width);
        margin-left: var(--desktop-content-left-gap);
        padding: clamp(30px, 4vh, 48px) 0 clamp(42px, 6vh, 72px);
        box-sizing: border-box;
    }

    :global(body.desktop-profile-related-page .static-rich-page .rich-content) {
        padding: clamp(26px, 3vw, 40px);
        border-radius: 12px;
        background: #ffffff;
        box-shadow: 0 10px 28px rgba(15, 23, 42, 0.08);
        border: 1px solid rgba(226, 232, 240, 0.9);
    }

    :global(body.desktop-profile-related-page .static-rich-page .rich-content h1) {
        margin-bottom: 28px;
        font-size: clamp(28px, 3vw, 42px);
        line-height: 1.25;
    }

    :global(body.desktop-profile-related-page .static-rich-page .rich-content h2) {
        margin: 26px 0 14px;
        font-size: clamp(18px, 1.7vw, 24px);
        line-height: 1.35;
    }

    :global(body.desktop-profile-related-page .static-rich-page .rich-content h3) {
        margin: 22px 0 12px;
        font-size: 18px;
        line-height: 1.4;
    }

    :global(body.desktop-profile-related-page .static-rich-page .rich-content p),
    :global(body.desktop-profile-related-page .static-rich-page .rich-content li) {
        font-size: 15px;
        line-height: 1.7;
    }

    :global(body.desktop-profile-related-page .static-rich-page .rich-content img) {
        max-width: min(100%, 820px);
        border-radius: 10px;
    }
}
</style>
