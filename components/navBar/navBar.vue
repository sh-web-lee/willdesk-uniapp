<template>
	<view class="header" @touchmove.stop.prevent="stopPenetrate">
		<!-- 标准header -->
		<view class="navBar">
			<!-- <view class="status_bar"> -->
			<!-- 这里是占位，防止顶部内容真机覆盖 -->
			<!-- </view> -->
			<uni-status-bar v-if="statusBar" />
			<view class="navBarBox">
				<view class="boxLeft">
					<slot name="left">
						<view class="back" v-show="back" @click="backPage">
							<image src="/static/arrow_left.svg" mode="aspectFit"></image>
						</view>
					</slot>
				</view>
				<view class="content" @click="maskTouchend">
					<slot name="text"></slot>
				</view>
				<view class="boxRight">
					<slot name="right">
						<view class="more" v-show="more" @click="viewMore">
							<image src="/static/more.svg" mode="aspectFit" lazy-load></image>
						</view>
					</slot>
				</view>
			</view>
		</view>
		<!-- 背景占位 -->
		<view class="placeholder-box" :style="{height: `calc(${backHeight}px + ${statusBarHeight}px)`}"></view>
	</view>
</template>

<script>
	import uniStatusBar from '@/components/uni-status-bar/uni-status-bar.vue'
	export default {
		name: "navBar",
		components: {
			uniStatusBar
		},
		data() {
			return {
				backHeight: 0,
				statusBarHeight: 0
			};
		},
		created() {
			this.backHeight = uni.upx2px(88)
			this.statusBarHeight = uni.getSystemInfoSync().statusBarHeight
		},
		props: {
			// 左侧返回上一页按钮 <options back></options>
			back: {
				type: Boolean,
				default: false
			},
			// 右侧查看更多信息 <options more></options>
			more: {
				type: Boolean,
				default: false
			},
			statusBar: {
				type: [Boolean, String],
				default: true
			},
			dbclick: {
				type: Boolean,
				default: false
			}
		},
		onShow() {
			// #ifdef APP-PLUS
			plus.navigator.setStatusBarStyle('#fff');
			// #endif
		},
		methods: {
			// 防止触摸穿透(避免底部元素滚动或被点击)
			stopPenetrate() {
				return
			},
			maskTouchend() {
				if (this.dbclick) {
					this.touchNum++
					setTimeout(() => {
						if (this.touchNum == 1) {
							console.log('单击')
							// this.showModule('popup', 'top')
						}
						if (this.touchNum >= 2) {
							// 双击滚动到页面顶部
							console.log('双击')
							uni.pageScrollTo({
								scrollTop: 0,
								duration: 300
							})
						}
						this.touchNum = 0
					}, 250)
				}
			},
			// 回到上一页
			backPage() {
				uni.navigateBack({
					delta: 1
				});
			},
			viewMore() {
				uni.navigateTo({
					url: '/pages/details/actions'
				});
			}
		}
	}
</script>

<style lang="scss" scoped>
	.header {
		position: relative;

		&::before {
			content: "";
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			background-attachment: fixed;
			background-color: #fff;
			// backdrop-filter: blur(20px);

			z-index: -1;
		}
	}

	.navBar {
		position: fixed;
		// position: sticky;
		top: 0;
		left: 0;
		right: 0;
		display: block;
		background: #fff;
		// z-index: 2147483647;
		z-index: 999;
		// border-bottom: 1upx solid red;
		// padding-top: var(--status-bar-height);
	}

	.navBarBox {
		width: 100%;
		height: 88upx;
		display: flex;
		align-items: center;
		justify-content: space-between;
		background-color: #fff;

		.boxLeft,
		.boxRight {
			display: flex;
			align-items: center;
			height: 88upx;
			font-size: $font-size-lg - 8upx !important;
			font-weight: 800 !important;
		}

		.boxLeft {
			// padding-left: 32upx;

			.back {
				padding: 29upx 32upx;

				image {
					width: 16upx;
					height: 30upx;
				}
			}
		}

		.content {
			width: 76%;
			height: 88upx;

			position: absolute;
			left: 50%;
			transform: translateX(-50%);

			display: flex;
			align-items: center;
			justify-content: center;

			font-size: $font-size-lg !important;
			font-weight: bold;
		}

		.boxRight {
			// padding-right: 32upx;

			.more {
				padding: 29upx 32upx;

				image {
					width: 30upx;
					height: 30upx;
				}
			}
		}
	}

	// ::v-deep uni-image>img {
	// 	position: relative;
	// 	opacity: 1;
	// }
</style>
