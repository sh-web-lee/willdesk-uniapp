<template>
	<view class="empty-box flex-column">
		<image :src="src" mode="aspectFill" lazy-load></image>
		<text>{{ text }}</text>
	</view>
</template>

<script>
	export default {
		name: "emptyBox",
		data() {
			return {

			};
		},
		props: {
			src: {
				type: String,
				default: '/static/empty-list.svg'
			},
			text: {
				type: String,
				default: 'No Data.'
			},
		}
	}
</script>

<style lang="scss">
	.empty-box {
		width: 100vw;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;

		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);

		image {
			width: 275upx;
			height: 284upx;
		}

		text {
			font-size: $font-size-lg !important;
			color: rgba(#000, 0.5);
			padding-top: 12upx;
		}
	}
</style>
