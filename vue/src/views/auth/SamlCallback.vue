<template>
  <div style="display:flex;justify-content:center;align-items:center;min-height:100vh;">
    <a-spin size="large" />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { goToLink, createFormAndSubmit } from '@/utils/auth-util'

const route = useRoute()

onMounted(async () => {
  const params = new URLSearchParams(window.location.search)
  const samlResponse = params.get('SAMLResponse')
  const relayState = params.get('RelayState')

  if (!samlResponse) {
    goToLink('/login')
    return
  }

  // Forward SAML response to the application
  const innerParams = new URLSearchParams(route.query.state as string ? atob(route.query.state as string) : '')
  const redirectUrl = innerParams.get('redirect_uri') || innerParams.get('redirect_url')

  if (redirectUrl) {
    createFormAndSubmit(redirectUrl, {
      SAMLResponse: samlResponse,
      RelayState: relayState || '',
    })
  }
})
</script>
