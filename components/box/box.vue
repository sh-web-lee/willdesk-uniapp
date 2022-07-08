<template>
	<view class="box">
		<view class="header">
			<slot name="header" v-if="title == ''"></slot>
			<text v-else>{{title}}</text>
		</view>
		<view class="body">
			<slot name="body"></slot>
		</view>
	</view>
</template>

<script>
	export default {
		name: "box",
		data() {
			return {

			};
		},
		props: {
			title: {
				type: String,
				default: ''
			}
		},
	}
</script>

<style lang="scss">
	.box {
		width: 91.5%;
		background: rgba(255, 255, 255, 0.12);
		box-shadow: 0px 4upx 22upx 0px rgba(0, 0, 0, 0.1);
		border-radius: 12upx;

		margin: 32upx 0;

		display: flex;
		flex-direction: column;

		.header {
			display: flex;
			align-items: center;
			justify-content: flex-start;

			padding: 32upx;

			text {
				font-size: $font-size-lg - 2upx !important;
				font-weight: 600;
			}
		}

		.body {
			padding: 32upx;
			border-top: 1upx solid rgba(0, 0, 0, 0.13);
		}
	}
</style>
