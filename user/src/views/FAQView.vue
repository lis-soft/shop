<script setup>
import { onMounted, ref } from 'vue'
import StaticRichPage from '@/components/common/StaticRichPage.vue'
import { request } from '@/utils/request'

const DEFAULT_FAQ_ITEMS = [
    {
        question: 'How do I start a task?',
        answer: 'Open the Process page, review the assigned item, and submit the required answer to complete the current step.'
    },
    {
        question: 'Why can I not withdraw right now?',
        answer: 'Please confirm your account status, completed task requirements, and linked payout information. If the issue remains, contact customer support.'
    },
    {
        question: 'Where can I find my referral code?',
        answer: 'You can view your referral code in the profile drawer. Eligible members can copy and share it directly from there.'
    }
]

const DEFAULT_FAQ_PAGE_CONTENT = '<h1>Frequently Asked Questions (FAQ)</h1><hr><h2>1. How do I start a task?</h2><p>Open the Process page, review the assigned item, and submit the required answer to complete the current step.</p><hr><h2>2. Why can I not withdraw right now?</h2><p>Please confirm your account status, completed task requirements, and linked payout information. If the issue remains, contact customer support.</p><hr><h2>3. Where can I find my referral code?</h2><p>You can view your referral code in the profile drawer. Eligible members can copy and share it directly from there.</p>'

const faqPageContent = ref(DEFAULT_FAQ_PAGE_CONTENT)

const normalizeFaqItems = rawValue => {
    const parsed = typeof rawValue === 'string'
        ? (() => {
            try {
                return JSON.parse(rawValue)
            } catch {
                return []
            }
        })()
        : rawValue

    if (!Array.isArray(parsed)) {
        return []
    }

    return parsed
        .filter(item => item && typeof item === 'object')
        .map(item => ({
            question: String(item.question || '').trim(),
            answer: String(item.answer || '').trim()
        }))
        .filter(item => item.question && item.answer)
}

const renderParagraphHtml = content => {
    return String(content || '')
        .split(/\n{2,}/)
        .map(paragraph => `<p>${paragraph.replace(/\n/g, '<br />')}</p>`)
        .join('')
}

const buildFaqPageContentFromItems = items => {
    const normalizedItems = normalizeFaqItems(items)
    if (!normalizedItems.length) {
        return DEFAULT_FAQ_PAGE_CONTENT
    }

    return normalizedItems.map((item, index) => {
        const answerHtml = /<[a-z][\s\S]*>/i.test(item.answer)
            ? item.answer
            : renderParagraphHtml(item.answer)

        return `${index === 0 ? '<h1>Frequently Asked Questions (FAQ)</h1><hr>' : '<hr>'}<h2>${index + 1}. ${item.question}</h2>${answerHtml}`
    }).join('')
}

const normalizeFaqPageContent = rawValue => {
    const content = String(rawValue || '').trim()
    if (!content) {
        return DEFAULT_FAQ_PAGE_CONTENT
    }

    if (/<[a-z][\s\S]*>/i.test(content)) {
        return content
    }

    return renderParagraphHtml(content)
}

const fetchFaqPageContent = async () => {
    try {
        const result = await request('/api/home/websiteConfig')
        const content = String(result?.data?.faq_page_content || '').trim()

        faqPageContent.value = content
            ? normalizeFaqPageContent(content)
            : buildFaqPageContentFromItems(result?.data?.faq_items || DEFAULT_FAQ_ITEMS)
    } catch {
        faqPageContent.value = DEFAULT_FAQ_PAGE_CONTENT
    }
}

onMounted(() => {
    fetchFaqPageContent()
})
</script>

<template>
    <StaticRichPage :html-content="faqPageContent" />
</template>
