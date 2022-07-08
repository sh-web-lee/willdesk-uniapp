<template>
	<view class="status-bar flex-row" :style="{top: `calc(${navHeight}px + ${statusHeight}px)`}">
		<view class="status-icon">
			<image class="icon" src="/static/status/error.svg"></image>
		</view>
		<view class="status-text">{{statusText}}</view>
	</view>
</template>

<script>
	export default {
		name: "reconnectStatus",
		props: {
			statusText: {
				type: String,
				default: 'Reconnecting...'
			}
		},
		created() {
			this.navHeight = uni.upx2px(88)
			this.statusHeight = this.$store.state.deviceInfo.statusBarHeight
		},
		data() {
			return {
				rollTimer: null,
				navHeight: 0,
				statusHeight: 0
			};
		}
	}
</script>

<style lang="scss">
	.status-bar {
		width: 100vw;
		height: 84upx;
		background: #ffdcdc;
		position: fixed!important;
		z-index: 1;
		align-items: center;
		justify-content: center;

		.status-icon {
			width: 32upx;
			height: 32upx;

			.icon {
				width: 100%;
				height: 100%;
			}
		}

		.status-text {
			font-size: 30upx;
			margin-left: 12upx;
			line-height: 38upx;
			font-weight: 400;
			color: #FF2222;
		}
	}
</style>
