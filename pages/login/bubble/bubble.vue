<template>
	<view class="bubble">
		<view v-show="incorrertShow" class="incorrect">
			<view>
				<image src="/static/exclamation.svg" mode="aspectFit"></image>
				<text>{{text}}</text>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name: 'bubble',
		data() {
			return {}
		},
		props: {
			incorrertShow: {
				type: Boolean,
				default: false
			},
			text: {
				type: String,
				default: '0'
			}
		}
	}
</script>

<style scoped lang="scss">
	.bubble {
		position: relative;
		top: 0;
	}

	.incorrect {
		background-image: url('@/static/float-window.svg');
		background-repeat: no-repeat;
		background-size: cover;
		background-size: 100% 100%;
		-moz-background-size: 100% 100%;
		padding-right: 39upx;
		width: 84.8%;
		height: 92upx;
		position: absolute;
		z-index: 9999;

		view {
			opacity: 1;
			display: flex;
			align-items: center;
			margin-top: 35upx;

			image {
				width: 32upx;
				height: 32upx;
				margin-left: 39upx;
				margin-right: 12upx;
			}

			text {
				font-size: $font-size-lg - 8upx !important;
				font-family: SF-Pro;
				font-weight: 400;
				color: #000000;
			}
		}
	}
</style>
