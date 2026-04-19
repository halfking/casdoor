<template>
  <div class="swagger-page">
    <iframe class="swagger-frame" src="/swagger/index.html" title="Swagger" />
  </div>
</template>

<style scoped>
.swagger-page {
  height: calc(100vh - 120px);
}

.swagger-frame {
  width: 100%;
  height: 100%;
  border: 0;
  background: var(--kx-bg-card, #fff);
}
</style>
