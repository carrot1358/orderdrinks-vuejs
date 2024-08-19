<template>
  <div id="lottie-animation" ref="lottieContainer" :style="{ width: width, height: height }"></div>
</template>

<script>
import lottie from 'lottie-web';

export default {
  name: 'LottieAnimation',
  props: {
    animationPath: {
      type: String,
      required: true
    },
    width: {
      type: String,
      default: '100px'
    },
    height: {
      type: String,
      default: '100px'
    }
  },
  mounted() {
    lottie.loadAnimation({
      container: this.$refs.lottieContainer,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: this.animationPath
    });
  }
}
</script>

<style scoped>
#lottie-animation {
  width: var(--width);
  height: var(--height);
}
</style>
