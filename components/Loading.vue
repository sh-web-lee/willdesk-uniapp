<template>
  <div class="container" :style="{ transform: `scale(${scale})` }">
    <svg-icon class="circleContainer" name='loading' width='48' height='48'></svg-icon>
  </div>
</template>

<script>
export default {
  name: 'loading',
  props: {
    scale: {
      type: Number,
      default () {
        return 1
      }
    }
  }
}
</script>

<style scoped>
  .container {
    display: inline-block;
  }

  .circleContainer {
    /* loading动画 */
    animation: loading 0.4s linear infinite;
  }

  @keyframes loading {
    0% {
      transform: rotate(0deg);
    }

    100% {
      transform: rotate(360deg);
    }
  }
</style>
