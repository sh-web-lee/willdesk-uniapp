<template>
	<view class="register_top">
		<view class="status_bar">
			<!-- 这里是占位，防止顶部内容真机覆盖 -->
		</view>
		<!-- logo -->
		<image :style="{marginTop:top_img}" src="/static/logo.svg" mode="aspectFit"></image>
	</view>
</template>

<script>
	export default ({
		data() {
			return {
				top_img:'92upx'
			}
		},
		methods: {
			link() {
				// #ifdef APP-PLUS
				plus.runtime.openURL('https://apps.shopify.com/self-faq') //这里默认使用外部浏览器打开而不是内部web-view组件打开
				// #endif
				// #ifdef H5
				window.open('https://apps.shopify.com/self-faq')
				// #endif
			}
		}
	})
</script>

<style scoped lang="less">
	.register_top {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;

		image {
			// margin-top: 184upx;
			// margin-top: 92upx;
			width: 480upx;
			height: 106upx;
		}
	}
</style>
