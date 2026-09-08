<script setup>
import { onMounted, ref } from 'vue'
import StaticRichPage from '@/components/common/StaticRichPage.vue'
import certImg from '@/assets/static/img/profile/certificates.png'
import { request } from '@/utils/request'

const DEFAULT_CERTIFICATE_PAGE_CONTENT = `<h1 style="text-align:center;">Certificates</h1><p><img src="${certImg}" alt="Certificates" /></p>`
const certificatePageContent = ref(DEFAULT_CERTIFICATE_PAGE_CONTENT)

function normalizeConfigImages(raw) {
    if (Array.isArray(raw)) {
        return raw
    }

    if (typeof raw === 'string' && raw.trim()) {
        try {
            const parsed = JSON.parse(raw)
            return Array.isArray(parsed) ? parsed : []
        } catch {
            return raw
                .split(',')
                .map(item => item.trim())
                .filter(Boolean)
        }
    }

    return []
}

function buildCertificatePageContentFromLegacy(payload = {}) {
    const image = normalizeConfigImages(payload.certificate_image)
        .find(Boolean)

    const title = String(payload.certificate_title || '').trim() || 'Certificates'
    const titleAlign = ['left', 'center', 'right'].includes(String(payload.certificate_title_align || '').trim())
        ? String(payload.certificate_title_align || '').trim()
        : 'center'

    return [
        `<h1 style="text-align:${titleAlign};">${title}</h1>`,
        `<p><img src="${image || certImg}" alt="${title}" /></p>`
    ].join('')
}

async function fetchCertificatePageContent() {
    try {
        const result = await request('/api/home/websiteConfig')
        const payload = result?.data || {}

        certificatePageContent.value = String(payload.certificate_page_content || '').trim()
            || buildCertificatePageContentFromLegacy(payload)
    } catch {
        certificatePageContent.value = DEFAULT_CERTIFICATE_PAGE_CONTENT
    }
}

onMounted(() => {
    fetchCertificatePageContent()
})
</script>

<template>
    <StaticRichPage :html-content="certificatePageContent" />
</template>
