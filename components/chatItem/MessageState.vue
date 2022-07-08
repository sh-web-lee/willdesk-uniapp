<template>
  <view class="state">
    <!-- 加载 -->
    <loading v-if="currentState === 0"></loading>
    <!-- 失败 -->
    <view class="fail" @click="retry" v-else-if="currentState === 2">
		<image src="@/static/error.svg" mode=""></image>
    </view>

    <!-- 成功 (成功什么都不用做) -->
  </view>
</template>

<script>
import Loading from '@/components/Loading'

export default {
  name: 'messageState',
  components: { Loading },
  data () {
    return {
      // 声明一个定时器
      timer: null
    }
  },
	computed: {
		i18n() {
			return this.$t('components')
		},
	},
  props: ['currentState'],
  mounted () {
  },
  beforeDestroy () {
    clearTimeout(this.timer)
  },
  methods: {

    // 点击重新发送的回调'
    // TODO 暂时屏蔽
    retry () {
      this.$emit('update:currentState', 0)
      this.$emit('reSend')
    }
  },
  watch: {
    currentState (current) {
      if (current == 'success') {
        clearTimeout(this.timer)
      }
    }
  }
}
</script>

<style lang="less" scoped>
.state {
	position: relative;
	right: 24upx;
  .fail {
    font-family: SF-Pro;
    font-weight: 400;
    color: #e04949;
    cursor: pointer;
    display: flex;
    align-items: center;
    user-select: none;
    white-space: nowrap;
	image {
		width: 38upx;
		height: 38upx;
	}

    svg {
      margin: 0 6px;
    }
  }
}
</style>
