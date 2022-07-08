<template>
  <div class="ProgressBar" :style="{width:`${width}px`}">
    <div class="currentProgress" :style="{'background-color':color, width: `${progress}%`}"></div>
  </div>
</template>

<script>
export default {
  name: 'ProgressBar',
  props: {
    color: {
      type: String,
      default: '#3b59fe'
    },
    width: {
      type: Number,
      default: 100
    },
    // 当前进度(百分比)
    progress: {
      type: Number,
      default: 0
    }
  },
  data () {
    return {
    }
  }
}
</script>

<style scoped>
.ProgressBar {
  position: relative;
  background-color: #dadada;
  border-radius: 2px;
  height: 4px;
}

.currentProgress {
  position: absolute;
  border-radius: 2px;
  height: 100%;
  transition: 0.3s all ease;
}
</style>
