<template>
	<view class="list">
		<view class="leftText">
			<image :src='iconSrc' mode="aspectFit" lazy-load v-if="iconSrc"></image>
			<text>{{title}}</text>
		</view>
		<view class="rightText">
			<text>{{rightText}}</text>
			<image src="/static/arrow_right.svg" mode="aspectFit" lazy-load v-if="isShowRightArrow"></image>
		</view>
	</view>
</template>

<script>
	export default {
		name: "list",
		data() {
			return {
				iconsTest: '/static/chat/Pengding1.svg'
			};
		},
		props: {
			iconSrc: {
				type: String,
				default: ''
			},
			title: {
				type: String,
				default: ''
			},
			rightText: {
				type: String,
				default: ''
			},
			isShowRightArrow: {
				type: Boolean,
				default: false
			}
		}
	}
</script>

<style scoped lang="scss">
	.list {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 32upx;

		&:active {
			background: #EAEAEA;
		}

		.leftText,
		.rightText {
			display: flex;
			align-items: center;

			text {
				font-size: $font-size-lg - 2upx !important;
				font-weight: 400;
			}
		}

		.leftText {
			image {
				width: 30upx;
				height: 30upx;
				margin-right: 32upx;
			}
		}

		.rightText {
			image {
				width: 14upx;
				height: 24upx;
				margin-left: 10upx;
			}
		}
	}
</style>
