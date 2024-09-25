<template>
  <div class="h-100 d-flex flex-wrap align-center justify-space-between text-center-mobile">
    <!-- 👉 Footer: left content -->
    <span class="d-flex align-center justify-center w-100-mobile">
      &copy;
      {{ new Date().getFullYear() }}
      Made With
      <VIcon
        icon="bx-heart"
        color="error"
        size="1.25rem"
        class="mx-1"
      />
      By <a
        href="https://www.linkedin.com/in/nattapad-samakketkran-2b2374317/"
        target="_blank"
        rel="noopener noreferrer"
        class="text-primary ms-1"
      >Carrot </a>
    </span>
    <span class="d-flex align-center justify-center w-100-mobile">
      Distributed By <a
        href="https://line.me/R/ti/p/%40867fnnyy"
        target="_blank"
        rel="noopener noreferrer"
        class="text-primary ms-1"
      >Panuwat Water</a>
    </span>
    <!-- 👉 Footer: right content -->
    <span class="d-md-flex gap-x-4  d-none d-md-block justify-center w-100-mobile">
      Fork from : <a
        href="https://github.com/themeselection/sneat-vuetify-vuejs-admin-template-free"
        target="noopener noreferrer"
        class="text-primary ms-1"
      >sneat</a>
    </span>
  </div>
</template>

<style scoped>
@media (max-width: 768px) {
  .d-md-flex {
    display: flex !important;
  }
  .d-md-block {
    display: block !important;
  }
  .text-center-mobile {
    text-align: center;
  }
  .w-100-mobile {
    width: 100%;
  }
}
</style>
