<script setup>
import {useTheme} from 'vuetify'
import illustrationJohnDark from '@images/cards/illustration-john-dark.png'
import illustrationJohnLight from '@images/cards/illustration-john-light.png'

const {global} = useTheme()
const illustrationJohn = computed(() => global.name.value === 'dark' ? illustrationJohnDark : illustrationJohnLight)
</script>

<template>
  <div id="page">
    <VCard class="text-center text-sm-start">
      <VRow no-gutters>
        <VCol
          cols="12"
          order="2"
          order-sm="1"
          sm="8"
        >
          <VCardItem>
            <VCardTitle class="text-md-h5 text-primary">
              ยินดีต้อนรับ 🎉
            </VCardTitle>
          </VCardItem>

          <VCardText>
          <span>
            ยินดีต้อนรับสู่แดชบอร์ด OrderDrinks!
            <br>
            ลงทะเบียนเพื่อรับประสบการณ์ OrderDrinks แบบเต็มรูปแบบ
          </span>
            <br>
            <VBtn
              class="mt-4"
              size="medium"
              variant="tonal"
              height="2000"
            >
              ลงทะเบียน
            </VBtn>
          </VCardText>
        </VCol>

        <VCol
          class="text-center"
          cols="12"
          order="1"
          order-sm="2"
          sm="4"
        >
          <img
            :class="$vuetify.display.xs ? 'mt-6 mb-n2' : 'position-absolute'"
            :height="$vuetify.display.xs ? '150' : '175'"
            :src="illustrationJohn"
            class="john-illustration flip-in-rtl"
          >
        </VCol>
      </VRow>
    </VCard>
  </div>
</template>

<style lang="scss" scoped>
@import url('https://fonts.googleapis.com/css2?family=Kanit:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');

.john-illustration {
  inset-block-end: -0.0625rem;
  inset-inline-end: 3rem;
}
</style>
