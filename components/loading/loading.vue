<template>
	<view class="loading-box flex-center">
		<block v-if="status==='loading' && showIcon">
			<image src="/static/status/loading@3x.png" class="loading-icon"></image>
			<text class="loading-text" v-if="loadingText">{{ loadingText }}</text>
		</block>
		<view class="endText" v-if="status !=='loading' && showIcon">{{ endText }}</view>
	</view>
</template>

<script>
	export default {
		name: "loading",
		data() {
			return {

			};
		},
		props: {
			showIcon: {
				type: Boolean,
				default: true
			},
			loadingText: {
				type: String,
				default: ''
			},
			status: {
				type: String,
				default: 'loading'
			},
			endText: {
				type: String,
				default: ''
			}
		}
	}
</script>

<style scoped lang="scss">
	.loading-box {
		padding: 16upx 0;
		height: 70upx;
		box-sizing: border-box;
	}

	.loading-icon {
		/* loading动画 */
		animation: loading 0.4s linear infinite;
		width: 38upx;
		height: 38upx;
	}

	@keyframes loading {
		0% {
			transform: rotate(0deg);
		}

		100% {
			transform: rotate(360deg);
		}
	}

	.loading-text {
		margin-left: 16upx;
	}

	.loading-text,
	.endText {
		font-size: $font-size-lg !important;
		color: rgba(#000, 0.5);
	}
</style>
