<script setup>
import { onMounted, ref } from 'vue'
import StaticRichPage from '@/components/common/StaticRichPage.vue'
import { request } from '@/utils/request'

const DEFAULT_TERMS_CONTENT = '<h1>Terms Conditions</h1><h2>Brand Evaluation Service Terms</h2><p>Last Updated: April 2025</p><p>These Brand Evaluation Service Terms ("Terms") govern the provision and use of brand evaluation services provided by Grey Group Pte. Ltd., a company incorporated in Singapore ("Evaluation Party", "Company", "we", "us").</p><p>By clicking "Agree," "Submit Request," or otherwise using the brand evaluation services, you ("Client" or "User") acknowledge that you have read, understood, and agree to be legally bound by these Terms.</p><hr><h3>1. Acceptance of Terms</h3><p>Before submitting any evaluation request or receiving any evaluation report, you must carefully read and fully understand these Terms. Your continued use of the brand evaluation services constitutes your acceptance of these Terms.</p><hr><h3>2. Service Content and Scope of Use</h3><p>Before submitting any evaluation request or receiving any evaluation report, you must carefully read and fully understand these Terms. Your continued use of the brand evaluation services constitutes your acceptance of these Terms.</p><hr><h3>3. Client Obligations</h3><p>Before submitting any evaluation request or receiving any evaluation report, you must carefully read and fully understand these Terms. Your continued use of the brand evaluation services constitutes your acceptance of these Terms.</p>'

const termsContent = ref(DEFAULT_TERMS_CONTENT)

const fetchTermsContent = async () => {
    try {
        const result = await request('/api/home/websiteConfig')
        termsContent.value = String(result?.data?.website_terms || '').trim() || DEFAULT_TERMS_CONTENT
    } catch {
        termsContent.value = DEFAULT_TERMS_CONTENT
    }
}

onMounted(() => {
    fetchTermsContent()
})
</script>

<template>
    <StaticRichPage :html-content="termsContent" />
</template>
